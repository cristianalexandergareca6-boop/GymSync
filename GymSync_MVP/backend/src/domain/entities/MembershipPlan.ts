export interface MembershipPlanProps {
  id?: number;
  nombrePlan: string;
  descripcion?: string;
  precio: number;
  duracionDias: number;
  activo?: boolean;
}

/**
 * Entidad: PLAN_MEMBRESIA
 * Catálogo de servicios ofertados por el gimnasio.
 */
export class MembershipPlan {
  public readonly id?: number;
  public nombrePlan: string;
  public descripcion?: string;
  public precio: number;
  public duracionDias: number;
  public activo: boolean;

  constructor(props: MembershipPlanProps) {
    if (!props.nombrePlan?.trim()) {
      throw new Error('El nombre del plan es obligatorio.');
    }
    if (props.precio < 0) {
      throw new Error('El precio del plan no puede ser negativo.');
    }
    if (props.duracionDias <= 0) {
      throw new Error('La duración en días debe ser mayor a cero.');
    }

    this.id = props.id;
    this.nombrePlan = props.nombrePlan.trim();
    this.descripcion = props.descripcion?.trim();
    this.precio = props.precio;
    this.duracionDias = props.duracionDias;
    this.activo = props.activo ?? true;
  }
}
