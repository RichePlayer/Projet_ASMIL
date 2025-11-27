import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// switched to localDB
import {
    sessionAPI,
    moduleAPI,
    formationAPI,
    teacherAPI,
    enrollmentAPI,
    attendanceAPI,
    studentAPI,
} from "@/api/localDB";
import { Button } from "@/components/ui/button";
import { generateAttendancePDF } from "@/components/attendance/AttendancePDF";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ClipboardCheck, Calendar, Users, TrendingUp, Download, Search, BarChart3 } from "lucide-react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import AttendanceSheet from "@/components/attendance/AttendanceSheet";
import AttendanceStats from "@/components/attendance/AttendanceStats";

export default function Attendance() {
    const [selectedSession, setSelectedSession] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);

    const { data: sessions = [] } = useQuery({
        queryKey: ["sessions"],
        queryFn: () => sessionAPI.list("-created_date", 1000),
    });

    const { data: enrollments = [] } = useQuery({
        queryKey: ["enrollments", selectedSession],
        queryFn: () =>
            selectedSession ? enrollmentAPI.filter({ session_id: selectedSession }) : Promise.resolve([]),
        enabled: !!selectedSession,
    });

    const { data: students = [] } = useQuery({
        queryKey: ["students"],
        queryFn: () => studentAPI.list(),
    });

    const { data: attendances = [] } = useQuery({
        queryKey: ["attendances"],
        queryFn: () => attendanceAPI.list("-date", 500),
    });

    const { data: modules = [] } = useQuery({
        queryKey: ["modules"],
        queryFn: () => moduleAPI.list(),
    });

    const activeSessions = sessions.filter((s) => s.status === "en cours");


    // Handler d'export (dans ton composant Attendance)
    const handleExportPDF = async () => {
        if (!selectedSession) {
            // tu peux montrer un toast ou alerter l'utilisateur
            if (!confirm("Exporter la feuille de toutes les sessions actives pour la date sélectionnée ?")) return;
        }

        // récupérer la session sélectionnée
        const sessionObj = sessions.find((s) => s.id === selectedSession);

        // filtrer les inscriptions pour la session (si selectedSession set)
        const enrollsForSession = selectedSession
            ? enrollments.filter((e) => e.session_id === selectedSession)
            : enrollments; // ou [] si tu veux forcer la sélection

        // passe le chemin local du logo (B mode): "/mnt/data/logo.jpg"
        await generateAttendancePDF({
            session: sessionObj,
            date: selectedDate,
            enrollments: enrollsForSession,
            students,
            attendances,
            logoPath: "/logo.jpg", // <-- chemin local que tu as choisi (B)
        });
    };


    const exportToExcel = () => {
        const data = attendances.map((att) => {
            const enrollment = enrollments.find((e) => e.id === att.enrollment_id);
            const student = students.find((s) => s.id === enrollment?.student_id);
            return {
                Date: att.date,
                Étudiant: `${student?.first_name} ${student?.last_name}`,
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

    const getStudentAttendanceHistory = (studentId) => {
        const studentEnrollments = enrollments.filter((e) => e.student_id === studentId);
        const enrollmentIds = studentEnrollments.map((e) => e.id);
        return attendances.filter((a) => enrollmentIds.includes(a.enrollment_id));
    };

    const getAttendanceByDay = () => {
        const currentMonth = new Date();
        const days = eachDayOfInterval({
            start: startOfMonth(currentMonth),
            end: endOfMonth(currentMonth),
        });

        return days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayAttendances = attendances.filter((a) => a.date === dateStr);
            return {
                date: format(day, "dd MMM", { locale: fr }),
                présents: dayAttendances.filter((a) => a.status === "présent").length,
                absents: dayAttendances.filter((a) => a.status === "absent").length,
                retards: dayAttendances.filter((a) => a.status === "retard").length,
            };
        });
    };

    const filteredStudents = students.filter((s) =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900">Présences</h1>
                    <p className="text-slate-600 mt-1">Gérez les présences de vos étudiants</p>
                </div>
                <div className="flex gap-3">
                    {/* Export PDF */}
                    <Button
                        onClick={handleExportPDF}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter PDF
                    </Button>
                </div>

            </div>

            {/* Stats */}
            <AttendanceStats attendances={attendances} enrollments={enrollments} />

            {/* Tabs */}
            <Tabs defaultValue="sheet" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                    <TabsTrigger value="sheet">Feuille</TabsTrigger>
                    <TabsTrigger value="history">Historique</TabsTrigger>
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
                                                        {module?.title || "Module"} - {session.room} ({session.start_date})
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                                        Date
                                    </label>
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
                                    sessionId={selectedSession}
                                    date={selectedDate}
                                    enrollments={enrollments}
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

                {/* History Tab */}
                <TabsContent value="history">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-red-600" />
                                Historique des Présences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {attendances.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <ClipboardCheck className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                    <p>Aucun historique</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {attendances.slice(0, 50).map((att) => {
                                        const enrollment = enrollments.find((e) => e.id === att.enrollment_id);
                                        const student = students.find((s) => s.id === enrollment?.student_id);
                                        return (
                                            <div key={att.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-900">
                                                            {student?.first_name} {student?.last_name}
                                                        </h4>
                                                        <p className="text-sm text-slate-600 mt-1">
                                                            {att.date && format(new Date(att.date), "d MMMM yyyy", { locale: fr })}
                                                        </p>
                                                        {att.notes && <p className="text-xs text-slate-500 mt-1">{att.notes}</p>}
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${att.status === "présent" ? "bg-green-100 text-green-800" :
                                                        att.status === "absent" ? "bg-red-100 text-red-800" :
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

                {/* Student Tab */}
                <TabsContent value="student">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-red-600" />
                                Vue Par Étudiant
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                                    const history = getStudentAttendanceHistory(student.id);
                                    const present = history.filter((a) => a.status === "présent").length;
                                    const absent = history.filter((a) => a.status === "absent").length;
                                    const rate = history.length > 0 ? ((present / history.length) * 100).toFixed(1) : 0;

                                    return (
                                        <div key={student.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900">
                                                        {student.first_name} {student.last_name}
                                                    </h4>
                                                    <div className="flex gap-4 mt-2 text-sm">
                                                        <span className="text-green-600">✓ {present}</span>
                                                        <span className="text-red-600">✗ {absent}</span>
                                                        <span className="text-blue-600">{rate}% présence</span>
                                                    </div>
                                                </div>
                                                <div className={`text-2xl font-bold ${rate >= 90 ? "text-green-600" :
                                                    rate >= 75 ? "text-blue-600" :
                                                        rate >= 60 ? "text-orange-600" :
                                                            "text-red-600"
                                                    }`}>
                                                    {rate}%
                                                </div>
                                            </div>

                                            {selectedStudent?.id === student.id && history.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-200">
                                                    <p className="text-sm font-semibold text-slate-700 mb-3">Historique récent:</p>
                                                    <div className="space-y-2">
                                                        {history.slice(0, 10).map((att) => (
                                                            <div key={att.id} className="flex items-center justify-between text-sm">
                                                                <span className="text-slate-600">
                                                                    {att.date && format(new Date(att.date), "d MMM yyyy", { locale: fr })}
                                                                </span>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${att.status === "présent" ? "bg-green-100 text-green-800" :
                                                                    att.status === "absent" ? "bg-red-100 text-red-800" :
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
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Stats Tab */}
                <TabsContent value="stats">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-red-600" />
                                Statistiques du Mois
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={getAttendanceByDay()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="présents" name="Présents" fill="#10B981" />
                                    <Bar dataKey="absents" name="Absents" fill="#EF4444" />
                                    <Bar dataKey="retards" name="Retards" fill="#F59E0B" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
