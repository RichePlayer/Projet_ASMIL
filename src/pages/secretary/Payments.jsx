import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import paymentService from "@/services/paymentService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    CreditCard,
    DollarSign,
    TrendingUp,
    Plus,
    Edit,
    Trash2,
    Eye,
    MoreVertical,
    Download,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Swal from "sweetalert2";
import DataTable from "@/components/ui/data-table";
import PaymentFormDialog from "@/components/payments/PaymentFormDialog";
import PaymentEditDialog from "@/components/payments/PaymentEditDialog";
import PaymentDetailsDialog from "@/components/payments/PaymentDetailsDialog";
import { generatePaymentReceipt } from "@/utils/pdfUtils";


export default function Payments() {
    const [methodFilter, setMethodFilter] = useState("all");
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const queryClient = useQueryClient();

    // Fetch Payments
    const { data: paymentsData = [], isLoading } = useQuery({
        queryKey: ["payments"],
        queryFn: () => paymentService.getAll(),
    });

    // Fetch Stats
    const { data: stats } = useQuery({
        queryKey: ["payment-stats"],
        queryFn: () => paymentService.getStats(),
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => paymentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            Swal.fire({
                icon: "success",
                title: "Supprimé !",
                text: "Le paiement a été supprimé avec succès.",
                timer: 2000,
                showConfirmButton: false,
            });
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: error.response?.data?.message || "Impossible de supprimer le paiement.",
            });
        },
    });

    // Helpers
    const getStudentName = (payment) => {
        if (payment.invoice?.enrollment?.student) {
            const { first_name, last_name } = payment.invoice.enrollment.student;
            return `${first_name} ${last_name}`;
        }
        return "Étudiant inconnu";
    };

    const getFormationInfo = (payment) => {
        if (payment.invoice?.enrollment?.session?.module?.title) {
            return payment.invoice.enrollment.session.module.title;
        }
        return "Formation inconnue";
    };

    // Filter
    const filteredPayments = paymentsData.filter((payment) => {
        const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
        return matchesMethod;
    });

    // Stats calculations
    const totalRevenue = stats?.totalAmount || 0;
    const totalPayments = stats?.totalPayments || 0;
    const averagePayment = totalPayments > 0 ? totalRevenue / totalPayments : 0;

    // Handlers
    const handleAddPayment = () => {
        setShowAddDialog(true);
    };

    const handleEdit = (payment) => {
        setSelectedPayment(payment);
        setShowEditDialog(true);
    };

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsDialog(true);
    };

    const handleDelete = (payment) => {
        Swal.fire({
            title: "Êtes-vous sûr ?",
            text: "Cette action supprimera le paiement et mettra à jour le solde de la facture.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler",
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(payment.id);
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900">Paiements</h1>
                    <p className="text-slate-600 mt-1">Gérez les paiements des inscriptions</p>
                </div>
                <Button
                    onClick={handleAddPayment}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Paiement
                </Button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-emerald-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <DollarSign className="h-32 w-32 text-emerald-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Total</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold mb-1">Total Encaissé</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalRevenue.toLocaleString()} Ar</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-pink-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <CreditCard className="h-32 w-32 text-pink-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl text-white shadow-lg shadow-pink-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Compteur</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold mb-1">Nombre de Paiements</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalPayments}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-red-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <TrendingUp className="h-32 w-32 text-red-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white shadow-lg shadow-red-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Moyenne</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold mb-1">Paiement Moyen</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{averagePayment.toLocaleString()} Ar</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* SEARCH + FILTER */}
            <div className="flex flex-wrap gap-2">
                {["all", "Espèces", "Chèque", "Virement", "Mobile Money"].map((method) => (
                    <Button
                        key={method}
                        variant={methodFilter === method ? "default" : "outline"}
                        onClick={() => setMethodFilter(method)}
                        className={methodFilter === method ? "bg-red-600 hover:bg-red-700" : ""}
                        size="sm"
                    >
                        {method === "all" ? "Tous" : method}
                    </Button>
                ))}
            </div>

            {/* TABLE */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                        </div>
                    ) : (
                        <DataTable
                            data={filteredPayments}
                            columns={[
                                {
                                    key: 'payment_date',
                                    label: 'Date',
                                    sortable: true,
                                    render: (payment) =>
                                        payment.payment_date
                                            ? format(new Date(payment.payment_date), "d MMM yyyy", { locale: fr })
                                            : "N/A",
                                },
                                {
                                    key: 'invoice_number',
                                    label: 'N° Facture',
                                    sortable: true,
                                    render: (payment) => (
                                        <span className="font-mono font-medium">
                                            {payment.invoice?.invoice_number || "N/A"}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'student',
                                    label: 'Étudiant',
                                    sortable: true,
                                    render: (payment) => getStudentName(payment),
                                },
                                {
                                    key: 'formation',
                                    label: 'Formation',
                                    sortable: true,
                                    render: (payment) => getFormationInfo(payment),
                                },
                                {
                                    key: 'amount',
                                    label: 'Montant',
                                    sortable: true,
                                    render: (payment) => (
                                        <span className="font-bold">
                                            {parseFloat(payment.amount || 0).toLocaleString()} Ar
                                        </span>
                                    ),
                                },
                                {
                                    key: 'method',
                                    label: 'Mode',
                                    sortable: true,
                                    render: (payment) => (
                                        <Badge variant="outline" className="bg-slate-100 text-slate-800 border">
                                            {payment.method || "N/A"}
                                        </Badge>
                                    ),
                                },
                                {
                                    key: 'actions',
                                    label: 'Actions',
                                    sortable: false,
                                    searchable: false,
                                    render: (payment) => (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Voir détails
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(payment)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => generatePaymentReceipt(payment)}>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Exporter PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-700"
                                                    onClick={() => handleDelete(payment)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ),
                                },
                            ]}
                            searchable={true}
                            defaultPageSize={10}
                            pageSizeOptions={[10, 25, 50, 100]}
                        />
                    )}
                </CardContent>
            </Card>

            {/* DIALOGS */}
            {showAddDialog && (
                <PaymentFormDialog
                    open={showAddDialog}
                    onClose={() => {
                        setShowAddDialog(false);
                    }}
                />
            )}

            {showEditDialog && selectedPayment && (
                <PaymentEditDialog
                    payment={selectedPayment}
                    open={showEditDialog}
                    onClose={() => {
                        setShowEditDialog(false);
                        setSelectedPayment(null);
                    }}
                />
            )}

            {showDetailsDialog && selectedPayment && (
                <PaymentDetailsDialog
                    payment={selectedPayment}
                    open={showDetailsDialog}
                    onClose={() => {
                        setShowDetailsDialog(false);
                        setSelectedPayment(null);
                    }}
                />
            )}
        </div>
    );
}
