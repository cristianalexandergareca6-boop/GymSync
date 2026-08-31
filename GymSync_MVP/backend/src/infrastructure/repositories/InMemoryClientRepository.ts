import { Client } from '../../domain/entities/Client.js';
import { IClientRepository } from '../../domain/repositories/IClientRepository.js';
import { CI } from '../../domain/value-objects/CI.js';

export class InMemoryClientRepository implements IClientRepository {
  private clients: Client[] = [];
  private currentId = 1;

  constructor(initialClients: Client[] = []) {
    this.clients = [...initialClients];
    if (this.clients.length > 0) {
      const maxId = Math.max(...this.clients.map((c) => c.id || 0));
      this.currentId = maxId + 1;
    }
  }

  public async findById(id: number): Promise<Client | null> {
    const client = this.clients.find((c) => c.id === id);
    return client ? this.clone(client) : null;
  }

  public async findByCI(ci: CI): Promise<Client | null> {
    const client = this.clients.find((c) => c.ci.getValue() === ci.getValue());
    return client ? this.clone(client) : null;
  }

  public async findByCodigoSocio(codigoSocio: string): Promise<Client | null> {
    const client = this.clients.find(
      (c) => c.codigoSocio.toUpperCase() === codigoSocio.toUpperCase().trim()
    );
    return client ? this.clone(client) : null;
  }

  public async searchByQuery(query: string): Promise<Client[]> {
    const q = query.toLowerCase().trim();
    return this.clients
      .filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) ||
          c.apellido.toLowerCase().includes(q) ||
          c.ci.getValue().includes(q) ||
          c.codigoSocio.toLowerCase().includes(q) ||
          (c.telefono && c.telefono.includes(q))
      )
      .map((c) => this.clone(c));
  }

  public async findAll(): Promise<Client[]> {
    return this.clients.map((c) => this.clone(c));
  }

  public async save(client: Client): Promise<Client> {
    const newClient = new Client({
      id: client.id || this.currentId++,
      nombre: client.nombre,
      apellido: client.apellido,
      ci: client.ci,
      correo: client.correo,
      codigoSocio: client.codigoSocio,
      telefono: client.telefono,
      contactoEmergencia: client.contactoEmergencia,
      telefonoEmergencia: client.telefonoEmergencia,
      estadoMedico: client.estadoMedico,
      activo: client.activo,
      fechaRegistro: client.fechaRegistro
    });

    this.clients.push(newClient);
    return this.clone(newClient);
  }

  public async update(client: Client): Promise<Client> {
    const index = this.clients.findIndex((c) => c.id === client.id);
    if (index === -1) {
      throw new Error(`Cliente con ID ${client.id} no encontrado para actualización.`);
    }

    this.clients[index] = this.clone(client);
    return this.clone(this.clients[index]);
  }

  public async existsCI(ci: CI, excludeId?: number): Promise<boolean> {
    return this.clients.some((c) => c.ci.getValue() === ci.getValue() && c.id !== excludeId);
  }

  public async getNextCodigoSocio(): Promise<string> {
    const year = new Date().getFullYear();
    const count = this.clients.length + 1;
    const formattedNumber = String(count).padStart(4, '0');
    return `GS-${year}-${formattedNumber}`;
  }

  private clone(client: Client): Client {
    return new Client({
      id: client.id,
      nombre: client.nombre,
      apellido: client.apellido,
      ci: new CI(client.ci.getValue()),
      correo: client.correo,
      codigoSocio: client.codigoSocio,
      telefono: client.telefono,
      contactoEmergencia: client.contactoEmergencia,
      telefonoEmergencia: client.telefonoEmergencia,
      estadoMedico: client.estadoMedico,
      activo: client.activo,
      fechaRegistro: client.fechaRegistro
    });
  }
}
