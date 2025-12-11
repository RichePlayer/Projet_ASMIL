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

import { Plus, UserCheck, Edit, Trash2, MoreVertical, Loader2, Wallet, CreditCard } from "lucide-react";
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
    (sum, e) => sum + parseFloat(e.paid_amount || 0),
    0
  );
  const totalPending = enrollments.reduce(
    (sum, e) => sum + (parseFloat(e.total_amount || 0) - parseFloat(e.paid_amount || 0)),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-emerald-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <UserCheck className="h-32 w-32 text-emerald-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <UserCheck className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Actives</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Inscriptions Actives</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalActive}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-pink-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Wallet className="h-32 w-32 text-pink-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl text-white shadow-lg shadow-pink-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Wallet className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Encaissés</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Revenus Encaissés</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formatAmount(totalRevenue)} Ar</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-red-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <CreditCard className="h-32 w-32 text-red-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white shadow-lg shadow-red-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <CreditCard className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Reste</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Reste à Payer</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formatAmount(totalPending)} Ar</h3>
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
