import { User, UserProps } from './User.js';

export interface ClientProps extends Omit<UserProps, 'rol'> {
  codigoSocio: string;
  telefono?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  estadoMedico?: string;
}

/**
 * Entidad: CLIENTE (Subclase de USUARIO)
 * Representa al socio del gimnasio (HU01, HU02).
 */
export class Client extends User {
  public readonly codigoSocio: string;
  public telefono?: string;
  public contactoEmergencia?: string;
  public telefonoEmergencia?: string;
  public estadoMedico?: string;

  constructor(props: ClientProps) {
    super({ ...props, rol: 'Cliente' });

    if (!props.codigoSocio?.trim()) {
      throw new Error('El código de socio es obligatorio.');
    }

    this.codigoSocio = props.codigoSocio.trim().toUpperCase();
    this.telefono = props.telefono?.trim();
    this.contactoEmergencia = props.contactoEmergencia?.trim();
    this.telefonoEmergencia = props.telefonoEmergencia?.trim();
    this.estadoMedico = props.estadoMedico?.trim();
  }

  /**
   * HU02: Permite actualizar datos de contacto y observaciones médicas
   * sin alterar el histórico ni el C.I.
   */
  public updateProfile(data: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    contactoEmergencia?: string;
    telefonoEmergencia?: string;
    estadoMedico?: string;
    correo?: string;
  }): void {
    if (data.nombre) this.nombre = data.nombre.trim();
    if (data.apellido) this.apellido = data.apellido.trim();
    if (data.correo !== undefined) this.correo = data.correo?.trim().toLowerCase();
    if (data.telefono !== undefined) this.telefono = data.telefono?.trim();
    if (data.contactoEmergencia !== undefined) this.contactoEmergencia = data.contactoEmergencia?.trim();
    if (data.telefonoEmergencia !== undefined) this.telefonoEmergencia = data.telefonoEmergencia?.trim();
    if (data.estadoMedico !== undefined) this.estadoMedico = data.estadoMedico?.trim();
  }
}
