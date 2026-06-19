"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShieldAlert } from 'lucide-react';

export default function HealthGauge({ metrics }: { metrics: any }) {
  const data = [
    {
      name: 'Authenticity',
      Genuine: metrics.genuine || 0,
      Spam: metrics.spam || 0,
    },
    {
      name: 'Bot Likelihood',
      Human: metrics.human || 0,
      Bot: metrics.likelyBot || 0,
    }
  ];

  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert className="text-secondary" size={20} />
        <h3 className="text-lg font-semibold">Comment Health</h3>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} />
            <Tooltip 
              contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="Genuine" stackId="a" fill="#10b981" />
            <Bar dataKey="Spam" stackId="a" fill="#f43f5e" />
            <Bar dataKey="Human" stackId="b" fill="#06b6d4" />
            <Bar dataKey="Bot" stackId="b" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
