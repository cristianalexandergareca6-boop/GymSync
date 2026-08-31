import { useState, useEffect } from 'react';
import { AuthProvider, useAuth, User } from './features/auth/AuthContext';
import { Navbar } from './components/Navbar';
import { AccessControlPage } from './features/access-control/AccessControlPage';
import { ClientsPage } from './features/clients/ClientsPage';
import { MembershipsPage } from './features/memberships/MembershipsPage';
import { Mail, Lock, LogIn } from 'lucide-react';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<'access' | 'clients' | 'memberships'>('access');
  const { user, login, users, theme } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!user) {
      setEmail('');
      setPassword('');
      setErrorMsg('');
    }
  }, [user]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    const existingUser = users.find(
      (u: User) => u.email.toLowerCase() === cleanEmail || u.nombre.toLowerCase() === cleanEmail
    );

    if (!existingUser) {
      setErrorMsg('Usuario no registrado. Consulta con el administrador.');
      return;
    }

    if (existingUser.password && existingUser.password !== cleanPassword) {
      setErrorMsg('Contraseña incorrecta.');
      return;
    }

    login(existingUser);
  };

  return (
    <div className={`min-h-screen flex flex-row relative transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* MODAL DE LOGIN */}
      {!user && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md transition-all duration-500 ${
          isDark ? 'bg-slate-950/95' : 'bg-slate-900/60'
        }`}>
          <div className={`flex flex-col items-center text-center max-w-md w-full border rounded-3xl p-8 shadow-2xl space-y-6 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                GymSync <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">MVP</span>
              </h1>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {errorMsg && (
              <div className="w-full text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="w-full space-y-4 text-left">
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Usuario / Correo</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </button>
            </form>

            <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Credenciales por defecto: admin@gmail.com / 12345
            </span>
          </div>
        </div>
      )}

      {/* NAVEGACIÓN LATERAL */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
      } ${!user ? 'blur-sm pointer-events-none' : ''}`}>
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'access' && <AccessControlPage />}
          {activeTab === 'clients' && <ClientsPage />}
          {activeTab === 'memberships' && <MembershipsPage />}
        </main>

        <footer className={`border-t py-4 text-center text-xs transition-colors duration-300 ${
          isDark ? 'border-slate-900 bg-slate-950/80 text-slate-500' : 'border-slate-200 bg-white/80 text-slate-400'
        }`}>
          <p>GymSync MVP • Tarija, Bolivia • Arquitectura Limpia y Principios SOLID</p>
        </footer>
      </div>

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;