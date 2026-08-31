import express from 'express';
import cors from 'cors';
import { errorHandler } from './presentation/middlewares/errorHandler.js';

// Repositories
import { InMemoryClientRepository } from './infrastructure/repositories/InMemoryClientRepository.js';
import { InMemoryMembershipRepository } from './infrastructure/repositories/InMemoryMembershipRepository.js';
import { InMemoryPaymentRepository } from './infrastructure/repositories/InMemoryPaymentRepository.js';
import { InMemoryAttendanceRepository } from './infrastructure/repositories/InMemoryAttendanceRepository.js';
import { getInitialSeedData } from './infrastructure/database/seedData.js';

// Domain Services
import { AccessControlEvaluator } from './domain/services/AccessControlEvaluator.js';

// Use Cases
import { RegisterClientUseCase } from './application/use-cases/RegisterClientUseCase.js';
import { UpdateClientUseCase } from './application/use-cases/UpdateClientUseCase.js';
import { CreateMembershipUseCase } from './application/use-cases/CreateMembershipUseCase.js';
import { RegisterPaymentUseCase } from './application/use-cases/RegisterPaymentUseCase.js';
import { GetClientAccessStatusUseCase } from './application/use-cases/GetClientAccessStatusUseCase.js';
import { RegisterAttendanceUseCase } from './application/use-cases/RegisterAttendanceUseCase.js';

// Controllers & Routes
import { ClientController } from './presentation/controllers/ClientController.js';
import { MembershipController } from './presentation/controllers/MembershipController.js';
import { AccessController } from './presentation/controllers/AccessController.js';
import { createClientRoutes } from './presentation/routes/clientRoutes.js';
import { createMembershipRoutes } from './presentation/routes/membershipRoutes.js';
import { createAccessRoutes } from './presentation/routes/accessRoutes.js';

export function createApp() {
  const app = express();

  // Middleware básicos
  app.use(cors());
  app.use(express.json());

  // 1. Inicialización de Capa de Infraestructura (con datos iniciales)
  const seed = getInitialSeedData();
  const clientRepo = new InMemoryClientRepository(seed.clients);
  const membershipRepo = new InMemoryMembershipRepository(seed.plans, seed.memberships);
  const paymentRepo = new InMemoryPaymentRepository(seed.payments);
  const attendanceRepo = new InMemoryAttendanceRepository(seed.attendances);

  // 2. Inicialización de Servicios de Dominio
  const accessEvaluator = new AccessControlEvaluator({ warningDaysThreshold: 5 });

  // 3. Inicialización de Casos de Uso (Capa de Aplicación - Inyección de Dependencias)
  const registerClientUseCase = new RegisterClientUseCase(clientRepo);
  const updateClientUseCase = new UpdateClientUseCase(clientRepo);
  const createMembershipUseCase = new CreateMembershipUseCase(clientRepo, membershipRepo, paymentRepo);
  const registerPaymentUseCase = new RegisterPaymentUseCase(membershipRepo, paymentRepo);
  const getClientAccessStatusUseCase = new GetClientAccessStatusUseCase(clientRepo, membershipRepo, accessEvaluator);
  const registerAttendanceUseCase = new RegisterAttendanceUseCase(clientRepo, membershipRepo, attendanceRepo, accessEvaluator);

  // 4. Inicialización de Controladores (Capa de Presentación)
  const clientController = new ClientController(registerClientUseCase, updateClientUseCase, clientRepo);
  const membershipController = new MembershipController(createMembershipUseCase, registerPaymentUseCase, membershipRepo, paymentRepo);
  const accessController = new AccessController(getClientAccessStatusUseCase, registerAttendanceUseCase, attendanceRepo);

  // 5. Configuración de Rutas
  app.use('/api/clients', createClientRoutes(clientController));
  app.use('/api/memberships', createMembershipRoutes(membershipController));
  app.use('/api/access', createAccessRoutes(accessController));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'OK',
      app: 'GymSync API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Manejo centralizado de errores
  app.use(errorHandler);

  return { app, repositories: { clientRepo, membershipRepo, paymentRepo, attendanceRepo } };
}
