const express = require('express');
const { body, param } = require('express-validator');
const supportController = require('../controllers/supportController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.post(
  '/orders/:orderId/support',
  authenticate,
  [param('orderId').isInt(), body('message').isString().trim().isLength({ min: 1, max: 1000 })],
  validate,
  supportController.createTicket
);

router.get('/support/mine', authenticate, supportController.getMyTickets);

router.get('/admin/support', authenticate, requireRole('admin'), supportController.listTickets);

router.patch(
  '/admin/support/:id/status',
  authenticate,
  requireRole('admin'),
  [param('id').isInt(), body('status').isString()],
  validate,
  supportController.updateTicketStatus
);

module.exports = router;