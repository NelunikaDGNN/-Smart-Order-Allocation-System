const orderModel = require('../models/orderModel');
const supportTicketModel = require('../models/supportTicketModel');
const classificationService = require('../services/classificationService');
const { AppError } = require('../middleware/errorHandler');

/**
 * Notes at the post-order (at order-creation time)
 */
async function createTicket(req, res, next) {
  try {
    const { message } = req.body;
    const order = await orderModel.findById(req.params.orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (req.user.role !== 'admin' && order.customer_id !== req.user.userId) {
      throw new AppError('Forbidden', 403);
    }

    const classification = await classificationService.classifyMessage(message);

    const ticket = await supportTicketModel.create({
      orderId: order.id,
      customerId: order.customer_id,
      message,
      category: classification.category,
      confidence: classification.confidence,
      flagged: classification.flagged ?? false,
    });

    res.status(201).json({ ticket, classification });
  } catch (err) {
    next(err);
  }
}

async function getMyTickets(req, res, next) {
  try {
    const tickets = await supportTicketModel.findForCustomer(req.user.userId);
    res.json({ tickets });
  } catch (err) {
    next(err);
  }
}

// Admin
async function listTickets(req, res, next) {
  try {
    const { status, search, page = 1, pageSize = 20 } = req.query;
    const limit = Math.min(parseInt(pageSize, 10) || 20, 200);
    const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * limit;

    const tickets = await supportTicketModel.findAllForAdmin({ status, search, limit, offset });
    res.json({ tickets });
  } catch (err) {
    next(err);
  }
}

async function updateTicketStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['open', 'in_progress', 'closed'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }
    const ticket = await supportTicketModel.updateStatus(req.params.id, status);
    if (!ticket) throw new AppError('Ticket not found', 404);
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

module.exports = { createTicket, getMyTickets, listTickets, updateTicketStatus };