import {
  Client,
  Plan,
  Membership,
  Payment,
  ClientAccessStatus,
  AttendanceRecord,
  PaymentMethod
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Error en la solicitud (${res.status})`);
  }
  return json.data;
}

export const api = {
  // Access Control / Semáforo (HU05, HU06, HU07)
  async getAccessStatus(query: string): Promise<ClientAccessStatus> {
    const res = await fetch(`${API_BASE}/access/status/${encodeURIComponent(query)}`);
    return handleResponse<ClientAccessStatus>(res);
  },

  async checkIn(idCliente: number, forzarIngreso?: boolean): Promise<AttendanceRecord> {
    const res = await fetch(`${API_BASE}/access/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idCliente, forzarIngreso })
    });
    return handleResponse<AttendanceRecord>(res);
  },

  async getTodayAttendances(): Promise<{ totalHoy: number; asistencias: AttendanceRecord[] }> {
    const res = await fetch(`${API_BASE}/access/attendances/today`);
    return handleResponse<{ totalHoy: number; asistencias: AttendanceRecord[] }>(res);
  },

  // Clients (HU01, HU02)
  async getClients(search?: string): Promise<Client[]> {
    const url = search ? `${API_BASE}/clients?search=${encodeURIComponent(search)}` : `${API_BASE}/clients`;
    const res = await fetch(url);
    return handleResponse<Client[]>(res);
  },

  async getClientById(id: number): Promise<Client> {
    const res = await fetch(`${API_BASE}/clients/${id}`);
    return handleResponse<Client>(res);
  },

  async createClient(data: {
    nombre: string;
    apellido: string;
    ci: string;
    correo?: string;
    telefono?: string;
    contactoEmergencia?: string;
    telefonoEmergencia?: string;
    estadoMedico?: string;
  }): Promise<Client> {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Client>(res);
  },

  async updateClient(
    id: number,
    data: {
      nombre?: string;
      apellido?: string;
      correo?: string;
      telefono?: string;
      contactoEmergencia?: string;
      telefonoEmergencia?: string;
      estadoMedico?: string;
    }
  ): Promise<Client> {
    const res = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Client>(res);
  },

  // Memberships & Payments (HU03, HU04)
  async getPlans(): Promise<Plan[]> {
    const res = await fetch(`${API_BASE}/memberships/plans`);
    return handleResponse<Plan[]>(res);
  },

  async getMembershipsByClientId(clientId: number): Promise<Membership[]> {
    const res = await fetch(`${API_BASE}/memberships/client/${clientId}`);
    return handleResponse<Membership[]>(res);
  },

  async createMembership(data: {
    idCliente: number;
    idPlan: number;
    fechaInicio?: string;
    montoPagoInicial?: number;
    metodoPagoInicial?: PaymentMethod;
    numeroComprobante?: string;
  }): Promise<Membership> {
    const res = await fetch(`${API_BASE}/memberships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Membership>(res);
  },

  async registerPayment(data: {
    idMembresia: number;
    monto: number;
    metodoPago: PaymentMethod;
    numeroComprobante?: string;
    observaciones?: string;
  }): Promise<{ payment: Payment; nuevoSaldoPendiente: number }> {
    const res = await fetch(`${API_BASE}/memberships/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ payment: Payment; nuevoSaldoPendiente: number }>(res);
  },

  async getPaymentsByMembershipId(membershipId: number): Promise<Payment[]> {
    const res = await fetch(`${API_BASE}/memberships/${membershipId}/payments`);
    return handleResponse<Payment[]>(res);
  }
};
