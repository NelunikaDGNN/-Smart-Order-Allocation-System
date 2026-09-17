import React from 'react';

const STATUS_STYLES = {
  pending: 'text-orange-700',
  confirmed: 'text-blue-700',
  preparing: 'text-amber-700',
  dispatched: 'text-purple-700',
  delivered: 'text-green-700',
  cancelled: 'text-red-700',
  unfulfillable: 'text-red-800',
};

export default function OrderStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'text-gray-700';
  return (
    <span className={`text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}