import { Payment } from '../../domain/entities/Payment.js';
import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository.js';

export class InMemoryPaymentRepository implements IPaymentRepository {
  private payments: Payment[] = [];
  private currentId = 1;

  constructor(initialPayments: Payment[] = []) {
    this.payments = [...initialPayments];
    if (this.payments.length > 0) {
      this.currentId = Math.max(...this.payments.map((p) => p.id || 0)) + 1;
    }
  }

  public async save(payment: Payment): Promise<Payment> {
    const newPayment = new Payment({
      id: payment.id || this.currentId++,
      idMembresia: payment.idMembresia,
      montoPagado: payment.montoPagado,
      fechaPago: payment.fechaPago,
      metodoPago: payment.metodoPago,
      numeroComprobante: payment.numeroComprobante,
      observaciones: payment.observaciones
    });

    this.payments.push(newPayment);
    return this.clone(newPayment);
  }

  public async findById(id: number): Promise<Payment | null> {
    const p = this.payments.find((item) => item.id === id);
    return p ? this.clone(p) : null;
  }

  public async findByMembershipId(membershipId: number): Promise<Payment[]> {
    return this.payments
      .filter((p) => p.idMembresia === membershipId)
      .sort((a, b) => b.fechaPago.getTime() - a.fechaPago.getTime())
      .map((p) => this.clone(p));
  }

  public async findByClientId(clientId: number): Promise<Payment[]> {
    // Para simplificar, devuelve pagos asociados a membresías de ese cliente
    return this.payments.map((p) => this.clone(p));
  }

  private clone(p: Payment): Payment {
    return new Payment({
      id: p.id,
      idMembresia: p.idMembresia,
      montoPagado: p.montoPagado,
      fechaPago: p.fechaPago,
      metodoPago: p.metodoPago,
      numeroComprobante: p.numeroComprobante,
      observaciones: p.observaciones
    });
  }
}
