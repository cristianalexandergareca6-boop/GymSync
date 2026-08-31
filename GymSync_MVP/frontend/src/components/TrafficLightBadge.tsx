import React from 'react';
import { TrafficLightColor } from '../types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface TrafficLightBadgeProps {
  color: TrafficLightColor;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const TrafficLightBadge: React.FC<TrafficLightBadgeProps> = ({
  color,
  size = 'md',
  showLabel = true
}) => {
  const configs = {
    VERDE: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      label: 'Acceso Permitido',
      icon: CheckCircle2,
      dot: 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
    },
    AMARILLO: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      label: 'Advertencia',
      icon: AlertTriangle,
      dot: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
    },
    ROJO: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      label: 'Acceso Bloqueado',
      icon: XCircle,
      dot: 'bg-red-500 shadow-[0_0_8px_#ef4444]'
    }
  };

  const config = configs[color] || configs.ROJO;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.bg} ${config.border} ${config.text} ${sizeClasses[size]}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
