import { Router } from 'express';
import { AccessController } from '../controllers/AccessController.js';

export function createAccessRoutes(controller: AccessController): Router {
  const router = Router();

  router.get('/status/:query', controller.getStatus);
  router.get('/status', controller.getStatus);
  router.post('/check-in', controller.checkIn);
  router.get('/attendances/today', controller.getRecentAttendances);

  return router;
}
