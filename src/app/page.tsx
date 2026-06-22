"use client";

import { useHealthData } from '@/contexts/HealthDataContext';
import FileUploader from '@/components/FileUploader';
import TimeframeFilter from '@/components/TimeframeFilter';
import VitalSummaryRing from '@/components/VitalSummaryRing';
import IntradayHeartRateChart from '@/components/IntradayHeartRateChart';
import SleepArchitectureChart from '@/components/SleepArchitectureChart';
import MacroTrendMatrix from '@/components/MacroTrendMatrix';
import WorkoutLedger from '@/components/WorkoutLedger';
import { Footprints, Flame, Zap } from 'lucide-react';

export default function Dashboard() {
  const { daySummaries, heartRates, sleepData, isLoaded } = useHealthData();
  
  // Calculate latest day summary values
  const latestSummary = daySummaries && daySummaries.length > 0 
    ? daySummaries[daySummaries.length - 1] 
    : { step_count: 0, calorie: 0, active_time: 0 };

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-deep-violet mb-2">
            Health Analytics
            </h1>
            <p className="text-gray-400 font-mono text-sm tracking-wide">Client-Side Telemetry Engine</p>
        </div>
        <TimeframeFilter />
      </header>

      {/* Top Status Bar / Uploader */}
      <FileUploader />

      {isLoaded && (
        <>
          {/* Vital Rings Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <VitalSummaryRing 
              title="Daily Steps" 
              value={latestSummary.step_count || 0} 
              goal={10000} 
              color="var(--color-bright-green)" 
              gradientId="grad-steps"
              hoverClass="hover-green"
              unit="steps" 
              icon={<Footprints className="w-4 h-4 text-bright-green" />} 
            />
            <VitalSummaryRing 
              title="Caloric Burn" 
              value={Math.floor(latestSummary.calorie || 0)} 
              goal={2500} 
              color="var(--color-electric-blue)" 
              gradientId="grad-cal"
              hoverClass="hover-blue"
              unit="kcal" 
              icon={<Flame className="w-4 h-4 text-electric-blue" />} 
            />
            <VitalSummaryRing 
              title="Active Time" 
              value={Math.floor((latestSummary.active_time || 0) / 60000)} 
              goal={60} 
              color="var(--color-deep-violet)" 
              gradientId="grad-active"
              hoverClass="hover-violet"
              unit="mins" 
              icon={<Zap className="w-4 h-4 text-deep-violet" />} 
            />
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <IntradayHeartRateChart />
            <MacroTrendMatrix />
            <SleepArchitectureChart />
            <WorkoutLedger />
          </div>
        </>
      )}
    </main>
  );
}
