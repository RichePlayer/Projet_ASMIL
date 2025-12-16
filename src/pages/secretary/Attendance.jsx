import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
// Services backend
import attendanceService from "@/services/attendanceService";
import sessionService from "@/services/sessionService";
import enrollmentService from "@/services/enrollmentService";
import { studentService } from "@/services/studentService";
import { moduleService } from "@/services/moduleService";

import { Button } from "@/components/ui/button";
import { generateAttendancePDF } from "@/components/attendance/AttendancePDF";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Calendar, Users, TrendingUp, Download, Search, BarChart3, Loader2, RefreshCw, Filter } from "lucide-react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import AttendanceSheet from "@/components/attendance/AttendanceSheet";
import AttendanceStats from "@/components/attendance/AttendanceStats";

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'];

export default function Attendance() {
    const [selectedSession, setSelectedSession] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [historyFilter, setHistoryFilter] = useState("all");

    // Récupérer les sessions
    const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
        queryKey: ["sessions"],
        queryFn: () => sessionService.getAll(),
    });

    // Récupérer TOUTES les inscriptions
    const { data: allEnrollmentsData, isLoading: allEnrollmentsLoading } = useQuery({
        queryKey: ["all-enrollments"],
        queryFn: () => enrollmentService.getAll({ limit: 5000 }),
    });

    // Récupérer les inscriptions pour la session sélectionnée
    const { data: sessionEnrollmentsData } = useQuery({
        queryKey: ["session-enrollments", selectedSession],
        queryFn: () => selectedSession ? enrollmentService.getAll({ session_id: parseInt(selectedSession) }) : Promise.resolve([]),
        enabled: !!selectedSession,
    });

    // Récupérer tous les étudiants
    const { data: studentsData, isLoading: studentsLoading } = useQuery({
        queryKey: ["students"],
        queryFn: () => studentService.getAll({ limit: 1000 }),
    });

    // Récupérer toutes les présences
    const { data: attendancesData, isLoading: attendancesLoading, refetch: refetchAttendances } = useQuery({
        queryKey: ["attendances"],
        queryFn: () => attendanceService.getAll({ limit: 5000 }),
    });

    // Récupérer les modules
    const { data: modulesData } = useQuery({
        queryKey: ["modules"],
        queryFn: () => moduleService.getAll(),
    });

    // Récupérer les statistiques globales
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ["attendance-stats"],
        queryFn: () => attendanceService.getStats(),
    });

    // Normaliser les données
    const sessions = Array.isArray(sessionsData) ? sessionsData : [];
    const allEnrollments = Array.isArray(allEnrollmentsData) ? allEnrollmentsData : [];
    const sessionEnrollments = Array.isArray(sessionEnrollmentsData) ? sessionEnrollmentsData : [];
    const students = Array.isArray(studentsData) ? studentsData : [];
    const attendances = Array.isArray(attendancesData) ? attendancesData : [];
    const modules = Array.isArray(modulesData) ? modulesData : [];
    const backendStats = statsData?.statistics || null;
    const dailyStats = statsData?.dailyStats || [];

    const activeSessions = sessions.filter((s) => s.status === "en cours");

    // Fonction helper pour obtenir l'étudiant d'une présence
    const getStudentFromAttendance = (att) => {
        // D'abord essayer d'obtenir depuis l'enrollment inclus dans la présence
        if (att.enrollment?.student) {
            return att.enrollment.student;
        }
        // Sinon, chercher dans allEnrollments
        const enrollment = allEnrollments.find((e) => e.id === att.enrollment_id);
        if (enrollment?.student) {
            return enrollment.student;
        }
        // En dernier recours, chercher dans students par student_id
        if (enrollment?.student_id) {
            return students.find((s) => s.id === enrollment.student_id);
        }
        return null;
    };

    // Handler d'export PDF
    const handleExportPDF = async () => {
        if (!selectedSession) {
            if (!confirm("Exporter la feuille de toutes les sessions actives pour la date sélectionnée ?")) return;
        }

        const sessionObj = sessions.find((s) => s.id === parseInt(selectedSession));
        const enrollsForSession = selectedSession
            ? sessionEnrollments.filter((e) => e.session_id === parseInt(selectedSession))
            : sessionEnrollments;

        await generateAttendancePDF({
            session: sessionObj,
            date: selectedDate,
            enrollments: enrollsForSession,
            students,
            attendances,
            logoPath: "/logo.jpg",
        });
    };

    const exportToExcel = () => {
        const data = attendances.map((att) => {
            const student = getStudentFromAttendance(att);
            return {
                Date: typeof att.date === 'string' ? att.date.split('T')[0] : format(new Date(att.date), 'yyyy-MM-dd'),
                Étudiant: student ? `${student.first_name || ''} ${student.last_name || ''}` : 'Inconnu',
                Statut: att.status,
                Notes: att.notes || "-",
            };
        });

        if (data.length === 0) {
            alert("Aucune donnée à exporter");
            return;
        }

        const csv = [
            Object.keys(data[0]).join(","),
            ...data.map((row) => Object.values(row).join(",")),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `presences_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
    };

    // Fonction pour récupérer l'historique d'un étudiant - corrigée pour comparer les types correctement
    const getStudentAttendanceHistory = (studentId) => {
        // Filtrer les présences qui ont cet étudiant
        return attendances.filter((att) => {
            const student = getStudentFromAttendance(att);
            return student && student.id === studentId;
        });
    };

    // Données pour le graphique quotidien
    const getAttendanceByDay = useMemo(() => {
        if (dailyStats.length > 0) {
            return dailyStats.map(stat => ({
                date: format(new Date(stat.date), "dd MMM", { locale: fr }),
                présents: stat.présent || 0,
                absents: stat.absent || 0,
                retards: stat.retard || 0,
                excusés: stat.excusé || 0,
            }));
        }

        const currentMonth = new Date();
        const days = eachDayOfInterval({
            start: startOfMonth(currentMonth),
            end: endOfMonth(currentMonth),
        });

        return days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayAttendances = attendances.filter((a) => {
                const attDate = typeof a.date === 'string' ? a.date.split('T')[0] : format(new Date(a.date), 'yyyy-MM-dd');
                return attDate === dateStr;
            });
            return {
                date: format(day, "dd MMM", { locale: fr }),
                présents: dayAttendances.filter((a) => a.status === "présent").length,
                absents: dayAttendances.filter((a) => a.status === "absent").length,
                retards: dayAttendances.filter((a) => a.status === "retard").length,
                excusés: dayAttendances.filter((a) => a.status === "excusé").length,
            };
        });
    }, [dailyStats, attendances]);

    // Données pour le graphique camembert
    const pieChartData = useMemo(() => {
        if (backendStats) {
            return [
                { name: 'Présents', value: backendStats.present || 0 },
                { name: 'Absents', value: backendStats.absent || 0 },
                { name: 'Retards', value: backendStats.late || 0 },
                { name: 'Excusés', value: backendStats.excused || 0 },
            ].filter(item => item.value > 0);
        }

        return [
            { name: 'Présents', value: attendances.filter(a => a.status === 'présent').length },
            { name: 'Absents', value: attendances.filter(a => a.status === 'absent').length },
            { name: 'Retards', value: attendances.filter(a => a.status === 'retard').length },
            { name: 'Excusés', value: attendances.filter(a => a.status === 'excusé').length },
        ].filter(item => item.value > 0);
    }, [backendStats, attendances]);

    // Historique filtré - maintenant avec les données d'étudiant incluses
    const filteredHistory = useMemo(() => {
        let filtered = [...attendances];

        if (historyFilter !== "all") {
            filtered = filtered.filter(a => a.status === historyFilter);
        }

        // Trier par date décroissante
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        return filtered.slice(0, 100);
    }, [attendances, historyFilter]);

    // Étudiants filtrés par recherche
    const filteredStudents = useMemo(() => {
        return students.filter((s) =>
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.registration_number?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, searchQuery]);

    const isLoading = sessionsLoading || studentsLoading || attendancesLoading || allEnrollmentsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                <span className="ml-2 text-slate-600">Chargement des données...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900">Présences</h1>
                    <p className="text-slate-600 mt-1">Gérez les présences de vos étudiants</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => refetchAttendances()} variant="outline" className="border-slate-300">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualiser
                    </Button>
                    <Button onClick={handleExportPDF} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter PDF
                    </Button>
                </div>
            </div>

            {/* Stats globales */}
            <AttendanceStats attendances={attendances} enrollments={allEnrollments} backendStats={backendStats} />

            {/* Tabs */}
            <Tabs defaultValue="sheet" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                    <TabsTrigger value="sheet">Feuille</TabsTrigger>
                    <TabsTrigger value="history">
                        Historique
                        {attendances.length > 0 && <Badge variant="secondary" className="ml-2 text-xs">{attendances.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="student">Par Étudiant</TabsTrigger>
                    <TabsTrigger value="stats">Statistiques</TabsTrigger>
                </TabsList>

                {/* Sheet Tab */}
                <TabsContent value="sheet">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardCheck className="h-5 w-5 text-red-600" />
                                Feuille de Présence
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid gap-4 md:grid-cols-2 mb-6">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Sélectionner une Session</label>
                                    <Select value={selectedSession} onValueChange={setSelectedSession}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisir une session..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {activeSessions.map((session) => {
                                                const module = modules.find((m) => m.id === session.module_id);
                                                return (
                                                    <SelectItem key={session.id} value={session.id.toString()}>
                                                        {module?.title || "Module"} - {session.room} ({session.start_date})
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {selectedSession && (
                                <AttendanceSheet
                                    sessionId={parseInt(selectedSession)}
                                    date={selectedDate}
                                    enrollments={sessionEnrollments}
                                    students={students}
                                    attendances={attendances}
                                />
                            )}

                            {!selectedSession && (
                                <div className="text-center py-12 text-slate-500">
                                    <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                    <p>Sélectionnez une session pour commencer</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Historique Tab - CORRIGÉ */}
                <TabsContent value="history">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-red-600" />
                                    Historique des Présences
                                    <Badge variant="outline" className="ml-2">{attendances.length} enregistrements</Badge>
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-slate-400" />
                                    <Select value={historyFilter} onValueChange={setHistoryFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous</SelectItem>
                                            <SelectItem value="présent">Présents</SelectItem>
                                            <SelectItem value="absent">Absents</SelectItem>
                                            <SelectItem value="retard">Retards</SelectItem>
                                            <SelectItem value="excusé">Excusés</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {filteredHistory.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <ClipboardCheck className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                    <p>Aucun historique{historyFilter !== "all" ? ` pour "${historyFilter}"` : ""}</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {filteredHistory.map((att) => {
                                        // Utiliser la fonction helper pour obtenir l'étudiant
                                        const student = getStudentFromAttendance(att);
                                        const session = att.enrollment?.session;
                                        const module = session?.module || modules.find((m) => m.id === session?.module_id);

                                        return (
                                            <div key={att.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-900">
                                                            {student ? `${student.first_name} ${student.last_name}` : "Étudiant inconnu"}
                                                        </h4>
                                                        <p className="text-sm text-slate-600 mt-1">
                                                            📅 {att.date && format(new Date(att.date), "d MMMM yyyy", { locale: fr })}
                                                            {module && <span className="ml-2">• 📚 {module.title}</span>}
                                                        </p>
                                                        {student?.registration_number && (
                                                            <p className="text-xs text-slate-400">Matricule: {student.registration_number}</p>
                                                        )}
                                                        {att.notes && <p className="text-xs text-slate-500 mt-1 italic">💬 {att.notes}</p>}
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${att.status === "présent" ? "bg-green-100 text-green-800" :
                                                            att.status === "absent" ? "bg-red-100 text-red-800" :
                                                                att.status === "excusé" ? "bg-blue-100 text-blue-800" :
                                                                    "bg-orange-100 text-orange-800"
                                                        }`}>
                                                        {att.status}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Par Étudiant Tab - CORRIGÉ */}
                <TabsContent value="student">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-red-600" />
                                Vue Par Étudiant
                                <Badge variant="outline" className="ml-2">{students.length} étudiants</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Rechercher par nom ou matricule..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {filteredStudents.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                    <p>Aucun étudiant trouvé</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {filteredStudents.slice(0, 50).map((student) => {
                                        const history = getStudentAttendanceHistory(student.id);
                                        const present = history.filter((a) => a.status === "présent").length;
                                        const absent = history.filter((a) => a.status === "absent").length;
                                        const late = history.filter((a) => a.status === "retard").length;
                                        const excused = history.filter((a) => a.status === "excusé").length;
                                        const total = history.length;
                                        const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

                                        return (
                                            <div key={student.id}
                                                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900">
                                                            {student.first_name} {student.last_name}
                                                        </h4>
                                                        {student.registration_number && (
                                                            <p className="text-xs text-slate-500">{student.registration_number}</p>
                                                        )}
                                                        <div className="flex gap-3 mt-2 text-sm">
                                                            <span className="text-green-600 flex items-center gap-1">
                                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                                {present} présent(s)
                                                            </span>
                                                            <span className="text-red-600 flex items-center gap-1">
                                                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                                {absent} absent(s)
                                                            </span>
                                                            <span className="text-orange-600 flex items-center gap-1">
                                                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                                {late} retard(s)
                                                            </span>
                                                            <span className="text-blue-600 flex items-center gap-1">
                                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                                {excused} excusé(s)
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-2xl font-bold ${rate >= 90 ? "text-green-600" :
                                                                rate >= 75 ? "text-blue-600" :
                                                                    rate >= 60 ? "text-orange-600" :
                                                                        "text-red-600"
                                                            }`}>
                                                            {rate}%
                                                        </div>
                                                        <p className="text-xs text-slate-500">{total} enregistrement(s)</p>
                                                    </div>
                                                </div>

                                                {selectedStudent?.id === student.id && history.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                                        <p className="text-sm font-semibold text-slate-700 mb-3">Historique ({history.length}):</p>
                                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                                            {history.slice(0, 15).map((att) => (
                                                                <div key={att.id} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                                                                    <span className="text-slate-600">
                                                                        {att.date && format(new Date(att.date), "d MMM yyyy", { locale: fr })}
                                                                    </span>
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${att.status === "présent" ? "bg-green-100 text-green-800" :
                                                                            att.status === "absent" ? "bg-red-100 text-red-800" :
                                                                                att.status === "excusé" ? "bg-blue-100 text-blue-800" :
                                                                                    "bg-orange-100 text-orange-800"
                                                                        }`}>
                                                                        {att.status}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Stats Tab */}
                <TabsContent value="stats">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="shadow-lg border-0 md:col-span-2">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-red-600" />
                                    Statistiques du Mois
                                    {statsLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={getAttendanceByDay}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="présents" name="Présents" fill="#10B981" />
                                        <Bar dataKey="absents" name="Absents" fill="#EF4444" />
                                        <Bar dataKey="retards" name="Retards" fill="#F59E0B" />
                                        <Bar dataKey="excusés" name="Excusés" fill="#3B82F6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-0">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-red-600" />
                                    Répartition Globale
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {pieChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                        <p>Aucune donnée disponible</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-0">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardCheck className="h-5 w-5 text-red-600" />
                                    Statistiques Détaillées
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-700">Total enregistrements</span>
                                        <span className="text-2xl font-bold text-slate-900">
                                            {backendStats?.total || attendances.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="text-green-700">Présents</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-green-600">
                                                {backendStats?.present || attendances.filter(a => a.status === 'présent').length}
                                            </span>
                                            <p className="text-xs text-green-600">{backendStats?.attendanceRate || ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                        <span className="text-red-700">Absents</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-red-600">
                                                {backendStats?.absent || attendances.filter(a => a.status === 'absent').length}
                                            </span>
                                            <p className="text-xs text-red-600">{backendStats?.absentRate || ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span className="text-orange-700">Retards</span>
                                        <span className="text-2xl font-bold text-orange-600">
                                            {backendStats?.late || attendances.filter(a => a.status === 'retard').length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="text-blue-700">Excusés</span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            {backendStats?.excused || attendances.filter(a => a.status === 'excusé').length}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
