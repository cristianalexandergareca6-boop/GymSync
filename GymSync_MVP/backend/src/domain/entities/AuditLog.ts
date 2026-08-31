export interface AuditLogProps {
  id?: number;
  idUsuario: number;
  rolUsuario: string;
  accion: string;
  entidadAfectada: string;
  idRegistroAfectado: number;
  detalles?: Record<string, any> | string;
  ipOrigen?: string;
  fechaHora?: Date;
}

/**
 * Entidad: LOGS_AUDITORIA (AuditLog)
 * Registro inmutable de acciones administrativas, modificaciones y transacciones
 * para cumplimiento de la Ley 164 y prevención de manipulación informática (Art. 363 bis C.P.).
 */
export class AuditLog {
  public readonly id?: number;
  public readonly idUsuario: number;
  public readonly rolUsuario: string;
  public readonly accion: string;
  public readonly entidadAfectada: string;
  public readonly idRegistroAfectado: number;
  public readonly detalles?: Record<string, any> | string;
  public readonly ipOrigen?: string;
  public readonly fechaHora: Date;

  constructor(props: AuditLogProps) {
    if (!props.idUsuario) {
      throw new Error('El ID de usuario operador es obligatorio para auditar la acción.');
    }
    if (!props.accion?.trim()) {
      throw new Error('La acción realizada es obligatoria.');
    }
    if (!props.entidadAfectada?.trim()) {
      throw new Error('La entidad afectada es obligatoria.');
    }

    this.id = props.id;
    this.idUsuario = props.idUsuario;
    this.rolUsuario = props.rolUsuario || 'Desconocido';
    this.accion = props.accion.trim().toUpperCase();
    this.entidadAfectada = props.entidadAfectada.trim().toUpperCase();
    this.idRegistroAfectado = props.idRegistroAfectado;
    this.detalles = props.detalles;
    this.ipOrigen = props.ipOrigen || '127.0.0.1';
    this.fechaHora = props.fechaHora || new Date();
  }
}
