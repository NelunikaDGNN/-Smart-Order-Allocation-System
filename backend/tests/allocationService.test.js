/**
 * Unit tests for the allocation algorithm
 */
const { haversineDistanceKm, proximityScore } = require('../src/services/distanceService');

describe('distanceService', () => {
  test('haversine distance between identical points is 0', () => {
    expect(haversineDistanceKm(6.9271, 79.8612, 6.9271, 79.8612)).toBeCloseTo(0, 5);
  });

  test('haversine distance Colombo -> Kandy is roughly 90-100km', () => {
    const d = haversineDistanceKm(6.9271, 79.8612, 7.2906, 80.6337);
    expect(d).toBeGreaterThan(80);
    expect(d).toBeLessThan(110);
  });

  test('proximityScore decreases as distance increases', () => {
    expect(proximityScore(0)).toBe(1);
    expect(proximityScore(10)).toBeGreaterThan(proximityScore(100));
  });
});

jest.mock('../src/models/branchModel');
jest.mock('../src/models/stockModel');

const branchModel = require('../src/models/branchModel');
const stockModel = require('../src/models/stockModel');
const { allocateBranch } = require('../src/services/allocationService');

describe('allocationService.allocateBranch', () => {
  const BRANCH_NEAR = { id: 1, name: 'Near', latitude: 6.93, longitude: 79.84, is_active: true };
  const BRANCH_FAR_BUSY = { id: 2, name: 'Far', latitude: 7.29, longitude: 80.63, is_active: true };

  beforeEach(() => {
    branchModel.findAllActive.mockResolvedValue([BRANCH_NEAR, BRANCH_FAR_BUSY]);
    branchModel.getWorkloadCounts.mockResolvedValue({ 1: 0, 2: 10 });
  });

  test('returns null when no branch has enough stock', async () => {
    stockModel.getStockForProducts.mockResolvedValue([]);
    const result = await allocateBranch({
      customerLat: 6.93, customerLng: 79.84, items: [{ productId: 1, quantity: 5 }],
    });
    expect(result).toBeNull();
  });

  test('picks the nearer, less busy branch when both are eligible', async () => {
    stockModel.getStockForProducts.mockResolvedValue([
      { branch_id: 1, product_id: 1, quantity: 10 },
      { branch_id: 2, product_id: 1, quantity: 10 },
    ]);
    const result = await allocateBranch({
      customerLat: 6.93, customerLng: 79.84, items: [{ productId: 1, quantity: 2 }],
    });
    expect(result.branch.id).toBe(1);
  });

  test('excludes a branch that lacks sufficient stock even if it is closer', async () => {
    stockModel.getStockForProducts.mockResolvedValue([
      { branch_id: 1, product_id: 1, quantity: 1 }, 
      { branch_id: 2, product_id: 1, quantity: 10 },
    ]);
    const result = await allocateBranch({
      customerLat: 6.93, customerLng: 79.84, items: [{ productId: 1, quantity: 2 }],
    });
    expect(result.branch.id).toBe(2);
  });
});
