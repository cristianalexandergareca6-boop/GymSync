Este es el Product Requirements Document (PRD) detallado para el sistema
GymSync, generado a partir del análisis integral de los documentos de ingeniería
de requerimientos, diseño UML y arquitectura de base de datos.

Product Requirements Document (PRD) - GymSync

Estado: Definido / Listo para Desarrollo
Versión: 1.0
Fecha: Agosto 2026
Equipo: Cristian Gareca, Helen Benitez, John Vasquez, Hernán Copa

1. Visión del Producto

GymSync es una solución web integral diseñada para digitalizar y centralizar la
gestión administrativa y operativa de gimnasios, con un enfoque inicial en el
mercado local de Tarija, Bolivia. El producto busca eliminar la dependencia de
registros manuales (cuadernos y hojas de cálculo desarticuladas), reduciendo en
un 80% los errores operativos y optimizando el control de membresías, accesos e
inventarios mediante una interfaz ágil y un sistema de alertas visuales
("semáforo").

2. Stack Tecnológico Sugerido

Basado en los requerimientos de "Web Responsivo" y la arquitectura relacional
definida:

  - Frontend: React.js o Next.js (por su capacidad de respuesta y SEO).
  - Backend: Node.js con Express o Python con FastAPI.
  - Base de Datos: SQL Server (sugerido por el uso de GETDATE() en el
    diccionario) o PostgreSQL.
  - Modelado y Documentación: PlantUML y GitHub Projects para trazabilidad.
  - Despliegue: Cloud (AWS/Azure) para asegurar acceso web 24/7.

3. Modelo de Datos Exacto (3FN)

El sistema utiliza una estrategia de herencia tipo Joined (Tabla por subclase)
para la gestión de usuarios.

3.1 Entidades Principales

| Tabla                    | Descripción                                                                                                                                    |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **USUARIO**              | Entidad base. Almacena `id_usuario`, `nombre`, `apellido`, `ci_numero` (Único), `correo`, `contrasena_hash`, `rol` (Admin/Entrenador/Cliente). |
| **CLIENTE**              | Extiende de Usuario. Atributos: `telefono`, `contacto_emergencia`, `estado_medico`.                                                            |
| **ENTRENADOR**           | Extiende de Usuario. Atributos: `especialidad`, `turno`.                                                                                       |
| **PLAN\_MEMBRESIA**      | Catálogo de servicios. Atributos: `nombre_plan`, `precio`, `duracion_dias`.                                                                    |
| **MEMBRESIA\_CLIENTE**   | Relación M:N entre Cliente y Plan. Atributos: `fecha_inicio`, `fecha_vencimiento`, `estado` (Activa/Vencida/Suspendida).                       |
| **PAGO**                 | Registro transaccional. Atributos: `monto_pagado`, `fecha_pago`, `metodo_pago` (Efectivo/Tarjeta/QR).                                          |
| **REGISTRO\_ASISTENCIA** | Control de ingresos. Atributos: `fecha_hora_ingreso`.                                                                                          |
| **RUTINA / EJERCICIO**   | Gestión de entrenamiento. Atributos: `detalle_rutina` (Series, Repeticiones).                                                                  |

4. Reglas de Negocio y Cumplimiento

4.1 Lógica Operativa

1.  Identificación Única: El C.I. (Cédula de Identidad) es el identificador
    primario y no puede duplicarse.
2.  Cálculo Automático: La fecha_vencimiento debe calcularse sumando los
    duracion_dias del plan a la fecha_inicio.
3.  Sistema de Semáforo (Visualización):
      - Verde: Membresía vigente y al día.
      - Amarillo: Membresía próxima a vencer (rango de 3-5 días) o con deuda
        pendiente.
      - Rojo: Membresía vencida o acceso bloqueado.
4.  Control de Acceso: No se permite el registro de asistencia si el estado de
    la membresía es "Vencida".
5.  Gestión de Deudas: El sistema permite pagos parciales, manteniendo un
    saldo_pendiente que genera una alerta amarilla, pero no bloquea el acceso si
    la fecha sigue vigente.

4.2 Contexto Legal (Bolivia)

