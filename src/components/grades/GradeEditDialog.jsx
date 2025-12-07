import React, { useState, useEffect } from "react";
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
import { Edit } from "lucide-react";
import Swal from "sweetalert2";

export default function GradeEditDialog({ grade, open, onClose }) {
    const [formData, setFormData] = useState({
        evaluation_name: "",
        value: "",
        max_value: "",
        weight: "",
        date: "",
        comments: "",
    });

    const queryClient = useQueryClient();

    useEffect(() => {
        if (grade) {
            setFormData({
                evaluation_name: grade.evaluation_name || "",
                value: grade.value || "",
                max_value: grade.max_value || "",
                weight: grade.weight || "",
                date: grade.date ? new Date(grade.date).toISOString().split("T")[0] : "",
                comments: grade.comments || "",
            });
        }
    }, [grade]);

    const updateGradeMutation = useMutation({
        mutationFn: (data) => gradeService.updateGrade(grade.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["grades"]);
            Swal.fire({
                icon: "success",
                title: "Succès !",
                text: "La note a été modifiée avec succès.",
                timer: 2000,
                showConfirmButton: false,
            });
            onClose();
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: error.response?.data?.message || "Impossible de modifier la note",
            });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateGradeMutation.mutate(formData);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const student = grade?.enrollment?.student;
    const session = grade?.enrollment?.session;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
                {/* Header */}
                <div className="px-6 py-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <Edit className="h-4 w-4 text-red-600" />
                        </div>
                        Modifier la Note
                    </DialogTitle>
                    <p className="text-slate-600 mt-1 text-sm">
                        {student?.first_name} {student?.last_name} - {session?.module?.title}
                    </p>
                </div>

                <form id="grade-edit-form" onSubmit={handleSubmit}>
                    <div className="h-[400px] overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
                        <div className="space-y-5">
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
                            form="grade-edit-form"
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white min-w-[150px] shadow-lg shadow-red-500/30"
                            disabled={updateGradeMutation.isPending}
                        >
                            {updateGradeMutation.isPending ? "Modification..." : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
