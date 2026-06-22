"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Moon, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { useHealthData } from '@/contexts/HealthDataContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/80 border border-white/10 rounded-xl backdrop-blur-xl p-3 shadow-2xl min-w-[150px]">
        <p className="text-xs text-zinc-400 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">{label}</p>
        <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
                <div key={`item-${index}`} className="flex justify-between items-center text-xs">
                    <span style={{ color: entry.fill }} className="uppercase font-medium tracking-wide">
                        {entry.name === 'deep' ? 'Deep' : entry.name === 'light' ? 'Light' : entry.name === 'rem' ? 'REM' : 'Awake'}
                    </span>
                    <span className="font-mono text-white ml-4">{entry.value}m</span>
                </div>
            ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function SleepArchitectureChart() {
  const { sleepData, isLoaded } = useHealthData();
  
  if (!isLoaded) return null;

  // Format data
  const formattedData = sleepData.slice(-7).map(item => ({
    date: item.start_time ? format(new Date(item.start_time), 'MM/dd') : '',
    deep: item.stage_deep || 0,
    light: item.stage_light || 0,
    rem: item.stage_rem || 0,
    awake: item.stage_awake || 0,
  }));

  return (
    <div className="sci-fi-panel hover-violet col-span-1 md:col-span-2 relative group">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-deep-violet/10 rounded-lg border border-deep-violet/20">
            <Moon className="text-deep-violet w-5 h-5 group-hover:animate-pulse" />
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Sleep Architecture</h2>
      </div>
      
      <div className="h-64 w-full relative">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="date" 
                type="category" 
                stroke="#52525b" 
                fontSize={10} 
                fontFamily="monospace"
                tickLine={false} 
                axisLine={false} 
                width={60} 
              />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} content={<CustomTooltip />} />
              <Bar dataKey="deep" stackId="a" fill="#1e3a8a" radius={[4, 0, 0, 4]} />
              <Bar dataKey="light" stackId="a" fill="#8a2be2" />
              <Bar dataKey="rem" stackId="a" fill="#d8b4fe" />
              <Bar dataKey="awake" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/5 rounded-xl bg-black/20">
             <div className="text-center">
                 <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                 <p className="text-xs uppercase tracking-widest text-zinc-500">Awaiting Sleep Sync</p>
             </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 text-[10px] uppercase tracking-widest text-zinc-400">
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#1e3a8a] shadow-[0_0_8px_#1e3a8a]"></span> Deep</span>
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#8a2be2] shadow-[0_0_8px_#8a2be2]"></span> Light</span>
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d8b4fe] shadow-[0_0_8px_#d8b4fe]"></span> REM</span>
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]"></span> Awake</span>
      </div>
    </div>
  );
}
