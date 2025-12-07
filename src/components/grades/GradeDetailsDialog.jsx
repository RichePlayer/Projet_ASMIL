import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Eye,
    User,
    BookOpen,
    Calendar,
    Award,
    MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function GradeDetailsDialog({ grade, open, onClose }) {
    if (!grade) return null;

    const student = grade.enrollment?.student;
    const session = grade.enrollment?.session;
    const normalizedGrade = (parseFloat(grade.value) / parseFloat(grade.max_value)) * 20;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white">
                {/* Header */}
                <div className="px-6 py-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <Eye className="h-4 w-4 text-red-600" />
                        </div>
                        Détails de la Note
                    </DialogTitle>
                    <p className="text-slate-600 mt-1 text-sm">
                        {grade.evaluation_name}
                    </p>
                </div>

                <div className="h-[400px] overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
                    <div className="space-y-6">
                        {/* Note Card */}
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg p-6">
                            <div className="text-center">
                                <p className="text-sm font-bold text-red-700 mb-2">Note Obtenue</p>
                                <h2 className="text-5xl font-black text-red-900">
                                    {parseFloat(grade.value).toFixed(2)}/{parseFloat(grade.max_value)}
                                </h2>
                                <p className="text-sm text-red-700 mt-2">
                                    Soit {normalizedGrade.toFixed(2)}/20
                                </p>
                            </div>
                        </Card>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Student Info */}
                            <Card className="p-4 border-red-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <User className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Étudiant
                                        </p>
                                        <p className="font-bold text-slate-900">
                                            {student?.first_name} {student?.last_name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {student?.registration_number}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Module Info */}
                            <Card className="p-4 border-red-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <BookOpen className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Module
                                        </p>
                                        <p className="font-semibold text-slate-900">
                                            {session?.module?.title || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Date */}
                            <Card className="p-4 border-red-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Calendar className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Date d'évaluation
                                        </p>
                                        <p className="font-bold text-slate-900">
                                            {grade.date
                                                ? format(new Date(grade.date), "dd MMMM yyyy", { locale: fr })
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Coefficient */}
                            <Card className="p-4 border-red-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Award className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Coefficient
                                        </p>
                                        <Badge className="bg-red-100 text-red-800 border-red-200 font-semibold">
                                            {parseFloat(grade.weight)}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Comments */}
                        {grade.comments && (
                            <Card className="p-4 border-red-100 bg-red-50/50">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <MessageSquare className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                            Commentaires
                                        </p>
                                        <p className="text-slate-700 leading-relaxed">{grade.comments}</p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Footer Info */}
                        <div className="pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-500 text-center">
                                Créé le {format(new Date(grade.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gradient-to-r from-red-50 to-orange-50 flex justify-end">
                    <Button
                        onClick={onClose}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/30"
                    >
                        Fermer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
