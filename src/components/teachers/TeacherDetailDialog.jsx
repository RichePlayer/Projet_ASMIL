
// src/components/teachers/TeacherDetailDialog.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Calendar, DollarSign, Clock, Edit } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function TeacherDetailDialog({ teacher: initialTeacher, open, onClose, onEdit }) {
  const { data: teacherData } = useQuery({
    queryKey: ["teacher", initialTeacher?.id],
    queryFn: async () => {
      const response = await api.get(`/teachers/${initialTeacher.id}`);
      return response.data.teacher;
    },
    enabled: !!initialTeacher?.id,
  });

  const teacher = teacherData || initialTeacher;
  const sessions = teacher?.sessions || [];

  if (!teacher) return null;

  const getStatusColor = (status) => {
    const colors = {
      actif: "bg-green-100 text-green-800 border-green-200",
      inactif: "bg-slate-100 text-slate-800 border-slate-200",
      congé: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[status] || "bg-slate-100 text-slate-800";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Profil Enseignant</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Card */}
          <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {teacher.photo_url ? (
                  <img
                    src={teacher.photo_url}
                    alt={`${teacher.first_name} ${teacher.last_name}`}
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {teacher.first_name} {teacher.last_name}
                  </h2>
                  <p className="text-slate-600 mt-1">{teacher.registration_number || "Enseignant"}</p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <Badge variant="outline" className={`${getStatusColor(teacher.status)} border`}>
                      {teacher.status}
                    </Badge>
                    {teacher.specialties?.map((spec, idx) => (
                      <Badge key={idx} variant="outline" className="border-red-200 bg-red-50 text-red-800">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
              <TabsTrigger value="availability">Disponibilités</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-red-600" />
                    Informations Personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {teacher.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Téléphone</p>
                      <p className="font-medium flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {teacher.phone || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Date d'Embauche</p>
                      <p className="font-medium flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {teacher.hire_date ? format(new Date(teacher.hire_date), "d MMMM yyyy", { locale: fr }) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Tarif Horaire</p>
                      <p className="font-medium flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-slate-400" />
                        {teacher.hourly_rate?.toLocaleString() || "0"} Ar/h
                      </p>
                    </div>
                  </div>
                  {teacher.bio && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Biographie</p>
                      <p className="text-slate-700">{teacher.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-red-600" />
                    Sessions Assignées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">Aucune session assignée</p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">Session - {session.room}</p>
                              <p className="text-sm text-slate-500 mt-1">
                                {session.start_date && format(new Date(session.start_date), "d MMM yyyy", { locale: fr })}{" "}
                                -{" "}
                                {session.end_date && format(new Date(session.end_date), "d MMM yyyy", { locale: fr })}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                session.status === "en cours"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-slate-100 text-slate-800"
                              }
                            >
                              {session.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    Disponibilités
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!teacher.availability || teacher.availability.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">Aucune disponibilité configurée</p>
                  ) : (
                    <div className="space-y-3">
                      {teacher.availability.map((slot, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{slot.day}</span>
                            <span className="text-slate-600">
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
