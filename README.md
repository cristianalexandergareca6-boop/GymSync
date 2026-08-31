# 🏋️ GymSync - Sistema de Gestión y Control de Acceso para Gimnasios

**GymSync** es una solución integral diseñada para digitalizar y centralizar la administración de gimnasios, optimizando el control de membresías y accesos mediante un sistema de alertas visuales en semáforo (**Verde, Amarillo y Rojo**).

Este proyecto implementa la arquitectura base para el MVP (Sprint 1) respondiendo a las Historias de Usuario **HU01 a HU07** definidas en el [`PRD.md`](./PRD.md).

---

## 🏛️ Arquitectura y Principios SOLID

El proyecto sigue estrictamente los principios de **Clean Architecture** (Arquitectura Limpia) y **SOLID**:

```
d:\GitHub\
├── PRD.md                       # Especificación de Requerimientos del Producto
├── database\                    # Esquema y datos relacionales 3FN
│   ├── schema.sql               # DDL relacional (PostgreSQL / SQL Server)
│   └── seed.sql                 # Datos de prueba para casos de semáforo
├── backend\                     # Servidor Node.js + Express + TypeScript (Clean Architecture)
│   ├── src\
│   │   ├── domain\              # Entidades, Value Objects, Servicios de Dominio e Interfaces
│   │   │   ├── entities\        # User, Client, Trainer, MembershipPlan, ClientMembership, Payment, Attendance
│   │   │   ├── value-objects\   # CI (norma SEGIP), AccessStatus (Semáforo)
│   │   │   ├── services\        # AccessControlEvaluator (Lógica Verde/Amarillo/Rojo)
│   │   │   └── repositories\   # IClientRepository, IMembershipRepository, IPaymentRepository, IAttendanceRepository
│   │   ├── application\         # Casos de Uso (HU01 - HU07) y DTOs
│   │   │   ├── dtos\
│   │   │   └── use-cases\       # RegisterClient, UpdateClient, CreateMembership, RegisterPayment, GetAccessStatus, RegisterAttendance
│   │   ├── infrastructure\      # Implementaciones de Repositorios (In-Memory / Base de datos) y Seed
│   │   │   ├── database\
│   │   │   └── repositories\
│   │   └── presentation\        # Controladores REST, Rutas y Middleware de Errores
│   │       ├── controllers\
│   │       ├── routes\
│   │       └── middlewares\
│   └── tests\                   # Pruebas Unitarias de Casos de Uso y Semáforo (Node Test Runner)
└── frontend\                    # Aplicación Web React + Vite + Tailwind CSS + Lucide
    └── src\
        ├── components\          # Navbar, TrafficLightBadge, Modal, StatCard
        ├── features\
        │   ├── access-control\  # Semáforo de Acceso y Check-in 1-Clic (HU05, HU06, HU07)
        │   ├── clients\         # Registro y Edición de Socios (HU01, HU02)
        │   └── memberships\     # Planes, Membresías y Pagos Parciales (HU03, HU04)
        └── services\            # Cliente API HTTP
```

### Principios SOLID Aplicados:
1. **Single Responsibility Principle (SRP)**: Cada caso de uso (`RegisterClientUseCase`, `RegisterAttendanceUseCase`, `RegisterPaymentUseCase`) tiene una única responsabilidad aislada.
2. **Open/Closed Principle (OCP)**: El motor del semáforo (`AccessControlEvaluator`) permite agregar nuevas reglas o umbrales sin modificar la entidad central `ClientMembership`.
3. **Liskov Substitution Principle (LSP)**: `Client` y `Trainer` heredan de `User` y son tratados polimórficamente bajo el modelo de *Joined Table Inheritance*.
4. **Interface Segregation Principle (ISP)**: Interfaces granulares para repositorios (`IClientRepository`, `IMembershipRepository`, `IPaymentRepository`, `IAttendanceRepository`).
5. **Dependency Inversion Principle (DIP)**: Los casos de uso y controladores dependen de interfaces abstractas, permitiendo intercambiar repositorios (memoria, PostgreSQL, SQLite, SQL Server) sin tocar la lógica de negocio.

---

## 🚦 Reglas de Negocio del Semáforo (HU06, HU07)

| Color Semáforo | Condición de Negocio | Decisión de Acceso | Acción en HU07 |
| :--- | :--- | :--- | :--- |
| 🟢 **VERDE** | Membresía activa, vigente (> 5 días restantes) y saldo al día (Bs. 0). | **Permitido** | Registra asistencia en 1 clic. |
| 🟡 **AMARILLO** | Membresía vigente pero por vencer (≤ 5 días) o con deuda pendiente (`saldo_pendiente > 0`). | **Advertencia** | Permite ingreso y alerta el motivo en pantalla. |
| 🔴 **ROJO** | Membresía vencida, socio inactivo o sin plan activo registrado. | **Bloqueado** | **Bloquea automáticamente el ingreso** (`403 Forbidden`). |

---

## 🚀 Guía de Ejecución Rápida

### 1. Requisitos Previos
- **Node.js**: v18+ o v24+
- **npm**: v9+ o v11+

### 2. Ejecución del Backend
```bash
cd backend
npm install
npm run build
npm test       # Ejecuta 13 pruebas unitarias completas
npm run dev    # Inicia el servidor en http://localhost:3001
```

### 3. Ejecución del Frontend
```bash
cd frontend
npm install
npm run dev    # Inicia la interfaz web en http://localhost:5173
```

---

## 🧪 Casos de Prueba Predefinidos en el Semáforo

En la pantalla de **Control de Acceso**, se incluyen atajos para probar los diferentes estados del semáforo:
- 🟢 **Carlos Mendoza** (`C.I. 5432101`): Verde (Vigente por 25 días, saldo Bs. 0).
- 🟡 **Mariana Rios** (`C.I. 5432102`): Amarillo (Vence en 3 días, saldo Bs. 0).
- 🟡 **Roberto Fernandez** (`C.I. 5432103`): Amarillo (Vigente 20 días, debe Bs. 100).
- 🔴 **Sofia Ortiz** (`C.I. 5432104`): Rojo (Membresía vencida hace 10 días).
- 🔴 **Juan Perez** (`C.I. 5432105`): Rojo (Socio registrado sin membresía activa).
