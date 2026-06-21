import { Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SystemHealthMonitorProps {
  lastSync?: string;
}

export default function SystemHealthMonitor({ lastSync }: SystemHealthMonitorProps) {
  return (
    <div className="sci-fi-panel flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-blue opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-electric-blue shadow-[0_0_8px_var(--color-electric-blue)]"></span>
        </div>
        <div>
          <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold">System Status</h3>
          <p className="text-lg font-medium text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-electric-blue" /> Data Engine Connected
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Last Cloud Sync</h3>
        <p className="text-lg font-medium text-white flex items-center justify-end gap-2">
          <Clock className="w-5 h-5 text-gray-300" />
          {lastSync ? formatDistanceToNow(new Date(lastSync), { addSuffix: true }) : 'Never'}
        </p>
      </div>
    </div>
  );
}
