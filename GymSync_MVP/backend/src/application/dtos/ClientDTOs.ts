export interface RegisterClientDTO {
  nombre: string;
  apellido: string;
  ci: string;
  correo?: string;
  telefono?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  estadoMedico?: string;
}

export interface UpdateClientDTO {
  id: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  estadoMedico?: string;
}

export interface ClientResponseDTO {
  id: number;
  codigoSocio: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  ci: string;
  correo?: string;
  telefono?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  estadoMedico?: string;
  activo: boolean;
  fechaRegistro: string;
}
