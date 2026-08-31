-- =============================================================================
-- GYMSYNC - Esquema de Base de Datos Relacional (Tercera Forma Normal - 3FN)
-- Estrategia de Herencia: Joined Table (Tabla por Subclase)
-- Compatible con PostgreSQL y Microsoft SQL Server
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLA: USUARIO (Entidad Base)
-- -----------------------------------------------------------------------------
CREATE TABLE USUARIO (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    ci_numero VARCHAR(20) NOT NULL UNIQUE, -- Identificador único nacional (SEGIP)
    correo VARCHAR(150) UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('Admin', 'Entrenador', 'Cliente', 'Recepcionista')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuario_ci ON USUARIO(ci_numero);
CREATE INDEX idx_usuario_correo ON USUARIO(correo);

-- -----------------------------------------------------------------------------
-- 2. TABLA: CLIENTE (Subclase de USUARIO)
-- -----------------------------------------------------------------------------
CREATE TABLE CLIENTE (
    id_usuario INT PRIMARY KEY REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    codigo_socio VARCHAR(30) NOT NULL UNIQUE, -- Código autogenerado único (ej: GS-2026-0001)
    telefono VARCHAR(25),
    contacto_emergencia VARCHAR(150),
    telefono_emergencia VARCHAR(25),
    estado_medico TEXT -- Datos sensibles de salud (alergias, lesiones, condiciones cardíacas)
);

CREATE INDEX idx_cliente_codigo ON CLIENTE(codigo_socio);

-- -----------------------------------------------------------------------------
-- 3. TABLA: ENTRENADOR (Subclase de USUARIO)
-- -----------------------------------------------------------------------------
CREATE TABLE ENTRENADOR (
    id_usuario INT PRIMARY KEY REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    especialidad VARCHAR(100) NOT NULL,
    turno VARCHAR(50) NOT NULL -- Ej: Mañana, Tarde, Noche
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: PLAN_MEMBRESIA (Catálogo de Servicios)
-- -----------------------------------------------------------------------------
CREATE TABLE PLAN_MEMBRESIA (
    id_plan SERIAL PRIMARY KEY,
    nombre_plan VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    duracion_dias INT NOT NULL CHECK (duracion_dias > 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- -----------------------------------------------------------------------------
-- 5. TABLA: MEMBRESIA_CLIENTE (Relación M:N Cliente-Plan con vigencia y saldo)
-- -----------------------------------------------------------------------------
CREATE TABLE MEMBRESIA_CLIENTE (
    id_membresia SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL REFERENCES CLIENTE(id_usuario) ON DELETE RESTRICT,
    id_plan INT NOT NULL REFERENCES PLAN_MEMBRESIA(id_plan) ON DELETE RESTRICT,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL, -- Calculado: fecha_inicio + duracion_dias
    precio_congelado NUMERIC(10, 2) NOT NULL CHECK (precio_congelado >= 0), -- Fidelidad histórica de precio
    saldo_pendiente NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (saldo_pendiente >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Vencida', 'Suspendida', 'Cancelada')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_membresia_cliente ON MEMBRESIA_CLIENTE(id_cliente);
CREATE INDEX idx_membresia_vencimiento ON MEMBRESIA_CLIENTE(fecha_vencimiento);
CREATE INDEX idx_membresia_estado ON MEMBRESIA_CLIENTE(estado);

-- -----------------------------------------------------------------------------
-- 6. TABLA: PAGO (Registro Transaccional de Pagos Totales y Parciales)
-- -----------------------------------------------------------------------------
CREATE TABLE PAGO (
    id_pago SERIAL PRIMARY KEY,
    id_membresia INT NOT NULL REFERENCES MEMBRESIA_CLIENTE(id_membresia) ON DELETE RESTRICT,
    monto_pagado NUMERIC(10, 2) NOT NULL CHECK (monto_pagado > 0),
    fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(30) NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Tarjeta', 'QR', 'Transferencia')),
    numero_comprobante VARCHAR(50),
    observaciones TEXT
);

CREATE INDEX idx_pago_membresia ON PAGO(id_membresia);
CREATE INDEX idx_pago_fecha ON PAGO(fecha_pago);

-- -----------------------------------------------------------------------------
-- 7. TABLA: REGISTRO_ASISTENCIA (Control de Accesos / Semáforo)
-- -----------------------------------------------------------------------------
CREATE TABLE REGISTRO_ASISTENCIA (
    id_asistencia SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL REFERENCES CLIENTE(id_usuario) ON DELETE RESTRICT,
    fecha_hora_ingreso TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_acceso VARCHAR(20) NOT NULL CHECK (estado_acceso IN ('Permitido', 'Bloqueado', 'Advertencia')),
    color_semaforo VARCHAR(15) NOT NULL CHECK (color_semaforo IN ('VERDE', 'AMARILLO', 'ROJO')),
    motivo VARCHAR(255) -- Ej: "Membresía al día", "Deuda pendiente Bs. 50", "Membresía vencida hace 3 días"
);

CREATE INDEX idx_asistencia_cliente ON REGISTRO_ASISTENCIA(id_cliente);
CREATE INDEX idx_asistencia_fecha ON REGISTRO_ASISTENCIA(fecha_hora_ingreso);

-- -----------------------------------------------------------------------------
-- 8. TABLA: RUTINA / EJERCICIO (Módulo complementario para entrenamientos)
-- -----------------------------------------------------------------------------
CREATE TABLE RUTINA (
    id_rutina SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL REFERENCES CLIENTE(id_usuario) ON DELETE CASCADE,
    id_entrenador INT REFERENCES ENTRENADOR(id_usuario) ON DELETE SET NULL,
    nombre_rutina VARCHAR(100) NOT NULL,
    objetivo VARCHAR(150),
    fecha_asignacion DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE EJERCICIO_RUTINA (
    id_ejercicio SERIAL PRIMARY KEY,
    id_rutina INT NOT NULL REFERENCES RUTINA(id_rutina) ON DELETE CASCADE,
    nombre_ejercicio VARCHAR(100) NOT NULL,
    grupo_muscular VARCHAR(50),
    series INT NOT NULL,
    repeticiones VARCHAR(50) NOT NULL,
    descanso_segundos INT,
    observaciones TEXT
);
