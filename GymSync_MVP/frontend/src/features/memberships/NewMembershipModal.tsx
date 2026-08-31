import { useState, useEffect, useMemo, type FC } from 'react';
import { Modal } from '../../components/Modal';
import { api } from '../../services/api';
import { Client, Plan, Membership, PaymentMethod } from '../../types';
import { CreditCard, DollarSign, AlertCircle } from 'lucide-react';

interface NewMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMembershipCreated: (membership: Membership) => void;
  clients: Client[];
  plans: Plan[];
}

export const NewMembershipModal: FC<NewMembershipModalProps> = ({
  isOpen,
  onClose,
  onMembershipCreated,
  clients,
  plans
}) => {
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
  const [selectedPlanId, setSelectedPlanId] = useState<number | ''>('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [montoPagoInicial, setMontoPagoInicial] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<PaymentMethod>('QR');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPlan = plans.find((p) => p.id === Number(selectedPlanId));

  // Autocalcular fecha de vencimiento estimada
  const estimatedExpiration = useMemo(() => {
    if (!selectedPlan || !fechaInicio) return '';
    const start = new Date(fechaInicio);
    const exp = new Date(start.getTime() + selectedPlan.duracionDias * 24 * 60 * 60 * 1000);
    return exp.toISOString().split('T')[0];
  }, [selectedPlan, fechaInicio]);

  useEffect(() => {
    if (selectedPlan) {
      setMontoPagoInicial(selectedPlan.precio.toString());
    }
  }, [selectedPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedPlanId) {
      setError('Debe seleccionar un socio y un plan.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const initialAmount = montoPagoInicial ? parseFloat(montoPagoInicial) : 0;
      const newMembership = await api.createMembership({
        idCliente: Number(selectedClientId),
        idPlan: Number(selectedPlanId),
        fechaInicio,
        montoPagoInicial: initialAmount > 0 ? initialAmount : undefined,
        metodoPagoInicial: initialAmount > 0 ? metodoPago : undefined,
        numeroComprobante: numeroComprobante || undefined
      });

      onMembershipCreated(newMembership);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar la membresía.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Nueva Membresía (HU03)" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Client Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Seleccionar Socio *</label>
          <select
            required
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
          >
            <option value="">-- Seleccionar Socio --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombreCompleto} (C.I. {c.ci} | {c.codigoSocio})
              </option>
            ))}
          </select>
        </div>

        {/* Plan Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Plan de Membresía *</label>
          <select
            required
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
          >
            <option value="">-- Seleccionar Plan --</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombrePlan} - Bs. {p.precio.toFixed(2)} ({p.duracionDias} días)
              </option>
            ))}
          </select>
        </div>

        {/* Date Calculations (HU03) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha de Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Vencimiento Autocalculado (HU03)
            </label>
            <input
              type="text"
              readOnly
              value={estimatedExpiration || 'Seleccione plan...'}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-amber-400 font-mono focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {/* Initial Payment Section (HU04) */}
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Abono Inicial / Pago (HU04)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monto a Pagar (Bs.)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max={selectedPlan ? selectedPlan.precio : undefined}
                value={montoPagoInicial}
                onChange={(e) => setMontoPagoInicial(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none font-mono font-bold"
              />
              {selectedPlan && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Saldo que quedará pendiente:{' '}
                  <strong className="text-amber-400">
                    Bs. {(selectedPlan.precio - (parseFloat(montoPagoInicial) || 0)).toFixed(2)}
                  </strong>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Método de Pago</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="QR">📱 QR Simple (Bolivia)</option>
                <option value="Efectivo">💵 Efectivo</option>
                <option value="Tarjeta">💳 Tarjeta POS</option>
                <option value="Transferencia">🏦 Transferencia Bancaria</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nro. de Comprobante / Recibo</label>
            <input
              type="text"
              value={numeroComprobante}
              onChange={(e) => setNumeroComprobante(e.target.value)}
              placeholder="Ej: QR-99231 o REC-045"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Registrar Membresía</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
