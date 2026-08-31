import { ClientMembership } from '../../domain/entities/ClientMembership.js';
import { MembershipPlan } from '../../domain/entities/MembershipPlan.js';
import { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';

export class InMemoryMembershipRepository implements IMembershipRepository {
  private plans: MembershipPlan[] = [];
  private memberships: ClientMembership[] = [];
  private currentPlanId = 1;
  private currentMembershipId = 1;

  constructor(initialPlans: MembershipPlan[] = [], initialMemberships: ClientMembership[] = []) {
    this.plans = [...initialPlans];
    this.memberships = [...initialMemberships];

    if (this.plans.length > 0) {
      this.currentPlanId = Math.max(...this.plans.map((p) => p.id || 0)) + 1;
    }
    if (this.memberships.length > 0) {
      this.currentMembershipId = Math.max(...this.memberships.map((m) => m.id || 0)) + 1;
    }
  }

  // Planes
  public async findPlanById(id: number): Promise<MembershipPlan | null> {
    const plan = this.plans.find((p) => p.id === id);
    return plan ? this.clonePlan(plan) : null;
  }

  public async findAllPlans(): Promise<MembershipPlan[]> {
    return this.plans.map((p) => this.clonePlan(p));
  }

  public async savePlan(plan: MembershipPlan): Promise<MembershipPlan> {
    const newPlan = new MembershipPlan({
      id: plan.id || this.currentPlanId++,
      nombrePlan: plan.nombrePlan,
      descripcion: plan.descripcion,
      precio: plan.precio,
      duracionDias: plan.duracionDias,
      activo: plan.activo
    });
    this.plans.push(newPlan);
    return this.clonePlan(newPlan);
  }

  // Membresías
  public async findMembershipById(id: number): Promise<ClientMembership | null> {
    const membership = this.memberships.find((m) => m.id === id);
    return membership ? this.cloneMembership(membership) : null;
  }

  public async findActiveMembershipByClientId(clientId: number): Promise<ClientMembership | null> {
    // Busca la membresía más reciente o activa del cliente
    const clientMemberships = this.memberships
      .filter((m) => m.idCliente === clientId)
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());

    if (clientMemberships.length === 0) return null;

    // Preferir activa si existe, sino la última registrada
    const active = clientMemberships.find((m) => m.estado === 'Activa');
    return this.cloneMembership(active || clientMemberships[0]);
  }

  public async findAllMembershipsByClientId(clientId: number): Promise<ClientMembership[]> {
    return this.memberships
      .filter((m) => m.idCliente === clientId)
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime())
      .map((m) => this.cloneMembership(m));
  }

  public async saveMembership(membership: ClientMembership): Promise<ClientMembership> {
    const plan = this.plans.find((p) => p.id === membership.idPlan);
    const newMembership = new ClientMembership({
      id: membership.id || this.currentMembershipId++,
      idCliente: membership.idCliente,
      idPlan: membership.idPlan,
      planNombre: membership.planNombre || plan?.nombrePlan,
      fechaInicio: membership.fechaInicio,
      fechaVencimiento: membership.fechaVencimiento,
      precioCongelado: membership.precioCongelado,
      saldoPendiente: membership.saldoPendiente,
      estado: membership.estado,
      fechaCreacion: membership.fechaCreacion
    });

    this.memberships.push(newMembership);
    return this.cloneMembership(newMembership);
  }

  public async updateMembership(membership: ClientMembership): Promise<ClientMembership> {
    const index = this.memberships.findIndex((m) => m.id === membership.id);
    if (index === -1) {
      throw new Error(`Membresía con ID ${membership.id} no encontrada para actualización.`);
    }

    this.memberships[index] = this.cloneMembership(membership);
    return this.cloneMembership(this.memberships[index]);
  }

  private clonePlan(plan: MembershipPlan): MembershipPlan {
    return new MembershipPlan({
      id: plan.id,
      nombrePlan: plan.nombrePlan,
      descripcion: plan.descripcion,
      precio: plan.precio,
      duracionDias: plan.duracionDias,
      activo: plan.activo
    });
  }

  private cloneMembership(m: ClientMembership): ClientMembership {
    return new ClientMembership({
      id: m.id,
      idCliente: m.idCliente,
      idPlan: m.idPlan,
      planNombre: m.planNombre,
      fechaInicio: m.fechaInicio,
      fechaVencimiento: m.fechaVencimiento,
      precioCongelado: m.precioCongelado,
      saldoPendiente: m.saldoPendiente,
      estado: m.estado,
      fechaCreacion: m.fechaCreacion
    });
  }
}
