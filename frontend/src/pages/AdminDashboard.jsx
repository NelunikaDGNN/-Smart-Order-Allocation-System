import React, { useEffect, useState } from "react";
import * as orderApi from "../api/orderApi";
import OrderStatusBadge from "../components/OrderStatusBadge/OrderStatusBadge.jsx";
import SearchBar from "../components/common/SearchBar.jsx";
import Pagination from "../components/common/Pagination.jsx";

const STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "dispatched",
  "delivered",
  "cancelled",
  "unfulfillable",
];
const PAGE_SIZE = 5;

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadOrders = () => {
    setLoading(true);
    orderApi
      .getAdminOrders({
        status: filters.status || undefined,
        search: filters.search || undefined,
        pageSize: 1000,
      })
      .then((d) => setOrders(d.orders))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [filters.status, filters.search]); // eslint-disable-line
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.search]);
  useEffect(() => {
    orderApi.getBranchWorkload().then((d) => setWorkload(d.branches));
  }, []);

  const handleStatusChange = async (orderId, status) => {
    await orderApi.updateOrderStatus(orderId, status);
    loadOrders();
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const pageOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
        <div className="px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {workload.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
          >
            <p className="text-xs text-gray-500">{b.name}</p>
            <p className="text-xl font-bold text-gray-800">{b.activeOrders}</p>
            <p className="text-xs text-gray-400">active orders</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar
          value={filters.search}
          onChange={(value) => setFilters((f) => ({ ...f, search: value }))}
          placeholder="Search by customer email, name, branch, or note…"
        />
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-gray-500 mb-4">Loading…</p>}

      {/* Desktop/tablet table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Note category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {pageOrders.map((o) => (
              <tr key={o.id} className="border-t border-gray-100">
                <td className="px-4 py-3">#{o.id}</td>
                <td className="px-4 py-3">{o.customer_name || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{o.customer_email}</td>
                <td className="px-4 py-3">{o.branch_name || "—"}</td>
                <td
                  className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate"
                  title={o.note || ""}
                >
                  {o.note || "—"}
                </td>
                <td className="px-4 py-3">{o.note_category || "—"}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3">
                  <select
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs"
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-3">
        {pageOrders.map((o) => (
          <div
            key={o.id}
            className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium text-gray-800">Order #{o.id}</p>
              <OrderStatusBadge status={o.status} />
            </div>
            <p className="text-xs text-gray-500">{o.customer_name || "—"}</p>
            <p className="text-xs text-gray-500">{o.customer_email}</p>
            <p className="text-xs text-gray-500">
              Branch: {o.branch_name || "—"}
            </p>
            <p className="text-xs text-gray-500 mb-1">Note: {o.note || '—'}</p>
            <p className="text-xs text-gray-500 mb-3">
              Note category: {o.note_category || "—"}
            </p>
            <select
              className="w-full border border-gray-300 rounded-md px-2 py-2 text-xs"
              value={o.status}
              onChange={(e) => handleStatusChange(o.id, e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {!loading && orders.length === 0 && (
        <p className="text-sm text-gray-500 mt-6">
          No orders match these filters.
        </p>
      )}

      {!loading && orders.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
