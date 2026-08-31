import { Client } from '../../domain/entities/Client.js';
import { ClientMembership } from '../../domain/entities/ClientMembership.js';
import { MembershipPlan } from '../../domain/entities/MembershipPlan.js';
import { Payment } from '../../domain/entities/Payment.js';
import { Attendance } from '../../domain/entities/Attendance.js';
import { CI } from '../../domain/value-objects/CI.js';
import { AccessDecision, TrafficLightColor } from '../../domain/value-objects/AccessStatus.js';

export function getInitialSeedData() {
  const now = new Date();

  // Helper para sumar/restar días
  const addDays = (d: Date, days: number) => {
    const res = new Date(d.getTime());
    res.setDate(res.getDate() + days);
    return res;
  };

  // 1. Planes del catálogo
  const plans: MembershipPlan[] = [
    new MembershipPlan({
      id: 1,
      nombrePlan: 'Mensual Estudiante',
      descripcion: 'Acceso total de lunes a sábado en horario diurno',
      precio: 180.0,
      duracionDias: 30,
      activo: true
    }),
    new MembershipPlan({
      id: 2,
      nombrePlan: 'Mensual Libre',
      descripcion: 'Acceso ilimitado a todas las áreas, musculación y cardio',
      precio: 250.0,
      duracionDias: 30,
      activo: true
    }),
    new MembershipPlan({
      id: 3,
      nombrePlan: 'Trimestral Full',
      descripcion: 'Acceso 90 días + 1 sesión de evaluación con entrenador',
      precio: 650.0,
      duracionDias: 90,
      activo: true
    }),
    new MembershipPlan({
      id: 4,
      nombrePlan: 'Anual VIP',
      descripcion: 'Acceso por 365 días + casillero + asesoría nutricional',
      precio: 2200.0,
      duracionDias: 365,
      activo: true
    })
  ];

  // 2. Clientes
  const clients: Client[] = [
    // Cliente 1: Carlos Mendoza -> VERDE (vigente 25 días, saldo 0)
    new Client({
      id: 1,
      nombre: 'Carlos',
      apellido: 'Mendoza',
      ci: new CI('5432101'),
      correo: 'carlos.mendoza@email.com',
      codigoSocio: 'GS-2026-0001',
      telefono: '71234567',
      contactoEmergencia: 'Laura Mendoza (Esposa)',
      telefonoEmergencia: '71234500',
      estadoMedico: 'Sin condiciones médicas preexistentes',
      activo: true
    }),
    // Cliente 2: Mariana Rios -> AMARILLO (próxima a vencer en 3 días, saldo 0)
    new Client({
      id: 2,
      nombre: 'Mariana',
      apellido: 'Rios',
      ci: new CI('5432102'),
      correo: 'mariana.rios@email.com',
      codigoSocio: 'GS-2026-0002',
      telefono: '72345678',
      contactoEmergencia: 'Patricia Rios (Madre)',
      telefonoEmergencia: '72345600',
      estadoMedico: 'Asma leve controlada',
      activo: true
    }),
    // Cliente 3: Roberto Fernandez -> AMARILLO (vigente por 20 días, saldo pendiente Bs. 100)
    new Client({
      id: 3,
      nombre: 'Roberto',
      apellido: 'Fernandez',
      ci: new CI('5432103'),
      correo: 'roberto.f@email.com',
      codigoSocio: 'GS-2026-0003',
      telefono: '73456789',
      contactoEmergencia: 'Andrea Gomez (Hermana)',
      telefonoEmergencia: '73456700',
      estadoMedico: 'Lesión previa en rodilla izquierda (meniscos)',
      activo: true
    }),
    // Cliente 4: Sofia Ortiz -> ROJO (vencida hace 10 días)
    new Client({
      id: 4,
      nombre: 'Sofia',
      apellido: 'Ortiz',
      ci: new CI('5432104'),
      correo: 'sofia.ortiz@email.com',
      codigoSocio: 'GS-2026-0004',
      telefono: '74567890',
      contactoEmergencia: 'Ernesto Ortiz (Padre)',
      telefonoEmergencia: '74567800',
      estadoMedico: 'Hipertensión en tratamiento',
      activo: true
    }),
    // Cliente 5: Juan Perez -> ROJO (Sin membresía activa)
    new Client({
      id: 5,
      nombre: 'Juan',
      apellido: 'Perez',
      ci: new CI('5432105'),
      correo: 'juan.perez@email.com',
      codigoSocio: 'GS-2026-0005',
      telefono: '75678901',
      contactoEmergencia: 'Claudia Perez (Esposa)',
      telefonoEmergencia: '75678900',
      estadoMedico: 'Apto para actividad física completa',
      activo: true
    })
  ];

  // 3. Membresías
  const memberships: ClientMembership[] = [
    // Carlos Mendoza: Mensual Libre (250 Bs, pagado 250, vence en +25 días) -> VERDE
    new ClientMembership({
      id: 1,
      idCliente: 1,
      idPlan: 2,
      planNombre: 'Mensual Libre',
      fechaInicio: addDays(now, -5),
      fechaVencimiento: addDays(now, 25),
      precioCongelado: 250.0,
      saldoPendiente: 0.0,
      estado: 'Activa'
    }),
    // Mariana Rios: Mensual Estudiante (180 Bs, pagado 180, vence en +3 días) -> AMARILLO (por vencer)
    new ClientMembership({
      id: 2,
      idCliente: 2,
      idPlan: 1,
      planNombre: 'Mensual Estudiante',
      fechaInicio: addDays(now, -27),
      fechaVencimiento: addDays(now, 3),
      precioCongelado: 180.0,
      saldoPendiente: 0.0,
      estado: 'Activa'
    }),
    // Roberto Fernandez: Mensual Libre (250 Bs, abonó 150, debe 100, vence en +20 días) -> AMARILLO (deuda)
    new ClientMembership({
      id: 3,
      idCliente: 3,
      idPlan: 2,
      planNombre: 'Mensual Libre',
      fechaInicio: addDays(now, -10),
      fechaVencimiento: addDays(now, 20),
      precioCongelado: 250.0,
      saldoPendiente: 100.0,
      estado: 'Activa'
    }),
    // Sofia Ortiz: Mensual Estudiante (venció hace 10 días) -> ROJO
    new ClientMembership({
      id: 4,
      idCliente: 4,
      idPlan: 1,
      planNombre: 'Mensual Estudiante',
      fechaInicio: addDays(now, -40),
      fechaVencimiento: addDays(now, -10),
      precioCongelado: 180.0,
      saldoPendiente: 0.0,
      estado: 'Vencida'
    })
  ];

  // 4. Pagos iniciales
  const payments: Payment[] = [
    new Payment({
      id: 1,
      idMembresia: 1,
      montoPagado: 250.0,
      fechaPago: addDays(now, -5),
      metodoPago: 'QR',
      numeroComprobante: 'QR-98231',
      observaciones: 'Pago completo mensual'
    }),
    new Payment({
      id: 2,
      idMembresia: 2,
      montoPagado: 180.0,
      fechaPago: addDays(now, -27),
      metodoPago: 'Efectivo',
      numeroComprobante: 'REC-0012',
      observaciones: 'Pago completo estudiante'
    }),
    new Payment({
      id: 3,
      idMembresia: 3,
      montoPagado: 150.0,
      fechaPago: addDays(now, -10),
      metodoPago: 'Tarjeta',
      numeroComprobante: 'POS-44812',
      observaciones: 'Pago parcial (Saldo Bs. 100 pendiente)'
    })
  ];

  // 5. Asistencias de prueba
  const attendances: Attendance[] = [
    new Attendance({
      id: 1,
      idCliente: 1,
      fechaHoraIngreso: addDays(now, -1),
      estadoAcceso: AccessDecision.PERMITIDO,
      colorSemaforo: TrafficLightColor.VERDE,
      motivo: 'Membresía activa y al día'
    }),
    new Attendance({
      id: 2,
      idCliente: 2,
      fechaHoraIngreso: addDays(now, -1),
      estadoAcceso: AccessDecision.ADVERTENCIA,
      colorSemaforo: TrafficLightColor.AMARILLO,
      motivo: 'Membresía próxima a vencer (quedan 4 días)'
    })
  ];

  return { plans, clients, memberships, payments, attendances };
}
