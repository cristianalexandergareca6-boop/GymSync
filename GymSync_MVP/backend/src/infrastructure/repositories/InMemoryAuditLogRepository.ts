import { AuditLog } from '../../domain/entities/AuditLog.js';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository.js';

export class InMemoryAuditLogRepository implements IAuditLogRepository {
  private logs: AuditLog[] = [];
  private currentId = 1;

  public async save(log: AuditLog): Promise<AuditLog> {
    const created = new AuditLog({
      id: log.id || this.currentId++,
      idUsuario: log.idUsuario,
      rolUsuario: log.rolUsuario,
      accion: log.accion,
      entidadAfectada: log.entidadAfectada,
      idRegistroAfectado: log.idRegistroAfectado,
      detalles: log.detalles,
      ipOrigen: log.ipOrigen,
      fechaHora: log.fechaHora
    });

    this.logs.unshift(created); // Orden descendente (más recientes primero)
    return created;
  }

  public async findAll(limit = 100): Promise<AuditLog[]> {
    return this.logs.slice(0, limit);
  }

  public async findByEntity(entidad: string, idRegistro: number): Promise<AuditLog[]> {
    const target = entidad.toUpperCase();
    return this.logs.filter(
      (l) => l.entidadAfectada === target && l.idRegistroAfectado === idRegistro
    );
  }

  public async findByUserId(idUsuario: number): Promise<AuditLog[]> {
    return this.logs.filter((l) => l.idUsuario === idUsuario);
  }
}
