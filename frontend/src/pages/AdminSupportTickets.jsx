import React, { useEffect, useState } from 'react';
import * as orderApi from '../api/orderApi';
import SearchBar from '../components/common/SearchBar.jsx';
import Pagination from '../components/common/Pagination.jsx';

const STATUSES = ['open', 'in_progress', 'closed'];
const PAGE_SIZE = 6;

const STATUS_STYLES = {
  open: 'bg-orange-100 text-orange-700',
  in_progress: 'bg-blue-100 text-blue-700',
  closed: 'bg-green-100 text-green-700',
};

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const loadTickets = () => {
    setLoading(true);
    orderApi
      .getAdminSupportTickets({
        status: filters.status || undefined,
        search: filters.search || undefined,
        pageSize: 1000,
      })
      .then((d) => setTickets(d.tickets))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTickets(); }, [filters.status, filters.search]); // eslint-disable-line
  useEffect(() => { setPage(1); }, [filters.status, filters.search]);

  const handleStatusChange = async (id, status) => {
    await orderApi.updateSupportTicketStatus(id, status);
    loadTickets();
  };

  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const pageTickets = tickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Support tickets</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar
          value={filters.search}
          onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
          placeholder="Search by customer or message…"
        />
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && <p className="text-sm text-gray-500 mb-4">Loading…</p>}

      <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {pageTickets.map((t) => (
              <tr key={t.id} className="border-t border-gray-100">
                <td className="px-4 py-3">#{t.id}</td>
                <td className="px-4 py-3">#{t.order_id}</td>
                <td className="px-4 py-3">{t.customer_name || t.customer_email}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={t.message}>
                  {t.message}
                </td>
                <td className="px-4 py-3">
                  {t.category || '—'}
                  {t.flagged && (
                    <span
                      className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700"
                      title={`Confidence: ${Math.round((t.confidence ?? 0) * 100)}%`}
                    >
                      Needs review
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[t.status]}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs"
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {pageTickets.map((t) => (
          <div key={t.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium text-gray-800">Ticket #{t.id} · Order #{t.order_id}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[t.status]}`}>
                {t.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-1">{t.customer_name || t.customer_email}</p>
            <p className="text-sm text-gray-700 mb-2">{t.message}</p>
            <p className="text-xs text-gray-500 mb-3">
              Category: {t.category || '—'}
              {t.flagged && (
                <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">
                  Needs review
                </span>
              )}
            </p>
            <select
              className="w-full border border-gray-300 rounded-md px-2 py-2 text-xs"
              value={t.status}
              onChange={(e) => handleStatusChange(t.id, e.target.value)}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>

      {!loading && tickets.length === 0 && (
        <p className="text-sm text-gray-500 mt-6">No support tickets.</p>
      )}
      {!loading && tickets.length > 0 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}