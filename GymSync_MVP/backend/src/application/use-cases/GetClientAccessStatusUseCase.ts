import { Client } from '../../domain/entities/Client.js';
import { IClientRepository } from '../../domain/repositories/IClientRepository.js';
import { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';
import { AccessControlEvaluator } from '../../domain/services/AccessControlEvaluator.js';
import { CI } from '../../domain/value-objects/CI.js';
import { ClientAccessStatusDTO } from '../dtos/AttendanceDTOs.js';

/**
 * HU05: Consultar Estado
 * HU06: Semáforo Visual
 * Criterios de Aceptación:
 * - Búsqueda por C.I. o código de socio que responda instantáneamente.
 * - Evalúa la membresía activa y calcula el estado del semáforo (Verde / Amarillo / Rojo).
 */
export class GetClientAccessStatusUseCase {
  private readonly evaluator: AccessControlEvaluator;

  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly membershipRepository: IMembershipRepository,
    evaluator?: AccessControlEvaluator
  ) {
    this.evaluator = evaluator || new AccessControlEvaluator();
  }

  public async execute(searchQuery: string): Promise<ClientAccessStatusDTO> {
    if (!searchQuery?.trim()) {
      throw new Error('Debe proporcionar un C.I. o Código de Socio para realizar la búsqueda.');
    }

    const trimmed = searchQuery.trim();
    let client: Client | null = null;

    // Intentar buscar por código de socio
    if (trimmed.toUpperCase().startsWith('GS-') || trimmed.length > 5) {
      client = await this.clientRepository.findByCodigoSocio(trimmed.toUpperCase());
    }

    // Si no se encontró, intentar por C.I.
    if (!client) {
      try {
        const ci = new CI(trimmed);
        client = await this.clientRepository.findByCI(ci);
      } catch {
        // Formato no válido de CI, intentamos búsqueda general
      }
    }

    // Búsqueda general fallback
    if (!client) {
      const results = await this.clientRepository.searchByQuery(trimmed);
      if (results.length > 0) {
        client = results[0];
      }
    }

    if (!client) {
      throw new Error(`No se encontró ningún socio registrado con el identificador "${searchQuery}".`);
    }

    // Buscar membresía activa del cliente
    const activeMembership = await this.membershipRepository.findActiveMembershipByClientId(client.id!);

    // Evaluar semáforo con el servicio de dominio
    const evaluation = this.evaluator.evaluate(activeMembership);

    return {
      cliente: {
        id: client.id!,
        codigoSocio: client.codigoSocio,
        nombre: client.nombre,
        apellido: client.apellido,
        nombreCompleto: client.getFullName(),
        ci: client.ci.getValue(),
        correo: client.correo,
        telefono: client.telefono,
        contactoEmergencia: client.contactoEmergencia,
        telefonoEmergencia: client.telefonoEmergencia,
        estadoMedico: client.estadoMedico,
        activo: client.activo,
        fechaRegistro: client.fechaRegistro.toISOString()
      },
      evaluacion: evaluation
    };
  }
}
