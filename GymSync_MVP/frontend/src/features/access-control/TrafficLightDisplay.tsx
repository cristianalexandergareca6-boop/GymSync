import React from 'react';
import { ClientAccessStatus } from '../../types';
import { TrafficLightBadge } from '../../components/TrafficLightBadge';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  DollarSign,
  User,
  HeartPulse,
  Phone,
  ArrowRight
} from 'lucide-react';

interface TrafficLightDisplayProps {
  status: ClientAccessStatus;
  onCheckIn: () => void;
  isLoadingCheckIn: boolean;
}

export const TrafficLightDisplay: React.FC<TrafficLightDisplayProps> = ({
  status,
  onCheckIn,
  isLoadingCheckIn
}) => {
  const { cliente, evaluacion } = status;

  const lightConfigs = {
    VERDE: {
      container: 'border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_50px_rgba(16,185,129,0.15)]',
      glow: 'bg-emerald-500 shadow-[0_0_30px_#10b981]',
      text: 'text-emerald-400',
      button: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40',
      title: 'ACCESO HABILITADO',
      icon: CheckCircle2
    },
    AMARILLO: {
      container: 'border-amber-500/40 bg-amber-950/20 shadow-[0_0_50px_rgba(245,158,11,0.15)]',
      glow: 'bg-amber-500 shadow-[0_0_30px_#f59e0b]',
      text: 'text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40',
      title: 'ACCESO CON ADVERTENCIA',
      icon: AlertTriangle
    },
    ROJO: {
      container: 'border-red-500/40 bg-red-950/20 shadow-[0_0_50px_rgba(239,68,68,0.15)]',
      glow: 'bg-red-500 shadow-[0_0_30px_#ef4444]',
      text: 'text-red-400',
      button: 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700',
      title: 'ACCESO BLOQUEADO',
      icon: XCircle
    }
  };

  const currentConfig = lightConfigs[evaluacion.color];
  const Icon = currentConfig.icon;

  return (
    <div className={`rounded-3xl border-2 p-6 sm:p-8 transition-all duration-300 ${currentConfig.container}`}>
      {/* Visual Traffic Light Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-4">
          <div className={`p-4 rounded-2xl ${currentConfig.glow} text-slate-950`}>
            <Icon className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estado del Semáforo</span>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${currentConfig.text}`}>
              {currentConfig.title}
            </h2>
          </div>
        </div>

        <TrafficLightBadge color={evaluacion.color} size="lg" />
      </div>

      {/* Evaluation Reason Box */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <p className="text-sm font-medium text-slate-200">
          📢 <span className="font-semibold">{evaluacion.message}</span>
        </p>
      </div>

      {/* Member Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Socio Information */}
        <div className="space-y-3 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-400" />
              Datos del Socio
            </h4>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {cliente.codigoSocio}
            </span>
          </div>

          <p className="text-xl font-bold text-slate-100">{cliente.nombreCompleto}</p>
          <div className="text-sm text-slate-300 space-y-1">
            <p>
              <span className="text-slate-400">C.I.:</span> <strong className="font-mono">{cliente.ci}</strong>
            </p>
            {cliente.telefono && (
              <p className="flex items-center gap-1 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {cliente.telefono}
              </p>
            )}
            {cliente.estadoMedico && (
              <p className="flex items-center gap-1.5 text-amber-300/90 text-xs mt-2 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                <HeartPulse className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Obs. Médica: {cliente.estadoMedico}</span>
              </p>
            )}
          </div>
        </div>

        {/* Membership Details */}
        <div className="space-y-3 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Estado de Membresía
          </h4>

          {evaluacion.planName ? (
            <>
              <div className="flex justify-between items-baseline">
                <p className="text-xl font-bold text-slate-100">{evaluacion.planName}</p>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    evaluacion.daysRemaining > 5
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : evaluacion.daysRemaining >= 0
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {evaluacion.daysRemaining >= 0
                    ? `${evaluacion.daysRemaining} días restantes`
                    : `Vencida (${Math.abs(evaluacion.daysRemaining)} días)`}
                </span>
              </div>

              <div className="text-sm text-slate-300 space-y-1">
                <p>
                  <span className="text-slate-400">Fecha Vencimiento:</span>{' '}
                  <strong className="font-mono">{evaluacion.expirationDate || 'N/A'}</strong>
                </p>
                <p className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Saldo Pendiente:</span>{' '}
                  <strong
                    className={`font-mono text-base ${
                      evaluacion.pendingBalance > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'
                    }`}
                  >
                    Bs. {evaluacion.pendingBalance.toFixed(2)}
                  </strong>
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-red-400/90 py-2">
              Sin plan activo. Registre una nueva membresía para habilitar el acceso.
            </p>
          )}
        </div>
      </div>

      {/* 1-Click Check-In Action Button (HU07) */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-400">
          {evaluacion.isAllowed
            ? 'Presione el botón para registrar el ingreso instantáneo del socio.'
            : 'El ingreso está bloqueado. El socio debe regularizar su membresía antes de ingresar.'}
        </p>

        <button
          onClick={onCheckIn}
          disabled={!evaluacion.isAllowed || isLoadingCheckIn}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center space-x-3 transition-all ${currentConfig.button}`}
        >
          {isLoadingCheckIn ? (
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>{evaluacion.isAllowed ? 'Registrar Ingreso (1 Clic)' : 'Ingreso Bloqueado'}</span>
              {evaluacion.isAllowed && <ArrowRight className="w-5 h-5" />}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
