import { useState, type FC, type FormEvent } from 'react';
import { X, UserPlus, Shield, Mail, User, Key } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded?: (user: any) => void;
}

export const AddUserModal: FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'operador' as 'admin' | 'operador',
    permisos: {
      gestionSocios: true,
      controlAcceso: true,
      cobrosYMembresias: false,
      reportes: false,
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const newUser = {
      id: Date.now().toString(),
      ...formData,
      fechaCreacion: new Date().toISOString(),
    };

    // Guardar en localStorage para mantener persistencia local
    const existingUsers = JSON.parse(localStorage.getItem('gymsync_system_users') || '[]');
    localStorage.setItem('gymsync_system_users', JSON.stringify([...existingUsers, newUser]));

    if (onUserAdded) {
      onUserAdded(newUser);
    }

    // Resetear formulario y cerrar modal
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'operador',
      permisos: {
        gestionSocios: true,
        controlAcceso: true,
        cobrosYMembresias: false,
        reportes: false,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Registrar Usuario de Sistema</h2>
              <p className="text-xs text-slate-400">Asigna credenciales y niveles de acceso/permisos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre Completo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej. Carlos Mendoza"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Email / Usuario */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Correo Electrónico / Usuario
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@gymsync.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              Contraseña de Acceso
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Rol del Sistema */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Rol Asignado
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, rol: 'operador' })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.rol === 'operador'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Operador / Recepción
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, rol: 'admin' })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.rol === 'admin'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Administrador
              </button>
            </div>
          </div>

          {/* Permisos Granulares */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block">Permisos de Módulo:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permisos.controlAcceso}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permisos: { ...formData.permisos, controlAcceso: e.target.checked },
                    })
                  }
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                Control de Acceso
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permisos.gestionSocios}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permisos: { ...formData.permisos, gestionSocios: e.target.checked },
                    })
                  }
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                Gestión de Socios
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permisos.cobrosYMembresias}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permisos: { ...formData.permisos, cobrosYMembresias: e.target.checked },
                    })
                  }
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                Cobros y Membresías
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permisos.reportes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permisos: { ...formData.permisos, reportes: e.target.checked },
                    })
                  }
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                Reportes y Métricas
              </label>
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 transition-all"
            >
              Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};