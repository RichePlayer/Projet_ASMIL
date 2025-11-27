// src/components/dashboard/RecentActivityList.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function RecentActivityList({ items = [], students = [] }) {
  if (!items.length) return <div className="text-slate-500">Aucune activité récente.</div>;

  return (
    <div className="space-y-2">
      {items.map((it, idx) => {
        const date = it.date ? new Date(it.date) : new Date();
        let title = "";
        let subtitle = "";
        if (it.type === "payment") {
          title = `Paiement: ${Number(it.payload.amount || 0).toLocaleString()} Ar`;
          subtitle = `Réf: ${it.payload.transaction_reference || "—"}`;
        } else if (it.type === "invoice") {
          title = `Facture: ${it.payload.invoice_number || `#${it.payload.id?.slice(0,6)}`}`;
          subtitle = `Montant: ${Number(it.payload.amount || 0).toLocaleString()} Ar`;
        } else if (it.type === "announcement") {
          title = `Annonce: ${it.payload.title || "—"}`;
          subtitle = `${it.payload.type || "Info"}`;
        }
        return (
          <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border border-slate-100">
            <div>
              <div className="font-medium">{title}</div>
              <div className="text-xs text-slate-500">{subtitle}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">{format(date, "d MMM yyyy HH:mm", { locale: fr })}</div>
            </div>
          </div>
        );
      })}
      <div className="text-center mt-2">
        <Button variant="ghost" size="sm">Voir toutes les activités</Button>
      </div>
    </div>
  );
}
