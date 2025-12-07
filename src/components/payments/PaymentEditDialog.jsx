import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import paymentService from "@/services/paymentService";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import Swal from "sweetalert2";
import {
    Edit,
    Banknote,
    Wallet,
    User,
    Calendar,
    FileText,
    Building2,
} from "lucide-react";

export default function PaymentEditDialog({ payment, open, onClose }) {
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("");
    const [reference, setReference] = useState("");
    const [paymentDate, setPaymentDate] = useState("");
    const [notes, setNotes] = useState("");

    const queryClient = useQueryClient();

    useEffect(() => {
        if (payment && open) {
            setAmount(payment.amount?.toString() || "");
            setMethod(payment.method || "Espèces");
            setReference(payment.transaction_reference || "");
            setPaymentDate(
                payment.payment_date
                    ? new Date(payment.payment_date).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
            );
            setNotes(payment.notes || "");
        }
    }, [payment, open]);

    const updatePaymentMutation = useMutation({
        mutationFn: (data) => paymentService.update(payment.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            Swal.fire({
                icon: "success",
                title: "Modifié !",
                text: "Le paiement a été modifié avec succès.",
                timer: 2000,
                showConfirmButton: false,
                background: "#fee2e2",
                color: "#991b1b",
            });
            onClose();
        },
        onError: (error) => {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: error.response?.data?.message || "Une erreur est survenue.",
                background: "#fee2e2",
                color: "#991b1b",
            });
        },
    });

    if (!payment) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const payAmount = parseFloat(amount);

        if (!payAmount || payAmount <= 0) {
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: "Veuillez entrer un montant valide.",
                background: "#fee2e2",
                color: "#991b1b",
            });
            return;
        }

        updatePaymentMutation.mutate({
            amount: payAmount,
            method,
            transaction_reference: reference,
            payment_date: new Date(paymentDate),
            notes,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
                {/* Header */}
                <div className="px-6 py-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <Edit className="h-4 w-4 text-red-600" />
                        </div>
                        Modifier le Paiement
                    </DialogTitle>
                    <p className="text-slate-600 mt-1 text-sm">
                        Facture N° <span className="font-mono text-red-600">{payment.invoice?.invoice_number}</span>
                    </p>
                </div>

                <form id="payment-edit-form" onSubmit={handleSubmit}>
                    <div className="h-[400px] overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
                        <div className="space-y-5">
                            {/* Amount Input */}
                            <div>
                                <Label className="text-slate-700 font-bold">Montant du paiement (Ar) *</Label>
                                <div className="relative mt-1.5">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-red-600 font-bold">Ar</span>
                                    </div>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-10 h-12 text-lg font-bold border-red-200 focus:border-red-500 focus:ring-red-500"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Method */}
                                <div>
                                    <Label className="text-slate-700 font-semibold">Mode de règlement</Label>
                                    <Select value={method} onValueChange={setMethod}>
                                        <SelectTrigger className="mt-1.5 h-10 bg-white border-red-200 focus:border-red-500 focus:ring-red-500">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Espèces">
                                                <div className="flex items-center gap-2">
                                                    <Banknote className="h-4 w-4 text-red-600" /> Espèces
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Chèque">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-red-600" /> Chèque
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Virement">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-red-600" /> Virement
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Mobile Money">
                                                <div className="flex items-center gap-2">
                                                    <Wallet className="h-4 w-4 text-red-600" /> Mobile Money
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date */}
                                <div>
                                    <Label className="text-slate-700 font-semibold">Date du paiement</Label>
                                    <div className="relative mt-1.5">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
                                        <Input
                                            type="date"
                                            value={paymentDate}
                                            onChange={(e) => setPaymentDate(e.target.value)}
                                            className="pl-10 h-10 bg-white border-red-200 focus:border-red-500 focus:ring-red-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Reference */}
                            <div>
                                <Label className="text-slate-700 font-semibold">Référence / N° Chèque</Label>
                                <Input
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="Ex: CHQ-123456"
                                    className="mt-1.5 bg-white border-red-200 focus:border-red-500 focus:ring-red-500"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <Label className="text-slate-700 font-semibold">Notes / Commentaire</Label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Informations complémentaires..."
                                    className="mt-1.5 bg-white border-red-200 focus:border-red-500 focus:ring-red-500 resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                </form>

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
                        form="payment-edit-form"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white min-w-[150px] shadow-lg shadow-red-500/30"
                        disabled={updatePaymentMutation.isPending}
                    >
                        {updatePaymentMutation.isPending ? "Modification..." : "Enregistrer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >

    );
}
