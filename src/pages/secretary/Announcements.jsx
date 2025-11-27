import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  announcementAPI,
} from "@/api/localDB"; // ⭐ 100% LOCAL DB HERE ⭐

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Plus,
  Bell,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react";

import AnnouncementFormDialog from "@/components/announcements/AnnouncementFormDialog";
import { generateAnnouncementPDF } from "@/components/announcements/AnnouncementPDFGenerator";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

// -----------------------------------------------------------
//                        TYPE COLORS
// -----------------------------------------------------------

const typeColors = {
  information: "bg-blue-100 text-blue-800 border-blue-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
  événement: "bg-purple-100 text-purple-800 border-purple-200",
  "session ouverte": "bg-green-100 text-green-800 border-green-200",
};

// -----------------------------------------------------------
//                   PAGE ANNOUNCEMENTS
// -----------------------------------------------------------

export default function Announcements() {
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const queryClient = useQueryClient();

  // Load announcements (sorted DESC by created_date)
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => announcementAPI.list("-created_date", 200),
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: (id) => announcementAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["announcements"]);
      toast.success("Annonce supprimée");
    },
  });

  // PUBLISH / UNPUBLISH
  const publishMutation = useMutation({
    mutationFn: ({ id, published }) =>
      announcementAPI.update(id, { published }),
    onSuccess: () => {
      queryClient.invalidateQueries(["announcements"]);
      toast.success("Statut mis à jour");
    },
  });

  // UTILITY
  const getTypeColor = (type) => typeColors[type] || "bg-slate-100 text-slate-800";

  return (
    <div className="space-y-8">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Annonces</h1>
          <p className="text-slate-600 mt-1">Communiquez avec vos étudiants et formateurs</p>
        </div>

        <Button
          onClick={() => {
            setEditingAnnouncement(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Annonce
        </Button>
      </div>

      {/* ---------------- EMPTY / LOADING ---------------- */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Chargement...</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Bell className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <p>Aucune annonce disponible</p>
        </div>
      ) : (
        /* ---------------- GRID ---------------- */
        <div className="grid gap-6 md:grid-cols-2">
          {announcements.map((an) => (
            <Card
              key={an.id}
              className={`shadow-xl border border-slate-200 hover:shadow-2xl transition duration-200
                ${an.type === "urgent" ? "ring-2 ring-red-500" : ""}`}
            >
              {/* ---------------- HEADER ---------------- */}
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Badge variant="outline" className={`${getTypeColor(an.type)} border`}>
                        {an.type}
                      </Badge>

                      <Badge variant="outline" className="border-slate-200">
                        {an.target_audience}
                      </Badge>
                    </div>

                    <CardTitle className="text-xl leading-snug">{an.title}</CardTitle>

                    <p className="text-sm text-slate-500">
                      {an.publish_date
                        ? format(new Date(an.publish_date), "d MMMM yyyy", { locale: fr })
                        : ""}
                    </p>
                  </div>

                  {/* ---------------- ACTIONS ---------------- */}
                  <div className="flex gap-1">
                    {/* PDF */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => generateAnnouncementPDF(an)}
                    >
                      <FileText className="h-4 w-4 text-red-600" />
                    </Button>

                    {/* Edit */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingAnnouncement(an);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    {/* Delete */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600"
                      onClick={() => {
                        if (confirm("Supprimer cette annonce ?")) {
                          deleteMutation.mutate(an.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* ---------------- CONTENT ---------------- */}
              <CardContent className="pt-4">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {an.content}
                </p>

                {an.expiry_date && (
                  <p className="text-xs text-slate-500 mt-4">
                    Expire le{" "}
                    {format(new Date(an.expiry_date), "d MMMM yyyy", { locale: fr })}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ---------------- FORM DIALOG ---------------- */}
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
