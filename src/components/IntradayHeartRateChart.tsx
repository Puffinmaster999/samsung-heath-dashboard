"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart } from 'lucide-react';
import { format } from 'date-fns';

interface HeartRateData {
  create_time: string;
  heart_rate: number;
}

export default function IntradayHeartRateChart({ data }: { data: HeartRateData[] }) {
  // Format data for chart
  const formattedData = data.map(item => ({
    time: format(new Date(item.create_time), 'HH:mm'),
    bpm: item.heart_rate,
  })).slice(-100); // Show last 100 points for demo if too many

  return (
    <div className="sci-fi-panel col-span-1 md:col-span-2 lg:col-span-3">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="text-electric-blue w-6 h-6 animate-pulse" />
        <h2 className="text-xl font-bold uppercase tracking-wider text-white">Intraday Heart Rate Continuum</h2>
      </div>
      
      <div className="h-64 w-full">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-electric-blue)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-electric-blue)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-panel-bg)', borderColor: 'var(--color-panel-border)', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: 'var(--color-electric-blue)' }}
              />
              <Area 
                type="monotone" 
                dataKey="bpm" 
                stroke="var(--color-electric-blue)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBpm)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">No heart rate data available</div>
        )}
      </div>
    </div>
  );
}
