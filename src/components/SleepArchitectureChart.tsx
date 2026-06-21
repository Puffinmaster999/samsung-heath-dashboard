"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Moon } from 'lucide-react';
import { format } from 'date-fns';

interface SleepData {
  start_time?: string;
  end_time?: string;
  stage?: string; // Simplification, real data might need more parsing
}

export default function SleepArchitectureChart({ data }: { data: SleepData[] }) {
  // Mock data processing for demonstration (Samsung health sleep parsing can be complex)
  // We'll create a stylized representation
  const mockSleepData = [
    { time: '23:00', deep: 30, light: 20, rem: 10, awake: 0 },
    { time: '00:00', deep: 45, light: 10, rem: 5, awake: 0 },
    { time: '01:00', deep: 20, light: 25, rem: 15, awake: 0 },
    { time: '02:00', deep: 10, light: 30, rem: 20, awake: 0 },
    { time: '03:00', deep: 5, light: 40, rem: 15, awake: 0 },
    { time: '04:00', deep: 0, light: 30, rem: 25, awake: 5 },
    { time: '05:00', deep: 10, light: 20, rem: 30, awake: 0 },
    { time: '06:00', deep: 0, light: 45, rem: 15, awake: 0 },
  ];

  return (
    <div className="sci-fi-panel col-span-1 md:col-span-2">
      <div className="flex items-center gap-2 mb-6">
        <Moon className="text-deep-violet w-6 h-6" />
        <h2 className="text-xl font-bold uppercase tracking-wider text-white">Sleep Architecture</h2>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockSleepData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="time" type="category" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} width={50} />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.05)'}}
              contentStyle={{ backgroundColor: 'var(--color-panel-bg)', borderColor: 'var(--color-panel-border)', borderRadius: '8px', color: '#fff' }}
            />
            <Bar dataKey="deep" stackId="a" fill="#1e3a8a" radius={[4, 0, 0, 4]} />
            <Bar dataKey="light" stackId="a" fill="#8a2be2" />
            <Bar dataKey="rem" stackId="a" fill="#d8b4fe" />
            <Bar dataKey="awake" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#1e3a8a]"></span> Deep</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#8a2be2]"></span> Light</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#d8b4fe]"></span> REM</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> Awake</span>
      </div>
    </div>
  );
}
