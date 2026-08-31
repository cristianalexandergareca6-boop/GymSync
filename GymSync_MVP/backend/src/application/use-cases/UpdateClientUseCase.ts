import { AuditLog } from '../../domain/entities/AuditLog.js';
import { IClientRepository } from '../../domain/repositories/IClientRepository.js';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository.js';
import { ClientResponseDTO, UpdateClientDTO } from '../dtos/ClientDTOs.js';

/**
 * HU02: Actualizar Socio
 * Criterios de Aceptación:
 * - Permite editar datos de contacto y observaciones médicas.
 * - No altera el C.I. ni el histórico de asistencias ni el código de socio.
 * - Registra la pista de auditoría completa (datos previos vs nuevos) en logs_auditoria.
 */
export class UpdateClientUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly auditLogRepository?: IAuditLogRepository
  ) {}

  public async execute(
    dto: UpdateClientDTO,
    context?: { idUsuarioOperador?: number; rolUsuario?: string; ipOrigen?: string }
  ): Promise<ClientResponseDTO> {
    const client = await this.clientRepository.findById(dto.id);
    if (!client) {
      throw new Error(`No se encontró ningún socio con el ID ${dto.id}.`);
    }

    const previousData = {
      nombre: client.nombre,
      apellido: client.apellido,
      correo: client.correo,
      telefono: client.telefono,
      contactoEmergencia: client.contactoEmergencia,
      telefonoEmergencia: client.telefonoEmergencia,
      estadoMedico: client.estadoMedico
    };

    client.updateProfile({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      telefono: dto.telefono,
      contactoEmergencia: dto.contactoEmergencia,
      telefonoEmergencia: dto.telefonoEmergencia,
      estadoMedico: dto.estadoMedico
    });

    const updated = await this.clientRepository.update(client);

    // Registro de Auditoría
    if (this.auditLogRepository) {
      await this.auditLogRepository.save(
        new AuditLog({
          idUsuario: context?.idUsuarioOperador || 1,
          rolUsuario: context?.rolUsuario || 'Recepcionista',
          accion: 'ACTUALIZAR_SOCIO',
          entidadAfectada: 'CLIENTE',
          idRegistroAfectado: updated.id!,
          detalles: {
            datosAnteriores: previousData,
            datosNuevos: {
              nombre: updated.nombre,
              apellido: updated.apellido,
              correo: updated.correo,
              telefono: updated.telefono,
              contactoEmergencia: updated.contactoEmergencia,
              telefonoEmergencia: updated.telefonoEmergencia,
              estadoMedico: updated.estadoMedico
            }
          },
          ipOrigen: context?.ipOrigen || '127.0.0.1'
        })
      );
    }

    return {
      id: updated.id!,
      codigoSocio: updated.codigoSocio,
      nombre: updated.nombre,
      apellido: updated.apellido,
      nombreCompleto: updated.getFullName(),
      ci: updated.ci.getValue(),
      correo: updated.correo,
      telefono: updated.telefono,
      contactoEmergencia: updated.contactoEmergencia,
      telefonoEmergencia: updated.telefonoEmergencia,
      estadoMedico: updated.estadoMedico,
      activo: updated.activo,
      fechaRegistro: updated.fechaRegistro.toISOString()
    };
  }
}
