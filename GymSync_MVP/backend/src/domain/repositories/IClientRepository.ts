import { Client } from '../entities/Client.js';
import { CI } from '../value-objects/CI.js';

export interface IClientRepository {
  findById(id: number): Promise<Client | null>;
  findByCI(ci: CI): Promise<Client | null>;
  findByCodigoSocio(codigoSocio: string): Promise<Client | null>;
  searchByQuery(query: string): Promise<Client[]>;
  findAll(): Promise<Client[]>;
  save(client: Client): Promise<Client>;
  update(client: Client): Promise<Client>;
  existsCI(ci: CI, excludeId?: number): Promise<boolean>;
  getNextCodigoSocio(): Promise<string>;
}
