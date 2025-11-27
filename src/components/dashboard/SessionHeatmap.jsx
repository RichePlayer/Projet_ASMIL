// src/components/dashboard/SessionHeatmap.jsx
import React from "react";

/**
 * Simple placeholder heatmap (static) — tu peux remplacer par une vraie heatmap lib plus tard.
 */
export default function SessionHeatmap() {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const values = [
    [20,40,60,80,40,20],
    [30,50,70,90,40,10],
    [10,30,50,20,60,30],
    [50,70,90,60,30,20],
  ];

  return (
    <div className="grid gap-2">
      {values.map((row, i) => (
        <div key={i} className="flex gap-2">
          {row.map((v, j) => (
            <div key={j} title={`${days[j]}: ${v}%`} className={`w-12 h-6 rounded ${v>75 ? "bg-red-600" : v>50 ? "bg-red-400" : v>25 ? "bg-red-200" : "bg-red-50"}`}></div>
          ))}
        </div>
      ))}
      <div className="text-xs text-slate-500 mt-2">Heatmap approximative — Intensité = fréquentation / session</div>
    </div>
  );
}
