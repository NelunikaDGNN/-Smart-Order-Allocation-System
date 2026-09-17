const productModel = require('../models/productModel');

async function listProducts(req, res, next) {
  try {
    const products = await productModel.findAllActive();
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts };
