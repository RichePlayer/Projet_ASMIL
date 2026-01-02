// src/components/certificates/CertificateGenerator.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import certificateService from "@/services/certificateService";
import enrollmentService from "@/services/enrollmentService";
import gradeService from "@/services/gradeService";
import attendanceService from "@/services/attendanceService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

import { toast } from "sonner";

export default function CertificateGenerator({ open, onClose }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    enrollment_id: "",
    formation_title: "",
    grade: "",
    presence: "",
    date_obtention: new Date().toISOString().split("T")[0],
  });

  // Load enrollments from backend (returns array directly)
  const { data: enrollmentsData = [] } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentService.getAll({ limit: 1000 }),
  });

  // Load grades from backend (returns object with grades array)
  const { data: gradesResponse = { grades: [] } } = useQuery({
    queryKey: ["grades-for-cert"],
    queryFn: () => gradeService.getAllGrades({ limit: 5000 }),
  });

  // Load attendances from backend (returns array directly from service)
  const { data: attendancesData = [] } = useQuery({
    queryKey: ["attendances-for-cert"],
    queryFn: () => attendanceService.getAll({ limit: 5000 }),
  });

  // Extract grades array safely
  const gradesData = Array.isArray(gradesResponse)
    ? gradesResponse
    : (gradesResponse?.grades || []);

  // Ensure enrollments is an array
  const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : [];

  // Ensure attendances is an array
  const attendances = Array.isArray(attendancesData) ? attendancesData : [];

  // Filter eligible enrollments
  const eligibleEnrollments = enrollments.filter(
    (e) => e.status === "terminé" || e.status === "actif" || e.status === "completed"
  );

  // Handle enrollment selection - auto-fill fields
  const handleEnrollmentSelect = (enrollmentId) => {
    const id = parseInt(enrollmentId);
    const enrollment = enrollments.find((e) => e.id === id);

    if (!enrollment) {
      setFormData({
        enrollment_id: "",
        formation_title: "",
        grade: "",
        presence: "",
        date_obtention: new Date().toISOString().split("T")[0],
      });
      return;
    }

    // Get formation title
    const title = enrollment?.session?.module?.formation?.title ||
      enrollment?.session?.module?.title ||
      enrollment?.formation_title || "Formation";

    // Calculate average grade
    const enrollmentGrades = gradesData.filter((g) => g.enrollment_id === id);
    let avgGrade = "";
    if (enrollmentGrades.length > 0) {
      const sum = enrollmentGrades.reduce((acc, g) => {
        return acc + ((Number(g.value) / Number(g.max_value)) * 20 || 0);
      }, 0);
      avgGrade = (Math.round((sum / enrollmentGrades.length) * 10) / 10).toString();
    }

    // Calculate presence rate
    const enrollmentAttendances = attendances.filter((a) => a.enrollment_id === id);
    let presenceRate = "";
    if (enrollmentAttendances.length > 0) {
      const presentCount = enrollmentAttendances.filter((a) => a.status === "présent").length;
      presenceRate = (Math.round((presentCount / enrollmentAttendances.length) * 100)).toString();
    }

    setFormData({
      enrollment_id: enrollmentId,
      formation_title: title,
      grade: avgGrade,
      presence: presenceRate,
      date_obtention: new Date().toISOString().split("T")[0],
    });
  };

  const createMutation = useMutation({
    mutationFn: () => {
      const enrollment = enrollments.find((e) => e.id === parseInt(formData.enrollment_id));
      return certificateService.create({
        student_id: enrollment?.student_id,
        formation_id: enrollment?.session?.module?.formation_id || null,
        formation_title: formData.formation_title,
        grade: formData.grade ? parseFloat(formData.grade) : null,
        attendance_rate: formData.presence ? parseFloat(formData.presence) : null,
        date_obtention: formData.date_obtention,
        issue_date: new Date().toISOString().split("T")[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificat créé avec succès !");
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.enrollment_id) return toast.error("Choisissez un étudiant");
    if (!formData.grade) return toast.error("La note est requise");
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Nouvelle Certification
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Selection */}
          <div>
            <Label>Étudiant Inscrit *</Label>
            <Select
              value={formData.enrollment_id}
              onValueChange={handleEnrollmentSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un étudiant inscrit" />
              </SelectTrigger>
              <SelectContent>
                {eligibleEnrollments.length === 0 ? (
                  <div className="p-2 text-center text-slate-400 text-sm">
                    Aucun étudiant inscrit
                  </div>
                ) : (
                  eligibleEnrollments.map((e) => (
                    <SelectItem key={e.id} value={e.id.toString()}>
                      {e.student?.first_name} {e.student?.last_name} — {e.student?.registration_number}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Formation Title */}
          <div>
            <Label>Formation {formData.formation_title && "(auto-rempli)"}</Label>
            <Input
              value={formData.formation_title}
              onChange={(e) => setFormData({ ...formData, formation_title: e.target.value })}
              placeholder="Titre de la formation"
              required
            />
          </div>

          {/* Grade and Presence */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Note (/20) * {formData.grade && "(auto)"}</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="0.0"
                required
              />
            </div>
            <div>
              <Label>Présence (%) {formData.presence && "(auto)"}</Label>
              <Input
                type="number"
                step="1"
                min="0"
                max="100"
                value={formData.presence}
                onChange={(e) => setFormData({ ...formData, presence: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <Label>Date d'émission *</Label>
            <Input
              type="date"
              value={formData.date_obtention}
              onChange={(e) => setFormData({ ...formData, date_obtention: e.target.value })}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-red-600 to-red-700 text-white"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Création..." : "Créer le Certificat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
