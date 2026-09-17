const express = require('express');
const productController = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, productController.listProducts);

module.exports = router;
