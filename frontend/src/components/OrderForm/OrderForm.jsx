import React, { useState } from "react";
import LocationPicker from "../LocationPicker/LocationPicker.jsx";
import ProductCard from "./ProductCard.jsx";
import CartSummary from "./CartSummary.jsx";
import Button from "../common/Button.jsx";

export default function OrderForm({ products, onSubmit, submitting }) {
  const [cart, setCart] = useState([]); 
  const [location, setLocation] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const hasCart = cart.length > 0;

  const addToCart = (product, quantity) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price_cents: product.price_cents,
          quantity,
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Add at least one product to your cart.");
      return;
    }
    if (!location) {
      setError("Please select a delivery location on the map.");
      return;
    }

    onSubmit({
      items: cart.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      customerLat: location[0],
      customerLng: location[1],
      note: note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`grid grid-cols-1 gap-6 ${
          hasCart ? "lg:grid-cols-3" : ""
        }`}
      >
      
        <div className={hasCart ? "lg:col-span-2" : ""}>
          <h3 className="font-semibold text-gray-800 mb-3">Products</h3>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
              hasCart ? "" : "lg:grid-cols-3"
            }`}
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        </div>

       
        {hasCart && (
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-gray-800 mb-3">Your order</h3>
            <CartSummary
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Delivery instructions (optional)
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          rows={3}
          placeholder="e.g: Is this have a discount"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1000}
        />
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-gray-800 mb-3">Delivery location</h3>
        <LocationPicker onChange={(lat, lng) => setLocation([lat, lng])} />
      </div>

      <div className="mt-6">
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Placing order…" : "Place order"}
        </Button>
      </div>
    </form>
  );
}