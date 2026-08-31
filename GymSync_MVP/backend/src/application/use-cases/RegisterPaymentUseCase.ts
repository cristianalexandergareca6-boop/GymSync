import { Payment } from '../../domain/entities/Payment.js';
import { AuditLog } from '../../domain/entities/AuditLog.js';
import { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';
import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository.js';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository.js';
import { PaymentResponseDTO, RegisterPaymentDTO } from '../dtos/MembershipDTOs.js';

/**
 * HU04: Registrar Pago
 * Criterios de Aceptación:
 * - Permite pagos totales o parciales (Efectivo, Tarjeta, QR, Transferencia).
 * - Si es parcial, el saldo pendiente queda actualizado.
 * - Registra la transacción inmutablemente en el historial de pagos.
 * - Registra la acción en logs_auditoria para trazabilidad contable y no-repudio (Art. 363 bis C.P.).
 */
export class RegisterPaymentUseCase {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly auditLogRepository?: IAuditLogRepository
  ) {}

  public async execute(
    dto: RegisterPaymentDTO,
    context?: { idUsuarioOperador?: number; rolUsuario?: string; ipOrigen?: string }
  ): Promise<{ payment: PaymentResponseDTO; nuevoSaldoPendiente: number }> {
    const membership = await this.membershipRepository.findMembershipById(dto.idMembresia);
    if (!membership) {
      throw new Error(`Membresía con ID ${dto.idMembresia} no encontrada.`);
    }

    if (membership.saldoPendiente <= 0) {
      throw new Error('Esta membresía no tiene saldo pendiente por pagar.');
    }

    const saldoAnterior = membership.saldoPendiente;

    // Aplica el pago en la entidad de dominio
    const nuevoSaldo = membership.applyPayment(dto.monto);

    // Actualiza la membresía
    await this.membershipRepository.updateMembership(membership);

    // Registra la transacción de pago
    const payment = new Payment({
      idMembresia: membership.id!,
      montoPagado: dto.monto,
      metodoPago: dto.metodoPago,
      numeroComprobante: dto.numeroComprobante,
      observaciones: dto.observaciones || (nuevoSaldo === 0 ? 'Pago completado al 100%' : `Abono parcial (Saldo restante: Bs. ${nuevoSaldo})`)
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Registro de Auditoría
    if (this.auditLogRepository) {
      await this.auditLogRepository.save(
        new AuditLog({
          idUsuario: context?.idUsuarioOperador || 1,
          rolUsuario: context?.rolUsuario || 'Recepcionista',
          accion: 'REGISTRAR_PAGO',
          entidadAfectada: 'PAGO',
          idRegistroAfectado: savedPayment.id!,
          detalles: {
            idMembresia: membership.id,
            idCliente: membership.idCliente,
            montoPagado: dto.monto,
            metodoPago: dto.metodoPago,
            numeroComprobante: dto.numeroComprobante,
            saldoAnterior,
            nuevoSaldoPendiente: nuevoSaldo
          },
          ipOrigen: context?.ipOrigen || '127.0.0.1'
        })
      );
    }

    return {
      payment: {
        id: savedPayment.id!,
        idMembresia: savedPayment.idMembresia,
        montoPagado: savedPayment.montoPagado,
        fechaPago: savedPayment.fechaPago.toISOString(),
        metodoPago: savedPayment.metodoPago,
        numeroComprobante: savedPayment.numeroComprobante,
        observaciones: savedPayment.observaciones
      },
      nuevoSaldoPendiente: nuevoSaldo
    };
  }
}
