import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import announcementService from "@/services/announcementService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Plus,
  Bell,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  AlertTriangle,
  Calendar,
  Users,
  Clock,
  Loader2,
  RefreshCw,
  Megaphone,
} from "lucide-react";

import AnnouncementFormDialog from "@/components/announcements/AnnouncementFormDialog";
import { generateAnnouncementPDF } from "@/components/announcements/AnnouncementPDFGenerator";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Swal from "sweetalert2";

// Type Colors
const typeColors = {
  information: "bg-blue-100 text-blue-800 border-blue-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
  événement: "bg-purple-100 text-purple-800 border-purple-200",
  "session ouverte": "bg-green-100 text-green-800 border-green-200",
};

export default function Announcements() {
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Load announcements from backend
  const { data: announcements = [], isLoading, refetch } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => announcementService.getAll({ limit: 200 }),
  });

  // DELETE mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => announcementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["announcements"]);
      Swal.fire({
        icon: "success",
        title: "Supprimée !",
        text: "L'annonce a été supprimée avec succès.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.response?.data?.message || "Impossible de supprimer l'annonce.",
      });
    },
  });

  // PUBLISH / UNPUBLISH mutation
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, published }) => announcementService.togglePublish(id, published),
    onSuccess: (_, { published }) => {
      queryClient.invalidateQueries(["announcements"]);
      Swal.fire({
        icon: "success",
        title: published ? "Publiée !" : "Dépubliée !",
        text: `L'annonce a été ${published ? "publiée" : "retirée"} avec succès.`,
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: () => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de changer le statut de l'annonce.",
      });
    },
  });

  // Handle delete
  const handleDelete = (announcement) => {
    Swal.fire({
      title: "Supprimer cette annonce ?",
      text: `"${announcement.title}" sera supprimée définitivement.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(announcement.id);
      }
    });
  };

  // Handle toggle publish
  const handleTogglePublish = (announcement) => {
    const newStatus = !announcement.published;
    Swal.fire({
      title: newStatus ? "Publier l'annonce ?" : "Retirer l'annonce ?",
      text: newStatus
        ? "L'annonce sera visible par le public cible."
        : "L'annonce ne sera plus visible.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: newStatus ? "#10B981" : "#F59E0B",
      cancelButtonColor: "#6B7280",
      confirmButtonText: newStatus ? "Oui, publier" : "Oui, retirer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        togglePublishMutation.mutate({ id: announcement.id, published: newStatus });
      }
    });
  };

  // Get type color
  const getTypeColor = (type) => typeColors[type] || "bg-slate-100 text-slate-800";

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: announcements.length,
      published: announcements.filter((a) => a.published).length,
      urgent: announcements.filter((a) => a.type === "urgent").length,
      events: announcements.filter((a) => a.type === "événement").length,
      expired: announcements.filter((a) => a.expiry_date && new Date(a.expiry_date) < now).length,
    };
  }, [announcements]);

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    let filtered = [...announcements];

    if (typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    if (statusFilter === "published") {
      filtered = filtered.filter((a) => a.published);
    } else if (statusFilter === "draft") {
      filtered = filtered.filter((a) => !a.published);
    } else if (statusFilter === "expired") {
      const now = new Date();
      filtered = filtered.filter((a) => a.expiry_date && new Date(a.expiry_date) < now);
    }

    // Sort by publish_date DESC
    filtered.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));

    return filtered;
  }, [announcements, typeFilter, statusFilter]);

  // Check if expired
  const isExpired = (expiry_date) => {
    if (!expiry_date) return false;
    return new Date(expiry_date) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="ml-2 text-slate-600">Chargement des annonces...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">{t('announcements.title')}</h1>
          <p className="text-slate-600 mt-1">{t('announcements.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => refetch()} variant="outline" className="border-slate-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('announcements.refresh')}
          </Button>
          <Button
            onClick={() => {
              setEditingAnnouncement(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('announcements.addAnnouncement')}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total */}
        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-blue-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Megaphone className="h-32 w-32 text-blue-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Megaphone className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('common.total')}</span>
            </div>
            <p className="text-slate-500 text-sm font-semibold mb-1">{t('announcements.stats.totalAnnouncements')}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.total}</h3>
          </CardContent>
        </Card>

        {/* Published */}
        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-green-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Eye className="h-32 w-32 text-green-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white shadow-lg shadow-green-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Eye className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('common.active')}</span>
            </div>
            <p className="text-slate-500 text-sm font-semibold mb-1">{t('announcements.stats.published')}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.published}</h3>
          </CardContent>
        </Card>

        {/* Urgent */}
        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-red-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <AlertTriangle className="h-32 w-32 text-red-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white shadow-lg shadow-red-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('announcements.priority')}</span>
            </div>
            <p className="text-slate-500 text-sm font-semibold mb-1">{t('announcements.stats.urgent')}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.urgent}</h3>
          </CardContent>
        </Card>

        {/* Events */}
        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-purple-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Calendar className="h-32 w-32 text-purple-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('announcements.events')}</span>
            </div>
            <p className="text-slate-500 text-sm font-semibold mb-1">{t('announcements.stats.events')}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.events}</h3>
          </CardContent>
        </Card>

        {/* Expired */}
        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-orange-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Clock className="h-32 w-32 text-orange-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Clock className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('announcements.expired')}</span>
            </div>
            <p className="text-slate-500 text-sm font-semibold mb-1">{t('announcements.stats.expired')}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.expired}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-2xl shadow-lg">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-slate-700 mb-2 block">Type</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="information">Information</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="événement">Événement</SelectItem>
              <SelectItem value="session ouverte">Session Ouverte</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-slate-700 mb-2 block">Statut</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="published">Publiées</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="expired">Expirées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Badge variant="outline" className="h-10 px-4 flex items-center">
            {filteredAnnouncements.length} annonce(s)
          </Badge>
        </div>
      </div>

      {/* Announcements Grid */}
      {filteredAnnouncements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <Bell className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 font-medium">Aucune annonce trouvée</p>
          <p className="text-sm text-slate-400 mt-1">Modifiez les filtres ou créez une nouvelle annonce</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredAnnouncements.map((an) => (
            <Card
              key={an.id}
              className={`shadow-xl border hover:shadow-2xl transition-all duration-300 ${an.type === "urgent" ? "ring-2 ring-red-500 border-red-200" : "border-slate-200"
                } ${isExpired(an.expiry_date) ? "opacity-60" : ""}`}
            >
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className={`${getTypeColor(an.type)} border`}>
                        {an.type}
                      </Badge>
                      <Badge variant="outline" className="border-slate-200">
                        {an.target_audience}
                      </Badge>
                      {an.published ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Eye className="h-3 w-3 mr-1" />
                          Publiée
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-100 text-slate-600">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Brouillon
                        </Badge>
                      )}
                      {isExpired(an.expiry_date) && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Expirée
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-xl leading-snug">{an.title}</CardTitle>

                    <p className="text-sm text-slate-500">
                      {an.publish_date
                        ? format(new Date(an.publish_date), "d MMMM yyyy", { locale: fr })
                        : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    {/* Toggle Publish */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`h-8 w-8 ${an.published ? "hover:bg-orange-50" : "hover:bg-green-50"}`}
                      onClick={() => handleTogglePublish(an)}
                      title={an.published ? "Retirer" : "Publier"}
                    >
                      {an.published ? (
                        <EyeOff className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-green-600" />
                      )}
                    </Button>

                    {/* PDF */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-red-50"
                      onClick={() => generateAnnouncementPDF(an)}
                      title="Exporter PDF"
                    >
                      <FileText className="h-4 w-4 text-red-600" />
                    </Button>

                    {/* Edit */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-blue-50"
                      onClick={() => {
                        setEditingAnnouncement(an);
                        setShowForm(true);
                      }}
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>

                    {/* Delete */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-red-50"
                      onClick={() => handleDelete(an)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-4">
                  {an.content}
                </p>

                {an.expiry_date && (
                  <p className={`text-xs mt-4 ${isExpired(an.expiry_date) ? "text-orange-600 font-medium" : "text-slate-500"}`}>
                    {isExpired(an.expiry_date) ? "Expirée le " : "Expire le "}
                    {format(new Date(an.expiry_date), "d MMMM yyyy", { locale: fr })}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      {showForm && (
        <AnnouncementFormDialog
          open={showForm}
          announcement={editingAnnouncement}
          onClose={() => {
            setShowForm(false);
            setEditingAnnouncement(null);
          }}
        />
      )}
    </div>
  );
}
