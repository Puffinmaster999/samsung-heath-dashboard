"use client";

import { useHealthData, Timeframe } from '@/contexts/HealthDataContext';
import { cn } from '@/lib/utils';

export default function TimeframeFilter() {
  const { timeframe, setTimeframe, isLoaded } = useHealthData();
  
  const options: Timeframe[] = ['Daily', 'Weekly', 'Monthly', 'All-Time'];

  if (!isLoaded) return null;

  return (
    <div className="flex flex-wrap justify-center gap-1 md:gap-2 p-1 bg-black bg-opacity-40 backdrop-blur-md rounded-lg border border-[var(--color-panel-border)] w-full md:w-max mx-auto md:mx-0">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setTimeframe(opt)}
          className={cn(
            "px-2 md:px-4 py-1.5 text-[10px] md:text-xs uppercase tracking-widest font-semibold rounded-md transition-all duration-300 flex-1 md:flex-none",
            timeframe === opt 
              ? "bg-[rgba(255,255,255,0.1)] text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
              : "text-gray-500 hover:text-gray-300 hover:bg-[rgba(255,255,255,0.05)]"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
