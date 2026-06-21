"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Moon } from 'lucide-react';
import { format } from 'date-fns';
import { useHealthData } from '@/contexts/HealthDataContext';

export default function SleepArchitectureChart() {
  const { sleepData } = useHealthData();
  
  // Format data
  const formattedData = sleepData.slice(-7).map(item => ({
    date: item.start_time ? format(new Date(item.start_time), 'MM/dd') : '',
    deep: item.stage_deep || 0,
    light: item.stage_light || 0,
    rem: item.stage_rem || 0,
    awake: item.stage_awake || 0,
  }));

  return (
    <div className="sci-fi-panel col-span-1 md:col-span-2">
      <div className="flex items-center gap-2 mb-6">
        <Moon className="text-deep-violet w-6 h-6" />
        <h2 className="text-xl font-bold uppercase tracking-wider text-white">Sleep Architecture</h2>
      </div>
      
      <div className="h-64 w-full">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="date" type="category" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} width={50} />
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
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">No sleep data available in upload</div>
        )}
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
