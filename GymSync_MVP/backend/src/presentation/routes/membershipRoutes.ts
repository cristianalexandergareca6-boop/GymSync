import { Router } from 'express';
import { MembershipController } from '../controllers/MembershipController.js';

export function createMembershipRoutes(controller: MembershipController): Router {
  const router = Router();

  router.get('/plans', controller.getPlans);
  router.get('/client/:clientId', controller.getMembershipsByClientId);
  router.post('/', controller.createMembership);
  router.post('/payments', controller.registerPayment);
  router.get('/:membershipId/payments', controller.getPaymentsByMembershipId);

  return router;
}
