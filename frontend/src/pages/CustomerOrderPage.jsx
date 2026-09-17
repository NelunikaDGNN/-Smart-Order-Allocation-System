import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as branchApi from '../api/branchApi';
import * as orderApi from '../api/orderApi';
import OrderForm from '../components/OrderForm/OrderForm.jsx';

export default function CustomerOrderPage() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    branchApi
      .getProducts()
      .then((d) => setProducts(d.products))
      .catch(() => setLoadError('Could not load products.'))
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setResult(null);
    try {
      const data = await orderApi.createOrder(payload);
      setResult(data);
      setFormKey((k) => k + 1);
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Could not place order.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {loadError && <p className="text-red-500 mb-4">{loadError}</p>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-8">
        {loadingProducts ? (
          <p className="text-sm text-gray-400">Loading products…</p>
        ) : (
          <OrderForm
            key={formKey}
            products={products}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>

      {result && (
        <div className={`rounded-lg p-4 text-sm ${result.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {result.error ? (
            result.error
          ) : (
            <>
              <p className="font-medium">
                {result.allocatedBranch
                  ? `Order allocated to ${result.allocatedBranch.name}.`
                  : result.message}
              </p>
              {result.classification?.category && (
                <p className="mt-1 text-xs">
                  Note classified as: <strong>{result.classification.category}</strong>
                  {result.classification.confidence != null &&
                    ` (${Math.round(result.classification.confidence * 100)}% confidence)`}
                </p>
              )}
              <Link to="/orders" className="inline-block mt-2 text-xs font-medium underline">
                View this order in your order list →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}