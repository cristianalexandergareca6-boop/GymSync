import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AccessControlEvaluator } from '../src/domain/services/AccessControlEvaluator.js';
import { ClientMembership } from '../src/domain/entities/ClientMembership.js';
import { AccessDecision, TrafficLightColor } from '../src/domain/value-objects/AccessStatus.js';

describe('AccessControlEvaluator (Motor de Semáforo - HU06)', () => {
  const evaluator = new AccessControlEvaluator({ warningDaysThreshold: 5 });
  const referenceDate = new Date('2026-08-25T12:00:00Z');

  test('Debe devolver ROJO y bloqueo si no hay membresía activa', () => {
    const result = evaluator.evaluate(null, referenceDate);
    assert.strictEqual(result.color, TrafficLightColor.ROJO);
    assert.strictEqual(result.decision, AccessDecision.BLOQUEADO);
    assert.strictEqual(result.isAllowed, false);
    assert.match(result.message, /no cuenta con ninguna membresía/i);
  });

  test('Debe devolver VERDE si la membresía está al día y con más de 5 días restantes', () => {
    const membership = new ClientMembership({
      id: 1,
      idCliente: 10,
      idPlan: 1,
      planNombre: 'Mensual Libre',
      fechaInicio: new Date('2026-08-01T12:00:00Z'),
      fechaVencimiento: new Date('2026-09-15T12:00:00Z'), // Quedan 21 días
      precioCongelado: 250,
      saldoPendiente: 0,
      estado: 'Activa'
    });

    const result = evaluator.evaluate(membership, referenceDate);
    assert.strictEqual(result.color, TrafficLightColor.VERDE);
    assert.strictEqual(result.decision, AccessDecision.PERMITIDO);
    assert.strictEqual(result.isAllowed, true);
    assert.strictEqual(result.pendingBalance, 0);
    assert.ok(result.daysRemaining > 5);
  });

  test('Debe devolver AMARILLO (Advertencia) si vence en 3 días (próxima a vencer)', () => {
    const membership = new ClientMembership({
      id: 2,
      idCliente: 11,
      idPlan: 1,
      planNombre: 'Mensual Estudiante',
      fechaInicio: new Date('2026-07-28T12:00:00Z'),
      fechaVencimiento: new Date('2026-08-28T12:00:00Z'), // Quedan 3 días
      precioCongelado: 180,
      saldoPendiente: 0,
      estado: 'Activa'
    });

    const result = evaluator.evaluate(membership, referenceDate);
    assert.strictEqual(result.color, TrafficLightColor.AMARILLO);
    assert.strictEqual(result.decision, AccessDecision.ADVERTENCIA);
    assert.strictEqual(result.isAllowed, true);
    assert.match(result.message, /por vencer/i);
  });

  test('Debe devolver AMARILLO (Advertencia) si tiene saldo pendiente mayor a 0 aunque falten 20 días', () => {
    const membership = new ClientMembership({
      id: 3,
      idCliente: 12,
      idPlan: 2,
      planNombre: 'Mensual Libre',
      fechaInicio: new Date('2026-08-15T12:00:00Z'),
      fechaVencimiento: new Date('2026-09-15T12:00:00Z'), // Quedan 21 días
      precioCongelado: 250,
      saldoPendiente: 100, // Deuda de Bs. 100
      estado: 'Activa'
    });

    const result = evaluator.evaluate(membership, referenceDate);
    assert.strictEqual(result.color, TrafficLightColor.AMARILLO);
    assert.strictEqual(result.decision, AccessDecision.ADVERTENCIA);
    assert.strictEqual(result.isAllowed, true);
    assert.strictEqual(result.pendingBalance, 100);
    assert.match(result.message, /saldo pendiente/i);
  });

  test('Debe devolver ROJO y Bloqueo si la membresía ya venció', () => {
    const membership = new ClientMembership({
      id: 4,
      idCliente: 13,
      idPlan: 1,
      planNombre: 'Mensual Estudiante',
      fechaInicio: new Date('2026-07-01T12:00:00Z'),
      fechaVencimiento: new Date('2026-08-01T12:00:00Z'), // Venció hace 24 días
      precioCongelado: 180,
      saldoPendiente: 0,
      estado: 'Vencida'
    });

    const result = evaluator.evaluate(membership, referenceDate);
    assert.strictEqual(result.color, TrafficLightColor.ROJO);
    assert.strictEqual(result.decision, AccessDecision.BLOQUEADO);
    assert.strictEqual(result.isAllowed, false);
    assert.match(result.message, /vencida/i);
  });
});
