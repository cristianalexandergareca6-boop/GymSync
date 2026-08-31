import React, { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, XCircle, Clock, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export const AccessControlPage: React.FC = () => {
  const { theme } = useAuth();
  const isDark = theme === 'dark';
  const [searchInput, setSearchInput] = useState(''); 

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Control de Acceso y Semáforo
        </h1>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Validación en tiempo real de membresías y registro de asistencia en un solo clic (HU05, HU06, HU07).
        </p>
      </div>

      {/* METRICAS / TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`border p-4 rounded-2xl flex items-center justify-between transition-colors ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider">INGRESOS HOY</p>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>0</p>
            <p className="text-[11px] text-slate-500">Asistencias registradas</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className={`border p-4 rounded-2xl flex items-center justify-between transition-colors ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider">SEMÁFORO VERDE</p>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>0</p>
            <p className="text-[11px] text-slate-500">Accesos al día</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className={`border p-4 rounded-2xl flex items-center justify-between transition-colors ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider">SEMÁFORO AMARILLO</p>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>0</p>
            <p className="text-[11px] text-slate-500">Vencimientos o deudas</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className={`border p-4 rounded-2xl flex items-center justify-between transition-colors ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider">BLOQUEOS</p>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>0</p>
            <p className="text-[11px] text-slate-500">Intentos denegados</p>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* BUSCADOR Y PRUEBAS */}
      <div className={`border rounded-3xl p-6 transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h2 className="text-xs font-bold text-slate-400 tracking-wider mb-3">
          BÚSQUEDA RÁPIDA DE SOCIO (C.I. O CÓDIGO DE SOCIO)
        </h2>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ingrese C.I. (ej: 5432101) o Código (ej: GS-2026-0001)..."
              className={`w-full border rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-mono transition-colors ${
                isDark 
                  ? 'bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
          <button className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all border ${
            isDark 
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
              : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
          }`}>
            Consultar
          </button>
        </div>

        {/* PRUEBAS RÁPIDAS DEL SEMÁFORO */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            ✨ Pruebas Rápidas del Semáforo:
          </span>
          <button className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 text-xs font-semibold rounded-xl transition-all">
            🟢 Carlos (Verde)
          </button>
          <button className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 text-xs font-semibold rounded-xl transition-all">
            🟡 Mariana (Vence en 3d)
          </button>
          <button className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 text-xs font-semibold rounded-xl transition-all">
            🟡 Roberto (Debe 100 Bs)
          </button>
          <button className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 text-xs font-semibold rounded-xl transition-all">
            🔴 Sofia (Vencida)
          </button>
          <button className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 text-xs font-semibold rounded-xl transition-all">
            🔴 Juan (Sin Plan)
          </button>
        </div>
      </div>

      {/* REGISTRO RECIENTE */}
      <div className={`border rounded-3xl p-6 transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Registro de Ingresos Recientes de Hoy
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Total: 0</span>
        </div>

        <div className="py-12 text-center">
          <p className="text-xs text-slate-400">No se han registrado ingresos hoy todavía.</p>
        </div>
      </div>

    </div>
  );
};