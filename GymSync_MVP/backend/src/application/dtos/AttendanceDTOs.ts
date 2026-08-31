import { AccessEvaluationResult } from '../../domain/value-objects/AccessStatus.js';
import { ClientResponseDTO } from './ClientDTOs.js';

export interface ClientAccessStatusDTO {
  cliente: ClientResponseDTO;
  evaluacion: AccessEvaluationResult;
}

export interface RegisterAttendanceDTO {
  idCliente: number;
  forzarIngreso?: boolean; // Solo para bypass excepcional por admin
}

export interface AttendanceResponseDTO {
  id: number;
  idCliente: number;
  fechaHoraIngreso: string;
  estadoAcceso: string;
  colorSemaforo: string;
  motivo: string;
  clienteNombre?: string;
  clienteCodigo?: string;
}
