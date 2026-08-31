import { ClientMembership } from '../../domain/entities/ClientMembership.js';
import { Payment } from '../../domain/entities/Payment.js';
import { IClientRepository } from '../../domain/repositories/IClientRepository.js';
import { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';
import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository.js';
import { CreateMembershipDTO, MembershipResponseDTO } from '../dtos/MembershipDTOs.js';

/**
 * HU03: Registrar Membresía
 * Criterios de Aceptación:
 * - Valida existencia del socio y del plan.
 * - Congela el precio histórico del plan al momento de registro.
 * - Autocalcula la fecha de vencimiento sumando la duración en días a la fecha de inicio.
 * - Permite registrar un pago inicial (total o parcial, HU04), calculando el saldo pendiente.
 */
export class CreateMembershipUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly membershipRepository: IMembershipRepository,
    private readonly paymentRepository?: IPaymentRepository
  ) {}

  public async execute(dto: CreateMembershipDTO): Promise<MembershipResponseDTO> {
    const client = await this.clientRepository.findById(dto.idCliente);
    if (!client) {
      throw new Error(`Socio con ID ${dto.idCliente} no encontrado.`);
    }

    const plan = await this.membershipRepository.findPlanById(dto.idPlan);
    if (!plan || !plan.activo) {
      throw new Error(`El plan con ID ${dto.idPlan} no existe o no está disponible.`);
    }

    const startDate = dto.fechaInicio ? dto.fechaInicio : new Date();
    const expirationDate = ClientMembership.calculateExpiration(startDate, plan.duracionDias);

    const initialPayment = dto.montoPagoInicial ?? 0;
    if (initialPayment < 0) {
      throw new Error('El monto de pago inicial no puede ser negativo.');
    }
    if (initialPayment > plan.precio) {
      throw new Error(`El pago inicial (Bs. ${initialPayment}) no puede superar el costo del plan (Bs. ${plan.precio}).`);
    }

    const initialPendingBalance = Math.round((plan.precio - initialPayment) * 100) / 100;

    const membership = new ClientMembership({
      idCliente: client.id!,
      idPlan: plan.id!,
      planNombre: plan.nombrePlan,
      fechaInicio: startDate,
      fechaVencimiento: expirationDate,
      precioCongelado: plan.precio,
      saldoPendiente: initialPendingBalance,
      estado: 'Activa'
    });

    const savedMembership = await this.membershipRepository.saveMembership(membership);

    // Si hubo pago inicial, registrar en la tabla PAGO (HU04)
    if (initialPayment > 0 && this.paymentRepository && dto.metodoPagoInicial) {
      const payment = new Payment({
        idMembresia: savedMembership.id!,
        montoPagado: initialPayment,
        metodoPago: dto.metodoPagoInicial,
        numeroComprobante: dto.numeroComprobante,
        observaciones: initialPendingBalance === 0 ? 'Pago completo inicial' : `Pago parcial inicial (Saldo Bs. ${initialPendingBalance})`
      });
      await this.paymentRepository.save(payment);
    }

    const year = savedMembership.fechaInicio.getFullYear();
    const month = String(savedMembership.fechaInicio.getMonth() + 1).padStart(2, '0');
    const day = String(savedMembership.fechaInicio.getDate()).padStart(2, '0');
    const fechaInicioFormatted = `${year}-${month}-${day}`;

    const vYear = savedMembership.fechaVencimiento.getFullYear();
    const vMonth = String(savedMembership.fechaVencimiento.getMonth() + 1).padStart(2, '0');
    const vDay = String(savedMembership.fechaVencimiento.getDate()).padStart(2, '0');
    const fechaVencimientoFormatted = `${vYear}-${vMonth}-${vDay}`;

    return {
      id: savedMembership.id!,
      idCliente: savedMembership.idCliente,
      idPlan: savedMembership.idPlan,
      planNombre: plan.nombrePlan,
      fechaInicio: fechaInicioFormatted,
      fechaVencimiento: fechaVencimientoFormatted,
      precioCongelado: savedMembership.precioCongelado,
      saldoPendiente: savedMembership.saldoPendiente,
      estado: savedMembership.estado,
      diasRestantes: savedMembership.getDaysRemaining(),
      estaVencida: savedMembership.isExpired()
    };
  }
}
