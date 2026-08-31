import { Payment } from '../entities/Payment.js';

export interface IPaymentRepository {
  save(payment: Payment): Promise<Payment>;
  findById(id: number): Promise<Payment | null>;
  findByMembershipId(membershipId: number): Promise<Payment[]>;
  findByClientId(clientId: number): Promise<Payment[]>;
}
