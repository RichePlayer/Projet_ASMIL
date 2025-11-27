// src/components/dashboard/StatsCard.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function StatsCard({ title, value, subtitle }) {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <div className="text-2xl font-bold mt-1">{value}</div>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
