
// src/pages/Dashboard.jsx
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { invoiceAPI, enrollmentAPI, studentAPI, paymentAPI, announcementAPI } from "@/api/localDB";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import RevenueChart from "@/components/dashboard/RevenueChart";
import PerformanceOverview from "@/components/dashboard/PerformanceOverview";
import PaymentTimeline from "@/components/dashboard/PaymentTimeline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  ArrowUpRight,
  Users,
  CreditCard,
  Activity,
  Bell,
  Clock,
  AlertTriangle,
  FileText,
  TrendingUp,
  Wallet,
  GraduationCap
} from "lucide-react";

export default function Dashboard() {
  const { data: invoicesData } = useQuery({ queryKey: ["invoices"], queryFn: () => invoiceAPI.list("-created_date", 1000) });
  const { data: paymentsData } = useQuery({ queryKey: ["payments"], queryFn: () => paymentAPI.list("-created_date", 1000) });
  const { data: enrollmentsData } = useQuery({ queryKey: ["enrollments"], queryFn: () => enrollmentAPI.list() });
  const { data: studentsData } = useQuery({ queryKey: ["students"], queryFn: () => studentAPI.list() });

  // Ensure all data is always an array
  const invoices = Array.isArray(invoicesData) ? invoicesData : [];
  const payments = Array.isArray(paymentsData) ? paymentsData : [];
  const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : [];
  const students = Array.isArray(studentsData) ? studentsData : [];

  // KPIs
  const totalRevenue = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalInvoices = invoices.length;
  const totalStudents = students.length;
  const activeEnrollments = enrollments.filter(e => e.status === "actif").length;

  // Prepare monthly revenue series for RevenueChart (last 6 months)
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

  // Alerts: simple heuristics
  const unpaidInvoices = invoices.filter(inv => {
    const invPayments = payments.filter(p => p.invoice_id === inv.id);
    const paidSum = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return paidSum < (Number(inv.amount) || 0);
  });

  const overdueInvoices = invoices.filter(inv => {
    if (!inv.due_date) return false;
    const due = new Date(inv.due_date);
    const invPayments = payments.filter(p => p.invoice_id === inv.id);
    const paidSum = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return paidSum < (Number(inv.amount) || 0) && due < new Date();
  });

  const sessionsToday = enrollments.filter(e => {
    if (!e.start_date && !e.session_start) return false;
    const start = e.start_date ? new Date(e.start_date) : null;
    const end = e.end_date ? new Date(e.end_date) : null;
    const today = new Date();
    if (start && end) return today >= start && today <= end;
    return false;
  }).length;

  // Forecast
  const forecast = useMemo(() => {
    const last3 = revenueByMonth.slice(-3).map(r => r.revenue || 0);
    const avg = last3.length ? Math.round((last3.reduce((s, x) => s + x, 0) / last3.length)) : 0;
    const nextMonth = avg + Math.round(avg * 0.08);
    return { avg, nextMonth };
  }, [revenueByMonth]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">Vue d'ensemble de l'activité de l'institut.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-emerald-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Wallet className="h-32 w-32 text-emerald-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <CreditCard className="h-6 w-6 animate-pulse-slow" />
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> +12.5%
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Revenus Totaux</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalRevenue.toLocaleString()} Ar</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-blue-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <FileText className="h-32 w-32 text-blue-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <FileText className="h-6 w-6 animate-pulse-slow" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Total global</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Factures Émises</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalInvoices}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-violet-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <GraduationCap className="h-32 w-32 text-violet-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl text-white shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Users className="h-6 w-6 animate-pulse-slow" />
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> +4.3%
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Étudiants Inscrits</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalStudents}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-amber-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Activity className="h-32 w-32 text-amber-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Activity className="h-6 w-6 animate-pulse-slow" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">En cours</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Inscriptions Actives</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{activeEnrollments}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

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

        {/* Right Column (Dense Side Panel) */}
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
                  <h3 className="text-2xl font-bold text-white">{forecast.avg.toLocaleString()} Ar</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Projection</p>
                  <h4 className="text-lg font-semibold text-emerald-400">{forecast.nextMonth.toLocaleString()} Ar</h4>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Progression estimée</span>
                  <span>+8%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div style={{ width: `${Math.min(100, forecast.nextMonth / Math.max(1, forecast.avg) * 100)}%` }} className="h-full bg-emerald-500 rounded-full"></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Basé sur l'historique récent.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
