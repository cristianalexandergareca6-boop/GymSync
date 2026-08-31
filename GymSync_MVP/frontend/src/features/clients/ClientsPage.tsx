import { useState, useEffect, type FC } from 'react';
import { ClientFormModal } from './ClientFormModal';
import { ClientDetailModal } from './ClientDetailModal';
import { api } from '../../services/api';
import { Client } from '../../types';
import { Search, UserPlus, Edit3, Phone, HeartPulse } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'gymsync_clients_backup';

export const ClientsPage: FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Carga inicial: intenta cargar desde la API, y si falla o está vacía usa localStorage
  const loadClients = async (query?: string) => {
    setIsLoading(true);
    try {
      const data = await api.getClients(query);
      if (data && data.length > 0) {
        setClients(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } else {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          const parsed: Client[] = JSON.parse(localData);
          if (query) {
            const filtered = parsed.filter((c) =>
              c.nombreCompleto.toLowerCase().includes(query.toLowerCase()) ||
              c.ci.includes(query) ||
              c.codigoSocio.toLowerCase().includes(query.toLowerCase())
            );
            setClients(filtered);
          } else {
            setClients(parsed);
          }
        }
      }
    } catch (err) {
      console.error('Error loading clients from API, loading from localStorage:', err);
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        setClients(JSON.parse(localData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    loadClients(val);
  };

  // Guarda en estado y en localStorage al crear
  const handleClientCreated = (newClient: Client) => {
    setClients((prev) => {
      const updatedList = [newClient, ...prev];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      return updatedList;
    });
  };

  // Guarda en estado y en localStorage al editar
  const handleClientUpdated = (updated: Client) => {
    setClients((prev) => {
      const updatedList = prev.map((c) => (c.id === updated.id ? updated : c));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      return updatedList;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Gestión de Socios (HU01, HU02)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registro con validación de C.I. único (SEGIP) y actualización de fichas médicas.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-3 rounded-2xl font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Nuevo Socio</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Buscar por Nombre, C.I., Código de Socio o Teléfono..."
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => {
              setSearch('');
              loadClients();
            }}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Clients Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">
            <span className="animate-spin inline-block rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-2" />
            <p className="text-sm">Cargando catálogo de socios...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No se encontraron socios que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="py-4 px-6">Código / C.I.</th>
                  <th className="py-4 px-6">Nombre Completo</th>
                  <th className="py-4 px-6">Contacto</th>
                  <th className="py-4 px-6">Observación Médica</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-blue-400 block">
                        {c.codigoSocio}
                      </span>
                      <span className="font-mono text-xs text-slate-400">C.I. {c.ci}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-100">{c.nombreCompleto}</td>
                    <td className="py-4 px-6 text-xs text-slate-300">
                      {c.telefono ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" /> {c.telefono}
                        </span>
                      ) : (
                        <span className="text-slate-500">Sin teléfono</span>
                      )}
                      {c.correo && <span className="text-slate-500 block text-[11px]">{c.correo}</span>}
                    </td>
                    <td className="py-4 px-6 text-xs">
                      {c.estadoMedico ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 max-w-xs truncate">
                          <HeartPulse className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{c.estadoMedico}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">Ninguna</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedClient(c)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/30 transition-all inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ClientFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onClientCreated={handleClientCreated}
      />

      <ClientDetailModal
        client={selectedClient}
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        onClientUpdated={handleClientUpdated}
      />
    </div>
  );
};