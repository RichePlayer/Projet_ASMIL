import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import StatCard from "@/components/shared/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import PerformanceOverview from "@/components/dashboard/PerformanceOverview";
import PaymentTimeline from "@/components/dashboard/PaymentTimeline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Download,
    Users,
    Calendar,
    CreditCard,
    Activity,
    FileText,
    TrendingUp,
    Wallet,
    GraduationCap,
    ShieldCheck,
    UserPlus,
    Database,
    AlertCircle,
    CheckCircle2,
    BookOpen,
    Clock,
    DollarSign
} from "lucide-react";
import { formatCurrency } from "@/utils/exportHelpers";

import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const navigate = useNavigate();

    // Fetch data with proper extraction
    const { data: invoicesData } = useQuery({
        queryKey: ["invoices"],
        queryFn: async () => {
            const response = await api.get('/invoices?limit=1000');
            return response.data.invoices || response.data || [];
        }
    });

    const { data: paymentsData } = useQuery({
        queryKey: ["payments"],
        queryFn: async () => {
            const response = await api.get('/payments?limit=1000');
            return response.data.payments || response.data || [];
        }
    });

    const { data: enrollmentsData } = useQuery({
        queryKey: ["enrollments"],
        queryFn: async () => {
            const response = await api.get('/enrollments?limit=1000');
            return response.data.enrollments || response.data || [];
        }
    });

    const { data: studentsData } = useQuery({
        queryKey: ["students"],
        queryFn: async () => {
            const response = await api.get('/students?limit=1000');
            return response.data.students || response.data || [];
        }
    });

    const { data: teachersData } = useQuery({
        queryKey: ["teachers"],
        queryFn: async () => {
            const response = await api.get('/teachers?limit=1000');
            return response.data.teachers || response.data || [];
        }
    });

    // Ensure all data is always an array
    const invoices = Array.isArray(invoicesData) ? invoicesData : [];
    const payments = Array.isArray(paymentsData) ? paymentsData : [];
    const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : [];
    const students = Array.isArray(studentsData) ? studentsData : [];
    const teachers = Array.isArray(teachersData) ? teachersData : [];

    // ========== ADVANCED KPIs ==========

    // Revenue calculations
    const totalRevenue = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    // Previous period revenue for comparison
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

    // Student growth
    const studentsThisMonth = students.filter(s => {
        const date = new Date(s.created_date || s.createdAt);
        return isWithinInterval(date, {
            start: startOfMonth(currentMonth),
            end: endOfMonth(currentMonth)
        });
    }).length;

    const studentsLastMonth = students.filter(s => {
        const date = new Date(s.created_date || s.createdAt);
        return isWithinInterval(date, {
            start: startOfMonth(previousMonth),
            end: endOfMonth(previousMonth)
        });
    }).length;

    const studentGrowth = studentsLastMonth > 0
        ? ((studentsThisMonth - studentsLastMonth) / studentsLastMonth * 100).toFixed(1)
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

    // Active enrollments
    const activeEnrollments = enrollments.filter(e => e.status === "actif").length;

    // Success rate (students with grades > 10)
    const successRate = 75; // Mock data - calculate from actual grades

    // Monthly revenue data
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
        const nextMonth = avg + Math.round(avg * 0.08);
        return { avg, nextMonth };
    }, [revenueByMonth]);

    // Quick actions
    const quickActions = [
        { icon: UserPlus, label: "Nouvel Utilisateur", action: () => navigate("/admin/users"), color: "blue" },
        { icon: BookOpen, label: "Nouvelle Formation", action: () => navigate("/admin/formations"), color: "emerald" },
        { icon: Calendar, label: "Nouvelle Session", action: () => navigate("/admin/sessions"), color: "emerald" },
        { icon: ShieldCheck, label: "Voir Logs", action: () => navigate("/admin/logs"), color: "amber" },
    ];
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Tableau de bord
                        <span className="text-red-600 bg-red-50 px-3 py-1 rounded-lg text-lg border border-red-100 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            Admin
                        </span>
                    </h1>
                    <p className="text-slate-500 mt-1">Vue d'ensemble globale et administration du système</p>
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
                    title="Étudiants Inscrits"
                    value={students.length}
                    icon={GraduationCap}
                    trend={Number(studentGrowth)}
                    trendLabel={`+${studentsThisMonth} ce mois`}
                    color="violet"
                />

                <StatCard
                    title="Impayés"
                    value={formatCurrency(unpaidAmount)}
                    icon={AlertCircle}
                    subtitle={`${unpaidInvoices.length} factures`}
                    color="red"
                />

                <StatCard
                    title="Taux de Réussite"
                    value={`${successRate}%`}
                    icon={CheckCircle2}
                    trend={5.2}
                    trendLabel="vs année dernière"
                    color="blue"
                />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Factures Émises"
                    value={invoices.length}
                    icon={FileText}
                    subtitle="Total global"
                    color="blue"
                />

                <StatCard
                    title="Inscriptions Actives"
                    value={activeEnrollments}
                    icon={Activity}
                    subtitle="En cours"
                    color="amber"
                />

                <StatCard
                    title="Enseignants"
                    value={teachers.length}
                    icon={Users}
                    subtitle="Actifs"
                    color="slate"
                />
            </div>

            {/* Quick Actions */}
            <Card className="border-none shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <CardHeader>
                    <CardTitle className="text-white">Actions Rapides</CardTitle>
                    <CardDescription className="text-slate-300">Accès rapide aux fonctions principales</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={action.action}
                                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 transition-all duration-300 group"
                            >
                                <div className={`p-3 rounded-lg bg-${action.color}-500/20 group-hover:scale-110 transition-transform`}>
                                    <action.icon className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-sm font-medium text-center">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Charts) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Revenue Chart */}
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-900">Aperçu des Revenus</CardTitle>
                                <CardDescription>Évolution financière sur les 6 derniers mois</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                    <Download className="h-4 w-4 text-slate-400" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <RevenueChart data={revenueByMonth} />
                        </CardContent>
                    </Card>

                    {/* Payment Timeline */}
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-900">Transactions Récentes</CardTitle>
                            <CardDescription>Derniers paiements reçus</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PaymentTimeline payments={payments.slice(0, 8)} />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (Side Panel) */}
                <div className="space-y-8">
                    {/* Performance */}
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-900">Performance</CardTitle>
                            <CardDescription>Indicateurs clés de succès</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PerformanceOverview />
                        </CardContent>
                    </Card>

                    {/* Forecast */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-400" /> Prévision
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm text-slate-400">Moyenne (3 mois)</p>
                                    <h3 className="text-2xl font-bold text-white">{formatCurrency(forecast.avg)}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-400">Projection</p>
                                    <h4 className="text-lg font-semibold text-emerald-400">{formatCurrency(forecast.nextMonth)}</h4>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Progression estimée</span>
                                    <span>+8%</span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        style={{ width: `${Math.min(100, forecast.nextMonth / Math.max(1, forecast.avg) * 100)}%` }}
                                        className="h-full bg-emerald-500 rounded-full"
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Basé sur l'historique récent</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Status */}
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-900">État du Système</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Dernière sauvegarde</span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Il y a 2h
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Utilisateurs actifs</span>
                                <span className="text-sm font-semibold text-emerald-600">3</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
