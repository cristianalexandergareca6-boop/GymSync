import { AuditLog } from '../entities/AuditLog.js';

export interface IAuditLogRepository {
  save(log: AuditLog): Promise<AuditLog>;
  findAll(limit?: number): Promise<AuditLog[]>;
  findByEntity(entidad: string, idRegistro: number): Promise<AuditLog[]>;
  findByUserId(idUsuario: number): Promise<AuditLog[]>;
}
