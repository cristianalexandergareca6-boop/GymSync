# Plan de Implementación Base - GymSync (MVP)

Este documento define la arquitectura técnica y el plan de implementación para la estructura base de **GymSync**, un sistema integral para la gestión y control de acceso de gimnasios con sistema visual de semáforo, basado en el PRD y las Historias de Usuario HU01 a HU07.

---

## 1. Arquitectura y Principios de Diseño

### 1.1 Clean Architecture y Principios SOLID
La solución se estructura separando responsabilidades en capas desacopladas:
- **Single Responsibility (SRP)**: Cada caso de uso, controlador, entidad y servicio realiza una única tarea bien definida.
- **Open/Closed (OCP)**: Lógica de semáforo y métodos de pago extensibles sin alterar el flujo central de acceso.
- **Liskov Substitution (LSP)**: Jerarquía de usuarios (`Usuario` -> `Cliente`, `Entrenador`) y repositorios intercambiables.
- **Interface Segregation (ISP)**: Interfaces granulares para repositorios (`IClientRepository`, `IMembershipRepository`, `IPaymentRepository`, `IAttendanceRepository`).
- **Dependency Inversion (DIP)**: La capa de dominio y aplicación depende exclusivamente de abstracciones (interfaces), desacoplada de frameworks web o drivers de base de datos.

### 1.2 Stack Tecnológico
- **Backend**: Node.js + Express + TypeScript con Clean Architecture y soporte para base de datos relacional (PostgreSQL / SQLite / SQL Server).
- **Frontend**: React (Vite) + TypeScript + Tailwind CSS + Lucide Icons, optimizado para recepción rápida y control de acceso.
- **Base de Datos**: Esquema 3FN relacional con estrategia de herencia *Joined Table* (`USUARIO`, `CLIENTE`, `ENTRENADOR`, `PLAN_MEMBRESIA`, `MEMBRESIA_CLIENTE`, `PAGO`, `REGISTRO_ASISTENCIA`).

---

## 2. Historias de Usuario Cubiertas (MVP)

| ID | Historia de Usuario | Regla / Lógica de Negocio |
| :--- | :--- | :--- |
| **HU01** | **Registrar Socio** | Validación de C.I. único (normativa SEGIP), generación automática de `codigo_socio` (ej. `GS-2026-0001`), registro de datos de contacto y estado médico sensible. |
| **HU02** | **Actualizar Socio** | Edición de teléfono, contacto de emergencia y observaciones médicas sin alterar el historial de membresías o asistencias. |
| **HU03** | **Registrar Membresía** | Selección de plan del catálogo, congelamiento del precio histórico (`precio_congelado`) y autocalculo de `fecha_vencimiento = fecha_inicio + duracion_dias`. |
| **HU04** | **Registrar Pago** | Pagos totales o parciales (Efectivo, Tarjeta, QR), recalculando y actualizando el `saldo_pendiente`. |
| **HU05** | **Consultar Estado** | Búsqueda indexada instantánea por C.I. o Código de Socio en tiempo real. |
| **HU06** | **Semáforo Visual** | Motor de reglas de acceso: <br>• **Verde**: Membresía vigente y sin deuda (`saldo_pendiente == 0`).<br>• **Amarillo**: Por vencer (3 a 5 días) o con deuda pendiente (`saldo_pendiente > 0`), pero aún vigente.<br>• **Rojo**: Membresía vencida, sin membresía activa o suspendida. |
| **HU07** | **Registrar Ingreso** | Botón de 1-clic para registrar entrada. Bloqueo automático (`403 Forbidden` / alerta roja) si el estado es Rojo. Registro de asistencia con fecha, hora y motivo en caso de acceso. |

---

## 3. Estructura de Archivos Propuesta

