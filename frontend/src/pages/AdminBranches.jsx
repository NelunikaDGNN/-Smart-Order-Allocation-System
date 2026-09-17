import React, { useEffect, useState } from 'react';
import * as branchApi from '../api/branchApi';
import * as orderApi from '../api/orderApi';
import SearchBar from '../components/common/SearchBar.jsx';
import Pagination from '../components/common/Pagination.jsx';

const PAGE_SIZE = 6;

export default function AdminBranches() {
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      branchApi.getBranches(),
      branchApi.getProducts(),
      orderApi.getBranchWorkload(),
      orderApi.getStockOverview(),
    ])
      .then(([b, p, w, s]) => {
        setBranches(b.branches);
        setProducts(p.products);
        setWorkload(w.branches);
        setStock(s.stock);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search]);

  const workloadFor = (branchId) => workload.find((w) => w.id === branchId)?.activeOrders ?? 0;
  const stockFor = (branchId, productId) =>
    stock.find((s) => s.branch_id === branchId && s.product_id === productId)?.quantity ?? 0;
  const totalStockFor = (branchId) =>
    stock.filter((s) => s.branch_id === branchId).reduce((sum, r) => sum + r.quantity, 0);

  const filteredBranches = branches.filter((b) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      b.name.toLowerCase().includes(term) ||
      (b.address || '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredBranches.length / PAGE_SIZE));
  const pageBranches = filteredBranches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Branches</h1>
      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      {!loading && (
        <>
          <div className="max-w-sm mb-6">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by branch name or address…" />
          </div>

          {/* Desktop/tablet table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3 text-center">Active orders</th>
                  {products.map((p) => (
                    <th key={p.id} className="px-4 py-3 text-center whitespace-nowrap">
                      {p.name}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">Total stock</th>
                </tr>
              </thead>
              <tbody>
                {pageBranches.map((b) => (
                  <tr key={b.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-800">{b.name}</td>
                    <td className="px-4 py-3 text-gray-600">{b.address || '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{workloadFor(b.id)}</td>
                    {products.map((p) => (
                      <td key={p.id} className="px-4 py-3 text-center text-gray-700">
                        {stockFor(b.id, p.id)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-medium text-gray-800">
                      {totalStockFor(b.id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden space-y-3">
            {pageBranches.map((b) => (
              <div key={b.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                <p className="font-semibold text-gray-800">{b.name}</p>
                <p className="text-xs text-gray-500 mb-2">{b.address || '—'}</p>
                <p className="text-sm text-gray-600 mb-3">
                  Active orders: <span className="font-medium text-gray-800">{workloadFor(b.id)}</span>
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs uppercase">
                      <th className="pb-1 font-medium">Product</th>
                      <th className="pb-1 font-medium text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t border-gray-100">
                        <td className="py-1 text-gray-700">{p.name}</td>
                        <td className="py-1 text-right text-gray-700">{stockFor(b.id, p.id)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-200">
                      <td className="pt-2 font-medium text-gray-800">Total</td>
                      <td className="pt-2 text-right font-medium text-gray-800">
                        {totalStockFor(b.id)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {filteredBranches.length === 0 && (
            <p className="text-sm text-gray-500 mt-6">No branches match your search.</p>
          )}

          {filteredBranches.length > 0 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}