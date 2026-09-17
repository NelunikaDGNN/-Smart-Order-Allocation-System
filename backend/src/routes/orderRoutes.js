const express = require('express');
const { body, param } = require('express-validator');
const orderController = require('../controllers/orderController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.post(
  '/',
  authenticate,
  requireRole('customer', 'admin'),
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId').isInt({ min: 1 }),
    body('items.*.quantity').isInt({ min: 1 }),
    body('customerLat').isFloat({ min: -90, max: 90 }),
    body('customerLng').isFloat({ min: -180, max: 180 }),
    body('note').optional().isString().isLength({ max: 1000 }),
  ],
  validate,
  orderController.createOrder
);

router.get('/mine', authenticate, orderController.getMyOrders);

router.get(
  '/:id',
  authenticate,
  [param('id').isInt()],
  validate,
  orderController.getOrderById
);

router.post(
  '/:id/cancel',
  authenticate,
  [param('id').isInt()],
  validate,
  orderController.cancelOrder
);

router.delete(
  '/:id',
  authenticate,
  [param('id').isInt()],
  validate,
  orderController.deleteOrder
);

module.exports = router;
