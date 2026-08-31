import { User, UserProps } from './User.js';

export interface TrainerProps extends Omit<UserProps, 'rol'> {
  especialidad: string;
  turno: string;
}

/**
 * Entidad: ENTRENADOR (Subclase de USUARIO)
 */
export class Trainer extends User {
  public especialidad: string;
  public turno: string;

  constructor(props: TrainerProps) {
    super({ ...props, rol: 'Entrenador' });

    if (!props.especialidad?.trim()) {
      throw new Error('La especialidad del entrenador es obligatoria.');
    }
    if (!props.turno?.trim()) {
      throw new Error('El turno del entrenador es obligatorio.');
    }

    this.especialidad = props.especialidad.trim();
    this.turno = props.turno.trim();
  }
}
