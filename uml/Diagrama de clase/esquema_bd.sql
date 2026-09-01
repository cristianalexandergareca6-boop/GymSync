-- ============================================================================
-- PROYECTO: GymSync - Sistema de Gestión de Gimnasios
-- ACTIVIDAD 8: Diseño de la Arquitectura de Datos y Normalización
-- ============================================================================

-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'GymSyncDB')
BEGIN
    CREATE DATABASE GymSyncDB;
END;
GO

USE GymSyncDB;
GO

-- ============================================================================
-- 1. TABLAS DE USUARIO Y HERENCIA (ESTRATEGIA JOINED / TABLA POR SUBCLASE)
-- ============================================================================

-- Tabla Base: USUARIO
CREATE TABLE USUARIO (
    id_usuario INT IDENTITY(1,1) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    ci_numero VARCHAR(15) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    contrasena_hash VARCHAR(256) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE(),

    -- Restricciones
    CONSTRAINT PK_USUARIO PRIMARY KEY (id_usuario),
    CONSTRAINT UQ_USUARIO_CI UNIQUE (ci_numero),
    CONSTRAINT UQ_USUARIO_CORREO UNIQUE (correo),
    CONSTRAINT CK_USUARIO_ROL CHECK (rol IN ('ADMIN', 'ENTRENADOR', 'CLIENTE'))
);
GO

