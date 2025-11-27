// src/components/dashboard/RevenueChart.jsx
import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-3 rounded-xl shadow-xl">
        <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
        <p className="text-lg font-bold text-red-600">
          {payload[0].value.toLocaleString()} <span className="text-xs font-normal text-slate-500">Ar</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data = [] }) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748B" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748B" }}
            tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#DC2626"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRev)"
            activeDot={{ r: 6, strokeWidth: 0, fill: "#DC2626" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
