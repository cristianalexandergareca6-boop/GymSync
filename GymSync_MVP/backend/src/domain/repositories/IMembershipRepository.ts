import { ClientMembership } from '../entities/ClientMembership.js';
import { MembershipPlan } from '../entities/MembershipPlan.js';

export interface IMembershipRepository {
  // Planes
  findPlanById(id: number): Promise<MembershipPlan | null>;
  findAllPlans(): Promise<MembershipPlan[]>;
  savePlan(plan: MembershipPlan): Promise<MembershipPlan>;

  // Membresías de clientes
  findMembershipById(id: number): Promise<ClientMembership | null>;
  findActiveMembershipByClientId(clientId: number): Promise<ClientMembership | null>;
  findAllMembershipsByClientId(clientId: number): Promise<ClientMembership[]>;
  saveMembership(membership: ClientMembership): Promise<ClientMembership>;
  updateMembership(membership: ClientMembership): Promise<ClientMembership>;
}
