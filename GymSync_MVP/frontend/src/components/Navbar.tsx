import React, { useState } from 'react';
import { 
  Home, 
  ShieldCheck, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  UserPlus, 
  LogOut, 
  ChevronDown, 
  HelpCircle, 
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';
import { AddUserModal } from '../features/auth/AddUserModal';
import { useAuth } from '../features/auth/AuthContext';

interface SidebarProps {
  activeTab: 'access' | 'clients' | 'memberships';
  onTabChange: (tab: 'access' | 'clients' | 'memberships') => void;
}

export const Navbar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const { logout, user, theme, toggleTheme } = useAuth();

  const isDark = theme === 'dark';

  return (
    <aside className={`w-64 border-r flex flex-col h-screen sticky top-0 justify-between p-4 select-none z-40 transition-colors duration-200 ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      
      {/* SECCIÓN SUPERIOR: LOGO Y NAVEGACIÓN */}
      <div className="space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-600'
            }`}>
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className={`text-xl font-extrabold tracking-tight ${
                isDark ? 'bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent' : 'text-slate-800'
              }`}>
                GymSync
              </span>
              <span className={`block text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                v1.0.0 • MVP
              </span>
            </div>
          </div>
        </div>

        {/* MENÚ PRINCIPAL */}
        <nav className="space-y-1.5">
          
          <button
            onClick={() => onTabChange('access')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'access'
                ? isDark 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : isDark 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => onTabChange('access')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'access'
                ? isDark 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : 'bg-emerald-100 text-emerald-800'
                : isDark 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Control de Acceso</span>
          </button>

          <button
            onClick={() => onTabChange('clients')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'clients'
                ? isDark 
                  ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' 
                  : 'bg-blue-50 border border-blue-200 text-blue-700'
                : isDark 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Socios</span>
          </button>

          <button
            onClick={() => onTabChange('memberships')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'memberships'
                ? isDark 
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' 
                  : 'bg-amber-50 border border-amber-200 text-amber-700'
                : isDark 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Membresías y Pagos</span>
          </button>

          <button disabled className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 opacity-50 cursor-not-allowed">
            <BarChart3 className="w-4 h-4" />
            <span>Reportes</span>
          </button>

          <button disabled className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 opacity-50 cursor-not-allowed">
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </button>

        </nav>
      </div>

      {/* SECCIÓN INFERIOR */}
      <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
        
        {/* BOTÓN ALTERNAR MODO CLARO / OSCURO */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            isDark 
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' 
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            {isDark ? 'Modo Claro' : 'Modo Oscuro'}
          </span>
          <span className="text-[10px] opacity-60 uppercase">{theme}</span>
        </button>

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsUserModalOpen(true)}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-500" />
            <span>+ Usuario</span>
          </button>

          {user && (
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          )}
        </div>

        {/* Tarjeta Gimnasio */}
        <div className={`border p-3 rounded-2xl flex items-center justify-between ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <p className="text-xs font-bold text-emerald-500">Tarija MVP</p>
            <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Gimnasio Activo</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Ayuda */}
        <div className={`border p-3 rounded-2xl flex items-center justify-between ${
          isDark ? 'bg-slate-950/50 border-slate-800/50' : 'bg-slate-50/50 border-slate-200/50'
        }`}>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>¿Necesitas ayuda?</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-400">Accede a nuestra guía</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <p className={`text-[10px] text-center pt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          © 2026 GymSync. Todos los derechos reservados.
        </p>
      </div>

      <AddUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
    </aside>
  );
};