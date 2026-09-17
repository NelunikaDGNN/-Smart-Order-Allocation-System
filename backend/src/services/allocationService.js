const branchModel = require('../models/branchModel');
const stockModel = require('../models/stockModel');
const { haversineDistanceKm, proximityScore } = require('./distanceService');
const { WEIGHTS, MAX_DISTANCE_KM } = require('../config/allocation');

/**
 * Core branch allocation algorithm.
 * 
 *  // --- Phase 1: ---
 * @param {Object} params
 * @param {number} params.customerLat
 * @param {number} params.customerLng
 * @param {{productId:number, quantity:number}[]} params.items
 * @returns {Promise<{branch: object, score: number, breakdown: object} | null>}
 *   null means no branch is currently eligible to fulfil this order.
 */
async function allocateBranch({ customerLat, customerLng, items }) {
  const productIds = items.map((i) => i.productId);

  const [branches, stockRows, workloadByBranch] = await Promise.all([
    branchModel.findAllActive(),
    stockModel.getStockForProducts(productIds),
    branchModel.getWorkloadCounts(),
  ]);

  const branchById = new Map(branches.map((b) => [b.id, b]));

  // --- Phase 1: eligibility filter via inverted index + set intersection ---
  // Build productId -> Map<branchId, quantity> from the fetched stock rows.
  const stockByProduct = new Map();
  for (const row of stockRows) {
    if (!stockByProduct.has(row.product_id)) {
      stockByProduct.set(row.product_id, new Map());
    }
    stockByProduct.get(row.product_id).set(row.branch_id, row.quantity);
  }

  // For each item, the set of branch IDs that can cover that item's quantity.
  const candidateSets = items.map((item) => {
    const stockMap = stockByProduct.get(item.productId) || new Map();
    const eligible = new Set();
    for (const [branchId, quantity] of stockMap.entries()) {
      if (quantity >= item.quantity) eligible.add(branchId);
    }
    return eligible;
  });

  // Intersection across all items: a branch must cover EVERY item.
  let eligibleBranchIds = candidateSets.length ? [...candidateSets[0]] : [];
  for (let i = 1; i < candidateSets.length; i += 1) {
    eligibleBranchIds = eligibleBranchIds.filter((id) => candidateSets[i].has(id));
  }

  eligibleBranchIds = eligibleBranchIds.filter((id) => {
    const branch = branchById.get(id);
    if (!branch) return false;
    const distance = haversineDistanceKm(customerLat, customerLng, branch.latitude, branch.longitude);
    return distance <= MAX_DISTANCE_KM;
  });

  if (eligibleBranchIds.length === 0) {
    return null; 
  }

  // --- Phase 2: weighted ranking ---
 
  function stockSurplusScore(branchId) {
    let total = 0;
    for (const item of items) {
      const stockMap = stockByProduct.get(item.productId);
      const quantity = stockMap?.get(branchId) ?? 0;
      const surplus = quantity - item.quantity;
      
      total += Math.min(surplus, 10) / 10;
    }
    return items.length ? total / items.length : 0;
  }

  function workloadScoreFor(branchId) {
    const activeOrders = workloadByBranch[branchId] || 0;
    return 1 / (1 + activeOrders);
  }

  const scored = eligibleBranchIds.map((branchId) => {
    const branch = branchById.get(branchId);
    const distanceKm = haversineDistanceKm(
      customerLat, customerLng, branch.latitude, branch.longitude
    );
    const proximity = proximityScore(distanceKm);
    const workload = workloadScoreFor(branchId);
    const stockSurplus = stockSurplusScore(branchId);

    const score =
      WEIGHTS.workload * workload +
      WEIGHTS.proximity * proximity +
      WEIGHTS.stockSurplus * stockSurplus;

    return {
      branch,
      score,
      breakdown: { distanceKm, proximity, workload, stockSurplus },
    };
  });

  
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.breakdown.workload !== b.breakdown.workload) {
      return b.breakdown.workload - a.breakdown.workload; // higher workload score = less busy
    }
    return a.branch.id - b.branch.id;
  });

  return scored[0];
}

module.exports = { allocateBranch };
