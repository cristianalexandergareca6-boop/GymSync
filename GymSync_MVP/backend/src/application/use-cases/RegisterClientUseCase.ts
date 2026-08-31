import { Client } from '../../domain/entities/Client.js';
import { AuditLog } from '../../domain/entities/AuditLog.js';
import { IClientRepository } from '../../domain/repositories/IClientRepository.js';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository.js';
import { CI } from '../../domain/value-objects/CI.js';
import { ClientResponseDTO, RegisterClientDTO } from '../dtos/ClientDTOs.js';

/**
 * HU01: Registrar Socio
 * Criterios de Aceptación:
 * - Valida que el C.I. no exista previamente en el sistema.
 * - Genera automáticamente un código de socio único (ej: GS-2026-0001).
 * - Registra datos de contacto y estado médico sensible.
 * - Registra la acción en logs_auditoria para trazabilidad legal (Ley 164).
 */
export class RegisterClientUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly auditLogRepository?: IAuditLogRepository
  ) {}

  public async execute(
    dto: RegisterClientDTO,
    context?: { idUsuarioOperador?: number; rolUsuario?: string; ipOrigen?: string }
  ): Promise<ClientResponseDTO> {
    const ci = new CI(dto.ci);

    const exists = await this.clientRepository.existsCI(ci);
    if (exists) {
      throw new Error(`Ya existe un socio registrado con el C.I. ${ci.getValue()}.`);
    }

    const nextCodigoSocio = await this.clientRepository.getNextCodigoSocio();

    const client = new Client({
      nombre: dto.nombre,
      apellido: dto.apellido,
      ci,
      correo: dto.correo,
      codigoSocio: nextCodigoSocio,
      telefono: dto.telefono,
      contactoEmergencia: dto.contactoEmergencia,
      telefonoEmergencia: dto.telefonoEmergencia,
      estadoMedico: dto.estadoMedico
    });

    const saved = await this.clientRepository.save(client);

    // Registro de Auditoría
    if (this.auditLogRepository) {
      await this.auditLogRepository.save(
        new AuditLog({
          idUsuario: context?.idUsuarioOperador || 1,
          rolUsuario: context?.rolUsuario || 'Recepcionista',
          accion: 'REGISTRAR_SOCIO',
          entidadAfectada: 'CLIENTE',
          idRegistroAfectado: saved.id!,
          detalles: {
            codigoSocio: saved.codigoSocio,
            ci: saved.ci.getValue(),
            nombreCompleto: saved.getFullName(),
            tieneFichaMedica: Boolean(dto.estadoMedico?.trim())
          },
          ipOrigen: context?.ipOrigen || '127.0.0.1'
        })
      );
    }

    return {
      id: saved.id!,
      codigoSocio: saved.codigoSocio,
      nombre: saved.nombre,
      apellido: saved.apellido,
      nombreCompleto: saved.getFullName(),
      ci: saved.ci.getValue(),
      correo: saved.correo,
      telefono: saved.telefono,
      contactoEmergencia: saved.contactoEmergencia,
      telefonoEmergencia: saved.telefonoEmergencia,
      estadoMedico: saved.estadoMedico,
      activo: saved.activo,
      fechaRegistro: saved.fechaRegistro.toISOString()
    };
  }
}
