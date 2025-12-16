import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, TrendingUp, AlertCircle } from "lucide-react";

export default function AttendanceStats({ attendances = [], enrollments = [], backendStats = null }) {
  // Utiliser les statistiques du backend si disponibles
  const totalPresent = backendStats?.present ?? attendances.filter((a) => a.status === "présent").length;
  const totalAbsent = backendStats?.absent ?? attendances.filter((a) => a.status === "absent").length;
  const totalLate = backendStats?.late ?? attendances.filter((a) => a.status === "retard").length;
  const totalExcused = backendStats?.excused ?? attendances.filter((a) => a.status === "excusé").length;

  const total = backendStats?.total ?? (totalPresent + totalAbsent + totalLate + totalExcused);
  const presenceRate = backendStats?.attendanceRate
    ? parseFloat(backendStats.attendanceRate)
    : (total > 0 ? ((totalPresent / total) * 100).toFixed(1) : 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {/* Présents */}
      <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-green-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <CheckCircle2 className="h-32 w-32 text-green-600" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white shadow-lg shadow-green-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Présence</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-semibold mb-1">Présents</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalPresent}</h3>
          </div>
        </CardContent>
      </Card>

      {/* Absents */}
      <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-red-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <XCircle className="h-32 w-32 text-red-600" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white shadow-lg shadow-red-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <XCircle className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Absence</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-semibold mb-1">Absents</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalAbsent}</h3>
          </div>
        </CardContent>
      </Card>

      {/* Retards */}
      <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-orange-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <Clock className="h-32 w-32 text-orange-600" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Clock className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Retard</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-semibold mb-1">Retards</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalLate}</h3>
          </div>
        </CardContent>
      </Card>

      {/* Excusés */}
      <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-blue-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <AlertCircle className="h-32 w-32 text-blue-600" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Excusé</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-semibold mb-1">Excusés</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalExcused}</h3>
          </div>
        </CardContent>
      </Card>

      {/* Taux de Présence */}
      <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-purple-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <TrendingUp className="h-32 w-32 text-purple-600" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Taux</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-semibold mb-1">Taux de Présence</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{presenceRate}<span className="text-xl">%</span></h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
