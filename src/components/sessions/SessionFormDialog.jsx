import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import sessionService from "@/services/sessionService";
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
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SessionFormDialog({ session, modules = [], teachers = [], open, onClose }) {
  const [formData, setFormData] = useState({
    module_id: "",
    teacher_id: "",
    start_date: "",
    end_date: "",
    room: "",
    capacity: 20,
    status: "planifiée",
    schedule: [],
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (session) {
      setFormData({
        module_id: session.module_id?.toString() || "",
        teacher_id: session.teacher_id?.toString() || "",
        start_date: session.start_date ? session.start_date.split('T')[0] : "",
        end_date: session.end_date ? session.end_date.split('T')[0] : "",
        room: session.room || "",
        capacity: session.capacity || 20,
        status: session.status || "planifiée",
        schedule: session.schedule || [],
      });
    }
  }, [session]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        module_id: parseInt(data.module_id),
        teacher_id: data.teacher_id && data.teacher_id !== "none" ? parseInt(data.teacher_id) : null,
      };
      if (session) {
        return sessionService.update(session.id, payload);
      }
      return sessionService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(session ? "Session modifiée" : "Session créée");
      onClose();
    },
  });

  const addScheduleSlot = () => {
    setFormData({
      ...formData,
      schedule: [
        ...formData.schedule,
        { day: "Lundi", start_time: "09:00", end_time: "12:00" },
      ],
    });
  };

  const removeScheduleSlot = (index) => {
    setFormData({
      ...formData,
      schedule: formData.schedule.filter((_, i) => i !== index),
    });
  };

  const updateScheduleSlot = (index, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
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
            {session ? "Modifier la Session" : "Nouvelle Session"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Module *</Label>
              <Select value={formData.module_id} onValueChange={(value) => setFormData({ ...formData, module_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id.toString()}>
                      {module.title} {module.formation ? `(${module.formation.title})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Enseignant</Label>
              <Select value={formData.teacher_id || "none"} onValueChange={(value) => setFormData({ ...formData, teacher_id: value === "none" ? null : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un enseignant (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun enseignant</SelectItem>
                  {teachers && teachers.length > 0 ? (
                    teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.first_name} {teacher.last_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>Aucun enseignant disponible</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date de Début *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Date de Fin *</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Salle</Label>
              <Input
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="Ex: Salle 101"
              />
            </div>

            <div>
              <Label>Capacité *</Label>
              <Input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planifiée">Planifiée</SelectItem>
                  <SelectItem value="à venir">À venir</SelectItem>
                  <SelectItem value="en cours">En cours</SelectItem>
                  <SelectItem value="terminée">Terminée</SelectItem>
                  <SelectItem value="annulée">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Planning des Cours</Label>
              <Button type="button" size="sm" variant="outline" onClick={addScheduleSlot}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-3">
              {formData.schedule.map((slot, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div>
                      <Label className="text-xs">Jour</Label>
                      <Select
                        value={slot.day}
                        onValueChange={(value) => updateScheduleSlot(index, "day", value)}
                      >
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
                        onChange={(e) => updateScheduleSlot(index, "start_time", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Fin</Label>
                      <Input
                        type="time"
                        value={slot.end_time}
                        onChange={(e) => updateScheduleSlot(index, "end_time", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeScheduleSlot(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {formData.schedule.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Aucun horaire ajouté</p>
              )}
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
