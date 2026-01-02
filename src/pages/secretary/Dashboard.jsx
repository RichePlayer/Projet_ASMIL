// src/pages/secretary/Dashboard.jsx
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";

// Backend Services
import invoiceService from "@/services/invoiceService";
import paymentService from "@/services/paymentService";
import enrollmentService from "@/services/enrollmentService";
import studentService from "@/services/studentService";

// Components
import RevenueChart from "@/components/dashboard/RevenueChart";
import PerformanceOverview from "@/components/dashboard/PerformanceOverview";
import PaymentTimeline from "@/components/dashboard/PaymentTimeline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  CreditCard,
  Activity,
  FileText,
  TrendingUp,
  Wallet,
  GraduationCap,
  Loader2,
  AlertCircle,
  UserPlus,
  Receipt,
  Award,
  ClipboardCheck
} from "lucide-react";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Fetch data from backend
  const { data: invoicesData, isLoading: loadingInvoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoiceService.getAll({ limit: 1000 }),
  });

  const { data: paymentsData } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentService.getAll({ limit: 1000 }),
  });

  const { data: enrollmentsData } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentService.getAll({ limit: 1000 }),
  });

  const { data: studentsData } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentService.getAll({ limit: 1000 }),
  });

  // Ensure all data is always an array
  const invoices = Array.isArray(invoicesData) ? invoicesData : [];
  const payments = Array.isArray(paymentsData) ? paymentsData : [];
  const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : [];
  const students = Array.isArray(studentsData) ? studentsData : [];

  // ========== KPIs ==========
  const totalRevenue = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalInvoices = invoices.length;
  const totalStudents = students.length;
  const activeEnrollments = enrollments.filter(e => e.status === "actif").length;

  // Revenue trend calculation
  const currentMonth = new Date();
  const previousMonth = subMonths(currentMonth, 1);

  const currentMonthRevenue = payments
    .filter(p => {
      const date = new Date(p.payment_date || p.created_at || new Date());
      return isWithinInterval(date, {
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
      });
    })
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const previousMonthRevenue = payments
    .filter(p => {
      const date = new Date(p.payment_date || p.created_at || new Date());
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

  // Unpaid amount
  const unpaidAmount = unpaidInvoices.reduce((s, inv) => {
    const invPayments = payments.filter(p => p.invoice_id === inv.id);
    const paidSum = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return s + (Number(inv.amount) - paidSum);
  }, 0);

  // Monthly revenue data for chart
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
        const pd = new Date(p.payment_date || p.created_at || new Date());
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

  // Quick actions for secretary
  const quickActions = [
    { icon: UserPlus, label: t('secretaryDashboard.newEnrollment'), action: () => navigate("/secretary/enrollments"), color: "blue" },
    { icon: CreditCard, label: t('secretaryDashboard.newPayment'), action: () => navigate("/secretary/payments"), color: "emerald" },
    { icon: Receipt, label: t('secretaryDashboard.issueInvoice'), action: () => navigate("/secretary/invoices"), color: "purple" },
    { icon: Award, label: t('secretaryDashboard.viewCertificates'), action: () => navigate("/secretary/certificates"), color: "amber" },
  ];

  if (loadingInvoices) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <p className="text-slate-500 font-medium">Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            {t('secretaryDashboard.title')}
            <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-lg border border-blue-100 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Secrétaire
            </span>
          </h1>
          <p className="text-slate-500 mt-1">{t('secretaryDashboard.subtitle')}</p>
        </div>
      </div>

      {/* KPIs - 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-white via-white to-emerald-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Wallet className="h-32 w-32 text-emerald-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <CreditCard className="h-6 w-6" />
              </div>
              {Number(revenueTrend) !== 0 && (
                <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${Number(revenueTrend) >= 0
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                  : 'text-red-600 bg-red-50 border-red-200'
                  }`}>
                  {Number(revenueTrend) >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-1" />}
                  {revenueTrend}%
                </span>
              )}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">{t('secretaryDashboard.totalRevenue')}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalRevenue.toLocaleString()} Ar</h3>
            </div>
          </CardContent>
        </Card>

        {/* Total Invoices */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-white via-white to-blue-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <FileText className="h-32 w-32 text-blue-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <FileText className="h-6 w-6" />
              </div>
              {unpaidInvoices.length > 0 && (
                <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200 shadow-sm">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {unpaidInvoices.length} impayées
                </span>
              )}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">{t('secretaryDashboard.issuedInvoices')}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalInvoices}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Students */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-white via-white to-violet-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <GraduationCap className="h-32 w-32 text-violet-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl text-white shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Total</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">{t('secretaryDashboard.enrolledStudents')}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalStudents}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Active Enrollments */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-white via-white to-amber-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Activity className="h-32 w-32 text-amber-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Activity className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">En cours</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">{t('secretaryDashboard.activeEnrollments')}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{activeEnrollments}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-white">{t('secretaryDashboard.quickActions')}</CardTitle>
          <CardDescription className="text-slate-300">{t('secretaryDashboard.quickActionsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 transition-all duration-300 group"
              >
                <div className="p-3 rounded-lg bg-white/20 group-hover:scale-110 transition-transform">
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
                <CardTitle className="text-lg font-bold text-slate-900">{t('secretaryDashboard.revenueOverview')}</CardTitle>
                <CardDescription>{t('secretaryDashboard.revenueOverviewDesc')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pl-0">
              <RevenueChart data={revenueByMonth} />
            </CardContent>
          </Card>

          {/* Payment Timeline */}
          <Card className="border-none shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">{t('secretaryDashboard.recentTransactions')}</CardTitle>
              <CardDescription>{t('secretaryDashboard.recentTransactionsDesc')}</CardDescription>
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
              <CardTitle className="text-lg font-bold text-slate-900">{t('secretaryDashboard.performance')}</CardTitle>
              <CardDescription>{t('secretaryDashboard.performanceDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceOverview />
            </CardContent>
          </Card>

          {/* Forecast */}
          <Card className="border-none shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" /> {t('secretaryDashboard.forecast')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-slate-400">{t('secretaryDashboard.average3Months')}</p>
                  <h3 className="text-2xl font-bold text-white">{forecast.avg.toLocaleString()} Ar</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">{t('secretaryDashboard.projection')}</p>
                  <h4 className="text-lg font-semibold text-emerald-400">{forecast.nextMonth.toLocaleString()} Ar</h4>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{t('secretaryDashboard.estimatedProgress')}</span>
                  <span>+8%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div style={{ width: `${Math.min(100, forecast.nextMonth / Math.max(1, forecast.avg) * 100)}%` }} className="h-full bg-emerald-500 rounded-full"></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">{t('secretaryDashboard.basedOnHistory')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
