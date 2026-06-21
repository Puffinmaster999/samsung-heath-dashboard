import { getHealthData } from '@/lib/dataStore';
import SystemHealthMonitor from '@/components/SystemHealthMonitor';
import VitalSummaryRing from '@/components/VitalSummaryRing';
import IntradayHeartRateChart from '@/components/IntradayHeartRateChart';
import SleepArchitectureChart from '@/components/SleepArchitectureChart';
import MacroTrendMatrix from '@/components/MacroTrendMatrix';
import WorkoutLedger from '@/components/WorkoutLedger';
import { Footprints, Flame, Zap } from 'lucide-react';

export default async function Dashboard() {
  const data = await getHealthData();
  
  // Calculate latest day summary values
  const latestSummary = data.day_summary && data.day_summary.length > 0 
    ? data.day_summary[data.day_summary.length - 1] 
    : { step_count: 0, calorie: 0, active_time: 0 };

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-deep-violet mb-2">
          Samsung Health Analytics
        </h1>
        <p className="text-gray-400 font-mono text-sm tracking-wide">Self-Hosted Telemetry Drone Hub</p>
      </header>

      {/* Top Status Bar */}
      <SystemHealthMonitor lastSync={data.last_sync} />

      {/* Vital Rings Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <VitalSummaryRing 
          title="Daily Steps" 
          value={latestSummary.step_count || 0} 
          goal={10000} 
          color="var(--color-bright-green)" 
          unit="steps" 
          icon={<Footprints className="w-4 h-4 text-bright-green" />} 
        />
        <VitalSummaryRing 
          title="Caloric Burn" 
          value={Math.floor(latestSummary.calorie || 0)} 
          goal={2500} 
          color="var(--color-electric-blue)" 
          unit="kcal" 
          icon={<Flame className="w-4 h-4 text-electric-blue" />} 
        />
        <VitalSummaryRing 
          title="Active Time" 
          value={Math.floor((latestSummary.active_time || 0) / 60000)} 
          goal={60} 
          color="var(--color-deep-violet)" 
          unit="mins" 
          icon={<Zap className="w-4 h-4 text-deep-violet" />} 
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <IntradayHeartRateChart data={data.heart_rate || []} />
        <MacroTrendMatrix data={data.day_summary || []} />
        <SleepArchitectureChart data={data.sleep_data || []} />
        <WorkoutLedger data={data.day_summary || []} />
      </div>
    </main>
  );
}
