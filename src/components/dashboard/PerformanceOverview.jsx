// src/components/dashboard/PerformanceOverview.jsx
import React from "react";
import { Badge } from "@/components/ui/badge";

export default function PerformanceOverview() {
  // Static demo values — adapte si tu veux data réelle
  const avgNote = 13.6;
  const avgPresence = 87;
  const passRate = 78;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-600">Note Moyenne</div>
          <div className="text-2xl font-bold text-slate-900">{avgNote}/20</div>
        </div>
        <div>
          <Badge className="bg-red-50 text-red-700 border-red-100">Stable</Badge>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-600">Taux de Présence</div>
          <div className="text-2xl font-bold text-slate-900">{avgPresence}%</div>
        </div>
        <div>
          <Badge className="bg-green-50 text-green-700 border-green-100">Bon</Badge>
        </div>
      </div>

      <div>
        <div className="text-sm text-slate-600">Taux de réussite</div>
        <div className="text-2xl font-bold text-slate-900">{passRate}%</div>
      </div>
    </div>
  );
}
