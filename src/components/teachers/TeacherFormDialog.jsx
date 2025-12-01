
// src/components/teachers/TeacherFormDialog.jsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Upload } from "lucide-react";
import Swal from 'sweetalert2';

export default function TeacherFormDialog({ teacher, open, onClose }) {
  const [formData, setFormData] = useState({
    registration_number: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialties: [],
    bio: "",
    photo_url: "",
    status: "actif",
    hire_date: new Date().toISOString().split("T")[0],
    hourly_rate: 0,
    availability: [],
  });

  const [newSpecialty, setNewSpecialty] = useState("");
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (teacher) {
      setFormData({
        registration_number: teacher.registration_number || "",
        first_name: teacher.first_name || "",
        last_name: teacher.last_name || "",
        email: teacher.email || "",
        phone: teacher.phone || "",
        specialties: teacher.specialties || [],
        bio: teacher.bio || "",
        photo_url: teacher.photo_url || "",
        status: teacher.status || "actif",
        hire_date: teacher.hire_date ? new Date(teacher.hire_date).toISOString().split("T")[0] : "",
        hourly_rate: teacher.hourly_rate || 0,
        availability: teacher.availability || [],
      });
    }
  }, [teacher]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (teacher) {
        return (await api.put(`/teachers/${teacher.id}`, data)).data;
      }
      return (await api.post('/teachers', data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      onClose();
      Swal.fire({
        icon: 'success',
        title: teacher ? "Modifié !" : "Créé !",
        text: teacher ? "L'enseignant a été modifié avec succès." : "Le nouvel enseignant a été ajouté.",
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
      setFormData({ ...formData, photo_url: file_url });
      Swal.fire({
        icon: 'success',
        title: 'Photo téléchargée',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Erreur lors du téléchargement de la photo",
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setUploading(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData({ ...formData, specialties: [...formData.specialties, newSpecialty.trim()] });
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (index) => {
    setFormData({ ...formData, specialties: formData.specialties.filter((_, i) => i !== index) });
  };

  const addAvailability = () => {
    setFormData({
      ...formData,
      availability: [...formData.availability, { day: "Lundi", start_time: "09:00", end_time: "17:00" }],
    });
  };

  const removeAvailability = (index) => {
    setFormData({ ...formData, availability: formData.availability.filter((_, i) => i !== index) });
  };

  const updateAvailability = (index, field, value) => {
    const newAvailability = [...formData.availability];
    newAvailability[index] = { ...newAvailability[index], [field]: value };
    setFormData({ ...formData, availability: newAvailability });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {teacher ? "Modifier l'Enseignant" : "Nouvel Enseignant"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo */}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prénom :</Label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Nom :</Label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Email :</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Téléphone :</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label>N° Identification :</Label>
              <Input
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              />
            </div>

            <div>
              <Label>Date d'Embauche :</Label>
              <Input
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              />
            </div>

            <div>
              <Label>Tarif Horaire (Ar) :</Label>
              <Input
                type="number"
                min="0"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <Label>Statut :</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="congé">En Congé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label>Biographie :</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
            />
          </div>

          {/* Specialties */}
          <div>
            <Label>Spécialités :</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Ex: Excel, Comptabilité..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
              />
              <Button type="button" onClick={addSpecialty} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.specialties || []).map((spec, index) => (
                <div key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center gap-2">
                  <span className="text-sm">{spec}</span>
                  <button type="button" onClick={() => removeSpecialty(index)} className="hover:text-red-900">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Disponibilités :</Label>
              <Button type="button" size="sm" variant="outline" onClick={addAvailability}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-3">
              {(formData.availability || []).map((slot, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-4 gap-3 items-end">
                    <div>
                      <Label className="text-xs">Jour</Label>
                      <Select value={slot.day} onValueChange={(value) => updateAvailability(index, "day", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Début</Label>
                      <Input
                        type="time"
                        value={slot.start_time}
                        onChange={(e) => updateAvailability(index, "start_time", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Fin</Label>
                      <Input
                        type="time"
                        value={slot.end_time}
                        onChange={(e) => updateAvailability(index, "end_time", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeAvailability(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
