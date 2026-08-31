export type TrafficLightColor = 'VERDE' | 'AMARILLO' | 'ROJO';
export type AccessDecision = 'Permitido' | 'Advertencia' | 'Bloqueado';
export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'QR' | 'Transferencia';
export type MembershipStatus = 'Activa' | 'Vencida' | 'Suspendida' | 'Cancelada';

export interface Client {
  id: number;
  codigoSocio: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  ci: string;
  correo?: string;
  telefono?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  estadoMedico?: string;
  activo: boolean;
  fechaRegistro: string;
}

export interface Plan {
  id: number;
  nombrePlan: string;
  descripcion?: string;
  precio: number;
  duracionDias: number;
  activo: boolean;
}

export interface Membership {
  id: number;
  idCliente: number;
  idPlan: number;
  planNombre: string;
  fechaInicio: string;
  fechaVencimiento: string;
  precioCongelado: number;
  saldoPendiente: number;
  estado: MembershipStatus;
  diasRestantes: number;
  estaVencida: boolean;
}

export interface Payment {
  id: number;
  idMembresia: number;
  montoPagado: number;
  fechaPago: string;
  metodoPago: PaymentMethod;
  numeroComprobante?: string;
  observaciones?: string;
}

export interface AccessEvaluation {
  color: TrafficLightColor;
  decision: AccessDecision;
  isAllowed: boolean;
  message: string;
  daysRemaining: number;
  pendingBalance: number;
  membershipId?: number;
  planName?: string;
  expirationDate?: string;
}

export interface ClientAccessStatus {
  cliente: Client;
  evaluacion: AccessEvaluation;
}

export interface AttendanceRecord {
  id: number;
  idCliente: number;
  fechaHoraIngreso: string;
  estadoAcceso: AccessDecision;
  colorSemaforo: TrafficLightColor;
  motivo: string;
  clienteNombre?: string;
  clienteCodigo?: string;
}
