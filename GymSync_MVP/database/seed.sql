-- =============================================================================
-- GYMSYNC - Datos Iniciales de Prueba (Seed Data)
-- Casos de prueba para validación de Semáforo:
-- 1. VERDE: Carlos Mendoza (Membresía activa, vence en 25 días, saldo 0)
-- 2. AMARILLO (Vencimiento próximo): Mariana Rios (Vence en 3 días, saldo 0)
-- 3. AMARILLO (Deuda pendiente): Roberto Fernandez (Vigente 20 días, saldo pendiente Bs. 100)
-- 4. ROJO (Membresía vencida): Sofia Ortiz (Venció hace 10 días)
-- 5. ROJO (Sin membresía activa): Juan Perez (Registrado pero sin plan vigente)
-- =============================================================================

-- 1. USUARIOS
INSERT INTO USUARIO (id_usuario, nombre, apellido, ci_numero, correo, contrasena_hash, rol, activo) VALUES
(1, 'Admin', 'GymSync', '10000001', 'admin@gymsync.bo', '$2b$10$hashedAdminPassword', 'Admin', TRUE),
(2, 'Lucas', 'Torres', '10000002', 'lucas.torres@gymsync.bo', '$2b$10$hashedTrainerPassword', 'Entrenador', TRUE),
(3, 'Carlos', 'Mendoza', '5432101', 'carlos.mendoza@email.com', '$2b$10$hashedClient1', 'Cliente', TRUE),
(4, 'Mariana', 'Rios', '5432102', 'mariana.rios@email.com', '$2b$10$hashedClient2', 'Cliente', TRUE),
(5, 'Roberto', 'Fernandez', '5432103', 'roberto.f@email.com', '$2b$10$hashedClient3', 'Cliente', TRUE),
(6, 'Sofia', 'Ortiz', '5432104', 'sofia.ortiz@email.com', '$2b$10$hashedClient4', 'Cliente', TRUE),
(7, 'Juan', 'Perez', '5432105', 'juan.perez@email.com', '$2b$10$hashedClient5', 'Cliente', TRUE);

-- 2. ENTRENADORES
INSERT INTO ENTRENADOR (id_usuario, especialidad, turno) VALUES
(2, 'Musculación y Crossfit', 'Mañana');

-- 3. CLIENTES
INSERT INTO CLIENTE (id_usuario, codigo_socio, telefono, contacto_emergencia, telefono_emergencia, estado_medico) VALUES
(3, 'GS-2026-0001', '71234567', 'Laura Mendoza (Esposa)', '71234500', 'Sin condiciones médicas preexistentes'),
(4, 'GS-2026-0002', '72345678', 'Patricia Rios (Madre)', '72345600', 'Asma leve controlada'),
(5, 'GS-2026-0003', '73456789', 'Andrea Gomez (Hermana)', '73456700', 'Lesión previa en rodilla izquierda (meniscos)'),
(6, 'GS-2026-0004', '74567890', 'Ernesto Ortiz (Padre)', '74567800', 'Hipertensión en tratamiento'),
(7, 'GS-2026-0005', '75678901', 'Claudia Perez (Esposa)', '75678900', 'Apto para actividad física completa');

-- 4. PLANES DE MEMBRESÍA
INSERT INTO PLAN_MEMBRESIA (id_plan, nombre_plan, descripcion, precio, duracion_dias, activo) VALUES
(1, 'Mensual Estudiante', 'Acceso total de lunes a sábado en horario diurno', 180.00, 30, TRUE),
(2, 'Mensual Libre', 'Acceso ilimitado a todas las áreas, musculación y cardio', 250.00, 30, TRUE),
(3, 'Trimestral Full', 'Acceso 90 días + 1 sesión de evaluación con entrenador', 650.00, 90, TRUE),
(4, 'Anual VIP', 'Acceso por 365 días + casillero + asesoría nutricional', 2200.00, 365, TRUE);

-- 5. MEMBRESIAS DE CLIENTES
-- Caso 1: Carlos Mendoza -> VERDE (vigente hasta dentro de 25 días, saldo 0)
INSERT INTO MEMBRESIA_CLIENTE (id_membresia, id_cliente, id_plan, fecha_inicio, fecha_vencimiento, precio_congelado, saldo_pendiente, estado) VALUES
(1, 3, 2, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 250.00, 0.00, 'Activa');

-- Caso 2: Mariana Rios -> AMARILLO (próxima a vencer en 3 días, saldo 0)
INSERT INTO MEMBRESIA_CLIENTE (id_membresia, id_cliente, id_plan, fecha_inicio, fecha_vencimiento, precio_congelado, saldo_pendiente, estado) VALUES
(2, 4, 1, CURRENT_DATE - INTERVAL '27 days', CURRENT_DATE + INTERVAL '3 days', 180.00, 0.00, 'Activa');

-- Caso 3: Roberto Fernandez -> AMARILLO (vigente por 20 días pero saldo pendiente de 100 Bs)
INSERT INTO MEMBRESIA_CLIENTE (id_membresia, id_cliente, id_plan, fecha_inicio, fecha_vencimiento, precio_congelado, saldo_pendiente, estado) VALUES
(3, 5, 2, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 250.00, 100.00, 'Activa');

-- Caso 4: Sofia Ortiz -> ROJO (venció hace 10 días)
INSERT INTO MEMBRESIA_CLIENTE (id_membresia, id_cliente, id_plan, fecha_inicio, fecha_vencimiento, precio_congelado, saldo_pendiente, estado) VALUES
(4, 6, 1, CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '10 days', 180.00, 0.00, 'Vencida');

-- Caso 5: Juan Perez -> ROJO (Sin membresía activa)

-- 6. PAGOS
INSERT INTO PAGO (id_pago, id_membresia, monto_pagado, fecha_pago, metodo_pago, numero_comprobante, observaciones) VALUES
(1, 1, 250.00, CURRENT_TIMESTAMP - INTERVAL '5 days', 'QR', 'QR-98231', 'Pago completo mensual'),
(2, 2, 180.00, CURRENT_TIMESTAMP - INTERVAL '27 days', 'Efectivo', 'REC-0012', 'Pago completo estudiante'),
(3, 3, 150.00, CURRENT_TIMESTAMP - INTERVAL '10 days', 'Tarjeta', 'POS-44812', 'Pago parcial (Saldo Bs. 100 pendiente)');

-- 7. REGISTRO ASISTENCIAS RECIENTES
INSERT INTO REGISTRO_ASISTENCIA (id_asistencia, id_cliente, fecha_hora_ingreso, estado_acceso, color_semaforo, motivo) VALUES
(1, 3, CURRENT_TIMESTAMP - INTERVAL '1 day', 'Permitido', 'VERDE', 'Membresía activa y al día'),
(2, 4, CURRENT_TIMESTAMP - INTERVAL '1 day', 'Advertencia', 'AMARILLO', 'Membresía próxima a vencer (quedan 4 días)'),
(3, 5, CURRENT_TIMESTAMP - INTERVAL '2 days', 'Advertencia', 'AMARILLO', 'Acceso con saldo pendiente de Bs. 100.00');
