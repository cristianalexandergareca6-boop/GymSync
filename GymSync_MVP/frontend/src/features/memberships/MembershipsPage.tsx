import { useState, useEffect, type FC } from 'react';
import { NewMembershipModal } from './NewMembershipModal';
import { PaymentModal } from './PaymentModal';
import { api } from '../../services/api';
import { Client, Plan, Membership } from '../../types';
import { CreditCard, DollarSign, Calendar, Plus, CheckCircle2 } from 'lucide-react';

export const MembershipsPage: FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewMembershipOpen, setIsNewMembershipOpen] = useState(false);
  const [selectedMembershipForPayment, setSelectedMembershipForPayment] = useState<Membership | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plansData, clientsData] = await Promise.all([api.getPlans(), api.getClients()]);
      setPlans(plansData);
      setClients(clientsData);

      // Load all client memberships
      const allMemberships: Membership[] = [];
      for (const client of clientsData) {
        const clientMems = await api.getMembershipsByClientId(client.id);
        allMemberships.push(...clientMems);
      }
      setMemberships(allMemberships);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMembershipCreated = (newM: Membership) => {
    setMemberships((prev) => [newM, ...prev]);
  };

  const handlePaymentSuccess = (membershipId: number, nuevoSaldo: number) => {
    setMemberships((prev) =>
      prev.map((m) => (m.id === membershipId ? { ...m, saldoPendiente: nuevoSaldo } : m))
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Membresías y Pagos (HU03, HU04)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestión del catálogo de planes, suscripciones con precio congelado y control de pagos parciales.
          </p>
        </div>

        <button
          onClick={() => setIsNewMembershipOpen(true)}
          className="px-5 py-3 rounded-2xl font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Membresía (HU03)</span>
        </button>
      </div>

      {/* Catalog of Plans Section */}
      <div>
        <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          Catálogo de Planes de Entrenamiento
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {p.duracionDias} DÍAS
                </span>
                <h4 className="text-lg font-bold text-slate-100 mt-2">{p.nombrePlan}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.descripcion}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Precio Oficial:</span>
                <span className="text-xl font-mono font-black text-amber-400">
                  Bs. {p.precio.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Subscriptions and Debt Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Suscripciones Registradas y Estado de Cuentas
          </h3>
          <span className="text-xs font-mono text-slate-400">Total: {memberships.length}</span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            <span className="animate-spin inline-block rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent mb-2" />
            <p>Cargando membresías...</p>
          </div>
        ) : memberships.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No hay membresías registradas actualmente.
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="py-3 px-4">Socio</th>
                  <th className="py-3 px-4">Plan Asignado</th>
                  <th className="py-3 px-4">Vigencia</th>
                  <th className="py-3 px-4">Precio Congelado</th>
                  <th className="py-3 px-4">Saldo Pendiente</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {memberships.map((m) => {
                  const client = clients.find((c) => c.id === m.idCliente);
                  const isPending = m.saldoPendiente > 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-100 block">
                          {client ? client.nombreCompleto : `Cliente #${m.idCliente}`}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {client ? client.codigoSocio : ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{m.planNombre}</td>
                      <td className="py-3.5 px-4 text-xs font-mono">
                        <span className="text-slate-400 block">{m.fechaInicio} al {m.fechaVencimiento}</span>
                        <span
                          className={`font-semibold ${
                            m.diasRestantes > 5
                              ? 'text-emerald-400'
                              : m.diasRestantes >= 0
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {m.diasRestantes >= 0 ? `${m.diasRestantes} días restantes` : 'Vencida'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        Bs. {m.precioCongelado.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {isPending ? (
                          <span className="text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-xs">
                            Bs. {m.saldoPendiente.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Al día (Bs. 0)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <button
                            onClick={() => setSelectedMembershipForPayment(m)}
                            className="px-3 py-1.5 rounded-xl font-semibold text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Pagar Saldo</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600">Completo</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewMembershipModal
        isOpen={isNewMembershipOpen}
        onClose={() => setIsNewMembershipOpen(false)}
        onMembershipCreated={handleMembershipCreated}
        clients={clients}
        plans={plans}
      />

      <PaymentModal
        membership={selectedMembershipForPayment}
        isOpen={!!selectedMembershipForPayment}
        onClose={() => setSelectedMembershipForPayment(null)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
