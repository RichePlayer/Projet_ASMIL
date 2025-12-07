import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import gradeService from "@/services/gradeService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus } from "lucide-react";
import Swal from "sweetalert2";

export default function GradeFormDialog({ open, onClose, selectedSession, sessionEnrollments }) {
  const [formData, setFormData] = useState({
    enrollment_id: "",
    evaluation_name: "",
    value: "",
    max_value: "20",
    weight: "1",
    date: new Date().toISOString().split("T")[0],
    comments: "",
  });

  const queryClient = useQueryClient();

  const createGradeMutation = useMutation({
    mutationFn: gradeService.createGrade,
    onSuccess: () => {
      queryClient.invalidateQueries(["grades"]);
      Swal.fire({
        icon: "success",
        title: "Succès !",
        text: "La note a été ajoutée avec succès.",
        timer: 2000,
        showConfirmButton: false,
      });
      onClose();
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.response?.data?.message || "Impossible d'ajouter la note",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createGradeMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <Plus className="h-4 w-4 text-red-600" />
            </div>
            Ajouter une Note
          </DialogTitle>
          <p className="text-slate-600 mt-1 text-sm">
            Enregistrer une nouvelle évaluation pour la session sélectionnée
          </p>
        </div>

        <form id="grade-form" onSubmit={handleSubmit}>
          <div className="h-[400px] overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
            <div className="space-y-5">
              {/* Étudiant (Inscription) */}
              <div>
                <Label className="text-slate-700 font-bold">Étudiant *</Label>
                <Select
                  value={formData.enrollment_id}
                  onValueChange={(value) => handleChange("enrollment_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un étudiant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionEnrollments.map((enrollment) => {
                      const student = enrollment.student;
                      return (
                        <SelectItem key={enrollment.id} value={enrollment.id.toString()}>
                          {student?.first_name} {student?.last_name} ({student?.registration_number})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Nom de l'évaluation */}
              <div>
                <Label className="text-slate-700 font-bold">Nom de l'évaluation *</Label>
                <Input
                  value={formData.evaluation_name}
                  onChange={(e) => handleChange("evaluation_name", e.target.value)}
                  placeholder="Ex: Examen Final, TP1, Quiz..."
                  required
                />
              </div>

              {/* Note et Note maximale */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 font-bold">Note obtenue *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => handleChange("value", e.target.value)}
                    placeholder="Ex: 15.5"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-700 font-bold">Note maximale *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.max_value}
                    onChange={(e) => handleChange("max_value", e.target.value)}
                    placeholder="Ex: 20"
                    required
                  />
                </div>
              </div>

              {/* Coefficient et Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 font-bold">Coefficient *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    placeholder="Ex: 1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-700 font-bold">Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Commentaires */}
              <div>
                <Label className="text-slate-700 font-bold">Commentaires</Label>
                <Textarea
                  value={formData.comments}
                  onChange={(e) => handleChange("comments", e.target.value)}
                  placeholder="Commentaires optionnels..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 border-t bg-gradient-to-r from-red-50 to-orange-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-300 hover:bg-white text-slate-700"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              form="grade-form"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white min-w-[150px] shadow-lg shadow-red-500/30"
              disabled={createGradeMutation.isPending}
            >
              {createGradeMutation.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
