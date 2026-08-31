export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'QR' | 'Transferencia';

export interface PaymentProps {
  id?: number;
  idMembresia: number;
  montoPagado: number;
  fechaPago?: Date;
  metodoPago: PaymentMethod;
  numeroComprobante?: string;
  observaciones?: string;
}

/**
 * Entidad: PAGO
 * Registro transaccional inmutable para trazabilidad contable (HU04).
 */
export class Payment {
  public readonly id?: number;
  public readonly idMembresia: number;
  public readonly montoPagado: number;
  public readonly fechaPago: Date;
  public readonly metodoPago: PaymentMethod;
  public readonly numeroComprobante?: string;
  public readonly observaciones?: string;

  constructor(props: PaymentProps) {
    if (!props.idMembresia) {
      throw new Error('El ID de membresía es obligatorio para registrar un pago.');
    }
    if (props.montoPagado <= 0) {
      throw new Error('El monto del pago debe ser mayor a cero.');
    }
    if (!props.metodoPago) {
      throw new Error('El método de pago es obligatorio.');
    }

    this.id = props.id;
    this.idMembresia = props.idMembresia;
    this.montoPagado = Math.round(props.montoPagado * 100) / 100;
    this.fechaPago = props.fechaPago || new Date();
    this.metodoPago = props.metodoPago;
    this.numeroComprobante = props.numeroComprobante?.trim();
    this.observaciones = props.observaciones?.trim();
  }
}
