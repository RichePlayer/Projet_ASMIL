
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/services/api";
import Swal from 'sweetalert2';

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

import { Upload, Trash2 } from "lucide-react";


export default function FormationFormDialog({
  formation,
  categories,
  open,
  onClose,
}) {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    prerequisites: "",
    duration_months: 1,
    price: 0,
    type: "certifiante",
    image_url: "",
  });

  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  /* ----------------------------- LOAD ON EDIT ----------------------------- */
  useEffect(() => {
    if (formation) {
      setFormData({
        category: formation.category || "",
        title: formation.title || "",
        description: formation.description || "",
        prerequisites: formation.prerequisites || "",
        duration_months: formation.duration_months || 1,
        price: formation.price || 0,
        type: formation.type || "certifiante",
        image_url: formation.image_url || "",
      });
    }
  }, [formation]);

  /* ----------------------------- SAVE FORMATION ----------------------------- */
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (formation) {
        return (await api.put(`/formations/${formation.id}`, data)).data;
      }
      return (await api.post('/formations', data)).data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      onClose();
      Swal.fire({
        icon: 'success',
        title: formation ? "Modifiée !" : "Créée !",
        text: formation ? "La formation a été modifiée avec succès." : "La nouvelle formation a été ajoutée.",
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: (error) => {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Une erreur est survenue lors de l'enregistrement.",
      });
    }
  });

  /* ----------------------------- IMAGE UPLOAD ----------------------------- */
  /* ----------------------------- IMAGE UPLOAD ----------------------------- */
  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': undefined,
        },
      });

      const { file_url } = response.data;

      setFormData((prev) => ({
        ...prev,
        image_url: file_url,
      }));

      Swal.fire({
        icon: 'success',
        title: 'Image téléchargée',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Erreur lors du téléchargement de l'image",
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setUploading(false);
    }
  };

  /* ----------------------------- SUBMIT ----------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  /* ----------------------------- UI ----------------------------- */
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {formation ? "Modifier la Formation" : "Nouvelle Formation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* IMAGE UPLOAD */}
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
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            ) : (
              <label className="mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                <Upload className="h-12 w-12 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">
                  Cliquez pour téléverser une image
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

          {/* MAIN FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* TITLE */}
            <div className="md:col-span-2">
              <Label>Titre *</Label>
              <Input
                required
                placeholder="Ex: Excel Avancé"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* CATEGORY */}
            <div>
              <Label>Catégorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem value={cat} key={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* TYPE */}
            <div>
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="certifiante">Certifiante</SelectItem>
                  <SelectItem value="diplomante">Diplômante</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DURATION */}
            <div>
              <Label>Durée (mois) *</Label>
              <Input
                type="number"
                required
                min={1}
                value={formData.duration_months}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_months: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* PRICE */}
            <div>
              <Label>Prix (Ar) *</Label>
              <Input
                type="number"
                required
                min={0}
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                rows={4}
                placeholder="Décrivez la formation..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />
            </div>

            {/* PREREQUISITES */}
            <div className="md:col-span-2">
              <Label>Prérequis</Label>
              <Textarea
                rows={2}
                placeholder="Ex: Connaissances de base en informatique"
                value={formData.prerequisites}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prerequisites: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* ACTIONS */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={saveMutation.isPending || uploading}
              className="bg-red-600 hover:bg-red-700"
            >
              {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
