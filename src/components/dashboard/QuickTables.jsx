// src/components/dashboard/QuickTables.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function QuickTables({ students = [], sessions = [], payments = [], invoices = [] }) {
  const recentStudents = students.slice(0, 5);
  const upcomingSessions = sessions.slice(0, 5);
  const recentPayments = payments.slice(0, 6);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="col-span-1">
        <h4 className="text-sm font-semibold mb-2">Nouveaux étudiants</h4>
        <div className="space-y-2">
          {recentStudents.length === 0 ? (
            <div className="text-slate-500 text-sm">Aucun étudiant</div>
          ) : recentStudents.map(s => (
            <div key={s.id} className="p-2 rounded border border-slate-100 bg-white text-sm">
              <div className="font-medium">{s.first_name} {s.last_name}</div>
              <div className="text-xs text-slate-400">Inscrit: {s.enrollment_date ? format(new Date(s.enrollment_date), "d MMM yyyy", { locale: fr }) : "-"}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-1">
        <h4 className="text-sm font-semibold mb-2">Sessions récentes</h4>
        <div className="space-y-2">
          {upcomingSessions.length === 0 ? (
            <div className="text-slate-500 text-sm">Aucune session</div>
          ) : upcomingSessions.map(s => (
            <div key={s.id} className="p-2 rounded border border-slate-100 bg-white text-sm">
              <div className="font-medium">{s.room || "Session"} — {s.status}</div>
              <div className="text-xs text-slate-400">Du {s.start_date || "-"} au {s.end_date || "-"}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-1">
        <h4 className="text-sm font-semibold mb-2">Paiements récents</h4>
        <div className="space-y-2">
          {recentPayments.length === 0 ? (
            <div className="text-slate-500 text-sm">Aucun paiement</div>
          ) : recentPayments.map(p => (
            <div key={p.id} className="p-2 rounded border border-slate-100 bg-white text-sm flex items-center justify-between">
              <div>
                <div className="font-medium">{p.method}</div>
                <div className="text-xs text-slate-400">{p.transaction_reference || "—"}</div>
              </div>
              <div className="font-semibold">{Number(p.amount || 0).toLocaleString()} Ar</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
