import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue'
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      text: 'text-emerald-400'
    },
    blue: {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      text: 'text-blue-400'
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      text: 'text-amber-400'
    },
    red: {
      bg: 'bg-red-500/10 border-red-500/20 text-red-400',
      text: 'text-red-400'
    },
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      text: 'text-purple-400'
    }
  };

  const style = colorStyles[color];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-black text-slate-100 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${style.bg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
