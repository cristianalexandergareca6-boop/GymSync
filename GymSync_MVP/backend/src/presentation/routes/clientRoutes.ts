import { Router } from 'express';
import { ClientController } from '../controllers/ClientController.js';

export function createClientRoutes(controller: ClientController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);

  return router;
}
