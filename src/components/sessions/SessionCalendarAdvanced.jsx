import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import sessionService from "@/services/sessionService";
import teacherService from "@/services/teacherService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, AlertTriangle, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";

export default function SessionCalendarAdvanced() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: sessionService.getAll,
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: teacherService.getAll,
  });

  const detectConflicts = (session) => {
    const conflicts = [];

    // Room conflicts
    const roomConflicts = sessions.filter((s) => {
      if (s.id === session.id || !s.room || s.room !== session.room) return false;
      const sStart = new Date(s.start_date);
      const sEnd = new Date(s.end_date);
      const sessionStart = new Date(session.start_date);
      const sessionEnd = new Date(session.end_date);
      return (sessionStart <= sEnd && sessionEnd >= sStart);
    });

    if (roomConflicts.length > 0) {
      conflicts.push({ type: "room", count: roomConflicts.length, message: `Salle ${session.room} déjà réservée` });
    }

    // Teacher conflicts
    if (session.teacher_id) {
      const teacherConflicts = sessions.filter((s) => {
        if (s.id === session.id || s.teacher_id !== session.teacher_id) return false;
        const sStart = new Date(s.start_date);
        const sEnd = new Date(s.end_date);
        const sessionStart = new Date(session.start_date);
        const sessionEnd = new Date(session.end_date);
        return (sessionStart <= sEnd && sessionEnd >= sStart);
      });

      if (teacherConflicts.length > 0) {
        const teacher = teachers.find((t) => t.id === session.teacher_id);
        conflicts.push({
          type: "teacher",
          count: teacherConflicts.length,
          message: `${teacher?.first_name} ${teacher?.last_name} déjà occupé(e)`,
        });
      }
    }

    return conflicts;
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSessionsForDate = (date) => {
    return sessions.filter((session) => {
      const start = new Date(session.start_date);
      const end = new Date(session.end_date);
      return date >= start && date <= end;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      "planifiée": "bg-blue-100 text-blue-800 border-blue-200",
      "à venir": "bg-blue-100 text-blue-800 border-blue-200",
      "en cours": "bg-green-100 text-green-800 border-green-200",
      "terminée": "bg-slate-100 text-slate-800 border-slate-200",
      "annulée": "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-slate-100 text-slate-800";
  };

  const totalConflicts = sessions.reduce((count, session) => {
    return count + detectConflicts(session).length;
  }, 0);

  return (
    <div className="space-y-6">
      {totalConflicts > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900">
                  {totalConflicts} conflit(s) détecté(s)
                </p>
                <p className="text-sm text-orange-700">
                  Vérifiez les réservations de salles et disponibilités des enseignants
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-600" />
              Calendrier des Sessions
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[200px] text-center">
                {format(currentMonth, "MMMM yyyy", { locale: fr })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Aujourd'hui
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div key={day} className="text-center font-semibold text-slate-600 py-2">
                {day}
              </div>
            ))}

            {Array.from({ length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[100px] bg-slate-50 rounded-lg" />
            ))}

            {days.map((day) => {
              const daySessions = getSessionsForDate(day);
              const isToday = isSameDay(day, new Date());
              const hasConflicts = daySessions.some((s) => detectConflicts(s).length > 0);

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[100px] p-2 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${isToday ? "border-red-600 bg-red-50" : "border-slate-200 bg-white"
                    } ${hasConflicts ? "ring-2 ring-orange-500" : ""}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday ? "text-red-600" : "text-slate-900"}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {daySessions.slice(0, 2).map((session) => {
                      const conflicts = detectConflicts(session);
                      const formationName = session.module?.formation?.title || "Session";
                      return (
                        <div
                          key={session.id}
                          className={`text-xs p-1 rounded ${conflicts.length > 0
                            ? "bg-orange-100 border border-orange-300"
                            : getStatusColor(session.status)
                            }`}
                        >
                          <div className="font-medium truncate">{formationName}</div>
                          {session.room && <div className="text-[10px] opacity-75">{session.room}</div>}
                        </div>
                      );
                    })}
                    {daySessions.length > 2 && (
                      <div className="text-[10px] text-slate-500 text-center">
                        +{daySessions.length - 2} autre(s)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-red-50 to-red-100">
            <CardTitle>Sessions du {format(selectedDate, "d MMMM yyyy", { locale: fr })}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {getSessionsForDate(selectedDate).length === 0 ? (
              <p className="text-center text-slate-500 py-8">Aucune session ce jour</p>
            ) : (
              <div className="space-y-3">
                {getSessionsForDate(selectedDate).map((session) => {
                  const teacher = teachers.find((t) => t.id === session.teacher_id);
                  const conflicts = detectConflicts(session);
                  const formationName = session.module?.formation?.title || "Formation";

                  return (
                    <div
                      key={session.id}
                      className={`p-4 border-2 rounded-lg ${conflicts.length > 0 ? "border-orange-300 bg-orange-50" : "border-slate-200"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900">{formationName}</h4>
                          {teacher && (
                            <p className="text-sm text-slate-600">
                              {teacher.first_name} {teacher.last_name}
                            </p>
                          )}
                          {session.room && (
                            <p className="text-sm text-slate-600">Salle: {session.room}</p>
                          )}
                        </div>
                        <Badge variant="outline" className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>

                      {conflicts.length > 0 && (
                        <div className="mt-3 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-orange-900 mb-1">Conflits détectés:</p>
                              <ul className="text-sm text-orange-800 space-y-1">
                                {conflicts.map((conflict, idx) => (
                                  <li key={idx}>• {conflict.message}</li>
                                ))}
                              </ul>
                            </div>
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
      )}
    </div>
  );
}
