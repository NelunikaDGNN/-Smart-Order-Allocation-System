const express = require('express');
const { body, param } = require('express-validator');
const adminController = require('../controllers/adminController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/orders', adminController.listOrders);

router.patch(
  '/orders/:id/status',
  [param('id').isInt(), body('status').isString()],
  validate,
  adminController.updateOrderStatus
);

router.get('/branches/workload', adminController.branchWorkload);
router.get('/stock', adminController.listStock);

module.exports = router;
