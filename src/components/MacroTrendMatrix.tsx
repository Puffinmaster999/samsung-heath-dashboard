"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface DaySummary {
  create_time: string;
  step_count: number;
  active_time: number;
  calorie: number;
}

export default function MacroTrendMatrix({ data }: { data: DaySummary[] }) {
  // Format last 7-14 days
  const formattedData = data.slice(-14).map(item => ({
    date: item.create_time ? item.create_time.split(' ')[0].substring(5) : '', // MM-DD
    steps: item.step_count || 0,
    calories: item.calorie || 0,
  }));

  return (
    <div className="sci-fi-panel col-span-1 md:col-span-2 lg:col-span-3">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-bright-green w-6 h-6" />
        <h2 className="text-xl font-bold uppercase tracking-wider text-white">Macro-Trend Matrix (Steps)</h2>
      </div>
      
      <div className="h-64 w-full">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-panel-bg)', borderColor: 'var(--color-panel-border)', borderRadius: '8px', color: '#fff' }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="steps" 
                stroke="var(--color-bright-green)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-dark-bg)', stroke: 'var(--color-bright-green)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'var(--color-bright-green)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">No trend data available</div>
        )}
      </div>
    </div>
  );
}