```
d:\GitHub\
├── PRD.md
├── README.md
├── database\
│   ├── schema.sql           # DDL relacional 3FN (PostgreSQL / SQL Server)
│   └── seed.sql             # Datos de prueba (planes, clientes verde/amarillo/rojo, pagos)
│
├── backend\
│   ├── src\
│   │   ├── domain\          # Entidades de dominio, Reglas de Semáforo e Interfaces
│   │   │   ├── entities\
│   │   │   │   ├── User.ts
│   │   │   │   ├── Client.ts
│   │   │   │   ├── MembershipPlan.ts
│   │   │   │   ├── ClientMembership.ts
│   │   │   │   ├── Payment.ts
│   │   │   │   └── Attendance.ts
│   │   │   ├── value-objects\
│   │   │   │   ├── CI.ts
│   │   │   │   └── AccessStatus.ts   # Enum y tipo Verde / Amarillo / Rojo
│   │   │   ├── services\
│   │   │   │   └── AccessControlEvaluator.ts # Algoritmo central del Semáforo (HU06)
│   │   │   └── repositories\
│   │   │       ├── IClientRepository.ts
│   │   │       ├── IMembershipRepository.ts
│   │   │       ├── IPaymentRepository.ts
│   │   │       └── IAttendanceRepository.ts
│   │   ├── application\     # Casos de Uso (HU01 - HU07) y DTOs
│   │   │   ├── dtos\
│   │   │   │   ├── ClientDTOs.ts
│   │   │   │   ├── MembershipDTOs.ts
│   │   │   │   └── AttendanceDTOs.ts
│   │   │   └── use-cases\
│   │   │       ├── RegisterClientUseCase.ts       # HU01
│   │   │       ├── UpdateClientUseCase.ts         # HU02
│   │   │       ├── CreateMembershipUseCase.ts     # HU03
│   │   │       ├── RegisterPaymentUseCase.ts      # HU04
│   │   │       ├── GetClientAccessStatusUseCase.ts# HU05 & HU06
│   │   │       └── RegisterAttendanceUseCase.ts   # HU07
│   │   ├── infrastructure\  # Repositorios en memoria / base de datos y adaptadores
│   │   │   ├── database\
│   │   │   │   └── db.ts
│   │   │   └── repositories\
│   │   │       ├── InMemoryClientRepository.ts
│   │   │       ├── InMemoryMembershipRepository.ts
│   │   │       ├── InMemoryPaymentRepository.ts
│   │   │       └── InMemoryAttendanceRepository.ts
│   │   ├── presentation\    # Controladores REST y Rutas
│   │   │   ├── controllers\
│   │   │   │   ├── ClientController.ts
│   │   │   │   ├── MembershipController.ts
│   │   │   │   └── AccessController.ts
│   │   │   ├── routes\
│   │   │   │   ├── clientRoutes.ts
│   │   │   │   ├── membershipRoutes.ts
│   │   │   │   └── accessRoutes.ts
│   │   │   └── middlewares\
│   │   │       └── errorHandler.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend\
    ├── src\
    │   ├── components\      # Componentes UI reutilizables (Semáforo Badge, Modal, Layout)
    │   │   ├── Navbar.tsx
    │   │   ├── TrafficLightBadge.tsx
    │   │   ├── Modal.tsx
    │   │   └── StatCard.tsx
    │   ├── features\
    │   │   ├── access-control\  # HU05, HU06, HU07: Módulo Semáforo y Check-in Rápido
    │   │   │   ├── AccessControlPage.tsx
    │   │   │   ├── TrafficLightDisplay.tsx
    │   │   │   └── QuickCheckInBar.tsx
    │   │   ├── clients\         # HU01, HU02: Lista y Registro de Socios
    │   │   │   ├── ClientsPage.tsx
    │   │   │   ├── ClientFormModal.tsx
    │   │   │   └── ClientDetailModal.tsx
    │   │   └── memberships\     # HU03, HU04: Planes, Membresías y Pagos
    │   │       ├── MembershipsPage.tsx
    │   │       ├── NewMembershipModal.tsx
    │   │       └── PaymentModal.tsx
    │   ├── services\        # Cliente HTTP API
    │   │   └── api.ts
    │   ├── types\           # Tipos TypeScript compartidos en Frontend
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 4. Plan de Verificación

### 4.1 Pruebas Automatizadas
1. **Pruebas Unitarias de Reglas de Negocio (Domain Services & Use Cases)**:
   - Semáforo Verde: socio con membresía activa y saldo 0.
   - Semáforo Amarillo: socio con fecha próxima a vencer (≤ 5 días) o con deuda pendiente (`saldo_pendiente > 0`).
   - Semáforo Rojo: socio con membresía vencida o inactiva.
   - Control de Acceso: Bloqueo de registro de ingreso para socios en estado Rojo.
   - Cálculo automático de fecha de vencimiento (`fecha_inicio + duracion_dias`).
   - Registro de pago parcial y actualización correcta del saldo pendiente.

### 4.2 Verificación de Construcción y Ejecución
- Compilación TypeScript exitosa en Backend (`npm run build`).
- Compilación de Frontend Vite (`npm run build`).
- Verificación del servidor de Backend respondiendo a endpoints REST (`/api/access/status/:query`, `/api/access/check-in`, `/api/clients`, `/api/memberships`, `/api/payments`).
- Interfaz web interactiva ejecutándose y permitiendo probar el flujo de las 7 historias de usuario.
