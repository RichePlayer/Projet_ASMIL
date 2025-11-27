// ===============================
//      src/pages/Grades.jsx
// ===============================

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  sessionAPI,
  enrollmentAPI,
  gradeAPI,
  studentAPI,
  moduleAPI,
} from "@/api/localDB";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  FileText,
  Plus,
  TrendingUp,
  Award,
  Download,
  Search,
  BarChart3,
  Trophy,
} from "lucide-react";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import GradeSheet from "@/components/grades/GradeSheet";
import GradeFormDialog from "@/components/grades/GradeFormDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Grades() {
  const [selectedSession, setSelectedSession] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionAPI.list(),
  });

  // Students
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentAPI.list(),
  });

  // Modules
  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => moduleAPI.list(),
  });

  // Enrollments filtered by session
  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments", selectedSession],
    queryFn: () => enrollmentAPI.filter({ session_id: selectedSession }),
    enabled: !!selectedSession,
  });

  // Grades
  const { data: grades = [] } = useQuery({
    queryKey: ["grades"],
    queryFn: () => gradeAPI.list("-created_date", 500),
  });

  const activeSessions = sessions.filter(
    (s) => s.status === "en cours" || s.status === "terminée"
  );

  // ------------------------------
  //       CALCULS & STATS
  // ------------------------------

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, g) => sum + (g.value || 0), 0);
    return (total / grades.length).toFixed(2);
  };

  const getTopStudents = () => {
    const studentGrades = {};

    grades.forEach((grade) => {
      const enrollment = enrollments.find((e) => e.id === grade.enrollment_id);

      if (enrollment) {
        if (!studentGrades[enrollment.student_id]) {
          studentGrades[enrollment.student_id] = [];
        }
        studentGrades[enrollment.student_id].push((grade.value / grade.max_value) * 20);
      }
    });

    return Object.entries(studentGrades)
      .map(([studentId, gradeValues]) => {
        const avg =
          gradeValues.reduce((sum, v) => sum + v, 0) / gradeValues.length;

        const student = students.find((s) => s.id === studentId);

        return { studentId, average: avg, student };
      })
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);
  };

  const getStudentGrades = (studentId) => {
    const studentEnrollments = enrollments.filter((e) => e.student_id === studentId);
    const enrollmentIds = studentEnrollments.map((e) => e.id);
    return grades.filter((g) => enrollmentIds.includes(g.enrollment_id));
  };

  const calculateStudentAverage = (studentId) => {
    const studentGrades = getStudentGrades(studentId);
    if (studentGrades.length === 0) return 0;

    const total = studentGrades.reduce((sum, g) => {
      return sum + ((g.value / g.max_value) * 20 * (g.weight || 1));
    }, 0);

    const totalWeight = studentGrades.reduce(
      (sum, g) => sum + (g.weight || 1),
      0
    );

    return (total / totalWeight).toFixed(2);
  };

  const getGradeDistribution = () => {
    const ranges = [
      { range: "0-5", count: 0 },
      { range: "5-10", count: 0 },
      { range: "10-15", count: 0 },
      { range: "15-20", count: 0 },
    ];

    grades.forEach((grade) => {
      const normalized = (grade.value / grade.max_value) * 20;

      if (normalized < 5) ranges[0].count++;
      else if (normalized < 10) ranges[1].count++;
      else if (normalized < 15) ranges[2].count++;
      else ranges[3].count++;
    });

    return ranges;
  };

  //   const exportToCSV = () => {
  //     if (grades.length === 0) return;

  //     const data = grades.map((grade) => {
  //       const enrollment = enrollments.find((e) => e.id === grade.enrollment_id);
  //       const student = students.find((s) => s.id === enrollment?.student_id);

  //       return {
  //         Étudiant: `${student?.first_name} ${student?.last_name}`,
  //         Évaluation: grade.evaluation_name,
  //         Note: `${grade.value}/${grade.max_value}`,
  //         Coefficient: grade.weight,
  //         Date: grade.date,
  //         Commentaire: grade.comments || "-",
  //       };
  //     });

  //     const csv = [
  //       Object.keys(data[0]).join(","),
  //       ...data.map((row) => Object.values(row).join(",")),
  //     ].join("\n");

  //     const blob = new Blob([csv], { type: "text/csv" });
  //     const url = URL.createObjectURL(blob);

  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = `notes_${new Date().toISOString().split("T")[0]}.csv`;
  //     link.click();
  //   };

  const filteredStudents = students.filter((s) =>
    `${s.first_name} ${s.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // ------------------------------
  //          RENDER
  // ------------------------------

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Notes & Évaluations</h1>
          <p className="text-slate-600 mt-1">Gérez les notes de vos étudiants</p>
        </div>

        {/* <Button
          onClick={exportToCSV}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button> */}
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-blue-700">Moyenne Générale</p>
            <h3 className="text-3xl font-bold text-blue-900 mt-2">
              {calculateAverageGrade()}/20
            </h3>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-purple-700">Total Évaluations</p>
            <h3 className="text-3xl font-bold text-purple-900 mt-2">{grades.length}</h3>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-amber-700">Meilleurs Étudiants</p>
            <h3 className="text-3xl font-bold text-amber-900 mt-2">
              {getTopStudents().length}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* TABS */}
      <Tabs defaultValue="sheet" className="space-y-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="sheet">Feuille</TabsTrigger>
          <TabsTrigger value="ranking">Classement</TabsTrigger>
          <TabsTrigger value="student">Par Étudiant</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        {/* ========================== */}
        {/*     TAB – FEUILLE NOTES    */}
        {/* ========================== */}
        <TabsContent value="sheet">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  Feuille de Notes
                </CardTitle>

                {selectedSession && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une Note
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Sélectionner une Session
                </label>

                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une session..." />
                  </SelectTrigger>

                  <SelectContent>
                    {activeSessions.map((session) => {
                      const module = modules.find((m) => m.id === session.module_id);
                      return (
                        <SelectItem key={session.id} value={session.id}>
                          {module?.title || "Module"} - {session.room}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedSession ? (
                <GradeSheet
                  sessionId={selectedSession}
                  enrollments={enrollments}
                  students={students}
                  grades={grades}
                />
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p>Sélectionnez une session pour voir les notes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================== */}
        {/*     TAB – RANKING          */}
        {/* ========================== */}
        <TabsContent value="ranking">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-red-600" />
                Classement des Étudiants
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-3">
              {getTopStudents().map((item, index) => (
                <div
                  key={item.studentId}
                  className="p-4 border rounded-lg bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center">
                        #{index + 1}
                      </div>

                      <div>
                        <h4 className="font-semibold">
                          {item.student?.first_name} {item.student?.last_name}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {item.student?.registration_number}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-red-600">
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

        {/* ========================== */}
        {/*    TAB – PAR ETUDIANT      */}
        {/* ========================== */}
        <TabsContent value="student">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-red-600" />
                Bulletins Individuels
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un étudiant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredStudents.slice(0, 20).map((student) => {
                  const studentGrades = getStudentGrades(student.id);
                  const average = calculateStudentAverage(student.id);

                  return (
                    <div
                      key={student.id}
                      className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() =>
                        setSelectedStudent(
                          selectedStudent?.id === student.id ? null : student
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {student.first_name} {student.last_name}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {studentGrades.length} évaluation(s)
                          </p>
                        </div>

                        <div
                          className={`text-3xl font-bold ${average >= 16
                              ? "text-green-600"
                              : average >= 14
                                ? "text-blue-600"
                                : average >= 10
                                  ? "text-orange-600"
                                  : "text-red-600"
                            }`}
                        >
                          {average}/20
                        </div>
                      </div>

                      {selectedStudent?.id === student.id &&
                        studentGrades.length > 0 && (
                          <div className="mt-4 pt-4 border-t space-y-2">
                            {studentGrades.map((grade) => (
                              <div
                                key={grade.id}
                                className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
                              >
                                <div className="flex-1">
                                  <span className="font-medium">
                                    {grade.evaluation_name}
                                  </span>{" "}
                                  <span className="text-slate-500">
                                    ({format(new Date(grade.date), "d MMM yyyy", { locale: fr })})
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500">
                                    Coef. {grade.weight}
                                  </span>

                                  <span className="font-bold text-red-600">
                                    {grade.value}/{grade.max_value}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================== */}
        {/*     TAB – DISTRIBUTION     */}
        {/* ========================== */}
        <TabsContent value="distribution">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                Distribution des Notes
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getGradeDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#DC2626" name="Nombre d'étudiants" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* FORM */}
      {showForm && (
        <GradeFormDialog
          sessionId={selectedSession}
          enrollments={enrollments}
          students={students}
          open={showForm}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
