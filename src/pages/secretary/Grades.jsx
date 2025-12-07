import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import gradeService from "@/services/gradeService";
import enrollmentService from "@/services/enrollmentService";
import studentService from "@/services/studentService";
import sessionService from "@/services/sessionService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Search,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Award,
  Trophy,
  BarChart3,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Swal from "sweetalert2";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import GradeFormDialog from "@/components/grades/GradeFormDialog";
import GradeEditDialog from "@/components/grades/GradeEditDialog";
import GradeDetailsDialog from "@/components/grades/GradeDetailsDialog";

export default function Grades() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSession, setSelectedSession] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const queryClient = useQueryClient();

  // Fetch grades
  const { data: gradesData, isLoading } = useQuery({
    queryKey: ["grades", page],
    queryFn: () => gradeService.getAllGrades({ page, limit }),
  });

  // Fetch sessions
  const { data: sessionsData } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionService.getAllSessions({ limit: 1000 }),
  });

  // Fetch enrollments for selected session
  const { data: enrollmentsData } = useQuery({
    queryKey: ["enrollments", selectedSession],
    queryFn: () => enrollmentService.getAllEnrollments({
      limit: 1000,
      session_id: selectedSession
    }),
    enabled: !!selectedSession,
  });

  // Delete mutation
  const deleteGradeMutation = useMutation({
    mutationFn: gradeService.deleteGrade,
    onSuccess: () => {
      queryClient.invalidateQueries(["grades"]);
      Swal.fire({
        icon: "success",
        title: "Supprimé !",
        text: "La note a été supprimée avec succès.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.response?.data?.message || "Impossible de supprimer la note",
      });
    },
  });

  const handleEdit = (grade) => {
    setSelectedGrade(grade);
    setShowEditDialog(true);
  };

  const handleViewDetails = (grade) => {
    setSelectedGrade(grade);
    setShowDetailsDialog(true);
  };

  const handleDelete = async (grade) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: `Voulez-vous vraiment supprimer cette note ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      deleteGradeMutation.mutate(grade.id);
    }
  };

  const grades = gradesData?.grades || [];
  const pagination = gradesData?.pagination || {};
  const sessions = sessionsData?.sessions || [];
  const enrollments = enrollmentsData?.enrollments || [];

  // Enrollments are already filtered by backend, no need for client-side filtering
  const sessionEnrollments = enrollments;

  // Calculate statistics
  const totalGrades = pagination.total || 0;
  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (parseFloat(g.value) / parseFloat(g.max_value)) * 20, 0) / grades.length).toFixed(2)
    : 0;
  const uniqueStudents = new Set(grades.map(g => g.enrollment?.student_id)).size;

  // Calculate ranking
  const getTopStudents = () => {
    const studentGrades = {};

    grades.forEach((grade) => {
      const studentId = grade.enrollment?.student_id;
      if (studentId) {
        if (!studentGrades[studentId]) {
          studentGrades[studentId] = {
            student: grade.enrollment.student,
            grades: [],
          };
        }
        const normalizedGrade = (parseFloat(grade.value) / parseFloat(grade.max_value)) * 20;
        const weight = parseFloat(grade.weight);
        studentGrades[studentId].grades.push({ value: normalizedGrade, weight });
      }
    });

    return Object.entries(studentGrades)
      .map(([studentId, data]) => {
        const totalWeighted = data.grades.reduce((sum, g) => sum + g.value * g.weight, 0);
        const totalWeight = data.grades.reduce((sum, g) => sum + g.weight, 0);
        const average = totalWeight > 0 ? totalWeighted / totalWeight : 0;

        return {
          studentId,
          student: data.student,
          average: average,
          totalGrades: data.grades.length,
        };
      })
      .sort((a, b) => b.average - a.average)
      .slice(0, 20);
  };

  // Calculate distribution
  const getGradeDistribution = () => {
    const ranges = [
      { range: "0-5", count: 0, color: "#DC2626" },
      { range: "5-10", count: 0, color: "#F97316" },
      { range: "10-15", count: 0, color: "#3B82F6" },
      { range: "15-20", count: 0, color: "#10B981" },
    ];

    grades.forEach((grade) => {
      const normalized = (parseFloat(grade.value) / parseFloat(grade.max_value)) * 20;
      if (normalized < 5) ranges[0].count++;
      else if (normalized < 10) ranges[1].count++;
      else if (normalized < 15) ranges[2].count++;
      else ranges[3].count++;
    });

    return ranges;
  };

  // Filter grades by search
  const filteredGrades = grades.filter(grade => {
    const student = grade.enrollment?.student;
    const studentName = `${student?.first_name} ${student?.last_name}`.toLowerCase();
    const evaluationName = grade.evaluation_name.toLowerCase();
    const query = searchQuery.toLowerCase();
    return studentName.includes(query) || evaluationName.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">
            Notes & Évaluations
          </h1>
          <p className="text-slate-600 mt-1">Gérez les notes et suivez les performances</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="stagger-item shadow-xl border-0 bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-700 mb-2">Total Notes</p>
                <h3 className="text-4xl font-black text-emerald-900 tracking-tight">{totalGrades}</h3>
                <p className="text-xs text-emerald-600 mt-1">Évaluations enregistrées</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-xl shadow-emerald-600/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <BookOpen className="h-8 w-8 text-white animate-pulse-slow" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item shadow-xl border-0 bg-gradient-to-br from-red-50 via-red-100 to-red-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-700 mb-2">Moyenne Générale</p>
                <h3 className="text-4xl font-black text-red-900 tracking-tight">{averageGrade}<span className="text-2xl">/20</span></h3>
                <p className="text-xs text-red-600 mt-1">Performance globale</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 shadow-xl shadow-red-600/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <TrendingUp className="h-8 w-8 text-white animate-pulse-slow" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item shadow-xl border-0 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-orange-700 mb-2">Étudiants</p>
                <h3 className="text-4xl font-black text-orange-900 tracking-tight">{uniqueStudents}</h3>
                <p className="text-xs text-orange-600 mt-1">Étudiants évalués</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 shadow-xl shadow-orange-600/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Award className="h-8 w-8 text-white animate-pulse-slow" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="list">
            <FileText className="h-4 w-4 mr-2" />
            Liste
          </TabsTrigger>
          <TabsTrigger value="ranking">
            <Trophy className="h-4 w-4 mr-2" />
            Classement
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <BarChart3 className="h-4 w-4 mr-2" />
            Distribution
          </TabsTrigger>
        </TabsList>

        {/* TAB: Liste */}
        <TabsContent value="list">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  Liste des Notes
                </CardTitle>
                {selectedSession && (
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une Note
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Session Selection */}
              <div className="mb-6">
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  Sélectionner une Session
                </label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une session..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id.toString()}>
                        {session.module?.title || "Module"} - {session.room} ({format(new Date(session.start_date), "dd/MM/yyyy", { locale: fr })})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              {selectedSession && (
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher par étudiant ou évaluation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {/* Table */}
              {!selectedSession ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Sélectionnez une session pour voir les notes</p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                  <p className="text-slate-500 mt-4">Chargement des notes...</p>
                </div>
              ) : filteredGrades.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucune note trouvée</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Commencez par ajouter une note
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-50 hover:to-orange-50">
                        <TableHead className="font-bold text-slate-700">Étudiant</TableHead>
                        <TableHead className="font-bold text-slate-700">Évaluation</TableHead>
                        <TableHead className="font-bold text-slate-700">Note</TableHead>
                        <TableHead className="font-bold text-slate-700">Coefficient</TableHead>
                        <TableHead className="font-bold text-slate-700">Date</TableHead>
                        <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGrades.map((grade) => {
                        const student = grade.enrollment?.student;
                        const normalizedGrade = (parseFloat(grade.value) / parseFloat(grade.max_value)) * 20;

                        return (
                          <TableRow key={grade.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell>
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {student?.first_name} {student?.last_name}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {student?.registration_number}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-slate-800">{grade.evaluation_name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge
                                  className={`w-fit ${normalizedGrade >= 16
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : normalizedGrade >= 14
                                      ? "bg-blue-100 text-blue-800 border-blue-200"
                                      : normalizedGrade >= 10
                                        ? "bg-orange-100 text-orange-800 border-orange-200"
                                        : "bg-red-100 text-red-800 border-red-200"
                                    } font-bold`}
                                >
                                  {parseFloat(grade.value).toFixed(2)}/{parseFloat(grade.max_value)}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  ({normalizedGrade.toFixed(2)}/20)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-semibold">
                                ×{parseFloat(grade.weight)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {grade.date ? format(new Date(grade.date), "dd MMM yyyy", { locale: fr }) : "-"}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-red-50">
                                    <MoreVertical className="h-5 w-5" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={() => handleViewDetails(grade)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Voir détails
                                  </DropdownMenuItem>

                                  <DropdownMenuItem onClick={() => handleEdit(grade)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                    onClick={() => handleDelete(grade)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Classement */}
        <TabsContent value="ranking">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-red-600" />
                Classement des Étudiants
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-3">
              {getTopStudents().map((item, index) => (
                <div
                  key={item.studentId}
                  className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${index === 0 ? "bg-yellow-500" :
                        index === 1 ? "bg-gray-400" :
                          index === 2 ? "bg-orange-600" :
                            "bg-red-600"
                        } text-white font-bold flex items-center justify-center text-lg`}>
                        #{index + 1}
                      </div>

                      <div>
                        <h4 className="font-semibold text-lg">
                          {item.student?.first_name} {item.student?.last_name}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {item.student?.registration_number} • {item.totalGrades} évaluation(s)
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-4xl font-black text-red-600">
                        {item.average.toFixed(2)}
                      </div>
                      <div className="text-sm text-slate-500">/20</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Distribution */}
        <TabsContent value="distribution">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                Distribution des Notes
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getGradeDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#DC2626" name="Nombre d'étudiants" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {getGradeDistribution().map((range) => (
                  <Card key={range.range} className="p-4 text-center">
                    <div className="text-2xl font-bold" style={{ color: range.color }}>
                      {range.count}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{range.range}/20</div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showAddDialog && (
        <GradeFormDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          selectedSession={selectedSession}
          sessionEnrollments={sessionEnrollments}
        />
      )}

      {showEditDialog && selectedGrade && (
        <GradeEditDialog
          grade={selectedGrade}
          open={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedGrade(null);
          }}
        />
      )}

      {showDetailsDialog && selectedGrade && (
        <GradeDetailsDialog
          grade={selectedGrade}
          open={showDetailsDialog}
          onClose={() => {
            setShowDetailsDialog(false);
            setSelectedGrade(null);
          }}
        />
      )}
    </div>
  );
}
