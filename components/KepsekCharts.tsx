"use client";

import React from "react";
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Cpu, Users } from "lucide-react";

interface Props {
  courseData: { name: string; fullName: string; siswa: number }[];
  machineData: { name: string; value: number }[];
}

const MACHINE_COLORS: Record<string, string> = {
  Ready: "#10b981",
  Maintenance: "#f59e0b",
  Broken: "#ef4444"
};

export default function KepsekCharts({ courseData, machineData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
          <Users className="text-amber-500" size={20} />
          <h3 className="font-bold text-slate-100">Distribusi Siswa per Kelas</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={courseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#334155', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
              />
              <Bar dataKey="siswa" name="Jumlah Siswa" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
          <Cpu className="text-amber-500" size={20} />
          <h3 className="font-bold text-slate-100">Status Kesiapan Mesin Bengkel</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={machineData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {machineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={MACHINE_COLORS[entry.name] || "#64748b"} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
