import React, { useState } from 'react';

function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => q + 1);

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white
                 shadow-sm transition-all duration-200
                 w-full max-w-sm mx-auto
                 hover:-translate-y-0.5 hover:shadow-md hover:border-gray-200"
    >
      {/* Media / placeholder */}
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-3xl font-semibold text-gray-300 select-none">
              {product.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Price badge */}
        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-gray-800 shadow-sm backdrop-blur">
          {formatCurrency(product.price_cents)}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {product.name}
        </h3>

        {product.description && (
          <p className="line-clamp-2 text-xs text-gray-500">
            {product.description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center gap-1.5 pt-1.5">
          {/* Quantity stepper */}
          <div className="flex h-8 items-center rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={decrement}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-full w-7 items-center justify-center rounded-l-lg text-gray-500
                         transition-colors hover:bg-gray-50 hover:text-gray-800
                         disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span
              className="w-5 select-none text-center text-xs font-medium text-gray-900 tabular-nums"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={increment}
              aria-label="Increase quantity"
              className="flex h-full w-7 items-center justify-center rounded-r-lg text-gray-500
                         transition-colors hover:bg-gray-50 hover:text-gray-800"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Add to cart */}
          <button
            type="button"
            onClick={() => {
              onAddToCart(product, quantity);
              setQuantity(1);
            }}
            className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg
                       bg-amber-600 px-2.5 text-xs font-semibold text-white shadow-sm
                       transition-all duration-150
                       hover:bg-amber-700
                       active:scale-[0.98] active:bg-amber-800
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}