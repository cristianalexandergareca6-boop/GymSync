import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface QuickCheckInBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const QuickCheckInBar: React.FC<QuickCheckInBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleQuickPreset = (presetCI: string) => {
    setQuery(presetCI);
    onSearch(presetCI);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Búsqueda Rápida de Socio (C.I. o Código de Socio)
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ingrese C.I. (ej: 5432101) o Código (ej: GS-2026-0001)..."
              autoFocus
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 rounded-2xl py-4 pl-12 pr-32 text-lg font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors shadow-inner"
            />
            <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm shadow-md"
            >
              {isLoading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                'Consultar'
              )}
            </button>
          </div>
        </div>

        {/* Quick Test Cases Shortcuts for MVP demonstration */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Pruebas Rápidas del Semáforo:
          </span>
          <button
            type="button"
            onClick={() => handleQuickPreset('5432101')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors font-mono"
          >
            🟢 Carlos (Verde)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('5432102')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors font-mono"
          >
            🟡 Mariana (Vence en 3d)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('5432103')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors font-mono"
          >
            🟡 Roberto (Debe 100 Bs)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('5432104')}
            className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors font-mono"
          >
            🔴 Sofia (Vencida)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('5432105')}
            className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors font-mono"
          >
            🔴 Juan (Sin Plan)
          </button>
        </div>
      </form>
    </div>
  );
};