-- Subclase: CLIENTE
CREATE TABLE CLIENTE (
    id_cliente INT NOT NULL,
    telefono VARCHAR(20) NULL,
    contacto_emergencia VARCHAR(20) NULL,
    estado_medico VARCHAR(255) NULL,

    -- Restricciones y Herencia (PK/FK 1:1 con USUARIO)
    CONSTRAINT PK_CLIENTE PRIMARY KEY (id_cliente),
    CONSTRAINT FK_CLIENTE_USUARIO FOREIGN KEY (id_cliente) 
        REFERENCES USUARIO(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);
GO

-- Subclase: ENTRENADOR
CREATE TABLE ENTRENADOR (
    id_entrenador INT NOT NULL,
    especialidad VARCHAR(50) NOT NULL,
    turno VARCHAR(20) NOT NULL,

    -- Restricciones y Herencia (PK/FK 1:1 con USUARIO)
    CONSTRAINT PK_ENTRENADOR PRIMARY KEY (id_entrenador),
    CONSTRAINT FK_ENTRENADOR_USUARIO FOREIGN KEY (id_entrenador) 
        REFERENCES USUARIO(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT CK_ENTRENADOR_TURNO CHECK (turno IN ('Mañana', 'Tarde', 'Noche'))
);
GO

-- ============================================================================
-- 2. TABLAS DE PLANES Y MEMBRESÍAS
-- ============================================================================

-- Tabla: PLAN_MEMBRESIA
CREATE TABLE PLAN_MEMBRESIA (
    id_plan INT IDENTITY(1,1) NOT NULL,
    nombre_plan VARCHAR(50) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    duracion_dias INT NOT NULL,

    -- Restricciones
    CONSTRAINT PK_PLAN_MEMBRESIA PRIMARY KEY (id_plan),
    CONSTRAINT UQ_PLAN_NOMBRE UNIQUE (nombre_plan),
    CONSTRAINT CK_PLAN_PRECIO CHECK (precio > 0),
    CONSTRAINT CK_PLAN_DURACION CHECK (duracion_dias > 0)
);
GO

-- Tabla: MEMBRESIA_CLIENTE
CREATE TABLE MEMBRESIA_CLIENTE (
    id_membresia INT IDENTITY(1,1) NOT NULL,
    id_cliente INT NOT NULL,
    id_plan INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(15) NOT NULL,

    -- Restricciones y Claves Ajenas
    CONSTRAINT PK_MEMBRESIA_CLIENTE PRIMARY KEY (id_membresia),
    CONSTRAINT FK_MEMBRESIA_CLIENTE FOREIGN KEY (id_cliente) 
        REFERENCES CLIENTE(id_cliente),
    CONSTRAINT FK_MEMBRESIA_PLAN FOREIGN KEY (id_plan) 
        REFERENCES PLAN_MEMBRESIA(id_plan),
    CONSTRAINT CK_MEMBRESIA_ESTADO CHECK (estado IN ('Activa', 'Vencida', 'Suspendida'))
);
GO

-- ============================================================================
-- 3. TABLA DE CONTROL DE ASISTENCIA
-- ============================================================================

-- Tabla: REGISTRO_ASISTENCIA
CREATE TABLE REGISTRO_ASISTENCIA (
    id_asistencia INT IDENTITY(1,1) NOT NULL,
    id_cliente INT NOT NULL,
    fecha_hora_ingreso DATETIME NOT NULL DEFAULT GETDATE(),

    -- Restricciones
    CONSTRAINT PK_REGISTRO_ASISTENCIA PRIMARY KEY (id_asistencia),
    CONSTRAINT FK_ASISTENCIA_CLIENTE FOREIGN KEY (id_cliente) 
        REFERENCES CLIENTE(id_cliente)
);
GO

-- ============================================================================
-- 4. TABLA DE TRANSACCIONES Y PAGOS
-- ============================================================================

-- Tabla: PAGO
CREATE TABLE PAGO (
    id_pago INT IDENTITY(1,1) NOT NULL,
    id_cliente INT NOT NULL,
    id_membresia INT NOT NULL,
    monto_pagado DECIMAL(10,2) NOT NULL,
    fecha_pago DATETIME NOT NULL DEFAULT GETDATE(),
    metodo_pago VARCHAR(20) NOT NULL,

    -- Restricciones
    CONSTRAINT PK_PAGO PRIMARY KEY (id_pago),
    CONSTRAINT FK_PAGO_CLIENTE FOREIGN KEY (id_cliente) 
        REFERENCES CLIENTE(id_cliente),
    CONSTRAINT FK_PAGO_MEMBRESIA FOREIGN KEY (id_membresia) 
        REFERENCES MEMBRESIA_CLIENTE(id_membresia),
    CONSTRAINT CK_PAGO_MONTO CHECK (monto_pagado > 0),
    CONSTRAINT CK_PAGO_METODO CHECK (metodo_pago IN ('Efectivo', 'Tarjeta', 'QR'))
);
GO

-- ============================================================================
-- 5. TABLAS DE RUTINAS Y EJERCICIOS
-- ============================================================================

-- Tabla: EJERCICIO
CREATE TABLE EJERCICIO (
    id_ejercicio INT IDENTITY(1,1) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    grupo_muscular VARCHAR(50) NOT NULL,

    -- Restricciones
    CONSTRAINT PK_EJERCICIO PRIMARY KEY (id_ejercicio),
    CONSTRAINT UQ_EJERCICIO_NOMBRE UNIQUE (nombre)
);
GO

-- Tabla: RUTINA
CREATE TABLE RUTINA (
    id_rutina INT IDENTITY(1,1) NOT NULL,
    nombre_rutina VARCHAR(100) NOT NULL,
    id_cliente INT NOT NULL,
    id_entrenador INT NOT NULL,
    fecha_creacion DATE NOT NULL DEFAULT GETDATE(),

    -- Restricciones
    CONSTRAINT PK_RUTINA PRIMARY KEY (id_rutina),
    CONSTRAINT FK_RUTINA_CLIENTE FOREIGN KEY (id_cliente) 
        REFERENCES CLIENTE(id_cliente),
    CONSTRAINT FK_RUTINA_ENTRENADOR FOREIGN KEY (id_entrenador) 
        REFERENCES ENTRENADOR(id_entrenador)
);
GO

-- Tabla Intermedia M:N: DETALLE_RUTINA
CREATE TABLE DETALLE_RUTINA (
    id_rutina INT NOT NULL,
    id_ejercicio INT NOT NULL,
    series INT NOT NULL,
    repeticiones INT NOT NULL,
    descanso_segundos INT NULL,

    -- Clave Primaria Compuesta
    CONSTRAINT PK_DETALLE_RUTINA PRIMARY KEY (id_rutina, id_ejercicio),
    
    -- Claves Ajenas
    CONSTRAINT FK_DETALLE_RUTINA FOREIGN KEY (id_rutina) 
        REFERENCES RUTINA(id_rutina) ON DELETE CASCADE,
    CONSTRAINT FK_DETALLE_EJERCICIO FOREIGN KEY (id_ejercicio) 
        REFERENCES EJERCICIO(id_ejercicio),
        
    -- Validaciones de Dominio
    CONSTRAINT CK_DETALLE_SERIES CHECK (series > 0),
    CONSTRAINT CK_DETALLE_REPETICIONES CHECK (repeticiones > 0)
);
GO
