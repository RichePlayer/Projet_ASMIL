import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import announcementService from "@/services/announcementService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Switch } from "@/components/ui/switch";
import { Loader2, Bell, Save } from "lucide-react";
import Swal from "sweetalert2";

export default function AnnouncementFormDialog({ announcement, open, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "information",
    target_audience: "tous",
    published: false,
    publish_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
  });

  const queryClient = useQueryClient();

  // Load data when editing
  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || "",
        content: announcement.content || "",
        type: announcement.type || "information",
        target_audience: announcement.target_audience || "tous",
        published: announcement.published || false,
        publish_date: announcement.publish_date
          ? new Date(announcement.publish_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        expiry_date: announcement.expiry_date
          ? new Date(announcement.expiry_date).toISOString().split("T")[0]
          : "",
      });
    } else {
      setFormData({
        title: "",
        content: "",
        type: "information",
        target_audience: "tous",
        published: false,
        publish_date: new Date().toISOString().split("T")[0],
        expiry_date: "",
      });
    }
  }, [announcement]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (announcement) {
        return announcementService.update(announcement.id, data);
      }
      return announcementService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      Swal.fire({
        icon: "success",
        title: announcement ? "Modifiée !" : "Créée !",
        text: `L'annonce a été ${announcement ? "modifiée" : "créée"} avec succès.`,
        timer: 2000,
        showConfirmButton: false,
      });
      onClose();
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.response?.data?.message || "Impossible d'enregistrer l'annonce.",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Champ requis",
        text: "Le titre est obligatoire.",
      });
      return;
    }

    if (!formData.content.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Champ requis",
        text: "Le contenu est obligatoire.",
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-200">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Bell className="h-6 w-6 text-red-600" />
            {announcement ? "Modifier l'Annonce" : "Nouvelle Annonce"}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6" style={{ maxHeight: "calc(90vh - 180px)" }}>
          <form id="announcement-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <Label className="text-sm font-semibold text-slate-700">Titre *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de l'annonce"
                className="mt-1"
              />
            </div>

            {/* Content */}
            <div>
              <Label className="text-sm font-semibold text-slate-700">Contenu *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                placeholder="Écrivez ici le contenu de l'annonce..."
                className="mt-1"
              />
            </div>

            {/* Type + Target */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="information">📢 Information</SelectItem>
                    <SelectItem value="urgent">🚨 Urgent</SelectItem>
                    <SelectItem value="événement">📅 Événement</SelectItem>
                    <SelectItem value="session ouverte">✅ Session Ouverte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Public Cible *</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">👥 Tous</SelectItem>
                    <SelectItem value="étudiants">🎓 Étudiants</SelectItem>
                    <SelectItem value="formateurs">👨‍🏫 Formateurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Date de Publication</Label>
                <Input
                  type="date"
                  value={formData.publish_date}
                  onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Date d'Expiration</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Laissez vide pour une annonce permanente</p>
              </div>
            </div>

            {/* Published Switch */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Publier immédiatement</Label>
                <p className="text-xs text-slate-500 mt-1">L'annonce sera visible par le public cible</p>
              </div>
              <Switch
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
            </div>
          </form>
        </div>

        {/* Footer with gradient */}
        <DialogFooter className="bg-gradient-to-r from-slate-100 to-slate-200 p-4 rounded-b-lg border-t">
          <Button variant="outline" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            form="announcement-form"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
