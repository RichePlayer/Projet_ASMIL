import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moduleService from "@/services/moduleService";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ModuleFormDialog({ module, formations, open, onClose }) {
  const [formData, setFormData] = useState({
    formation_id: "",
    title: "",
    description: "",
    hours: 0,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (module) {
      setFormData({
        formation_id: module.formation_id?.toString() || "",
        title: module.title || "",
        description: module.description || "",
        hours: module.hours || 0,
      });
    }
  }, [module]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (module) return moduleService.update(module.id, data);
      return moduleService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success(module ? "Module modifié" : "Module créé");
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{module ? "Modifier le Module" : "Nouveau Module"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <Label>Formation :</Label>
            <Select
              value={formData.formation_id?.toString()}
              onValueChange={(value) => setFormData({ ...formData, formation_id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une formation" />
              </SelectTrigger>
              <SelectContent>
                {formations.map((f) => (
                  <SelectItem key={f.id} value={f.id.toString()}>{f.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Titre :</Label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label>Description :</Label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label>Nombre d'Heures :</Label>
            <Input
              type="number"
              min={0}
              required
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
