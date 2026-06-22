"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { useHealthData } from '@/contexts/HealthDataContext';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/80 border border-white/10 rounded-xl backdrop-blur-xl p-3 shadow-2xl">
        <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-mono font-bold text-bright-green flex items-center gap-2">
            {payload[0].value.toLocaleString()} <span className="text-xs text-zinc-500">Steps</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function MacroTrendMatrix() {
  const { daySummaries, timeframe, isLoaded } = useHealthData();
  
  if (!isLoaded) return null;

  // Apply timeframe filter
  let daysToShow = 7;
  if (timeframe === 'Monthly') daysToShow = 30;
  if (timeframe === 'All-Time') daysToShow = daySummaries.length;
  if (timeframe === 'Daily') daysToShow = 1;

  const formattedData = daySummaries.slice(-daysToShow).map(item => {
    let displayDate = item.date;
    try {
        if (item.date) displayDate = format(new Date(item.date), 'MMM dd');
    } catch(e) {}
    return {
        date: displayDate,
        steps: item.step_count || 0,
    }
  });

  return (
    <div className="sci-fi-panel hover-green col-span-1 md:col-span-2 lg:col-span-3">
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-bright-green/10 rounded-lg border border-bright-green/20">
                <TrendingUp className="text-bright-green w-5 h-5" />
              </div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Macro-Trend Velocity</h2>
          </div>
          <span className="text-xs uppercase tracking-widest text-zinc-500 px-2 py-1 border border-zinc-800 rounded bg-zinc-900/50">{timeframe}</span>
      </div>
      
      <div className="h-64 w-full relative">
        {formattedData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-bright-green)" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="var(--color-bright-green)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#52525b" 
                fontSize={10} 
                fontFamily="monospace"
                tickLine={false} 
                axisLine={false} 
                minTickGap={30}
              />
              <YAxis 
                yAxisId="left" 
                stroke="#52525b" 
                fontSize={10} 
                fontFamily="monospace"
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="steps" 
                stroke="var(--color-bright-green)" 
                strokeWidth={2}
                fill="url(#colorSteps)"
                activeDot={{ r: 6, fill: 'var(--color-bright-green)', stroke: '#09090b', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : formattedData.length === 1 ? (
          // Single day state - show a dot instead of a curve that can't be drawn
          <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-bright-green glow-green mb-2">{formattedData[0].steps.toLocaleString()}</div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500">Steps Logged Today</p>
              </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/5 rounded-xl bg-black/20">
             <div className="text-center">
                 <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                 <p className="text-xs uppercase tracking-widest text-zinc-500">Awaiting Movement Data</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
