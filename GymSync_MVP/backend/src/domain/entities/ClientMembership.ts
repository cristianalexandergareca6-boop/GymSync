export type MembershipStatus = 'Activa' | 'Vencida' | 'Suspendida' | 'Cancelada';

export interface ClientMembershipProps {
  id?: number;
  idCliente: number;
  idPlan: number;
  planNombre?: string;
  fechaInicio: Date | string;
  fechaVencimiento?: Date | string;
  duracionDias?: number;
  precioCongelado: number;
  saldoPendiente?: number;
  estado?: MembershipStatus;
  fechaCreacion?: Date;
}

/**
 * Normaliza una fecha a las 00:00:00 locales para comparaciones precisas sin desfase horario.
 */
function parseToLocalDate(input: Date | string): Date {
  if (typeof input === 'string') {
    // Si viene como YYYY-MM-DD
    const parts = input.split('T')[0].split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }
  const d = new Date(input);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Entidad: MEMBRESIA_CLIENTE
 * Controla la suscripción activa o histórica del cliente (HU03, HU04, HU06).
 */
export class ClientMembership {
  public readonly id?: number;
  public readonly idCliente: number;
  public readonly idPlan: number;
  public planNombre?: string;
  public fechaInicio: Date;
  public fechaVencimiento: Date;
  public readonly precioCongelado: number;
  public saldoPendiente: number;
  public estado: MembershipStatus;
  public readonly fechaCreacion: Date;

  constructor(props: ClientMembershipProps) {
    if (!props.idCliente) throw new Error('El ID de cliente es obligatorio.');
    if (!props.idPlan) throw new Error('El ID de plan es obligatorio.');
    if (!props.fechaInicio) throw new Error('La fecha de inicio es obligatoria.');
    if (props.precioCongelado < 0) throw new Error('El precio congelado no puede ser negativo.');

    this.id = props.id;
    this.idCliente = props.idCliente;
    this.idPlan = props.idPlan;
    this.planNombre = props.planNombre;
    this.fechaInicio = parseToLocalDate(props.fechaInicio);
    this.precioCongelado = props.precioCongelado;
    this.saldoPendiente = props.saldoPendiente !== undefined ? props.saldoPendiente : props.precioCongelado;
    this.estado = props.estado || 'Activa';
    this.fechaCreacion = props.fechaCreacion || new Date();

    // HU03: Cálculo automático de fecha de vencimiento si no se suministra explícitamente
    if (props.fechaVencimiento) {
      this.fechaVencimiento = parseToLocalDate(props.fechaVencimiento);
    } else if (props.duracionDias) {
      this.fechaVencimiento = ClientMembership.calculateExpiration(this.fechaInicio, props.duracionDias);
    } else {
      throw new Error('Debe proporcionar fechaVencimiento o duracionDias para calcular el vencimiento.');
    }
  }

  /**
   * Calcula la fecha de vencimiento sumando la duración en días (HU03).
   */
  public static calculateExpiration(startDate: Date | string, durationDays: number): Date {
    const base = parseToLocalDate(startDate);
    const expiration = new Date(base.getFullYear(), base.getMonth(), base.getDate() + durationDays);
    return expiration;
  }

  /**
   * Aplica un pago total o parcial, reduciendo el saldo pendiente (HU04).
   */
  public applyPayment(amount: number): number {
    if (amount <= 0) {
      throw new Error('El monto del pago debe ser mayor a cero.');
    }
    if (amount > this.saldoPendiente) {
      throw new Error(`El monto (Bs. ${amount}) excede el saldo pendiente actual (Bs. ${this.saldoPendiente}).`);
    }

    this.saldoPendiente = Math.round((this.saldoPendiente - amount) * 100) / 100;
    return this.saldoPendiente;
  }

  /**
   * Determina si la membresía ha expirado en una fecha determinada.
   */
  public isExpired(targetDate: Date = new Date()): boolean {
    const today = parseToLocalDate(targetDate);
    const expiration = parseToLocalDate(this.fechaVencimiento);
    return today.getTime() > expiration.getTime();
  }

  /**
   * Obtiene la cantidad de días restantes hasta el vencimiento (positivo o negativo si ya venció).
   */
  public getDaysRemaining(targetDate: Date = new Date()): number {
    const today = parseToLocalDate(targetDate);
    const expiration = parseToLocalDate(this.fechaVencimiento);
    const diffMs = expiration.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }
}
