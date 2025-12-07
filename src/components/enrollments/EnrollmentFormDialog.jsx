import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import enrollmentService from "@/services/enrollmentService";
import formationService from "@/services/formationService";

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

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";
import Swal from 'sweetalert2';

export default function EnrollmentFormDialog({
  enrollment,
  students,
  sessions,
  modules,
  open,
  onClose,
}) {
  const [formData, setFormData] = useState({
    student_id: "",
    session_id: "",
    status: "actif",
    enrollment_date: new Date().toISOString().split('T')[0],
    paid_amount: 0,
    total_amount: 0,
    notes: "",
  });

  const queryClient = useQueryClient();

  // ============================================
  // FETCH FORMATIONS (via backend API)
  // ============================================
  const { data: formations = [] } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationService.getAll(),
  });

  // ============================================
  // INITIAL DATA
  // ============================================
  useEffect(() => {
    if (enrollment) {
      setFormData({
        student_id: enrollment.student_id ? String(enrollment.student_id) : "",
        session_id: enrollment.session_id ? String(enrollment.session_id) : "",
        status: enrollment.status || "actif",
        enrollment_date: enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paid_amount: enrollment.paid_amount || 0,
        total_amount: enrollment.total_amount || 0,
        notes: enrollment.notes || "",
      });
    }
  }, [enrollment]);

  // ============================================
  // CREATE / UPDATE Enrollment
  // ============================================
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (enrollment) {
        return enrollmentService.update(enrollment.id, data);
      }
      return enrollmentService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      Swal.fire({
        icon: 'success',
        title: enrollment ? 'Inscription modifiée !' : 'Inscription créée !',
        text: enrollment ? 'L\'inscription a été modifiée avec succès.' : 'L\'inscription a été créée avec succès.',
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

  // ============================================
  // HELPERS
  // ============================================

  const getSessionInfo = (id) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) return "Session";

    const module = modules.find((m) => m.id === session.module_id);
    return module ? `${module.title} - Salle ${session.room}` : "Session";
  };

  const getFormationDetails = (sessionId) => {
    const session = sessions.find((s) => s.id === parseInt(sessionId));
    if (!session) return { tuition: 0, registration: 0, total: 0 };

    const module = modules.find((m) => m.id === session.module_id);
    if (!module) return { tuition: 0, registration: 0, total: 0 };

    const formation = formations.find((f) => f.id === module.formation_id);
    if (!formation) return { tuition: 0, registration: 0, total: 0 };

    const tuition = parseFloat(formation.tuition_fee || 0);
    const registration = parseFloat(formation.registration_fee || 0);

    return {
      tuition,
      registration,
      total: tuition + registration
    };
  };

  const handleSessionChange = (sessionId) => {
    const { total } = getFormationDetails(sessionId);

    setFormData({
      ...formData,
      session_id: sessionId,
      total_amount: total,
    });
  };

  const percentagePaid = () => {
    if (!formData.total_amount) return 0;
    return ((formData.paid_amount / formData.total_amount) * 100).toFixed(1);
  };

  const remainingAmount = formData.total_amount - formData.paid_amount;
  const currentDetails = formData.session_id ? getFormationDetails(formData.session_id) : { tuition: 0, registration: 0, total: 0 };

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert IDs back to integers for backend
    const dataToSubmit = {
      ...formData,
      student_id: parseInt(formData.student_id),
      session_id: parseInt(formData.session_id),
    };
    saveMutation.mutate(dataToSubmit);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {enrollment ? "Modifier l'Inscription" : "Nouvelle Inscription"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student + Session */}
          <div className="grid grid-cols-2 gap-4">
            {/* Student */}
            <div>
              <Label>Étudiant *</Label>
              <Select
                value={formData.student_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, student_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un étudiant" />
                </SelectTrigger>

                <SelectContent>
                  {students.map((st) => (
                    <SelectItem key={st.id} value={String(st.id)}>
                      {st.first_name} {st.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Session */}
            <div>
              <Label>Session *</Label>
              <Select
                value={formData.session_id}
                onValueChange={handleSessionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une session" />
                </SelectTrigger>

                <SelectContent>
                  {sessions.map((session) => {
                    const { total } = getFormationDetails(session.id);
                    return (
                      <SelectItem key={session.id} value={String(session.id)}>
                        <div className="flex items-center justify-between w-full">
                          <span>{getSessionInfo(session.id)}</span>
                          {total > 0 && (
                            <span className="ml-4 text-red-600 font-bold">
                              {total.toLocaleString()} Ar
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PRICING INFO (READ ONLY) */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-600" />
              <Label className="text-base font-bold text-blue-900">
                Détail de la Tarification
              </Label>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Droit d'inscription</span>
                <span className="font-semibold text-slate-800">{currentDetails.registration.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Écolage</span>
                <span className="font-semibold text-slate-800">{currentDetails.tuition.toLocaleString()} Ar</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-blue-200 pt-3">
              <Label className="text-lg">Montant Total</Label>
              <div className="text-2xl font-black text-blue-900">
                {formData.total_amount.toLocaleString()} Ar
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 italic">
              * Une facture sera générée automatiquement. Le paiement s'effectue dans le menu "Paiements".
            </p>
          </Card>

          {/* STATUS & DATE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Statut</Label>
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
                  <SelectItem value="en attente">En Attente</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="terminé">Terminé</SelectItem>
                  <SelectItem value="annulé">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date d'inscription</Label>
              <Input
                type="date"
                value={formData.enrollment_date}
                onChange={(e) =>
                  setFormData({ ...formData, enrollment_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* NOTES */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              placeholder="Notes administratives..."
            />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
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
