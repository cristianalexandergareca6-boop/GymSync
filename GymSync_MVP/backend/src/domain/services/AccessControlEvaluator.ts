import { ClientMembership } from '../entities/ClientMembership.js';
import { AccessDecision, AccessEvaluationResult, TrafficLightColor } from '../value-objects/AccessStatus.js';

export interface EvaluatorOptions {
  warningDaysThreshold?: number; // Días para disparar alerta amarilla (por defecto 5 días)
  currentDate?: Date; // Fecha de referencia (útil para pruebas)
}

/**
 * Servicio de Dominio: AccessControlEvaluator
 * Implementa las Reglas de Negocio del Sistema de Semáforo (HU06) y Control de Acceso (HU07).
 *
 * Reglas:
 * - VERDE: Membresía activa, vigente (> 5 días restantes) y saldo al día (Bs. 0).
 * - AMARILLO: Membresía vigente pero próxima a vencer (<= 5 días) o con saldo pendiente > 0.
 * - ROJO: Membresía vencida, suspendida, cancelada o inexistente. Bloquea el acceso.
 */
export class AccessControlEvaluator {
  private readonly warningDaysThreshold: number;

  constructor(options: EvaluatorOptions = {}) {
    this.warningDaysThreshold = options.warningDaysThreshold ?? 5;
  }

  public evaluate(
    activeMembership: ClientMembership | null | undefined,
    currentDate: Date = new Date()
  ): AccessEvaluationResult {
    // Caso 1: No posee membresía
    if (!activeMembership) {
      return {
        color: TrafficLightColor.ROJO,
        decision: AccessDecision.BLOQUEADO,
        isAllowed: false,
        message: 'El socio no cuenta con ninguna membresía registrada.',
        daysRemaining: 0,
        pendingBalance: 0
      };
    }

    // Caso 2: Membresía suspendida o cancelada
    if (activeMembership.estado === 'Suspendida' || activeMembership.estado === 'Cancelada') {
      return {
        color: TrafficLightColor.ROJO,
        decision: AccessDecision.BLOQUEADO,
        isAllowed: false,
        message: `Membresía ${activeMembership.estado.toLowerCase()}. Acceso restringido.`,
        daysRemaining: activeMembership.getDaysRemaining(currentDate),
        pendingBalance: activeMembership.saldoPendiente,
        membershipId: activeMembership.id,
        planName: activeMembership.planNombre,
        expirationDate: activeMembership.fechaVencimiento.toISOString().split('T')[0]
      };
    }

    const daysRemaining = activeMembership.getDaysRemaining(currentDate);

    // Caso 3: Membresía vencida por fecha
    if (daysRemaining < 0 || activeMembership.estado === 'Vencida') {
      const daysAgo = Math.abs(daysRemaining);
      return {
        color: TrafficLightColor.ROJO,
        decision: AccessDecision.BLOQUEADO,
        isAllowed: false,
        message: `Membresía vencida hace ${daysAgo} día(s). Debe renovar su plan para ingresar.`,
        daysRemaining,
        pendingBalance: activeMembership.saldoPendiente,
        membershipId: activeMembership.id,
        planName: activeMembership.planNombre,
        expirationDate: activeMembership.fechaVencimiento.toISOString().split('T')[0]
      };
    }

    const hasPendingBalance = activeMembership.saldoPendiente > 0;
    const isExpiringSoon = daysRemaining <= this.warningDaysThreshold;

    // Caso 4: Semáforo AMARILLO (Próxima a vencer o deuda pendiente)
    if (isExpiringSoon || hasPendingBalance) {
      const warnings: string[] = [];
      if (isExpiringSoon) {
        warnings.push(`Membresía por vencer en ${daysRemaining} día(s)`);
      }
      if (hasPendingBalance) {
        warnings.push(`Saldo pendiente: Bs. ${activeMembership.saldoPendiente.toFixed(2)}`);
      }

      return {
        color: TrafficLightColor.AMARILLO,
        decision: AccessDecision.ADVERTENCIA,
        isAllowed: true,
        message: `Acceso permitido con advertencia: ${warnings.join(' | ')}.`,
        daysRemaining,
        pendingBalance: activeMembership.saldoPendiente,
        membershipId: activeMembership.id,
        planName: activeMembership.planNombre,
        expirationDate: activeMembership.fechaVencimiento.toISOString().split('T')[0]
      };
    }

    // Caso 5: Semáforo VERDE (Al día y vigencia holgada)
    return {
      color: TrafficLightColor.VERDE,
      decision: AccessDecision.PERMITIDO,
      isAllowed: true,
      message: `Membresía activa y al día. Vigencia restante: ${daysRemaining} días.`,
      daysRemaining,
      pendingBalance: 0,
      membershipId: activeMembership.id,
      planName: activeMembership.planNombre,
      expirationDate: activeMembership.fechaVencimiento.toISOString().split('T')[0]
    };
  }
}