Aunque los documentos no citan leyes específicas, por diseño cumplen con:

  - Uso de C.I. como Identificador: Conforme a la normativa del SEGIP para
    registro de personas.
  - Privacidad de Datos: Manejo de datos sensibles (estado médico) que debe
    alinearse con principios de confidencialidad.
  - Fidelidad Histórica de Precios: La regla de negocio indica que el precio
    capturado en la tabla PAGO se "congela", cumpliendo con buenas prácticas
    contables y derechos del consumidor en Bolivia (evitar cambios retroactivos
    en deudas ya devengadas).

5. Backlog de Historias de Usuario (MVP - Sprint 1)

| ID       | Historia de Usuario     | Criterios de Aceptación (CA)                                                                           |
| :------- | :---------------------- | :----------------------------------------------------------------------------------------------------- |
| **HU01** | **Registrar Socio**     | El sistema debe validar que el C.I. no exista. Generar automáticamente un código de socio único.       |
| **HU02** | **Actualizar Socio**    | Permitir edición de datos de contacto y observaciones médicas sin alterar el histórico de asistencias. |
| **HU03** | **Registrar Membresía** | Al elegir un plan, el sistema debe autocalcular la fecha de vencimiento.                               |
| **HU04** | **Registrar Pago**      | El sistema debe permitir pagos totales o parciales. Si es parcial, el saldo debe quedar registrado.    |
| **HU05** | **Consultar Estado**    | Búsqueda por C.I. o código que devuelva el estado actual en menos de 2 segundos.                       |
| **HU06** | **Semáforo Visual**     | Mostrar un indicador de color (Verde/Amarillo/Rojo) basado en la vigencia y saldo del socio.           |
| **HU07** | **Registrar Ingreso**   | Botón de "Un clic" para registrar entrada. Bloquear automáticamente si la membresía es Roja.           |

6. Límites del Sistema (Out of Scope para MVP)

  - Integración con torniquetes o lectores biométricos (se usará entrada manual
    de C.I./Código).
  - Pasarelas de pago online (pagos registrados manualmente por recepción).
  - Aplicación móvil nativa (se garantiza diseño web responsivo).
  - Módulo de contabilidad avanzada o nómina de empleados.

7. Plan de Lanzamiento (Roadmap 3 Semanas)

1.  Semana 1: Digitalización de socios, gestión de membresías y validación de
    acceso.
2.  Semana 2: Implementación de control de inventario básico y registro de
    ventas de productos.
3.  Semana 3: Consultas administrativas, reportes de ingresos y entrega del
    prototipo funcional.

Nota de PM: Este PRD garantiza la trazabilidad desde la necesidad del cliente
(evitar cuadernos físicos) hasta el modelo de base de datos final.

## 7. Marco Legal y Ética de Datos

### 7.1. Protección de Datos y Habeas Data

El sistema GymSync procesa información personal y de filiación de los socios para fines exclusivos de control de membresías y acceso. Conforme a los Arts. 21 (num. 2), 130 y 131 de la Constitución Política del Estado (CPE), se garantiza el derecho a la autodeterminación informativa y a la acción de Habeas Data mediante las siguientes directrices:

- **Consulta y Transparencia:** Los socios tienen derecho a conocer qué datos personales están registrados en el sistema. A nivel de arquitectura, el sistema expone endpoints de consulta individual (`GET /api/clients/:id`) que permiten verificar la información personal, médica y de contacto almacenada.
- **Actualización y Rectificación:** Mediante la historia de usuario **HU02 (Actualizar Socio)** y el caso de uso `UpdateClientUseCase`, los operadores autorizados pueden rectificar errores en datos de contacto (teléfono, correo, contacto de emergencia) y estado de salud, preservando la inmutabilidad del historial de asistencias y del C.I.
- **Eliminación y Desactivación de Datos (Ciclo de Vida):**
  - *Medida Actual:* El sistema implementa una desactivación lógica (*soft-delete*) mediante el atributo `activo: BOOLEAN` en las tablas `USUARIO` y `CLIENTE`, lo cual revoca el acceso del socio de manera inmediata sin destruir la integridad referencial de los registros contables y de asistencia histórica.
  - *Mejora Prevista / Pendiente de Implementación:* Se prevé incorporar un procedimiento formal de disociación y anonimización de datos personales para socios que soliciten la baja definitiva o una vez cumplido el plazo legal de retención contable, eliminando C.I., números telefónicos y datos médicos sin afectar las estadísticas globales del gimnasio. Asimismo, se añadirá el registro explícito del consentimiento informado al momento de la creación de la ficha del socio.

