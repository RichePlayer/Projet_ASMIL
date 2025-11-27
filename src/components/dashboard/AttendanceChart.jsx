// src/components/dashboard/AttendanceChart.jsx
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const defaultData = [
  { name: "S1", present: 85, absent: 15 },
  { name: "S2", present: 78, absent: 22 },
  { name: "S3", present: 92, absent: 8 },
];

export default function AttendanceChart({ data = defaultData }) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
          <Bar dataKey="present" stackId="a" fill="#10B981" />
          <Bar dataKey="absent" stackId="a" fill="#EF4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
