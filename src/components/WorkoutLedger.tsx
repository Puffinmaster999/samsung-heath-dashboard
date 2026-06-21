import { Dumbbell } from 'lucide-react';

interface DaySummary {
  create_time: string;
  step_count: number;
  active_time: number;
  calorie: number;
}

export default function WorkoutLedger({ data }: { data: DaySummary[] }) {
  // We'll use day summaries with high active time as proxy for workouts for this ledger
  const workouts = [...data].reverse().slice(0, 5); // Last 5 days

  return (
    <div className="sci-fi-panel col-span-1 md:col-span-2">
      <div className="flex items-center gap-2 mb-6">
        <Dumbbell className="text-white w-6 h-6" />
        <h2 className="text-xl font-bold uppercase tracking-wider text-white">Recent Activity Ledger</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-panel-border)]">
              <th className="pb-3 text-xs uppercase tracking-widest text-gray-400 font-semibold">Date</th>
              <th className="pb-3 text-xs uppercase tracking-widest text-gray-400 font-semibold">Active Time</th>
              <th className="pb-3 text-xs uppercase tracking-widest text-gray-400 font-semibold text-right">Calories</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((w, i) => (
              <tr key={i} className="border-b border-[var(--color-panel-border)] border-opacity-50 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="py-4 text-sm text-gray-300">{w.create_time ? w.create_time.split(' ')[0] : 'Unknown'}</td>
                <td className="py-4 text-sm text-gray-300">
                  <span className="inline-block px-2 py-1 rounded bg-[rgba(57,255,20,0.1)] text-bright-green border border-[rgba(57,255,20,0.2)]">
                    {Math.floor((w.active_time || 0) / 60000)} mins
                  </span>
                </td>
                <td className="py-4 text-sm text-white font-medium text-right">{Math.floor(w.calorie || 0)} kcal</td>
              </tr>
            ))}
            {workouts.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500 text-sm">No recent activity logged</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
