const express = require('express');
const branchController = require('../controllers/branchController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, branchController.listBranches);

module.exports = router;
