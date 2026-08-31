import { CI } from '../value-objects/CI.js';

export type UserRole = 'Admin' | 'Entrenador' | 'Cliente' | 'Recepcionista';

export interface UserProps {
  id?: number;
  nombre: string;
  apellido: string;
  ci: CI;
  correo?: string;
  contrasenaHash?: string;
  rol: UserRole;
  activo?: boolean;
  fechaRegistro?: Date;
}

/**
 * Entidad Base: USUARIO
 * Principio Open/Closed y Liskov Substitution para herencia tipo Joined.
 */
export class User {
  public readonly id?: number;
  public nombre: string;
  public apellido: string;
  public ci: CI;
  public correo?: string;
  public contrasenaHash?: string;
  public rol: UserRole;
  public activo: boolean;
  public readonly fechaRegistro: Date;

  constructor(props: UserProps) {
    if (!props.nombre?.trim()) throw new Error('El nombre es obligatorio.');
    if (!props.apellido?.trim()) throw new Error('El apellido es obligatorio.');

    this.id = props.id;
    this.nombre = props.nombre.trim();
    this.apellido = props.apellido.trim();
    this.ci = props.ci;
    this.correo = props.correo?.trim().toLowerCase();
    this.contrasenaHash = props.contrasenaHash || 'default_hashed_pass';
    this.rol = props.rol;
    this.activo = props.activo ?? true;
    this.fechaRegistro = props.fechaRegistro || new Date();
  }

  public getFullName(): string {
    return `${this.nombre} ${this.apellido}`;
  }
}
