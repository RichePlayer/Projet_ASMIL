// src/pages/secretary/Certificates.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import certificateService from "@/services/certificateService";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  RefreshCw,
  Plus,
  MoreVertical,
  Eye,
  Trash2,
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import Swal from "sweetalert2";
import DataTable from "@/components/ui/data-table";
import CertificateGenerator from "@/components/certificates/CertificateGenerator";
import CertificatePreview from "@/components/certificates/CertificatePreview";

export default function Certificates() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Fetch certificates from backend
  const { data: certificates = [], isLoading, refetch } = useQuery({
    queryKey: ["certificates"],
    queryFn: () => certificateService.getAll({ limit: 1000 }),
  });

  // Revoke certificate mutation
  const revokeMutation = useMutation({
    mutationFn: (id) => certificateService.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificat révoqué avec succès");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la révocation");
    },
  });

  // Delete certificate mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => certificateService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      Swal.fire({
        icon: "success",
        title: "Supprimé !",
        text: "Le certificat a été supprimé avec succès.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.response?.data?.message || "Impossible de supprimer le certificat.",
      });
    },
  });

  // Handle revoke with confirmation
  const handleRevoke = (cert) => {
    const studentName = cert.student
      ? `${cert.student.first_name} ${cert.student.last_name}`
      : "Inconnu";

    Swal.fire({
      title: "Révoquer ce certificat ?",
      text: `Le certificat de ${studentName} sera révoqué.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Oui, révoquer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        revokeMutation.mutate(cert.id);
      }
    });
  };

  // Handle delete with confirmation
  const handleDelete = (cert) => {
    Swal.fire({
      title: "Supprimer ce certificat ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(cert.id);
      }
    });
  };

  // Filter certificates by status
  const filteredCertificates = certificates.filter((cert) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "valide") return cert.status === "valide" || cert.status === "actif";
    if (statusFilter === "révoqué") return cert.status === "révoqué";
    return true;
  });

  // Calculate statistics
  const totalCertificates = certificates.length;
  const activeCertificates = certificates.filter((c) => c.status === "valide" || c.status === "actif").length;
  const revokedCertificates = certificates.filter((c) => c.status === "révoqué").length;

  // Status badge
  const getStatusBadge = (status) => {
    const isActive = status === "valide" || status === "actif";
    return (
      <Badge
        className={`rounded-full h-6 px-3 text-[10px] font-bold uppercase tracking-wider border-none ${isActive
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
          }`}
      >
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <Award className="h-6 w-6 text-red-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <span className="text-slate-600 font-medium animate-pulse">Chargement des certificats...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">{t('certificates.title')}</h1>
          <p className="text-slate-600 mt-1">{t('certificates.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.refresh')}
          </Button>
          <Button
            onClick={() => setShowGenerator(true)}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('certificates.generateCertificate')}
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Certificates */}
        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-blue-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <FileText className="h-32 w-32 text-blue-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Total</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Total Certificats</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalCertificates}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Active Certificates */}
        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-emerald-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <CheckCircle2 className="h-32 w-32 text-emerald-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Actifs</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">{t('certificates.stats.activeCertificates')}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{activeCertificates}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Revoked Certificates */}
        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-red-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <XCircle className="h-32 w-32 text-red-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white shadow-lg shadow-red-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <XCircle className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Révoqués</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">{t('certificates.stats.revoked')}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{revokedCertificates}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2">
        {["all", "valide", "révoqué"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
            className={statusFilter === status ? "bg-red-600 hover:bg-red-700" : ""}
            size="sm"
          >
            {status === "all" ? "Tous" : status === "valide" ? "Valides" : "Révoqués"}
          </Button>
        ))}
      </div>

      {/* TABLE */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <DataTable
            data={filteredCertificates}
            columns={[
              {
                key: 'certificate_number',
                label: 'N° Certificat',
                sortable: true,
                render: (cert) => (
                  <span className="font-mono font-medium text-slate-700">
                    {cert.certificate_number}
                  </span>
                ),
              },
              {
                key: 'student',
                label: 'Étudiant',
                sortable: true,
                render: (cert) => (
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                      {cert.student?.first_name?.[0]}{cert.student?.last_name?.[0]}
                    </div>
                    <span className="font-medium">
                      {cert.student?.first_name} {cert.student?.last_name}
                    </span>
                  </div>
                ),
              },
              {
                key: 'formation',
                label: 'Formation',
                sortable: true,
                render: (cert) => cert.formation_title || cert.formation?.title || "N/A",
              },
              {
                key: 'grade',
                label: 'Note',
                sortable: true,
                render: (cert) => (
                  <span className="font-bold text-emerald-600">
                    {cert.grade ? `${Number(cert.grade).toFixed(1)}/20` : "N/A"}
                  </span>
                ),
              },
              {
                key: 'attendance_rate',
                label: 'Présence',
                sortable: true,
                render: (cert) => (
                  <span className="font-medium text-blue-600">
                    {cert.attendance_rate ? `${Number(cert.attendance_rate).toFixed(0)}%` : "N/A"}
                  </span>
                ),
              },
              {
                key: 'issue_date',
                label: 'Date',
                sortable: true,
                render: (cert) => (
                  <span className="text-slate-500">
                    {(cert.issue_date || cert.date_obtention)
                      ? format(new Date(cert.issue_date || cert.date_obtention), "d MMM yyyy", { locale: fr })
                      : "N/A"}
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Statut',
                sortable: true,
                render: (cert) => getStatusBadge(cert.status),
              },
              {
                key: 'actions',
                label: 'Actions',
                sortable: false,
                searchable: false,
                render: (cert) => {
                  const isActive = cert.status === "valide" || cert.status === "actif";
                  return (
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onSelect={() => setSelectedCertificate(cert)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir / Télécharger
                          </DropdownMenuItem>
                          {isActive && (
                            <DropdownMenuItem
                              onSelect={() => handleRevoke(cert)}
                              className="text-orange-600 focus:text-orange-700"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Révoquer
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700"
                            onSelect={() => handleDelete(cert)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                },
              },
            ]}
            searchable={true}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showGenerator && (
        <CertificateGenerator
          open={showGenerator}
          onClose={() => setShowGenerator(false)}
        />
      )}

      {selectedCertificate && (
        <CertificatePreview
          certificate={selectedCertificate}
          student={selectedCertificate.student}
          open={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}
