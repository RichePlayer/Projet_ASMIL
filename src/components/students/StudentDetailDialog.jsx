import React from "react";
import { useQuery } from "@tanstack/react-query";
import enrollmentService from "@/services/enrollmentService";
import { invoiceAPI } from "@/api/localDB"; // ⬅️ LOCAL DB API for invoices (to be migrated later)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CreditCard,
  Award,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function StudentDetailDialog({
  student,
  open,
  onClose,
  onEdit,
}) {
  // 🔥 Backend Enrollments
  const { data: enrollments = [] } = useQuery({
    queryKey: ["student-enrollments", student?.id],
    queryFn: () => enrollmentService.getAll({ student_id: student.id }),
    enabled: !!student?.id,
  });

  // 🔥 Local Invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ["student-invoices", student?.id],
    queryFn: () => {
      const all = invoiceAPI.list();
      const enrollmentIds = enrollments.map((e) => e.id);
      return all.filter((inv) => enrollmentIds.includes(inv.enrollment_id));
    },
    enabled: enrollments.length > 0,
  });

  if (!student) return null;

  const getStatusColor = (status) => {
    const colors = {
      actif: "bg-green-100 text-green-800 border-green-200",
      inactif: "bg-slate-100 text-slate-800 border-slate-200",
      diplômé: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return colors[status] || "bg-slate-100 text-slate-800";
  };

  // 🔢 Totaux paiements
  const totalPaid = invoices
    .filter((inv) => inv.status === "payée")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const totalDue = invoices
    .filter((inv) => inv.status === "impayée")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Profil Étudiant
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* HEADER CARD */}
          <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {student.photo_url ? (
                  <img
                    src={student.photo_url}
                    alt="avatar"
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {student.first_name?.[0]}
                    {student.last_name?.[0]}
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {student.first_name} {student.last_name}
                  </h2>
                  <p className="text-slate-600 font-mono text-sm mt-1">
                    {student.registration_number}
                  </p>
                  <div className="mt-3">
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(student.status)} border`}
                    >
                      {student.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TABS */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="enrollments">Inscriptions</TabsTrigger>
              <TabsTrigger value="payments">Paiements</TabsTrigger>
            </TabsList>

            {/* INFORMATIONS PERSONNELLES */}
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
                      <p className="text-sm text-slate-500">Date de Naissance</p>
                      <p className="font-medium flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {student.date_of_birth
                          ? format(
                            new Date(student.date_of_birth),
                            "d MMMM yyyy",
                            { locale: fr }
                          )
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Genre</p>
                      <p className="font-medium mt-1">{student.gender || "-"}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {student.email || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Téléphone Parent</p>
                      <p className="font-medium flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {student.phone_parent || "-"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm text-slate-500">Adresse</p>
                      <p className="font-medium flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {student.address || "-"}
                      </p>
                    </div>


                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* INSCRIPTIONS */}
            <TabsContent value="enrollments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-red-600" />
                    Inscriptions ({enrollments.length})
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {enrollments.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                      Aucune inscription
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {enrollments.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">
                                {enrollment.session?.module?.title || `Session #${enrollment.session_id}`}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                {enrollment.enrollment_date &&
                                  format(
                                    new Date(enrollment.enrollment_date),
                                    "d MMM yyyy",
                                    { locale: fr }
                                  )}
                              </p>
                            </div>

                            <Badge
                              variant="outline"
                              className={`${enrollment.status === "actif"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-slate-100 text-slate-800 border-slate-200"
                                }`}
                            >
                              {enrollment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* PAIEMENTS */}
            <TabsContent value="payments" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-green-700">Total Payé</p>
                    <p className="text-2xl font-bold text-green-800 mt-1">
                      {totalPaid.toLocaleString()} Ar
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-red-700">Total Impayé</p>
                    <p className="text-2xl font-bold text-red-800 mt-1">
                      {totalDue.toLocaleString()} Ar
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-red-600" />
                    Historique des Factures
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {invoices.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                      Aucune facture
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">
                                {invoice.invoice_number ||
                                  `Facture #${invoice.id}`}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                {invoice.due_date &&
                                  format(
                                    new Date(invoice.due_date),
                                    "d MMM yyyy",
                                    { locale: fr }
                                  )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                {invoice.amount?.toLocaleString()} Ar
                              </p>
                              <Badge
                                variant="outline"
                                className={`${invoice.status === "payée"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                                  } mt-1`}
                              >
                                {invoice.status}
                              </Badge>
                            </div>
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