### 7.2. Cumplimiento de la Ley 164

De acuerdo con la Ley N° 164 (Ley General de Telecomunicaciones, Tecnologías de Información y Comunicación) del Estado Plurinacional de Bolivia, particularmente sus Arts. 6 (Inviolabilidad y secreto), 21-22 (Validez de documentos digitales) y 79-80 (Seguridad de la información y privacidad de datos):

- **Uso de Estándares Abiertos e Interoperabilidad:** GymSync está diseñado sobre tecnologías abiertas y estándares de la industria (Node.js, Express, TypeScript, React, PostgreSQL / SQL Server), facilitando la portabilidad, la auditoría de código y la independencia tecnológica.
- **Integridad y No Alterabilidad de Registros:** La arquitectura aplica el principio de inmutabilidad en transacciones económicas; el precio del plan se congela en la tabla `MEMBRESIA_CLIENTE` (`precio_congelado`) al momento de la suscripción, evitando modificaciones retroactivas arbitrarias en concordancia con las normas de comercio electrónico y defensa del consumidor.
- **Medidas Técnicas de Seguridad Previstas / Pendientes de Implementación:**
  - *Cifrado en Tránsito:* Obligatoriedad de protocolo HTTPS / TLS 1.3 para todo el tráfico entre la interfaz web y la API REST, garantizando la confidencialidad de los datos en redes locales e Internet.
  - *Copias de Respaldo Cifradas:* Establecimiento de políticas de respaldo periódico automatizado de la base de datos relacional con almacenamiento cifrado (AES-256) en reposo.
  - *Integridad Digital:* Incorporación de hashes de verificación (SHA-256) en comprobantes de pago digitales emitidos para garantizar su validez jurídica probatoria.

### 7.3. Prevención de Accesos Indebidos

Para mitigar los riesgos tipificados en el Art. 363 ter del Código Penal Boliviano (Acceso Ilícito a Sistemas Informáticos), la seguridad de GymSync se fundamenta en el principio de menor privilegio y separación de funciones según los roles existentes:

- **Estructura de Roles en el Sistema:**
  - `Admin`: Gestión integral del sistema, configuración de catálogo de planes, auditoría y reportes.
  - `Recepcionista`: Búsqueda de socios, registro de nuevas altas, asignación de membresías, cobro de cuotas y registro de asistencia.
  - `Entrenador`: Visualización de rutinas, ejercicios y datos médicos relevantes de los socios a su cargo, sin acceso a módulos financieros.
  - `Cliente / Socio`: Visualización exclusiva de su propio estado de membresía, historial de pagos y rutina asignada.
- **Mecanismos Actuales:**
  - Definición del modelo de roles y almacenamiento de credenciales en hash (`contrasena_hash VARCHAR(255)`) en la base de datos relacional.
  - Validación lógica en el motor de semáforo (`AccessControlEvaluator`) que bloquea automáticamente intentos de ingreso físico u operativo para membresías inactivas o vencidas (Semáforo Rojo).
- **Mejoras Previstas / Pendientes de Implementación (Críticas):**
  - *Autenticación y Autorización por Tokens (JWT):* Implementación de un middleware de autenticación stateless (`authMiddleware`) y autorización basada en roles (RBAC) en el backend para validar la identidad y permisos en cada endpoint de la API.
  - *Protección contra Fuerza Bruta y Scraping:* Implementación de limitación de tasa de solicitudes (*Rate Limiting*) en los endpoints de consulta por C.I. (`/api/access/status`) para evitar la enumeración masiva de socios.
  - *Restricción de CORS:* Configuración estricta de dominios autorizados en el middleware de CORS para prevenir solicitudes no autorizadas entre sitios.

