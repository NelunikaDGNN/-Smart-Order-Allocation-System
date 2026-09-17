const orderModel = require('../models/orderModel');
const branchModel = require('../models/branchModel');
const stockModel = require('../models/stockModel');
const { AppError } = require('../middleware/errorHandler');

const VALID_STATUSES = [
  'pending', 'confirmed', 'preparing', 'dispatched', 'delivered', 'cancelled', 'unfulfillable',
];

async function listOrders(req, res, next) {
  try {
    const { status, branchId, search, page = 1, pageSize = 20 } = req.query;
    const limit = Math.min(parseInt(pageSize, 10) || 20, 100);
    const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * limit;

    const orders = await orderModel.findAllForAdmin({
      status, branchId: branchId ? parseInt(branchId, 10) : undefined, search, limit, offset,
    });
    res.json({ orders, page: Number(page), pageSize: limit });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }
    const order = await orderModel.updateStatus(req.params.id, status);
    if (!order) throw new AppError('Order not found', 404);
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

async function branchWorkload(req, res, next) {
  try {
    const [branches, workload] = await Promise.all([
      branchModel.findAllActive(),
      branchModel.getWorkloadCounts(),
    ]);
    const result = branches.map((b) => ({
      ...b,
      activeOrders: workload[b.id] || 0,
    }));
    res.json({ branches: result });
  } catch (err) {
    next(err);
  }
}

async function listStock(req, res, next) {
  try {
    const stock = await stockModel.getAllStockWithDetails();
    res.json({ stock });
  } catch (err) {
    next(err);
  }
}

module.exports = { listOrders, updateOrderStatus, branchWorkload, listStock };
