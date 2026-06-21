import React from 'react';

interface VitalSummaryRingProps {
  title: string;
  value: number;
  goal: number;
  color: string;
  unit: string;
  icon: React.ReactNode;
}

export default function VitalSummaryRing({ title, value, goal, color, unit, icon }: VitalSummaryRingProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / goal) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="sci-fi-panel flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-2 text-gray-400 flex items-center gap-2 text-sm uppercase tracking-widest font-semibold">
        {icon} {title}
      </div>
      
      <div className="relative flex items-center justify-center">
        {/* Background Ring */}
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-800"
          />
          {/* Progress Ring */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-white">{value.toLocaleString()}</span>
          <span className="text-xs text-gray-400">{unit}</span>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Goal: {goal.toLocaleString()}
      </div>
    </div>
  );
}
