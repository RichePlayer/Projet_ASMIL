import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import enrollmentService from "@/services/enrollmentService";
import studentService from "@/services/studentService";
import sessionService from "@/services/sessionService";
import moduleService from "@/services/moduleService";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { Plus, UserCheck, Edit, Trash2, MoreVertical, Loader2 } from "lucide-react";
import DataTable from "@/components/ui/data-table";

import { format } from "date-fns";
import { fr } from "date-fns/locale";

import EnrollmentFormDialog from "@/components/enrollments/EnrollmentFormDialog";
import Swal from 'sweetalert2';

export default function Enrollments() {
  const [showForm, setShowForm] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const queryClient = useQueryClient();

  // ============================
  // FETCH DATA (Backend API)
  // ============================

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentService.getAll(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentService.getAll(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionService.getAll(),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => moduleService.getAll(),
  });

  // ============================
  // DELETE
  // ============================
  const deleteEnrollmentMutation = useMutation({
    mutationFn: (id) => enrollmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      Swal.fire({
        icon: 'success',
        title: 'Supprimée !',
        text: 'L\'inscription a été supprimée avec succès.',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error) => {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors de la suppression.',
      });
    }
  });

  // ============================
  // FILTERS
  // ============================
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesStatus =
      statusFilter === "all" || enrollment.status === statusFilter;
    return matchesStatus;
  });

  // ============================
  // HELPERS
  // ============================

  const getStatusColor = (status) => {
    const colors = {
      "en attente": "bg-yellow-100 text-yellow-800 border-yellow-200",
      actif: "bg-green-100 text-green-800 border-green-200",
      terminé: "bg-blue-100 text-blue-800 border-blue-200",
      annulé: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-slate-100 text-slate-800";
  };

  const getStudentName = (id) => {
    const st = students.find((s) => s.id === id);
    return st ? `${st.first_name} ${st.last_name}` : "Étudiant inconnu";
  };

  const getSessionInfo = (id) => {
    const ses = sessions.find((s) => s.id === id);
    if (!ses) return "Session inconnue";

    const mod = modules.find((m) => m.id === ses.module_id);
    return mod ? mod.title : `Session ${id}`;
  };

  // Format number to avoid "000" display for 0
  const formatAmount = (amount) => {
    if (amount === 0 || amount === null || amount === undefined) return '0';
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const totalActive = enrollments.filter((e) => e.status === "actif").length;
  const totalRevenue = enrollments.reduce(
    (sum, e) => sum + (e.paid_amount || 0),
    0
  );
  const totalPending = enrollments.reduce(
    (sum, e) => sum + ((e.total_amount || 0) - (e.paid_amount || 0)),
    0
  );

  // ============================
  // RENDER
  // ============================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Inscriptions</h1>
          <p className="text-slate-600 mt-1">
            Gérez les inscriptions des étudiants aux sessions
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingEnrollment(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Inscription
        </Button>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Inscriptions Actives
                </p>
                <h3 className="text-3xl font-bold text-green-900 mt-2">
                  {totalActive}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-green-600 shadow-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Revenus Encaissés
                </p>
                <h3 className="text-3xl font-bold text-blue-900 mt-2">
                  {formatAmount(totalRevenue)} Ar
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-600 shadow-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">
                  Reste à Payer
                </p>
                <h3 className="text-3xl font-bold text-red-900 mt-2">
                  {formatAmount(totalPending)} Ar
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-red-600 shadow-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-2">
        {["all", "en attente", "actif", "terminé", "annulé"].map(
          (status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className={
                statusFilter === status
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
              size="sm"
            >
              {status === "all"
                ? "Tous"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          )
        )}
      </div>

      {/* TABLE */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
          ) : (
            <DataTable
              data={filteredEnrollments}
              columns={[
                {
                  key: 'student',
                  label: 'Étudiant',
                  sortable: true,
                  render: (e) => getStudentName(e.student_id),
                },
                {
                  key: 'session',
                  label: 'Session / Module',
                  sortable: true,
                  render: (e) => getSessionInfo(e.session_id),
                },
                {
                  key: 'enrollment_date',
                  label: 'Date',
                  sortable: true,
                  render: (e) =>
                    e.enrollment_date
                      ? format(new Date(e.enrollment_date), "d MMM yyyy", { locale: fr })
                      : "-",
                },
                {
                  key: 'status',
                  label: 'Statut',
                  sortable: true,
                  render: (e) => (
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(e.status)} border`}
                    >
                      {e.status}
                    </Badge>
                  ),
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  sortable: false,
                  searchable: false,
                  render: (e) => (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingEnrollment(e);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700"
                          onClick={() => {
                            Swal.fire({
                              title: 'Êtes-vous sûr ?',
                              text: "Voulez-vous vraiment supprimer cette inscription ?",
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#d33',
                              cancelButtonColor: '#3085d6',
                              confirmButtonText: 'Oui, supprimer',
                              cancelButtonText: 'Annuler'
                            }).then((result) => {
                              if (result.isConfirmed) {
                                deleteEnrollmentMutation.mutate(e.id);
                              }
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ),
                },
              ]}
              searchable={true}
              defaultPageSize={10}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          )}
        </CardContent>
      </Card>

      {/* FORM */}
      {showForm && (
        <EnrollmentFormDialog
          enrollment={editingEnrollment}
          students={students}
          sessions={sessions}
          modules={modules}
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingEnrollment(null);
          }}
        />
      )}
    </div>
  );
}
