import React from 'react';
import { cn } from '@/lib/utils';

interface VitalSummaryRingProps {
  title: string;
  value: number;
  goal: number;
  color: string; // Hex color for the primary glow
  gradientId: string;
  unit: string;
  icon: React.ReactNode;
  hoverClass: string;
}

export default function VitalSummaryRing({ title, value, goal, color, gradientId, unit, icon, hoverClass }: VitalSummaryRingProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / goal) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("sci-fi-panel flex flex-col items-center justify-center p-6 text-center", hoverClass)}>
      <div className="mb-4 text-zinc-400 flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium">
        {icon} {title}
      </div>
      
      <div className="relative flex items-center justify-center w-36 h-36">
        <svg className="transform -rotate-90 w-full h-full absolute inset-0">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.4" />
            </linearGradient>
            <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Background Ring */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-zinc-800/50"
          />
          {/* Progress Ring */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            filter={`url(#glow-${gradientId})`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center mt-1">
          <span className="text-3xl font-mono font-bold text-white tracking-tight">{value.toLocaleString()}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Goal: {goal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
