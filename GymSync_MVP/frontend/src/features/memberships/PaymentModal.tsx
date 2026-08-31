import { useState, useEffect, type FC, type FormEvent } from 'react';
import { Modal } from '../../components/Modal';
import { api } from '../../services/api';
import { Membership, PaymentMethod } from '../../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  membership: Membership | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (membershipId: number, nuevoSaldo: number) => void;
}

export const PaymentModal: FC<PaymentModalProps> = ({
  membership,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState<PaymentMethod>('QR');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (membership) {
      setMonto(membership.saldoPendiente.toString());
      setError(null);
    }
  }, [membership]);

  if (!membership) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(monto);
    if (!amount || amount <= 0) {
      setError('El monto debe ser mayor a cero.');
      return;
    }
    if (amount > membership.saldoPendiente) {
      setError(`El monto no puede superar la deuda actual (Bs. ${membership.saldoPendiente.toFixed(2)}).`);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await api.registerPayment({
        idMembresia: membership.id,
        monto: amount,
        metodoPago,
        numeroComprobante: numeroComprobante || undefined,
        observaciones: observaciones || undefined
      });

      onPaymentSuccess(membership.id, result.nuevoSaldoPendiente);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el pago.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pago / Abono (HU04)" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Debt Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Plan: {membership.planNombre}</p>
            <p className="text-xs text-slate-400">Precio Congelado: Bs. {membership.precioCongelado.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-amber-400 block">Deuda Pendiente</span>
            <span className="text-xl font-mono font-bold text-amber-300">
              Bs. {membership.saldoPendiente.toFixed(2)}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Monto del Pago (Bs.) * (Total o Parcial)
          </label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max={membership.saldoPendiente}
            required
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-base text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Método de Pago *</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value as PaymentMethod)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="QR">📱 QR Simple (Bolivia)</option>
            <option value="Efectivo">💵 Efectivo en Caja</option>
            <option value="Tarjeta">💳 Tarjeta Débito/Crédito</option>
            <option value="Transferencia">🏦 Transferencia Bancaria</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Nro. de Comprobante / Recibo</label>
          <input
            type="text"
            value={numeroComprobante}
            onChange={(e) => setNumeroComprobante(e.target.value)}
            placeholder="Ej: QR-10928 o REC-098"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Notas / Observaciones</label>
          <input
            type="text"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ej: Pago de cuota final de mes"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
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
            className="px-6 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Pago</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
