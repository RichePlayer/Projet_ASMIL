// src/pages/admin/FinanceOverview.jsx
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { invoiceAPI, paymentAPI, studentAPI, formationAPI } from "@/api/localDB";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/shared/StatCard";
import ExportButton from "@/components/shared/ExportButton";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { formatCurrency, formatDate } from "@/utils/exportHelpers";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    Clock,
    PieChart,
    BarChart3,
    Download,
    Calendar,
    CreditCard,
    Wallet
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function FinanceOverview() {
    const { data: invoices = [] } = useQuery({ queryKey: ["invoices"], queryFn: () => invoiceAPI.list("-created_date", 1000) });
    const { data: payments = [] } = useQuery({ queryKey: ["payments"], queryFn: () => paymentAPI.list("-created_date", 1000) });
    const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => studentAPI.list() });
    const { data: formations = [] } = useQuery({ queryKey: ["formations"], queryFn: () => formationAPI.list() });

    // ========== FINANCIAL CALCULATIONS ==========

    // Total revenue
    const totalRevenue = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    // Revenue this month vs last month
    const currentMonth = new Date();
    const previousMonth = subMonths(currentMonth, 1);

    const currentMonthRevenue = payments
        .filter(p => {
            const date = new Date(p.created_date || p.createdAt);
            return isWithinInterval(date, {
                start: startOfMonth(currentMonth),
                end: endOfMonth(currentMonth)
            });
        })
        .reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const previousMonthRevenue = payments
        .filter(p => {
            const date = new Date(p.created_date || p.createdAt);
            return isWithinInterval(date, {
                start: startOfMonth(previousMonth),
                end: endOfMonth(previousMonth)
            });
        })
        .reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const revenueTrend = previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
        : 0;

    // Unpaid invoices
    const unpaidInvoices = invoices.filter(inv => {
        const invPayments = payments.filter(p => p.invoice_id === inv.id);
        const paidSum = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        return paidSum < (Number(inv.amount) || 0);
    });

    const unpaidAmount = unpaidInvoices.reduce((s, inv) => {
        const invPayments = payments.filter(p => p.invoice_id === inv.id);
        const paidSum = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        return s + (Number(inv.amount) - paidSum);
    }, 0);

    // Paid invoices
    const paidInvoices = invoices.filter(inv => {
        const invPayments = payments.filter(p => p.invoice_id === inv.id);
        const paidSum = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        return paidSum >= (Number(inv.amount) || 0);
    });

    // Overdue invoices
    const overdueInvoices = invoices.filter(inv => {
        if (!inv.due_date) return false;
        const due = new Date(inv.due_date);
        const invPayments = payments.filter(p => p.invoice_id === inv.id);
        const paidSum = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        return paidSum < (Number(inv.amount) || 0) && due < new Date();
    });

    // Average invoice amount
    const avgInvoiceAmount = invoices.length > 0
        ? invoices.reduce((s, inv) => s + (Number(inv.amount) || 0), 0) / invoices.length
        : 0;

    // Payment rate
    const paymentRate = invoices.length > 0
        ? (paidInvoices.length / invoices.length * 100).toFixed(1)
        : 0;

    // Revenue by formation
    const revenueByFormation = useMemo(() => {
        const formationRevenue = {};

        invoices.forEach(inv => {
            const student = students.find(s => s.id === inv.student_id);
            if (student && student.formation_id) {
                const formation = formations.find(f => f.id === student.formation_id);
                const formationName = formation?.name || "Non spécifié";

                const invPayments = payments.filter(p => p.invoice_id === inv.id);
                const paidSum = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

                formationRevenue[formationName] = (formationRevenue[formationName] || 0) + paidSum;
            }
        });

        return Object.entries(formationRevenue)
            .map(([name, revenue]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [invoices, payments, students, formations]);

    // Monthly revenue for chart
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push(format(d, "yyyy-MM"));
    }

    const revenueByMonth = months.map(m => {
        const [y, mo] = m.split("-");
        const start = new Date(Number(y), Number(mo) - 1, 1);
        const end = new Date(Number(y), Number(mo), 1);
        const monthSum = payments
            .filter(p => {
                const pd = new Date(p.created_date || p.createdAt || new Date());
                return pd >= start && pd < end;
            })
            .reduce((s, p) => s + (Number(p.amount) || 0), 0);
        return { month: format(start, "MMM", { locale: fr }), revenue: monthSum };
    });

    // Forecast
    const forecast = useMemo(() => {
        const last3 = revenueByMonth.slice(-3).map(r => r.revenue || 0);
        const avg = last3.length ? Math.round((last3.reduce((s, x) => s + x, 0) / last3.length)) : 0;
        const growth = 0.08; // 8% growth assumption
        const nextMonth = avg + Math.round(avg * growth);
        return { avg, nextMonth, growth: (growth * 100).toFixed(0) };
    }, [revenueByMonth]);

    // Export data
    const exportData = invoices.map(inv => {
        const student = students.find(s => s.id === inv.student_id);
        const invPayments = payments.filter(p => p.invoice_id === inv.id);
        const paidSum = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        const status = paidSum >= (Number(inv.amount) || 0) ? "Payée" : "Impayée";

        return {
            "N° Facture": inv.invoice_number || inv.id,
            "Étudiant": student?.full_name || "N/A",
            "Montant": Number(inv.amount) || 0,
            "Payé": paidSum,
            "Reste": (Number(inv.amount) || 0) - paidSum,
            "Statut": status,
            "Date": formatDate(inv.created_date),
            "Échéance": inv.due_date ? formatDate(inv.due_date) : "N/A",
        };
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Aperçu Financier</h1>
                    <p className="text-slate-500 mt-1">Analyse complète des revenus et paiements</p>
                </div>
            </div>

            {/* Main KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Revenus Totaux"
                    value={formatCurrency(totalRevenue)}
                    icon={Wallet}
                    trend={Number(revenueTrend)}
                    trendLabel="vs mois dernier"
                    color="emerald"
                />

                <StatCard
                    title="Revenus ce Mois"
                    value={formatCurrency(currentMonthRevenue)}
                    icon={Calendar}
                    subtitle={format(currentMonth, "MMMM yyyy", { locale: fr })}
                    color="blue"
                />

                <StatCard
                    title="Impayés"
                    value={formatCurrency(unpaidAmount)}
                    icon={AlertCircle}
                    subtitle={`${unpaidInvoices.length} factures`}
                    color="red"
                />

                <StatCard
                    title="Taux de Paiement"
                    value={`${paymentRate}%`}
                    icon={CheckCircle2}
                    subtitle={`${paidInvoices.length}/${invoices.length} factures`}
                    color="violet"
                />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard
                    title="Factures en Retard"
                    value={overdueInvoices.length}
                    icon={Clock}
                    color="amber"
                />

                <StatCard
                    title="Montant Moyen"
                    value={formatCurrency(Math.round(avgInvoiceAmount))}
                    icon={DollarSign}
                    subtitle="Par facture"
                    color="slate"
                />

                <StatCard
                    title="Prévision Mois Prochain"
                    value={formatCurrency(forecast.nextMonth)}
                    icon={TrendingUp}
                    subtitle={`+${forecast.growth}% estimé`}
                    color="emerald"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            Évolution des Revenus
                        </CardTitle>
                        <CardDescription>6 derniers mois</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <RevenueChart data={revenueByMonth} />
                    </CardContent>
                </Card>

                {/* Revenue by Formation */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-violet-600" />
                            Revenus par Formation
                        </CardTitle>
                        <CardDescription>Top 5 formations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {revenueByFormation.map((item, idx) => {
                                const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue * 100).toFixed(1) : 0;
                                const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500'];

                                return (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                                            <span className="text-sm font-bold text-slate-900">{formatCurrency(item.revenue)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-500 w-12 text-right">{percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Invoices */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle>Factures Récentes</CardTitle>
                    <CardDescription>Dernières transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>N° Facture</TableHead>
                                    <TableHead>Étudiant</TableHead>
                                    <TableHead>Montant</TableHead>
                                    <TableHead>Payé</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.slice(0, 10).map((inv) => {
                                    const student = students.find(s => s.id === inv.student_id);
                                    const invPayments = payments.filter(p => p.invoice_id === inv.id);
                                    const paidSum = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
                                    const isPaid = paidSum >= (Number(inv.amount) || 0);

                                    return (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-mono text-sm">{inv.invoice_number || `#${inv.id}`}</TableCell>
                                            <TableCell className="font-medium">{student?.full_name || "N/A"}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(Number(inv.amount) || 0)}</TableCell>
                                            <TableCell className="text-emerald-600 font-medium">{formatCurrency(paidSum)}</TableCell>
                                            <TableCell>
                                                {isPaid ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Payée
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 border">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        En attente
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">{formatDate(inv.created_date)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
