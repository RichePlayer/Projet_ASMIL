import React from "react";
import StatsCard from "../components/dashboard/StatsCard";
import RecentActivityCard from "../components/dashboard/RecentActivityCard";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  /* =======================================
     FAKE DATA (à remplacer Express plus tard)
  ======================================== */

  const students = [
    { status: "actif" },
    { status: "actif" },
    { status: "inactif" },
    { status: "diplômé" },
  ];

  const enrollments = [
    { status: "actif", title: "Inscription - Dev Web", created_date: "2025-02-10" },
    { status: "en attente", title: "Inscription - Gestion", created_date: "2025-02-08" },
    { status: "terminé", title: "Fin Session", created_date: "2025-02-01" },
  ];

  const sessions = [
    { status: "en cours" },
    { status: "en cours" },
    { status: "terminé" },
  ];

  const invoices = [
    { status: "payée", amount: 5000 },
    { status: "payée", amount: 4500 },
    { status: "impayée", amount: 0 },
  ];

  /* =======================================
     CALCULS STATS
  ======================================== */

  const activeStudents = students.filter((s) => s.status === "actif").length;
  const activeSessions = sessions.filter((s) => s.status === "en cours").length;

  const totalRevenue = invoices
    .filter((i) => i.status === "payée")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingPayments = invoices.filter((i) => i.status === "impayée").length;

  /* =======================================
     GRAPHIQUES
  ======================================== */

  const revenueData = [
    { mois: "Jan", revenus: 45000 },
    { mois: "Fév", revenus: 52000 },
    { mois: "Mar", revenus: 48000 },
    { mois: "Avr", revenus: 61000 },
    { mois: "Mai", revenus: 55000 },
    { mois: "Juin", revenus: 67000 },
  ];

  const studentStatusData = [
    { statut: "Actifs", nombre: students.filter((s) => s.status === "actif").length },
    { statut: "Inactifs", nombre: students.filter((s) => s.status === "inactif").length },
    { statut: "Diplômés", nombre: students.filter((s) => s.status === "diplômé").length },
  ];

  const enrollmentStatusData = [
    { name: "Actif", value: enrollments.filter((e) => e.status === "actif").length, color: "#10B981" },
    { name: "En attente", value: enrollments.filter((e) => e.status === "en attente").length, color: "#F59E0B" },
    { name: "Terminé", value: enrollments.filter((e) => e.status === "terminé").length, color: "#3B82F6" },
    { name: "Annulé", value: enrollments.filter((e) => e.status === "annulé").length, color: "#EF4444" },
  ];

  return (
    <div className="space-y-8">
      {/* TITLE */}
      <div>
        <h1 className="text-4xl font-black text-slate-900">Tableau de Bord</h1>
        <p className="text-slate-600">Aperçu global ASMiL</p>
      </div>

      {/* CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Étudiants actifs" value={activeStudents} icon={Users} trend="up" trendValue="+12%" color="red" />
        <StatsCard title="Sessions en cours" value={activeSessions} icon={Calendar} trend="up" trendValue="+8%" color="blue" />
        <StatsCard title="Revenus du mois" value={`${totalRevenue} Ar`} icon={DollarSign} trend="up" trendValue="+15%" color="green" />
        <StatsCard title="Paiements en attente" value={pendingPayments} icon={TrendingUp} trend="down" trendValue="-5%" color="orange" />
      </div>

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* REVENUE LINE CHART */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b">
            <CardTitle>Évolution des Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenus" stroke="#C1121F" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PIE CHART */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b">
            <CardTitle>Inscriptions par Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={enrollmentStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {enrollmentStatusData.map((item, index) => (
                    <Cell key={index} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* BAR CHART */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b">
            <CardTitle>Étudiants par Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="statut" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="nombre" fill="#C1121F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* RECENT ACTIVITY */}
        <RecentActivityCard
          title="Inscriptions récentes"
          icon={GraduationCap}
          activities={enrollments}
        />
      </div>
    </div>
  );
}
