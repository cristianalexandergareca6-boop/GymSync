import { test, describe } from 'node:test';
import assert from 'node:assert';

import { InMemoryClientRepository } from '../src/infrastructure/repositories/InMemoryClientRepository.js';
import { InMemoryMembershipRepository } from '../src/infrastructure/repositories/InMemoryMembershipRepository.js';
import { InMemoryPaymentRepository } from '../src/infrastructure/repositories/InMemoryPaymentRepository.js';
import { InMemoryAttendanceRepository } from '../src/infrastructure/repositories/InMemoryAttendanceRepository.js';

import { RegisterClientUseCase } from '../src/application/use-cases/RegisterClientUseCase.js';
import { UpdateClientUseCase } from '../src/application/use-cases/UpdateClientUseCase.js';
import { CreateMembershipUseCase } from '../src/application/use-cases/CreateMembershipUseCase.js';
import { RegisterPaymentUseCase } from '../src/application/use-cases/RegisterPaymentUseCase.js';
import { GetClientAccessStatusUseCase } from '../src/application/use-cases/GetClientAccessStatusUseCase.js';
import { RegisterAttendanceUseCase } from '../src/application/use-cases/RegisterAttendanceUseCase.js';

import { MembershipPlan } from '../src/domain/entities/MembershipPlan.js';
import { TrafficLightColor } from '../src/domain/value-objects/AccessStatus.js';

describe('GymSync Casos de Uso (HU01 - HU07)', () => {
  // Configuración de repositorios limpios para el test
  const clientRepo = new InMemoryClientRepository();
  const membershipRepo = new InMemoryMembershipRepository([
    new MembershipPlan({
      id: 1,
      nombrePlan: 'Mensual Estándar',
      precio: 200,
      duracionDias: 30,
      activo: true
    })
  ]);
  const paymentRepo = new InMemoryPaymentRepository();
  const attendanceRepo = new InMemoryAttendanceRepository();

  const registerClientUC = new RegisterClientUseCase(clientRepo);
  const updateClientUC = new UpdateClientUseCase(clientRepo);
  const createMembershipUC = new CreateMembershipUseCase(clientRepo, membershipRepo, paymentRepo);
  const registerPaymentUC = new RegisterPaymentUseCase(membershipRepo, paymentRepo);
  const getStatusUC = new GetClientAccessStatusUseCase(clientRepo, membershipRepo);
  const registerAttendanceUC = new RegisterAttendanceUseCase(clientRepo, membershipRepo, attendanceRepo);

  let createdClientId: number;
  let createdMembershipId: number;

  test('HU01: Debe registrar un socio exitosamente y generar código de socio único', async () => {
    const client = await registerClientUC.execute({
      nombre: 'Elena',
      apellido: 'Vargas',
      ci: '7654321',
      correo: 'elena.vargas@email.com',
      telefono: '78912345',
      contactoEmergencia: 'Mario Vargas',
      estadoMedico: 'Ninguno'
    });

    assert.ok(client.id);
    createdClientId = client.id;
    assert.strictEqual(client.ci, '7654321');
    assert.ok(client.codigoSocio.startsWith('GS-'));
  });

  test('HU01: Debe rechazar el registro si el C.I. ya existe', async () => {
    await assert.rejects(
      async () => {
        await registerClientUC.execute({
          nombre: 'Elena Duplicada',
          apellido: 'Vargas',
          ci: '7654321'
        });
      },
      /ya existe un socio registrado con el C\.I\./i
    );
  });

  test('HU02: Debe actualizar datos de contacto y estado médico sin alterar el C.I.', async () => {
    const updated = await updateClientUC.execute({
      id: createdClientId,
      telefono: '79999999',
      estadoMedico: 'Alergia a la penicilina'
    });

    assert.strictEqual(updated.telefono, '79999999');
    assert.strictEqual(updated.estadoMedico, 'Alergia a la penicilina');
    assert.strictEqual(updated.ci, '7654321');
  });

  test('HU03 & HU04: Debe crear membresía con pago parcial y calcular vencimiento', async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const membership = await createMembershipUC.execute({
      idCliente: createdClientId,
      idPlan: 1, // Precio 200, 30 días
      fechaInicio: todayStr,
      montoPagoInicial: 120, // Pago parcial
      metodoPagoInicial: 'QR',
      numeroComprobante: 'QR-TEST-001'
    });

    assert.ok(membership.id);
    createdMembershipId = membership.id;
    assert.strictEqual(membership.precioCongelado, 200);
    assert.strictEqual(membership.saldoPendiente, 80); // 200 - 120
    assert.strictEqual(membership.diasRestantes, 30);
  });

  test('HU05 & HU06: Debe consultar estado por C.I. y retornar semáforo AMARILLO (por deuda)', async () => {
    const status = await getStatusUC.execute('7654321');

    assert.strictEqual(status.cliente.id, createdClientId);
    assert.strictEqual(status.evaluacion.color, TrafficLightColor.AMARILLO);
    assert.strictEqual(status.evaluacion.pendingBalance, 80);
    assert.strictEqual(status.evaluacion.isAllowed, true);
  });

  test('HU04: Debe registrar el pago del saldo restante y actualizar a 0', async () => {
    const result = await registerPaymentUC.execute({
      idMembresia: createdMembershipId,
      monto: 80,
      metodoPago: 'Efectivo',
      numeroComprobante: 'REC-TEST-99'
    });

    assert.strictEqual(result.nuevoSaldoPendiente, 0);

    // Ahora la consulta de estado debe dar VERDE
    const status = await getStatusUC.execute('7654321');
    assert.strictEqual(status.evaluacion.color, TrafficLightColor.VERDE);
    assert.strictEqual(status.evaluacion.pendingBalance, 0);
  });

  test('HU07: Debe registrar ingreso de 1-clic exitosamente', async () => {
    const checkIn = await registerAttendanceUC.execute({
      idCliente: createdClientId
    });

    assert.ok(checkIn.id);
    assert.strictEqual(checkIn.colorSemaforo, TrafficLightColor.VERDE);
    assert.strictEqual(checkIn.estadoAcceso, 'Permitido');
  });

  test('HU07: Debe bloquear automáticamente el ingreso si el socio está en ROJO', async () => {
    // Registramos un socio sin membresía
    const clientSinPlan = await registerClientUC.execute({
      nombre: 'Pedro',
      apellido: 'SinPlan',
      ci: '11223344'
    });

    await assert.rejects(
      async () => {
        await registerAttendanceUC.execute({
          idCliente: clientSinPlan.id
        });
      },
      /ACCESO DENEGADO/i
    );
  });
});
