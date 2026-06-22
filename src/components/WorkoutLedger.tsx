"use client";

import { Flame, Timer, Activity, Zap } from 'lucide-react';
import { useHealthData } from '@/contexts/HealthDataContext';
import { formatDistanceToNow } from 'date-fns';

export default function WorkoutLedger() {
  const { daySummaries, isLoaded } = useHealthData();
  
  if (!isLoaded) return null;

  // We'll use day summaries with high active time as proxy for workouts for this ledger
  const workouts = [...daySummaries].reverse().slice(0, 5); // Last 5 days

  return (
    <div className="sci-fi-panel hover-blue col-span-1 md:col-span-2 lg:col-span-2 relative group">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <Zap className="text-white w-5 h-5 group-hover:text-electric-blue transition-colors" />
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Activity Ledger</h2>
      </div>
      
      <div className="space-y-3">
        {workouts.map((w, i) => {
          let displayDate = w.date;
          let relativeTime = '';
          if (displayDate) {
              try {
                  const dateObj = new Date(displayDate);
                  relativeTime = formatDistanceToNow(dateObj, { addSuffix: true });
              } catch(e) {}
          }
          
          return (
            <div key={i} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-colors">
                
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center">
                        <Activity className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-zinc-200">Daily Telemetry</div>
                        <div className="text-xs text-zinc-500 font-mono mt-1">{relativeTime || displayDate?.split(' ')[0] || 'Unknown'}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-bright-green/10 border border-bright-green/20">
                        <Timer className="w-3 h-3 text-bright-green" />
                        <span className="text-xs font-mono font-medium text-bright-green tracking-wide">
                            {Math.floor((w.active_time || 0) / 60000)}m
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20">
                        <Flame className="w-3 h-3 text-electric-blue" />
                        <span className="text-xs font-mono font-medium text-electric-blue tracking-wide">
                            {Math.floor(w.calorie || 0)}
                        </span>
                    </div>
                </div>

            </div>
        )})}
        
        {workouts.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl bg-black/20">
             <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
             <p className="text-xs uppercase tracking-widest text-zinc-500">No Activity Detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
