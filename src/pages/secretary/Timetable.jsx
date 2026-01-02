import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Backend Services
import sessionService from "@/services/sessionService";
import moduleService from "@/services/moduleService";
import formationService from "@/services/formationService";
import teacherService from "@/services/teacherService";
import enrollmentService from "@/services/enrollmentService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, BookOpen, FileText, Loader2, GraduationCap } from "lucide-react";
import { startOfWeek } from "date-fns";
import { generateTimetableDoc } from "@/components/timetable/TimetableDocGenerator";

export default function Timetable() {
  const { t } = useTranslation();
  const [selectedSession, setSelectedSession] = useState("all");
  const [selectedDay, setSelectedDay] = useState("all");
  const [currentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Fetch data from backend
  const { data: sessionsData = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionService.getAll(),
  });

  const { data: modulesData = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => moduleService.getAll(),
  });

  const { data: formationsData = [] } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationService.getAll(),
  });

  const { data: teachersData = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => teacherService.getAll(),
  });

  const { data: enrollmentsData = [] } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentService.getAll(),
  });

  // Ensure arrays
  const sessions = Array.isArray(sessionsData) ? sessionsData : [];
  const modules = Array.isArray(modulesData) ? modulesData : [];
  const formations = Array.isArray(formationsData) ? formationsData : [];
  const teachers = Array.isArray(teachersData) ? teachersData : [];
  const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : [];

  const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  // Helper functions with safety checks
  const getModuleName = (moduleId) => {
    const mod = modules.find((m) => m.id === moduleId);
    return mod?.title || "Module";
  };

  const getFormationName = (moduleId) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return "";
    const formation = formations.find((f) => f.id === mod.formation_id);
    return formation?.title || "";
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "";
  };

  const getEnrollmentCount = (sessionId) => {
    return enrollments.filter((e) => e.session_id === sessionId && e.status === "actif").length;
  };

  const activeSessions = sessions.filter((s) => s.status === "en cours");

  const getScheduleForDay = (dayName) => {
    const filtered = activeSessions.filter((session) => {
      if (selectedSession !== "all" && session.id !== selectedSession) return false;
      return session.schedule?.some((s) => s.day === dayName);
    });

    return filtered.flatMap((session) =>
      (session.schedule || [])
        .filter((s) => s.day === dayName)
        .map((schedule) => ({
          ...session,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
        }))
    ).sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const getSessionColor = (sessionId) => {
    const colors = [
      "bg-blue-100 border-blue-300 text-blue-900",
      "bg-green-100 border-green-300 text-green-900",
      "bg-purple-100 border-purple-300 text-purple-900",
      "bg-orange-100 border-orange-300 text-orange-900",
      "bg-pink-100 border-pink-300 text-pink-900",
      "bg-indigo-100 border-indigo-300 text-indigo-900",
    ];
    const index = sessions.findIndex((s) => s.id === sessionId);
    return colors[index % colors.length];
  };

  const exportToDoc = () => {
    generateTimetableDoc({
      sessions,
      modules,
      formations,
      teachers,
      enrollments,
      daysOfWeek,
      getModuleName,
      getFormationName,
      getTeacherName,
      getEnrollmentCount,
      getScheduleForDay,
    });
  };

  const filteredDays = selectedDay === "all" ? daysOfWeek : [selectedDay];

  // Stats
  const totalActiveEnrollments = enrollments.filter((e) => e.status === "actif").length;

  if (loadingSessions) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        </div>
        <p className="text-slate-500 font-medium">Chargement de l'emploi du temps...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Emploi du Temps</h1>
          <p className="text-slate-600 mt-1">Vue hebdomadaire des sessions et cours</p>
        </div>
        <Button
          onClick={exportToDoc}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
        >
          <FileText className="h-4 w-4 mr-2" />
          Exporter DOC
        </Button>
      </div>

      {/* Stats Cards - Improved Design */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Sessions Actives */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-white via-white to-blue-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Calendar className="h-32 w-32 text-blue-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">En cours</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Sessions Actives</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{activeSessions.length}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Formations */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-white via-white to-green-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <BookOpen className="h-32 w-32 text-green-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white shadow-lg shadow-green-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Total</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Formations</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formations.length}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Enseignants */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-white via-white to-purple-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <GraduationCap className="h-32 w-32 text-purple-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Actifs</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Enseignants</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{teachers.length}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Étudiants Actifs */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-white via-white to-orange-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Users className="h-32 w-32 text-orange-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Inscrits</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Étudiants Actifs</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalActiveEnrollments}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl">
              <SelectValue placeholder="Toutes les sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sessions</SelectItem>
              {activeSessions.map((session) => (
                <SelectItem key={session.id} value={session.id.toString()}>
                  {getModuleName(session.module_id)} - {session.room || "Salle N/A"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl">
              <SelectValue placeholder="Tous les jours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les jours</SelectItem>
              {daysOfWeek.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Weekly Grid View */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-red-50 to-orange-50">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Calendar className="h-5 w-5 text-red-600" />
            Planning Hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header */}
              <div className={`grid border-b border-slate-200 bg-gradient-to-r from-slate-100 to-slate-50`} style={{ gridTemplateColumns: `100px repeat(${filteredDays.length}, 1fr)` }}>
                <div className="p-4 font-bold text-slate-700 border-r border-slate-200">Horaire</div>
                {filteredDays.map((day) => (
                  <div key={day} className="p-4 font-bold text-center text-slate-900 border-r border-slate-200">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((time) => (
                <div key={time} className="grid border-b border-slate-200 hover:bg-slate-50" style={{ gridTemplateColumns: `100px repeat(${filteredDays.length}, 1fr)` }}>
                  <div className="p-3 text-sm font-medium text-slate-600 border-r border-slate-200 bg-slate-50">
                    {time}
                  </div>
                  {filteredDays.map((day) => {
                    const daySchedule = getScheduleForDay(day);
                    const sessionAtTime = daySchedule.find(
                      (s) => s.start_time <= time && s.end_time > time
                    );

                    return (
                      <div key={`${day}-${time}`} className="p-2 border-r border-slate-200 min-h-[80px]">
                        {sessionAtTime && (
                          <div
                            className={`p-3 rounded-lg border-2 shadow-sm hover:shadow-md transition-all ${getSessionColor(
                              sessionAtTime.id
                            )}`}
                          >
                            <h4 className="font-bold text-sm mb-1">{getModuleName(sessionAtTime.module_id)}</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {sessionAtTime.start_time} - {sessionAtTime.end_time}
                                </span>
                              </div>
                              {sessionAtTime.room && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{sessionAtTime.room}</span>
                                </div>
                              )}
                              {sessionAtTime.teacher_id && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span className="truncate">{getTeacherName(sessionAtTime.teacher_id)}</span>
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs bg-white mt-1">
                                {getEnrollmentCount(sessionAtTime.id)} étudiants
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredDays.map((day) => {
          const daySchedule = getScheduleForDay(day);
          return (
            <Card key={day} className="shadow-lg border-0">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                <CardTitle className="flex items-center justify-between">
                  <span>{day}</span>
                  <Badge className="bg-red-600">{daySchedule.length} cours</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {daySchedule.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>Aucun cours planifié</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {daySchedule.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${getSessionColor(item.id)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold">{getModuleName(item.module_id)}</h4>
                          <Badge variant="outline" className="bg-white">
                            {item.start_time} - {item.end_time}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{getFormationName(item.module_id)}</p>
                        <div className="flex flex-wrap gap-3 text-xs">
                          {item.room && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{item.room}</span>
                            </div>
                          )}
                          {item.teacher_id && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{getTeacherName(item.teacher_id)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{getEnrollmentCount(item.id)} étudiants</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
