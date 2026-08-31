import { AccessDecision, TrafficLightColor } from '../value-objects/AccessStatus.js';

export interface AttendanceProps {
  id?: number;
  idCliente: number;
  fechaHoraIngreso?: Date;
  estadoAcceso: AccessDecision;
  colorSemaforo: TrafficLightColor;
  motivo: string;
}

/**
 * Entidad: REGISTRO_ASISTENCIA
 * Registro histórico e inmutable de ingresos al gimnasio (HU07).
 */
export class Attendance {
  public readonly id?: number;
  public readonly idCliente: number;
  public readonly fechaHoraIngreso: Date;
  public readonly estadoAcceso: AccessDecision;
  public readonly colorSemaforo: TrafficLightColor;
  public readonly motivo: string;

  constructor(props: AttendanceProps) {
    if (!props.idCliente) {
      throw new Error('El ID de cliente es obligatorio para registrar asistencia.');
    }
    if (!props.estadoAcceso) {
      throw new Error('El estado de acceso es obligatorio.');
    }
    if (!props.colorSemaforo) {
      throw new Error('El color del semáforo es obligatorio.');
    }

    this.id = props.id;
    this.idCliente = props.idCliente;
    this.fechaHoraIngreso = props.fechaHoraIngreso || new Date();
    this.estadoAcceso = props.estadoAcceso;
    this.colorSemaforo = props.colorSemaforo;
    this.motivo = props.motivo || 'Acceso regular';
  }
}
