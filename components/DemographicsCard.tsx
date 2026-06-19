"use client";
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { UsersRound } from 'lucide-react';

const COLORS = ['#d946ef', '#06b6d4', '#94a3b8']; // Female(Primary), Male(Accent), Undisclosed(Muted)

export default function DemographicsCard({ profile }: { profile: any }) {
  const data = [
    { name: 'Female', value: Number(profile.female_pct) || 0 },
    { name: 'Male', value: Number(profile.male_pct) || 0 },
    { name: 'Undisclosed', value: Number(profile.undisclosed_pct) || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <UsersRound className="text-accent" size={20} />
        <h3 className="text-lg font-semibold">Audience Demographics</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-xs text-text-muted uppercase tracking-wider">Primary Cohort</p>
        <p className="font-medium text-primary bg-primary/10 inline-block px-3 py-1 rounded-full mt-1">
          {profile.interest_cohort || 'Unknown'}
        </p>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
