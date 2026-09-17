const pool = require("../config/db");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const stockModel = require("../models/stockModel");
const allocationService = require("../services/allocationService");
const classificationService = require("../services/classificationService");
const { AppError } = require("../middleware/errorHandler");

async function createOrder(req, res, next) {
  const client = await pool.connect();
  try {
    const { items, customerLat, customerLng, note } = req.body;

    const productIds = items.map((i) => i.productId);
    const products = await productModel.findByIds(productIds);
    if (products.length !== new Set(productIds).size) {
      throw new AppError("One or more products do not exist", 400);
    }

    const priceById = new Map(products.map((p) => [p.id, p.price_cents]));
    const itemsWithPrice = items.map((item) => ({
      ...item,
      unitPriceCents: priceById.get(item.productId),
    }));

    const classification = await classificationService.classifyMessage(note);

    const allocation = await allocationService.allocateBranch({
      customerLat,
      customerLng,
      items,
    });

    await client.query("BEGIN");

    if (!allocation) {
      const order = await orderModel.createOrderWithItems(client, {
        customerId: req.user.userId,
        branchId: null,
        customerLat,
        customerLng,
        note,
        noteCategory: classification.category,
        noteConfidence: classification.confidence,
        allocationScore: null,
        status: "unfulfillable",
        items: itemsWithPrice,
      });
      await client.query("COMMIT");
      return res.status(201).json({
        order,
        message: "No branch currently has sufficient stock for this order.",
      });
    }

    await stockModel.decrementStockForOrder(
      client,
      allocation.branch.id,
      items,
    );

    const order = await orderModel.createOrderWithItems(client, {
      customerId: req.user.userId,
      branchId: allocation.branch.id,
      customerLat,
      customerLng,
      note,
      noteCategory: classification.category,
      noteConfidence: classification.confidence,
      allocationScore: allocation.score,
      status: "pending",
      items: itemsWithPrice,
    });

    await client.query("COMMIT");

    return res.status(201).json({
      order,
      allocatedBranch: allocation.branch,
      allocationBreakdown: allocation.breakdown,
      classification,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await orderModel.findForCustomer(req.user.userId);
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await orderModel.findItemsForOrder(order.id);
        const totalCents = items.reduce(
          (sum, item) => sum + item.unit_price_cents * item.quantity,
          0,
        );
        return { ...order, items, totalCents };
      }),
    );

    res.json({ orders: ordersWithItems });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);

    if (req.user.role !== "admin" && order.customer_id !== req.user.userId) {
      throw new AppError("Forbidden", 403);
    }

    const items = await orderModel.findItemsForOrder(order.id);
    res.json({ order, items });
  } catch (err) {
    next(err);
  }
}

async function cancelOrder(req, res, next) {
  const client = await pool.connect();
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);
    if (req.user.role !== "admin" && order.customer_id !== req.user.userId) {
      throw new AppError("Forbidden", 403);
    }
    if (["delivered", "cancelled"].includes(order.status)) {
      throw new AppError(
        `Cannot cancel an order that is already ${order.status}`,
        400,
      );
    }

    await client.query("BEGIN");

    if (order.branch_id) {
      const items = await orderModel.findItemsForOrder(order.id);
      await stockModel.restoreStockForOrder(
        client,
        order.branch_id,
        items.map((i) => ({ productId: i.product_id, quantity: i.quantity })),
      );
    }

    const updated = await orderModel.updateStatus(order.id, "cancelled");
    await client.query("COMMIT");
    res.json({ order: updated });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}

async function deleteOrder(req, res, next) {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);
    if (req.user.role !== "admin" && order.customer_id !== req.user.userId) {
      throw new AppError("Forbidden", 403);
    }

    // Only cancelled or delivered are deletable
    if (!["cancelled", "delivered"].includes(order.status)) {
      throw new AppError(
        `Cannot delete an order with status "${order.status}" — only cancelled or delivered orders can be deleted`,
        400,
      );
    }

    await orderModel.deleteOrder(order.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  deleteOrder,
};
