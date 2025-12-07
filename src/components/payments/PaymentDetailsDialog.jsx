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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Eye,
    CreditCard,
    Calendar,
    User,
    FileText,
    Banknote,
    Building2,
    Wallet,
    Hash,
    MessageSquare,
    Download,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { generatePaymentReceipt } from "@/utils/pdfUtils";


export default function PaymentDetailsDialog({ payment, open, onClose }) {
    if (!payment) return null;

    const getStudentName = () => {
        if (payment.invoice?.enrollment?.student) {
            const { first_name, last_name } = payment.invoice.enrollment.student;
            return `${first_name} ${last_name}`;
        }
        return "Étudiant inconnu";
    };

    const getFormationInfo = () => {
        if (payment.invoice?.enrollment?.session?.module?.title) {
            return payment.invoice.enrollment.session.module.title;
        }
        return "Formation inconnue";
    };

    const getMethodIcon = () => {
        switch (payment.method) {
            case "Espèces":
                return <Banknote className="h-5 w-5 text-red-600" />;
            case "Chèque":
                return <FileText className="h-5 w-5 text-red-600" />;
            case "Virement":
                return <Building2 className="h-5 w-5 text-red-600" />;
            case "Mobile Money":
                return <Wallet className="h-5 w-5 text-red-600" />;
            default:
                return <CreditCard className="h-5 w-5 text-red-600" />;
        }
    };

    // Calculer le reste à payer
    const totalPaid = payment.invoice?.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
    const totalAmount = parseFloat(payment.invoice?.amount || 0);
    const remainingAmount = totalAmount - totalPaid;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white">
                {/* Header */}
                <div className="px-6 py-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <Eye className="h-4 w-4 text-red-600" />
                        </div>
                        Détails du Paiement
                    </DialogTitle>
                    <p className="text-slate-600 mt-1 text-sm">
                        Paiement #{payment.id} - {format(new Date(payment.created_at), "dd MMMM yyyy", { locale: fr })}
                    </p>
                </div>

                <div className="h-[400px] overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
                    <div className="space-y-6">
                        {/* Amount Card */}
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg p-6">
                            <div className="text-center">
                                <p className="text-sm font-bold text-red-700 mb-2">Montant de ce Paiement</p>
                                <h2 className="text-5xl font-black text-red-900">
                                    {parseFloat(payment.amount || 0).toLocaleString()} Ar
                                </h2>
                            </div>
                        </Card>

                        {/* Informations de la facture */}
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

                                    {/* Montant Payé (ce paiement) */}
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-xs font-medium mb-1">Montant Payé</span>
                                        <span className="text-lg font-bold text-green-600">
                                            {parseFloat(payment.amount || 0).toLocaleString()} <span className="text-xs font-normal">Ar</span>
                                        </span>
                                    </div>

                                    {/* Reste */}
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-xs font-medium mb-1">Reste</span>
                                        <span className="text-lg font-bold text-red-600">
                                            {(totalAmount - parseFloat(payment.amount || 0)).toLocaleString()} <span className="text-xs font-normal">Ar</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Barre de progression */}
                                <div className="mt-3">
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${totalAmount > 0 ? (parseFloat(payment.amount || 0) / totalAmount) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 text-center">
                                        {totalAmount > 0 ? Math.round((parseFloat(payment.amount || 0) / totalAmount) * 100) : 0}% payé
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Invoice Info */}
                            <Card className="p-4 border-red-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <FileText className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Facture
                                        </p>
                                        <p className="font-mono font-bold text-red-700">
                                            {payment.invoice?.invoice_number || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </Card>

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
                                        <p className="font-bold text-slate-900">{getStudentName()}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Formation Info */}
                            <Card className="p-4 border-red-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <CreditCard className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Formation
                                        </p>
                                        <p className="font-semibold text-slate-900">{getFormationInfo()}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Payment Date */}
                            <Card className="p-4 border-red-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Calendar className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Date de Paiement
                                        </p>
                                        <p className="font-bold text-slate-900">
                                            {payment.payment_date
                                                ? format(new Date(payment.payment_date), "dd MMMM yyyy", { locale: fr })
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Payment Method */}
                            <Card className="p-4 border-red-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">{getMethodIcon()}</div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Mode de Paiement
                                        </p>
                                        <Badge className="bg-red-100 text-red-800 border-red-200 font-semibold">
                                            {payment.method || "N/A"}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>

                            {/* Transaction Reference */}
                            <Card className="p-4 border-red-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Hash className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            Référence
                                        </p>
                                        <p className="font-mono font-semibold text-slate-900">
                                            {payment.transaction_reference || "-"}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Historique des Paiements */}
                        {payment.invoice?.payments && payment.invoice.payments.length > 1 && (
                            <Card className="p-4 border-red-100 bg-gradient-to-br from-red-50/30 to-orange-50/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <FileText className="h-5 w-5 text-red-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                        Historique des Paiements
                                    </h3>
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-bold">Date</TableHead>
                                            <TableHead className="font-bold">Montant</TableHead>
                                            <TableHead className="font-bold">Mode</TableHead>
                                            <TableHead className="font-bold">Référence</TableHead>
                                            <TableHead className="font-bold text-center">Actuel</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payment.invoice.payments
                                            .sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at))
                                            .map((p) => (
                                                <TableRow
                                                    key={p.id}
                                                    className={p.id === payment.id ? "bg-green-50 font-semibold" : ""}
                                                >
                                                    <TableCell>
                                                        {format(new Date(p.payment_date || p.created_at), "dd MMM yyyy", { locale: fr })}
                                                    </TableCell>
                                                    <TableCell className="font-bold">
                                                        {parseFloat(p.amount).toLocaleString()} Ar
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">
                                                            {p.method || "N/A"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {p.transaction_reference || "-"}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {p.id === payment.id && (
                                                            <Badge className="bg-green-600 text-white">✓</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}

                        {/* Notes */}
                        {payment.notes && (
                            <Card className="p-4 border-red-100 bg-red-50/50">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <MessageSquare className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                            Notes / Commentaires
                                        </p>
                                        <p className="text-slate-700 leading-relaxed">{payment.notes}</p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Footer Info */}
                        <div className="pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-500 text-center">
                                Créé le {format(new Date(payment.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gradient-to-r from-red-50 to-orange-50 flex justify-between items-center gap-4">
                    <Button
                        onClick={() => generatePaymentReceipt(payment)}
                        variant="outline"
                        className="border-red-300 hover:bg-red-100 text-red-700 font-semibold"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter en PDF
                    </Button>
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
