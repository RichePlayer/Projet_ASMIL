// src/components/dashboard/StudentGrowthChart.jsx
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const sample = [
  { month: "Mai", students: 42 },
  { month: "Jun", students: 48 },
  { month: "Jul", students: 55 },
  { month: "Aug", students: 61 },
  { month: "Sep", students: 72 },
  { month: "Oct", students: 80 },
];

export default function StudentGrowthChart({ data = sample }) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
          <Line type="monotone" dataKey="students" stroke="#DC2626" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
