import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import studentService from "@/services/studentService";
import api from "@/services/api";
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
import Swal from 'sweetalert2';
import { Upload } from "lucide-react";

export default function StudentFormDialog({ student, open, onClose }) {
  const [formData, setFormData] = useState({
    registration_number: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "Homme",
    email: "",
    phone_parent: "",
    address: "",
    status: "actif",
    photo_url: "",
  });

  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  // Populate form for editing
  useEffect(() => {
    if (student) {
      setFormData({
        registration_number: student.registration_number || "",
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : "",
        gender: student.gender || "Homme",
        email: student.email || "",
        phone_parent: student.phone_parent || "",
        address: student.address || "",
        status: student.status || "actif",
        photo_url: student.photo_url || "",
      });
    }
  }, [student]);

  // 🔥 Mutation CREATE or UPDATE using backend API
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (student) return studentService.update(student.id, data);
      return studentService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      Swal.fire({
        icon: 'success',
        title: student ? 'Étudiant modifié !' : 'Étudiant créé !',
        text: student ? 'L\'étudiant a été modifié avec succès.' : 'L\'étudiant a été créé avec succès.',
        timer: 2000,
        showConfirmButton: false
      });
      onClose();
    },
    onError: (error) => {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors de l\'enregistrement.',
      });
    }
  });

  // 🔥 Upload photo via backend API
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { file_url } = response.data;

      setFormData((prev) => ({
        ...prev,
        photo_url: file_url,
      }));

      Swal.fire({
        icon: 'success',
        title: 'Photo ajoutée',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur de téléchargement de la photo',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
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
            {student ? "Modifier l'Étudiant" : "Nouvel Étudiant"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex justify-center">
            <div className="relative">
              {formData.photo_url ? (
                <img
                  src={formData.photo_url}
                  alt="Photo"
                  className="h-32 w-32 rounded-full object-cover border-4 border-red-100"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                  <Upload className="h-12 w-12 text-red-400" />
                </div>
              )}

              <label className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 shadow-lg">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files[0])}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>N° Inscription :</Label>
              <Input
                value={formData.registration_number}
                onChange={(e) =>
                  setFormData({ ...formData, registration_number: e.target.value })
                }
                required
                placeholder="Ex: ETU-2025-001"
              />
            </div>



            <div>
              <Label>Prénom :</Label>
              <Input
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Nom :</Label>
              <Input
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Date de Naissance :</Label>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Sexe :</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Homme">Homme</SelectItem>
                  <SelectItem value="Femme">Femme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Email :</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@exemple.com"
              />
            </div>

            <div>
              <Label>Téléphone :</Label>
              <Input
                type="tel"
                value={formData.phone_parent}
                onChange={(e) =>
                  setFormData({ ...formData, phone_parent: e.target.value })
                }
                placeholder="034 00 000 00"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Adresse :</Label>
              <Textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={2}
                placeholder="Adresse complète"
              />
            </div>

            <div>
              <Label>Statut :</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="diplômé">Diplômé</SelectItem>
                </SelectContent>
              </Select>
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
              {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
