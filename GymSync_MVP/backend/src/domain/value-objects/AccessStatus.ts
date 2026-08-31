/**
 * Representa los estados del sistema de semáforo visual de GymSync (HU06)
 */
export enum TrafficLightColor {
  VERDE = 'VERDE',
  AMARILLO = 'AMARILLO',
  ROJO = 'ROJO'
}

export enum AccessDecision {
  PERMITIDO = 'Permitido',
  ADVERTENCIA = 'Advertencia',
  BLOQUEADO = 'Bloqueado'
}

export interface AccessEvaluationResult {
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
