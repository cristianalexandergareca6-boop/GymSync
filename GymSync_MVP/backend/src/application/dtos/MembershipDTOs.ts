import { PaymentMethod } from '../../domain/entities/Payment.js';

export interface CreateMembershipDTO {
  idCliente: number;
  idPlan: number;
  fechaInicio?: string; // Formato YYYY-MM-DD
  montoPagoInicial?: number; // Para abono inicial (total o parcial)
  metodoPagoInicial?: PaymentMethod;
  numeroComprobante?: string;
}

export interface RegisterPaymentDTO {
  idMembresia: number;
  monto: number;
  metodoPago: PaymentMethod;
  numeroComprobante?: string;
  observaciones?: string;
}

export interface MembershipResponseDTO {
  id: number;
  idCliente: number;
  idPlan: number;
  planNombre: string;
  fechaInicio: string;
  fechaVencimiento: string;
  precioCongelado: number;
  saldoPendiente: number;
  estado: string;
  diasRestantes: number;
  estaVencida: boolean;
}

export interface PaymentResponseDTO {
  id: number;
  idMembresia: number;
  montoPagado: number;
  fechaPago: string;
  metodoPago: string;
  numeroComprobante?: string;
  observaciones?: string;
}
