const express = require('express');
const authRoutes = require('./authRoutes');
const orderRoutes = require('./orderRoutes');
const branchRoutes = require('./branchRoutes');
const productRoutes = require('./productRoutes');
const adminRoutes = require('./adminRoutes');
const supportRoutes = require('./supportRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/branches', branchRoutes);
router.use('/products', productRoutes);
router.use('/admin', adminRoutes);
router.use('/', supportRoutes);

module.exports = router;
