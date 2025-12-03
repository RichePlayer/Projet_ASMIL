import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import paymentService from "@/services/paymentService";
import invoiceService from "@/services/invoiceService";
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
import Swal from "sweetalert2";
import {
    Banknote,
    Wallet,
    Calendar,
    FileText,
    Building2,
    Search,
    CheckCircle2,
    CreditCard,
    User,
    Hash,
    AlertCircle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentFormDialog({ open, onClose }) {
    const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("Espèces");
    const [reference, setReference] = useState("");
    const [payerName, setPayerName] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
    const [notes, setNotes] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const queryClient = useQueryClient();

    // Fetch Invoices
    const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
        queryKey: ["invoices"],
        queryFn: () => invoiceService.getAll(),
    });

    // Trouver la facture sélectionnée
    const selectedInvoice = invoices.find((inv) => inv.id === parseInt(selectedInvoiceId));

    // Calculer le montant restant
    const paidAmount = selectedInvoice?.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
    const totalAmount = parseFloat(selectedInvoice?.amount || 0);
    const remainingAmount = totalAmount - paidAmount;

    // Reset form on open
    useEffect(() => {
        if (open) {
            setSelectedInvoiceId("");
            setAmount("");
            setMethod("Espèces");
            setReference("");
            setPayerName("");
            setPaymentDate(new Date().toISOString().split("T")[0]);
            setNotes("");
            setSearchTerm("");
        }
    }, [open]);

    // Auto-fill amount when invoice is selected
    useEffect(() => {
        if (selectedInvoiceId && remainingAmount > 0) {
            setAmount(remainingAmount.toString());
        }
    }, [selectedInvoiceId, remainingAmount]);

    const createPaymentMutation = useMutation({
        mutationFn: (data) => paymentService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["enrollments"] });
            Swal.fire({
                icon: "success",
                title: "Paiement enregistré !",
                text: "Le paiement a été effectué avec succès.",
                timer: 2000,
                showConfirmButton: false,
            });
            onClose();
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: error.response?.data?.message || "Une erreur est survenue.",
            });
        },
    });

    const handleQuickAmount = (percentage) => {
        const quickAmount = (remainingAmount * percentage) / 100;
        setAmount(quickAmount.toFixed(2));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedInvoiceId) {
            Swal.fire({ icon: "warning", title: "Attention", text: "Veuillez sélectionner une inscription." });
            return;
        }

        const payAmount = parseFloat(amount);

        if (!payAmount || payAmount <= 0) {
            Swal.fire({ icon: "warning", title: "Attention", text: "Veuillez entrer un montant valide." });
            return;
        }

        if (payAmount > remainingAmount + 1) {
            Swal.fire({
                icon: "warning",
                title: "Montant trop élevé",
                text: `Le montant ne peut pas dépasser le solde restant (${remainingAmount.toLocaleString()} Ar).`,
            });
            return;
        }

        createPaymentMutation.mutate({
            invoice_id: selectedInvoice.id,
            amount: payAmount,
            method,
            transaction_reference: reference,
            notes: `${notes} ${payerName ? `(Payé par: ${payerName})` : ""}`,
            payment_date: new Date(paymentDate),
        });
    };

    // Filtrer les factures impayées
    const unpaidInvoices = invoices
        .filter((invoice) => {
            const paid = invoice.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
            const remaining = parseFloat(invoice.amount || 0) - paid;
            return remaining > 0;
        })
        .filter((invoice) => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            const student = invoice.enrollment?.student
                ? `${invoice.enrollment.student.first_name} ${invoice.enrollment.student.last_name}`.toLowerCase()
                : "";
            const invoiceNum = (invoice.invoice_number || "").toLowerCase();
            return student.includes(search) || invoiceNum.includes(search);
        });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-red-600" />
                        </div>
                        Nouveau Paiement
                    </DialogTitle>
                </DialogHeader>

                <div className="h-[400px] overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'thin' }}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Sélection Inscription */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-medium">Sélectionner une inscription *</Label>
                            <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                                <SelectTrigger className="h-12 border-slate-200 focus:ring-red-500/20">
                                    <SelectValue placeholder="Rechercher un étudiant..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    <div className="p-2 sticky top-0 bg-white z-10 border-b mb-1">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Filtrer par nom..."
                                                className="pl-8 h-9 text-sm border-slate-200 focus-visible:ring-red-500"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    {unpaidInvoices.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                                            <AlertCircle className="h-8 w-8 text-slate-300" />
                                            Aucune inscription avec solde impayé trouvée
                                        </div>
                                    ) : (
                                        unpaidInvoices.map((invoice) => {
                                            const paid = invoice.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
                                            const remaining = parseFloat(invoice.amount || 0) - paid;
                                            const student = invoice.enrollment?.student
                                                ? `${invoice.enrollment.student.first_name} ${invoice.enrollment.student.last_name}`
                                                : "Étudiant inconnu";
                                            const formation = invoice.enrollment?.session?.module?.title || "Formation inconnue";

                                            return (
                                                <SelectItem key={invoice.id} value={invoice.id.toString()} className="py-3 cursor-pointer">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-between w-full gap-4">
                                                            <span className="font-semibold text-slate-800">{student}</span>
                                                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                                                Reste: {remaining.toLocaleString()} Ar
                                                            </Badge>
                                                        </div>
                                                        <span className="text-slate-500 text-xs flex items-center gap-1">
                                                            <CheckCircle2 className="h-3 w-3" /> {formation}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedInvoice && (
                            <div className="space-y-3">
                                <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            {/* Montant Total */}
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 text-xs font-medium mb-1">Montant Total</span>
                                                <span className="text-lg font-bold text-slate-700">
                                                    {totalAmount.toLocaleString()} <span className="text-xs font-normal">Ar</span>
                                                </span>
                                            </div>

                                            {/* Montant à Payer */}
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 text-xs font-medium mb-1">Montant à Payer</span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    {amount ? parseFloat(amount).toLocaleString() : '0'} <span className="text-xs font-normal">Ar</span>
                                                </span>
                                            </div>

                                            {/* Reste Après Paiement */}
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 text-xs font-medium mb-1">Reste Après</span>
                                                <span className="text-lg font-bold text-red-600">
                                                    {amount ? (remainingAmount - parseFloat(amount)).toLocaleString() : remainingAmount.toLocaleString()} <span className="text-xs font-normal">Ar</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Barre de progression */}
                                        <div className="mt-3">
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${totalAmount > 0 ? ((paidAmount + (parseFloat(amount) || 0)) / totalAmount) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 text-center">
                                                {totalAmount > 0 ? Math.round(((paidAmount + (parseFloat(amount) || 0)) / totalAmount) * 100) : 0}% payé
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Historique des paiements si existants */}
                                {paidAmount > 0 && selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                                    <Card className="bg-blue-50/50 border-blue-200">
                                        <CardContent className="p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-blue-900">Paiements précédents ({paidAmount.toLocaleString()} Ar)</span>
                                            </div>
                                            <div className="space-y-1">
                                                {selectedInvoice.payments.map((payment, index) => (
                                                    <div key={payment.id || index} className="flex justify-between items-center text-xs">
                                                        <span className="text-slate-600">
                                                            {new Date(payment.payment_date).toLocaleDateString('fr-FR')} - {payment.method}
                                                        </span>
                                                        <span className="font-semibold text-green-700">
                                                            {parseFloat(payment.amount).toLocaleString()} Ar
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Montant */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Montant à payer (Ar) *</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">Ar</div>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-10 h-11 font-bold text-lg border-slate-200 focus-visible:ring-red-500"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                {selectedInvoice && (
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs border-slate-200 hover:bg-slate-50 hover:text-red-600"
                                            onClick={() => handleQuickAmount(50)}
                                        >
                                            50%
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs border-slate-200 hover:bg-slate-50 hover:text-red-600"
                                            onClick={() => handleQuickAmount(100)}
                                        >
                                            Totalité
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Date de paiement *</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="pl-10 h-11 border-slate-200 focus-visible:ring-red-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mode et Référence */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Mode de paiement *</Label>
                                <Select value={method} onValueChange={setMethod}>
                                    <SelectTrigger className="h-11 border-slate-200 focus:ring-red-500/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Espèces"><div className="flex items-center gap-2"><Banknote className="h-4 w-4 text-green-600" /> Espèces</div></SelectItem>
                                        <SelectItem value="Chèque"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /> Chèque</div></SelectItem>
                                        <SelectItem value="Virement"><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-purple-600" /> Virement</div></SelectItem>
                                        <SelectItem value="Mobile Money"><div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-orange-600" /> Mobile Money</div></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Référence / N° Chèque</Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                        placeholder="Optionnel"
                                        className="pl-10 h-11 border-slate-200 focus-visible:ring-red-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payeur et Notes */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Nom du payeur (si différent)</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        value={payerName}
                                        onChange={(e) => setPayerName(e.target.value)}
                                        placeholder="Nom du payeur..."
                                        className="pl-10 h-11 border-slate-200 focus-visible:ring-red-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Notes / Commentaire</Label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ajouter une note..."
                                    rows={3}
                                    className="resize-none border-slate-200 focus-visible:ring-red-500"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="p-6 border-t bg-gradient-to-r from-red-50 to-orange-50">
                    <Button type="button" variant="outline" onClick={onClose} className="h-11 px-6 border-slate-200 hover:bg-white hover:text-slate-700">
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white h-11 px-8 shadow-md shadow-red-600/20"
                        disabled={createPaymentMutation.isPending || !selectedInvoiceId || !amount}
                        onClick={handleSubmit}
                    >
                        {createPaymentMutation.isPending ? "Enregistrement..." : "Enregistrer le paiement"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
