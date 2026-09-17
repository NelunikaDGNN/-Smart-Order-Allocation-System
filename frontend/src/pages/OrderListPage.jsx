import React, { useEffect, useState } from 'react';
import * as orderApi from '../api/orderApi';
import OrderStatusBadge from '../components/OrderStatusBadge/OrderStatusBadge.jsx';
import Button from '../components/common/Button.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import ReportIssueDialog from '../components/common/ReportIssueDialog.jsx';

const PAGE_SIZE = 5;

function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatItems(items) {
  return items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ');
}

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null);
  const [reportOrderId, setReportOrderId] = useState(null);
  const [reportResult, setReportResult] = useState(null);

  const loadOrders = () =>
    orderApi.getMyOrders().then((d) => setOrders(d.orders)).finally(() => setLoading(false));

  useEffect(() => { loadOrders(); }, []);

  const runCancel = async (id) => {
    try {
      await orderApi.cancelOrder(id);
      await loadOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not cancel order.');
    }
  };

  const runDelete = async (id) => {
    try {
      await orderApi.deleteOrder(id);
      await loadOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete order.');
    }
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, orderId } = confirmAction;
    setConfirmAction(null);
    if (type === 'cancel') runCancel(orderId);
    if (type === 'delete') runDelete(orderId);
  };

  const handleReportSubmit = async (message) => {
    const data = await orderApi.createSupportTicket(reportOrderId, message);
    setReportOrderId(null);
    setReportResult(data);
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const pageOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your orders</h1>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {!loading && orders.length === 0 && (
        <p className="text-sm text-gray-500">No orders yet.</p>
      )}

      {!loading && orders.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Placed</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageOrders.map((o) => {
                  const canCancel = !['delivered', 'cancelled', 'unfulfillable'].includes(o.status);
                  const canDelete = ['cancelled', 'delivered'].includes(o.status);
                  return (
                    <tr key={o.id} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3 font-medium text-gray-800">#{o.id}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(o.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs" title={formatItems(o.items)}>
                        {formatItems(o.items)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.branch_name || '—'}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {formatCurrency(o.totalCents)}
                      </td>
                      <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          {canCancel && (
                            <Button
                              variant="primary"
                              onClick={() => setConfirmAction({ type: 'cancel', orderId: o.id })}
                              className="text-xs px-2 py-1 w-20"
                            >
                              Cancel
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="danger"
                              onClick={() => setConfirmAction({ type: 'delete', orderId: o.id })}
                              className="text-xs px-2 py-1 w-20"
                            >
                              Delete
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => setReportOrderId(o.id)}
                            className="text-xs px-2 py-1 w-20"
                          >
                            Report
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {pageOrders.map((o) => {
              const canCancel = !['delivered', 'cancelled', 'unfulfillable'].includes(o.status);
              const canDelete = ['cancelled', 'delivered'].includes(o.status);
              return (
                <div key={o.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-800">Order #{o.id}</p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(o.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">{formatItems(o.items)}</p>
                  <p className="text-xs text-gray-500 mb-2">Branch: {o.branch_name || '—'}</p>
                  <p className="font-semibold text-gray-800 mb-3">{formatCurrency(o.totalCents)}</p>
                  <div className="flex gap-2">
                    {canCancel && (
                      <Button
                        variant="primary"
                        onClick={() => setConfirmAction({ type: 'cancel', orderId: o.id })}
                        className="flex-1 text-xs py-1.5"
                      >
                        Cancel
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="danger"
                        onClick={() => setConfirmAction({ type: 'delete', orderId: o.id })}
                        className="flex-1 text-xs py-1.5"
                      >
                        Delete
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setReportOrderId(o.id)}
                      className="flex-1 text-xs py-1.5"
                    >
                      Report
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.type === 'delete' ? 'Delete order?' : 'Cancel order?'}
        message={
          confirmAction?.type === 'delete'
            ? `Delete order #${confirmAction?.orderId}? This cannot be undone.`
            : `Are you sure you want to cancel order #${confirmAction?.orderId}?`
        }
        confirmLabel={confirmAction?.type === 'delete' ? 'Delete' : 'Yes'}
        cancelLabel="No"
        variant={confirmAction?.type === 'delete' ? 'danger' : 'primary'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <ReportIssueDialog
        open={reportOrderId !== null}
        orderId={reportOrderId}
        onSubmit={handleReportSubmit}
        onCancel={() => setReportOrderId(null)}
      />

     {reportResult && (
  <div className="fixed bottom-4 right-4 bg-green-50 text-green-700 text-sm rounded-lg shadow-lg p-4 max-w-sm z-50">
    <p className="font-medium">Report submitted.</p>
    {reportResult.classification?.category && (
      <p className="text-xs mt-1">
        We understood this as: <strong>{reportResult.classification.category}</strong>
        {reportResult.classification.confidence != null && (
          <> ({Math.round(reportResult.classification.confidence * 100)}% confidence)</>
        )}
      </p>
    )}
    <button onClick={() => setReportResult(null)} className="text-xs underline mt-2">
      Dismiss
    </button>
  </div>
)}
    </div>
  );
}