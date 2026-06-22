"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { useHealthData } from '@/contexts/HealthDataContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/80 border border-white/10 rounded-xl backdrop-blur-xl p-3 shadow-2xl">
        <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-mono font-bold text-electric-blue flex items-center gap-2">
            {payload[0].value} <span className="text-xs text-zinc-500">BPM</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function IntradayHeartRateChart() {
  const { heartRates, isLoaded } = useHealthData();
  
  if (!isLoaded) return null;

  // Format data for chart
  const formattedData = heartRates.map(item => ({
    time: item.start_time ? format(new Date(item.start_time), 'HH:mm') : '',
    bpm: item.heart_rate,
  })).slice(-200); // Show last 200 points for smooth curve

  return (
    <div className="sci-fi-panel hover-blue col-span-1 md:col-span-2 lg:col-span-3 group">
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-electric-blue/10 rounded-lg border border-electric-blue/20">
                <Heart className="text-electric-blue w-5 h-5 group-hover:animate-pulse" />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Intraday Continuum</h2>
          </div>
          {formattedData.length > 0 && (
              <span className="text-xs font-mono text-zinc-500">{formattedData.length} Data Points</span>
          )}
      </div>
      
      <div className="h-64 w-full relative">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-electric-blue)" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="var(--color-electric-blue)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="#52525b" 
                fontSize={10} 
                fontFamily="monospace"
                tickLine={false} 
                axisLine={false} 
                minTickGap={40} // Prevent overlapping
              />
              <YAxis 
                stroke="#52525b" 
                fontSize={10} 
                fontFamily="monospace"
                tickLine={false} 
                axisLine={false} 
                domain={['auto', 'auto']} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" // Smooth curve
                dataKey="bpm" 
                stroke="var(--color-electric-blue)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorBpm)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/5 rounded-xl bg-black/20">
             <div className="text-center">
                 <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                 <p className="text-xs uppercase tracking-widest text-zinc-500">Awaiting Heart Telemetry</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
