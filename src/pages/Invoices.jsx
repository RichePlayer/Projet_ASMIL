// src/pages/Invoices.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceAPI, enrollmentAPI, studentAPI, paymentAPI } from "@/api/localDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  Plus,
  Search,
  Download,
  DollarSign,
  TrendingUp,
  AlertCircle,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import InvoiceFormDialog from "../components/invoices/InvoiceFormDialog";
import PaymentDialog from "../components/invoices/PaymentDialog";
import { generateReceiptPDF } from "../components/invoices/ReceiptGenerator";
import { toast } from "sonner";

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

  // States for receipt chooser popup
  const [showReceiptChooser, setShowReceiptChooser] = useState(false);
  const [receiptPayments, setReceiptPayments] = useState([]);
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoiceAPI.list("-created_date", 200),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentAPI.list(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentAPI.list(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentAPI.list("-created_date", 1000),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => invoiceAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Facture supprimée");
    },
    onError: () => toast.error("Erreur en supprimant la facture"),
  });

  const filteredInvoices = invoices.filter((invoice) =>
    (invoice.invoice_number || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStudentName = (enrollmentId) => {
    const enrollment = enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return "Étudiant inconnu";
    const student = students.find((s) => s.id === enrollment.student_id);
    return student ? `${student.first_name} ${student.last_name}` : "Étudiant inconnu";
  };

  const totalRevenue = invoices
    .filter((inv) => inv.status === "payée")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const totalPending = invoices
    .filter((inv) => inv.status === "impayée" || inv.status === "partielle")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const totalOverdue = invoices.filter(
    (inv) =>
      (inv.status === "impayée" || inv.status === "partielle") &&
      inv.due_date &&
      new Date(inv.due_date) < new Date()
  ).length;

  /**
   * handleGenerateReceipt:
   * - if multiple payments: open chooser dialog (showReceiptChooser)
   * - if single payment: generate receipt directly
   */
  const handleGenerateReceipt = (invoice) => {
    const invoicePayments = payments
      .filter((p) => p.invoice_id === invoice.id)
      .sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));

    if (invoicePayments.length === 0) {
      toast.error("Aucun paiement trouvé pour cette facture");
      return;
    }

    if (invoicePayments.length === 1) {
      // only one payment: generate directly
      const latestPayment = invoicePayments[0];
      const enrollment = enrollments.find((e) => e.id === invoice.enrollment_id);
      const student = students.find((s) => s.id === enrollment?.student_id);
      const studentName = student ? `${student.first_name} ${student.last_name}` : "Étudiant";
      generateReceiptPDF(latestPayment, invoice, studentName, "/src/assets/logo.jpg");
      return;
    }

    // multiple payments -> open chooser
    setReceiptPayments(invoicePayments);
    setReceiptInvoice(invoice);
    setShowReceiptChooser(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Paiement/Facturation</h1>
          <p className="text-slate-600 mt-1">Gérez vos factures et paiements</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedInvoice(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="stagger-item shadow-xl border-0 bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-700 mb-2">Revenus Totaux</p>
                <h3 className="text-4xl font-black text-emerald-900 tracking-tight">{totalRevenue.toLocaleString()} Ar</h3>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-xl shadow-emerald-600/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <DollarSign className="h-8 w-8 text-white animate-pulse-slow" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item shadow-xl border-0 bg-gradient-to-br from-red-50 via-red-100 to-red-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-700 mb-2">En Attente</p>
                <h3 className="text-4xl font-black text-red-900 tracking-tight">{totalPending.toLocaleString()} Ar</h3>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 shadow-xl shadow-red-600/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <TrendingUp className="h-8 w-8 text-white animate-pulse-slow" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item shadow-xl border-0 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-orange-700 mb-2">Factures en Retard</p>
                <h3 className="text-4xl font-black text-orange-900 tracking-tight">{totalOverdue}</h3>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 shadow-xl shadow-orange-600/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <AlertCircle className="h-8 w-8 text-white animate-pulse-slow" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Rechercher une facture..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
              <TableHead className="font-black text-slate-700">N° Facture</TableHead>
              <TableHead className="font-black text-slate-700">Étudiant</TableHead>
              <TableHead className="font-black text-slate-700">Montant</TableHead>
              <TableHead className="font-black text-slate-700">Date d'Échéance</TableHead>
              <TableHead className="font-black text-slate-700">Statut</TableHead>
              <TableHead className="font-black text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Aucune facture trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => {
                const invoicePayments = payments
                  .filter((p) => p.invoice_id === invoice.id)
                  .sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
                const paid = invoicePayments.reduce((s, p) => s + (p.amount || 0), 0);
                const reste = (invoice.amount || 0) - paid;
                const expanded = expandedInvoiceId === invoice.id;

                return (
                  <React.Fragment key={invoice.id}>
                    <TableRow className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all duration-300 border-b border-slate-100 group">
                      <TableCell className="font-mono text-sm font-bold text-slate-700">{invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{getStudentName(invoice.enrollment_id)}</TableCell>
                      <TableCell className="font-bold text-lg">
                        <div className="text-slate-900">{invoice.amount?.toLocaleString()} Ar</div>
                        <div className="text-xs text-slate-500 font-normal">
                          Payé: {paid.toLocaleString()} Ar • Reste: {reste.toLocaleString()} Ar
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">{invoice.due_date ? format(new Date(invoice.due_date), "d MMM yyyy", { locale: fr }) : "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${invoice.status === "payée" ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold" : invoice.status === "partielle" ? "bg-amber-100 text-amber-800 border-amber-300 font-bold" : "bg-red-100 text-red-800 border-red-300 font-bold"} border-2`}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end items-center">
                          {invoice.status !== "payée" && invoice.status !== "annulée" && (
                            <Button size="sm" onClick={() => { setSelectedInvoice(invoice); setShowPayment(true); }} className="bg-green-600 hover:bg-green-700">
                              <CreditCard className="h-4 w-4 mr-1" /> Payer
                            </Button>
                          )}

                          {invoicePayments.length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateReceipt(invoice)}
                              className="hover:bg-red-50"
                            >
                              <FileText className="h-4 w-4 mr-1" /> Reçu PDF
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowForm(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                className="cursor-pointer text-red-600 focus:text-red-600"
                                onClick={() => {
                                  if (confirm("Supprimer cette facture ?"))
                                    deleteMutation.mutate(invoice.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button size="sm" variant="ghost" onClick={() => setExpandedInvoiceId(expanded ? null : invoice.id)} title={expanded ? "Masquer paiements" : "Voir paiements"}>
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-slate-50">
                          <div className="p-4">
                            <h4 className="font-semibold mb-2">Historique des paiements ({invoicePayments.length})</h4>
                            {invoicePayments.length === 0 ? (
                              <div className="text-slate-500">Aucun paiement enregistré.</div>
                            ) : (
                              <div className="grid gap-2">
                                {invoicePayments.map((p) => (
                                  <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded">
                                    <div>
                                      <div className="font-medium">{p.method}</div>
                                      <div className="text-sm text-slate-500">{p.transaction_reference || "—"}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold">{(p.amount || 0).toLocaleString()} Ar</div>
                                      <div className="text-sm text-slate-500">{p.created_date ? format(new Date(p.created_date), "d MMM yyyy HH:mm", { locale: fr }) : ""}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Receipt chooser dialog (when invoice has multiple payments) */}
      <Dialog open={showReceiptChooser} onOpenChange={() => setShowReceiptChooser(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Choisir un paiement</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {receiptPayments.length === 0 ? (
              <p className="text-slate-500">Aucun paiement trouvé.</p>
            ) : (
              receiptPayments.map((p) => (
                <Button
                  key={p.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => {
                    const enrollment = enrollments.find((e) => e.id === (receiptInvoice?.enrollment_id));
                    const student = students.find((s) => s.id === enrollment?.student_id);
                    const studentName = student ? `${student.first_name} ${student.last_name}` : "Étudiant";
                    // generate receipt for selected payment
                    generateReceiptPDF(p, receiptInvoice, studentName, "/src/assets/logo.jpg");
                    setShowReceiptChooser(false);
                  }}
                >
                  <span>{p.method} — {(p.amount || 0).toLocaleString()} Ar</span>
                  <span className="text-xs text-slate-500">
                    {p.created_date ? format(new Date(p.created_date), "d MMM yyyy HH:mm", { locale: fr }) : ""}
                  </span>
                </Button>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiptChooser(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice form dialog */}
      {showForm && (
        <InvoiceFormDialog
          invoice={selectedInvoice}
          enrollments={enrollments}
          students={students}
          open={showForm}
          onClose={() => { setShowForm(false); setSelectedInvoice(null); }}
        />
      )}

      {/* Payment dialog */}
      {showPayment && selectedInvoice && (
        <PaymentDialog
          invoice={selectedInvoice}
          open={showPayment}
          onClose={() => { setShowPayment(false); setSelectedInvoice(null); }}
        />
      )}
    </div>
  );
}
