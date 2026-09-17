import React, { useEffect, useState } from 'react';
import * as branchApi from '../api/branchApi';
import * as orderApi from '../api/orderApi';
import SearchBar from '../components/common/SearchBar.jsx';
import Pagination from '../components/common/Pagination.jsx';

const PAGE_SIZE = 6;

function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([branchApi.getProducts(), orderApi.getStockOverview()])
      .then(([p, s]) => {
        setProducts(p.products);
        setStock(s.stock);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search]);

  const totalStockFor = (productId) =>
    stock.filter((s) => s.product_id === productId).reduce((sum, r) => sum + r.quantity, 0);

  const filteredProducts = products.filter((p) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      p.name.toLowerCase().includes(term) ||
      (p.sku || '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pageProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Products</h1>
      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      {!loading && (
        <>
          <div className="max-w-sm mb-6">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by product name or SKU…" />
          </div>

          {/* Desktop/tablet table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-center">Price</th>
                  <th className="px-4 py-3 text-center">Total stock</th>
                </tr>
              </thead>
              <tbody>
                {pageProducts.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.sku || '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {formatCurrency(p.price_cents)}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-800">
                      {totalStockFor(p.id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden space-y-3">
            {pageProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.sku || '—'}</p>
                  </div>
                  <p className="text-sm text-gray-600">{formatCurrency(p.price_cents)}</p>
                </div>
                <p className="text-xs text-gray-500">
                  Total stock: <span className="font-medium text-gray-800">{totalStockFor(p.id)}</span>
                </p>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p className="text-sm text-gray-500 mt-6">No products match your search.</p>
          )}

          {filteredProducts.length > 0 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}