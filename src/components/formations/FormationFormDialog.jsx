import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function FormationFormDialog({ formation, open, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_months: 1,
    price: 0,
    type: "certifiante",
    image_url: "",
    prerequisites: "",
  });

  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (formation) {
      setFormData({
        title: formation.title || "",
        description: formation.description || "",
        duration_months: formation.duration_months || 1,
        price: formation.price || 0,
        type: formation.type || "certifiante",
        image_url: formation.image_url || "",
        prerequisites: formation.prerequisites || "",
      });
    }
  }, [formation]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (formation) {
        return base44.entities.Formation.update(formation.id, data);
      }
      return base44.entities.Formation.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      toast.success(formation ? "Formation modifiée" : "Formation créée");
      onClose();
    },
  });

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      toast.success("Image téléchargée");
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {formation ? "Modifier la Formation" : "Nouvelle Formation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label>Image de la Formation</Label>
            {formData.image_url ? (
              <div className="relative mt-2">
                <img
                  src={formData.image_url}
                  alt="Formation"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData({ ...formData, image_url: "" })}
                >
                  Supprimer
                </Button>
              </div>
            ) : (
              <label className="mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="h-12 w-12 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">
                  Cliquez pour télécharger une image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Titre *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="Ex: Formation Excel Avancé"
              />
            </div>

            <div>
              <Label>Type *</Label>
              <select
                className="border rounded-md px-3 py-2 w-full"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="certifiante">Certifiante</option>
                <option value="diplomante">Diplômante</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div>
              <Label>Durée (mois) *</Label>
              <Input
                type="number"
                min="1"
                value={formData.duration_months}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_months: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>

            <div>
              <Label>Prix (DH) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Décrivez la formation..."
              />
            </div>

            <div className="md:col-span-2">
              <Label>Prérequis</Label>
              <Textarea
                value={formData.prerequisites}
                onChange={(e) =>
                  setFormData({ ...formData, prerequisites: e.target.value })
                }
                rows={2}
                placeholder="Ex: Connaissances de base"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              disabled={saveMutation.isPending || uploading}
            >
              {saveMutation.isPending
                ? "Enregistrement..."
                : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