### 7.4. Protección de Datos Sensibles

El sistema clasifica y protege los datos procesados en distintas categorías según su nivel de criticidad y confidencialidad:

1. **Datos de Identificación y Filiación (Confidenciales):** Carnet de Identidad (C.I.), Código de Socio, Nombres y Apellidos.
   - *Protección:* Se valida mediante un Value Object dedicado (`CI.ts`) que previene duplicidades y formateo erróneo.
   - *Mejora Prevista:* Enmascaramiento parcial del C.I. en vistas públicas o secundarias (ej. `5432***`).
2. **Datos de Contacto y Entorno Familiar (Privados):** Teléfono personal, correo electrónico, nombre y teléfono del contacto de emergencia.
   - *Mejora Prevista:* Minimización de datos en el endpoint `GET /api/clients`, excluyendo teléfonos y contactos familiares del listado masivo, reservando su consulta al detalle individual (`GET /api/clients/:id`) bajo permisos autorizados.
3. **Datos de Salud y Ficha Médica (Altamente Sensibles / Especialmente Protegidos):** El campo `estado_medico` almacena información sobre patologías preexistentes (asma, hipertensión, lesiones, cirugías, condiciones cardíacas).
   - *Normativa de Respaldo:* Ley N° 3131 del Ejercicio Profesional Médico y normas de confidencialidad clínica.
   - *Mejora Prevista:* Cifrado a nivel de columna / aplicación (AES-256-GCM) antes de su persistencia en base de datos y restricción estricta de visualización únicamente al perfil médico/entrenador y administrador.
4. **Datos Financieros y Transaccionales (Restringidos):** Historial de pagos (`PAGO`), montos cobrados, métodos de pago (Efectivo/Tarjeta/QR) y saldos pendientes.
   - *Protección Actual:* Registros inmutables en base de datos que vinculan pagos exclusivamente a su membresía correspondiente.
   - *Mejora Prevista:* Vinculación obligatoria del identificador del cajero/operador en cada transacción de pago.

### 7.5. Auditoría y Trazabilidad

Para garantizar el principio de no repudio, prevenir la manipulación informática (Art. 363 bis del Código Penal) y permitir análisis forenses ante incidentes, se define la arquitectura de auditoría y trazabilidad del sistema:

- **Estructura del Registro de Auditoría (Bitácora Inmutable):**
  Cada operación sensible (modificación de datos de socios, registro o anulación de pagos, actualización de fichas médicas y forzado de ingresos con semáforo rojo) deberá registrar obligatoriamente:
  - **Quién realizó la acción:** Identificador único (`id_usuario`) y rol del operador autenticado que ejecutó la solicitud.
  - **Qué acción realizó:** Acción específica estandarizada (ej. `CLIENT_UPDATED`, `PAYMENT_REGISTERED`, `OVERRIDE_ACCESS_CHECKIN`, `MEMBERSHIP_CREATED`).
  - **Sobre qué información:** Entidad y registro afectado (ej. `Tabla: CLIENTE`, `ID: 5`), incluyendo los datos antes del cambio (`datos_anteriores`) y los datos resultantes (`datos_nuevos`) en formato estructurado JSON.
  - **Fecha y hora exacta:** Marca de tiempo generada por el servidor (`TIMESTAMP WITH TIME ZONE`) sincronizada con hora oficial de Bolivia.
  - **Información del acceso y red:** Dirección IP de origen (`req.ip`), método HTTP y agente de usuario (*User-Agent*).
- **Estado Actual vs. Implementación Prevista:**
  - *Estado Actual:* Las tablas transaccionales `REGISTRO_ASISTENCIA` y `PAGO` almacenan marcas de tiempo (`fecha_hora_ingreso`, `fecha_pago`), estados y motivos de acceso.
  - *Mejora Prevista / Pendiente de Implementación:* Creación de la tabla centralizada `AUDIT_LOG` en el esquema de base de datos, creación de interceptores automáticos en los casos de uso para persistir las bitácoras y requerimiento de firma/autorización explícita de un supervisor al utilizar la bandera `forzarIngreso` en el control de acceso.
