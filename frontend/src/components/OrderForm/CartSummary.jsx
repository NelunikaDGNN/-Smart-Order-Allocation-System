import React from 'react';
import { Trash2 } from 'lucide-react';

function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}


export default function CartSummary({ cart, onUpdateQuantity, onRemove }) {
  const total = cart.reduce(
    (sum, item) => sum + item.price_cents * item.quantity,
    0,
  );

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
      <h4 className="font-semibold text-gray-800 mb-3">Order Receipt</h4>

      <div className="space-y-3">
        {cart.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 truncate">{item.name}</p>
            </div>

            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                type="button"
                className="px-2 py-1 text-gray-600 hover:bg-gray-50 rounded-l-md"
                onClick={() =>
                  onUpdateQuantity(item.productId, item.quantity - 1)
                }
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-2 tabular-nums">{item.quantity}</span>
              <button
                type="button"
                className="px-2 py-1 text-gray-600 hover:bg-gray-50 rounded-r-md"
                onClick={() =>
                  onUpdateQuantity(item.productId, item.quantity + 1)
                }
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <p className="w-16 text-right text-gray-800 font-medium tabular-nums">
              {formatCurrency(item.price_cents * item.quantity)}
            </p>

            <button
              type="button"
              onClick={() => onRemove(item.productId)}
              className="text-red-400 hover:text-red-500 transition-colors"
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
        <span className="font-semibold text-gray-800">Total</span>
        <span className="font-semibold text-gray-800 tabular-nums">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}