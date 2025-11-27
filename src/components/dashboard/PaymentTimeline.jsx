// src/components/dashboard/PaymentTimeline.jsx
import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function PaymentTimeline({ payments = [] }) {
  if (!payments.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400">
        <Clock className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">Aucun paiement récent</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100" />

      {payments.map((payment, index) => {
        const isLast = index === payments.length - 1;
        const date = new Date(payment.created_date || payment.createdAt || new Date());

        return (
          <div key={payment.id || index} className="relative flex gap-4 pb-6 group">
            <div className="relative z-10 flex-none w-8 h-8 rounded-full bg-white border-2 border-emerald-100 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>

            <div className="flex-1 pt-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                    Paiement reçu
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {payment.student_name || "Étudiant inconnu"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                    +{Number(payment.amount).toLocaleString()} Ar
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {format(date, "d MMM HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
