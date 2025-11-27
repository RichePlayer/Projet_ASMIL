import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// switched to localDB
import {
  sessionAPI,
  moduleAPI,
  formationAPI,
  teacherAPI,
  enrollmentAPI,
} from "@/api/localDB";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, BookOpen, FileText } from "lucide-react";
import { format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { generateTimetableDoc } from "@/components/timetable/TimetableDocGenerator";

export default function Timetable() {
  const [selectedSession, setSelectedSession] = useState("all");
  const [selectedDay, setSelectedDay] = useState("all");
  const [currentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // queries using localDB
  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionAPI.list("-created_date", 1000),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => moduleAPI.list(),
  });

  const { data: formations = [] } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationAPI.list(),
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => teacherAPI.list(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentAPI.list(),
  });

  const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const getModuleName = (moduleId) => {
    const module = modules.find((m) => m.id === moduleId);
    return module?.title || "Module";
  };

  const getFormationName = (moduleId) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return "";
    const formation = formations.find((f) => f.id === module.formation_id);
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
      session.schedule
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
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
        >
          <FileText className="h-4 w-4 mr-2" />
          Exporter DOC
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Sessions Actives</p>
                <h3 className="text-3xl font-bold text-blue-900 mt-2">{activeSessions.length}</h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-600 shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Formations</p>
                <h3 className="text-3xl font-bold text-green-900 mt-2">{formations.length}</h3>
              </div>
              <div className="p-3 rounded-xl bg-green-600 shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Enseignants</p>
                <h3 className="text-3xl font-bold text-purple-900 mt-2">{teachers.length}</h3>
              </div>
              <div className="p-3 rounded-xl bg-purple-600 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Étudiants Actifs</p>
                <h3 className="text-3xl font-bold text-orange-900 mt-2">
                  {enrollments.filter((e) => e.status === "actif").length}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-orange-600 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sessions</SelectItem>
              {activeSessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {getModuleName(session.module_id)} - {session.room}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger>
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
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-red-600" />
            Planning Hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header */}
              <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
                <div className="p-4 font-bold text-slate-700 border-r border-slate-200">Horaire</div>
                {filteredDays.map((day) => (
                  <div key={day} className="p-4 font-bold text-center text-slate-900 border-r border-slate-200">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b border-slate-200 hover:bg-slate-50">
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

// =======================  src/pages/Timetable.jsx  ========================= //

// import React, { useState } from "react";
// import { useQuery } from "@tanstack/react-query";

// // --- LocalDB APIs ---
// import {
//   sessionAPI,
//   moduleAPI,
//   formationAPI,
//   teacherAPI,
//   enrollmentAPI,
// } from "@/api/localDB";

// // --- UI Components ---
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";

// // --- Icons ---
// import { Calendar, Clock, MapPin, Users, BookOpen } from "lucide-react";

// // --- Date Utils ---
// import { format } from "date-fns";
// import { fr } from "date-fns/locale";

// // --- PDF Export Button ---
// import TimetablePDFButton from "@/components/timetable/TimetablePDFButton";

// export default function Timetable() {
//   const [selectedSession, setSelectedSession] = useState("all");
//   const [selectedDay, setSelectedDay] = useState("all");

//   const daysOfWeek = [
//     "Lundi", "Mardi", "Mercredi",
//     "Jeudi", "Vendredi", "Samedi", "Dimanche"
//   ];

//   const timeSlots = [
//     "08:00","09:00","10:00","11:00","12:00","13:00",
//     "14:00","15:00","16:00","17:00","18:00","19:00","20:00"
//   ];

//   // ============================
//   //     LOAD LOCAL DATA
//   // ============================

//   const { data: sessions = [] } = useQuery({
//     queryKey: ["sessions"],
//     queryFn: () => sessionAPI.list("-created_date"),
//   });

//   const { data: modules = [] } = useQuery({
//     queryKey: ["modules"],
//     queryFn: () => moduleAPI.list(),
//   });

//   const { data: formations = [] } = useQuery({
//     queryKey: ["formations"],
//     queryFn: () => formationAPI.list(),
//   });

//   const { data: teachers = [] } = useQuery({
//     queryKey: ["teachers"],
//     queryFn: () => teacherAPI.list(),
//   });

//   const { data: enrollments = [] } = useQuery({
//     queryKey: ["enrollments"],
//     queryFn: () => enrollmentAPI.list(),
//   });

//   // ============================
//   //     HELPERS
//   // ============================

//   const getModuleName = (id) => modules.find((m) => m.id === id)?.title || "";
//   const getTeacherName = (id) => {
//     const t = teachers.find((t) => t.id === id);
//     return t ? `${t.first_name} ${t.last_name}` : "";
//   };
//   const getFormationName = (moduleId) => {
//     const module = modules.find((m) => m.id === moduleId);
//     const formation = formations.find((f) => f.id === module?.formation_id);
//     return formation?.title || "";
//   };
//   const getEnrollmentCount = (sessionId) =>
//     enrollments.filter((e) => e.session_id === sessionId && e.status === "actif").length;

//   const activeSessions = sessions.filter((s) => s.status === "en cours");

//   const getScheduleForDay = (day) => {
//     return activeSessions
//       .flatMap((session) =>
//         session.schedule
//           ?.filter((sch) => sch.day === day)
//           .map((sch) => ({
//             ...session,
//             start_time: sch.start_time,
//             end_time: sch.end_time,
//           }))
//       )
//       .sort((a, b) => a.start_time.localeCompare(b.start_time));
//   };

//   const filteredDays = selectedDay === "all" ? daysOfWeek : [selectedDay];

//   const getSessionColor = (sessionId) => {
//     const colors = [
//       "bg-blue-100 border-blue-300 text-blue-900",
//       "bg-green-100 border-green-300 text-green-900",
//       "bg-purple-100 border-purple-300 text-purple-900",
//       "bg-orange-100 border-orange-300 text-orange-900",
//       "bg-pink-100 border-pink-300 text-pink-900",
//       "bg-indigo-100 border-indigo-300 text-indigo-900",
//     ];
//     const i = sessions.findIndex((s) => s.id === sessionId);
//     return colors[i % colors.length];
//   };

//   // ======================================================================
//   //                           RENDER PAGE
//   // ======================================================================

//   return (
//     <div className="space-y-6">

//       {/* ==================== HEADER ==================== */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-4xl font-black text-slate-900">Emploi du Temps</h1>
//           <p className="text-slate-600 mt-1">Vue hebdomadaire détaillée</p>
//         </div>

//         {/* EXPORT PDF */}
//         <TimetablePDFButton
//           sessions={sessions}
//           modules={modules}
//           formations={formations}
//           teachers={teachers}
//           enrollments={enrollments}
//           daysOfWeek={daysOfWeek}
//           getModuleName={getModuleName}
//           getFormationName={getFormationName}
//           getTeacherName={getTeacherName}
//           getEnrollmentCount={getEnrollmentCount}
//           getScheduleForDay={getScheduleForDay}
//         />
//       </div>

//       {/* ====================== STATS ====================== */}
//       <div className="grid gap-4 md:grid-cols-4">
//         {/* Sessions */}
//         <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
//           <CardContent className="p-6 flex justify-between">
//             <div>
//               <p className="text-sm font-medium text-blue-700">Sessions Actives</p>
//               <h3 className="text-3xl font-bold text-blue-900 mt-2">{activeSessions.length}</h3>
//             </div>
//             <div className="p-3 rounded-xl bg-blue-600 shadow-lg">
//               <Calendar className="h-6 w-6 text-white" />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Formations */}
//         <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
//           <CardContent className="p-6 flex justify-between">
//             <div>
//               <p className="text-sm font-medium text-green-700">Formations</p>
//               <h3 className="text-3xl font-bold text-green-900 mt-2">{formations.length}</h3>
//             </div>
//             <div className="p-3 rounded-xl bg-green-600 shadow-lg">
//               <BookOpen className="h-6 w-6 text-white" />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Teachers */}
//         <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
//           <CardContent className="p-6 flex justify-between">
//             <div>
//               <p className="text-sm font-medium text-purple-700">Enseignants</p>
//               <h3 className="text-3xl font-bold text-purple-900 mt-2">{teachers.length}</h3>
//             </div>
//             <div className="p-3 rounded-xl bg-purple-600 shadow-lg">
//               <Users className="h-6 w-6 text-white" />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Students */}
//         <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
//           <CardContent className="p-6 flex justify-between">
//             <div>
//               <p className="text-sm font-medium text-orange-700">Étudiants Actifs</p>
//               <h3 className="text-3xl font-bold text-orange-900 mt-2">
//                 {enrollments.filter((e) => e.status === "actif").length}
//               </h3>
//             </div>
//             <div className="p-3 rounded-xl bg-orange-600 shadow-lg">
//               <Users className="h-6 w-6 text-white" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* ====================== FILTERS ====================== */}

//       <div className="flex flex-col sm:flex-row gap-4">
//         {/* Select Session */}
//         <div className="flex-1">
//           <Select value={selectedSession} onValueChange={setSelectedSession}>
//             <SelectTrigger>
//               <SelectValue placeholder="Toutes les sessions" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">Toutes les sessions</SelectItem>
//               {activeSessions.map((s) => (
//                 <SelectItem key={s.id} value={s.id}>
//                   {getModuleName(s.module_id)} — {s.room}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Select Day */}
//         <div className="flex-1">
//           <Select value={selectedDay} onValueChange={setSelectedDay}>
//             <SelectTrigger>
//               <SelectValue placeholder="Tous les jours" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">Tous les jours</SelectItem>
//               {daysOfWeek.map((day) => (
//                 <SelectItem key={day} value={day}>{day}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* ====================== WEEKLY GRID ====================== */}

//       <Card className="shadow-lg border-0 overflow-hidden">
//         <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
//           <CardTitle className="flex items-center gap-2">
//             <Calendar className="h-5 w-5 text-red-600" />
//             Planning Hebdomadaire
//           </CardTitle>
//         </CardHeader>

//         <CardContent className="p-0">
//           <div className="overflow-x-auto">
//             <div className="min-w-[1200px]">

//               {/* Columns Header */}
//               <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
//                 <div className="p-4 font-bold border-r">Horaire</div>
//                 {filteredDays.map((day) => (
//                   <div key={day} className="p-4 text-center font-bold border-r">
//                     {day}
//                   </div>
//                 ))}
//               </div>

//               {/* Rows */}
//               {timeSlots.map((time) => (
//                 <div key={time} className="grid grid-cols-8 border-b border-slate-200">
//                   <div className="p-3 text-sm font-medium bg-slate-50 border-r">{time}</div>

//                   {filteredDays.map((day) => {
//                     const schedule = getScheduleForDay(day);
//                     const session = schedule.find(
//                       (s) => s.start_time <= time && s.end_time > time
//                     );

//                     return (
//                       <div key={day + time} className="p-2 border-r min-h-[80px]">
//                         {session && (
//                           <div className={`p-3 rounded-lg border-2 shadow-sm ${getSessionColor(session.id)}`}>
//                             <h4 className="font-bold text-sm mb-1">
//                               {getModuleName(session.module_id)}
//                             </h4>

//                             <div className="text-xs space-y-1">
//                               <div className="flex items-center gap-1">
//                                 <Clock className="h-3 w-3" />
//                                 {session.start_time}–{session.end_time}
//                               </div>

//                               {session.room && (
//                                 <div className="flex items-center gap-1">
//                                   <MapPin className="h-3 w-3" />
//                                   {session.room}
//                                 </div>
//                               )}

//                               <div className="flex items-center gap-1">
//                                 <Users className="h-3 w-3" />
//                                 {getTeacherName(session.teacher_id)}
//                               </div>

//                               <Badge variant="outline" className="mt-1 bg-white text-xs">
//                                 {getEnrollmentCount(session.id)} étudiants
//                               </Badge>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               ))}

//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* ====================== DAY CARDS ====================== */}

//       <div className="grid gap-6 md:grid-cols-2">
//         {filteredDays.map((day) => {
//           const schedule = getScheduleForDay(day);

//           return (
//             <Card key={day} className="shadow-lg border-0">
//               <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
//                 <CardTitle className="flex justify-between items-center">
//                   <span>{day}</span>
//                   <Badge className="bg-red-600">{schedule.length} cours</Badge>
//                 </CardTitle>
//               </CardHeader>

//               <CardContent className="p-6">
//                 {schedule.length === 0 ? (
//                   <div className="text-center py-8 text-slate-500">
//                     <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
//                     <p>Aucun cours planifié</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {schedule.map((s, i) => (
//                       <div key={i} className={`p-4 rounded-lg border-2 ${getSessionColor(s.id)}`}>
//                         <div className="flex justify-between mb-2">
//                           <h4 className="font-bold">{getModuleName(s.module_id)}</h4>
//                           <Badge variant="outline" className="bg-white">
//                             {s.start_time}–{s.end_time}
//                           </Badge>
//                         </div>

//                         <p className="text-sm mb-2">{getFormationName(s.module_id)}</p>

//                         <div className="flex flex-wrap text-xs gap-3">
//                           {s.room && (
//                             <span className="flex items-center gap-1">
//                               <MapPin className="h-3 w-3" /> {s.room}
//                             </span>
//                           )}

//                           <span className="flex items-center gap-1">
//                             <Users className="h-3 w-3" /> {getTeacherName(s.teacher_id)}
//                           </span>

//                           <span className="flex items-center gap-1">
//                             <Users className="h-3 w-3" /> {getEnrollmentCount(s.id)} étudiants
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
