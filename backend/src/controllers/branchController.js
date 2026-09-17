const branchModel = require('../models/branchModel');

async function listBranches(req, res, next) {
  try {
    const branches = await branchModel.findAllActive();
    res.json({ branches });
  } catch (err) {
    next(err);
  }
}

module.exports = { listBranches };
