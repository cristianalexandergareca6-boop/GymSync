import { Attendance } from '../../domain/entities/Attendance.js';
import { AuditLog } from '../../domain/entities/AuditLog.js';
import { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository.js';
import { IClientRepository } from '../../domain/repositories/IClientRepository.js';
import { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository.js';
import { AccessControlEvaluator } from '../../domain/services/AccessControlEvaluator.js';
import { TrafficLightColor } from '../../domain/value-objects/AccessStatus.js';
import { AttendanceResponseDTO, RegisterAttendanceDTO } from '../dtos/AttendanceDTOs.js';

/**
 * HU07: Registrar Ingreso
 * Criterios de Aceptación:
 * - Botón de "Un clic" para registrar entrada.
 * - Bloquea automáticamente si la membresía es Roja (vencida, sin membresía o inactiva).
 * - Registra la asistencia guardando fecha, hora, estado, color y motivo.
 * - Registra auditoría inmutable ante excepciones de forzado de ingreso (Art. 363 ter C.P.).
 */
export class RegisterAttendanceUseCase {
  private readonly evaluator: AccessControlEvaluator;

  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly membershipRepository: IMembershipRepository,
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly auditLogRepository?: IAuditLogRepository,
    evaluator?: AccessControlEvaluator
  ) {
    this.evaluator = evaluator || new AccessControlEvaluator();
  }

  public async execute(
    dto: RegisterAttendanceDTO,
    context?: { idUsuarioOperador?: number; rolUsuario?: string; ipOrigen?: string }
  ): Promise<AttendanceResponseDTO> {
    const client = await this.clientRepository.findById(dto.idCliente);
    if (!client) {
      throw new Error(`Socio con ID ${dto.idCliente} no encontrado.`);
    }

    const activeMembership = await this.membershipRepository.findActiveMembershipByClientId(client.id!);
    const evaluation = this.evaluator.evaluate(activeMembership);

    // Si la evaluación es ROJA y no está explícitamente forzada por admin, se bloquea el acceso
    if (evaluation.color === TrafficLightColor.ROJO && !dto.forzarIngreso) {
      const blockedAttendance = new Attendance({
        idCliente: client.id!,
        estadoAcceso: evaluation.decision,
        colorSemaforo: evaluation.color,
        motivo: `ACCESO DENEGADO: ${evaluation.message}`
      });
      await this.attendanceRepository.save(blockedAttendance);

      if (this.auditLogRepository) {
        await this.auditLogRepository.save(
          new AuditLog({
            idUsuario: context?.idUsuarioOperador || 1,
            rolUsuario: context?.rolUsuario || 'Recepcionista',
            accion: 'ACCESO_BLOQUEADO_SEMAFORO_ROJO',
            entidadAfectada: 'REGISTRO_ASISTENCIA',
            idRegistroAfectado: client.id!,
            detalles: {
              cliente: client.getFullName(),
              codigoSocio: client.codigoSocio,
              motivo: evaluation.message
            },
            ipOrigen: context?.ipOrigen || '127.0.0.1'
          })
        );
      }

      throw new Error(`ACCESO DENEGADO (Semáforo Rojo): ${evaluation.message}`);
    }

    // Registro de asistencia permitido / con advertencia / forzado
    const motivoFinal = dto.forzarIngreso && evaluation.color === TrafficLightColor.ROJO
      ? `FORZADO POR SUPERVISOR: ${evaluation.message}`
      : evaluation.message;

    const attendance = new Attendance({
      idCliente: client.id!,
      estadoAcceso: evaluation.decision,
      colorSemaforo: evaluation.color,
      motivo: motivoFinal
    });

    const saved = await this.attendanceRepository.save(attendance);

    // Registro de Auditoría (especialmente crítico si fue forzado)
    if (this.auditLogRepository) {
      await this.auditLogRepository.save(
        new AuditLog({
          idUsuario: context?.idUsuarioOperador || 1,
          rolUsuario: context?.rolUsuario || 'Recepcionista',
          accion: dto.forzarIngreso && evaluation.color === TrafficLightColor.ROJO ? 'FORZAR_INGRESO_SEMAFORO_ROJO' : 'REGISTRAR_ASISTENCIA',
          entidadAfectada: 'REGISTRO_ASISTENCIA',
          idRegistroAfectado: saved.id!,
          detalles: {
            idCliente: client.id,
            cliente: client.getFullName(),
            codigoSocio: client.codigoSocio,
            colorSemaforo: evaluation.color,
            fueForzado: Boolean(dto.forzarIngreso && evaluation.color === TrafficLightColor.ROJO),
            motivo: motivoFinal
          },
          ipOrigen: context?.ipOrigen || '127.0.0.1'
        })
      );
    }

    return {
      id: saved.id!,
      idCliente: saved.idCliente,
      fechaHoraIngreso: saved.fechaHoraIngreso.toISOString(),
      estadoAcceso: saved.estadoAcceso,
      colorSemaforo: saved.colorSemaforo,
      motivo: saved.motivo,
      clienteNombre: client.getFullName(),
      clienteCodigo: client.codigoSocio
    };
  }
}
