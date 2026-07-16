"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../lib/api";

type CartItem = {
  id: number;
  quantity: number;
  productId: number;
  name: string;
  priceCents: number;
};

export default function CartPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setCheckingAuth(false);
    loadCart();
  }, [router]);

  async function loadCart() {
    try {
      const result = await apiFetch("/cart");
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
    } finally {
      setLoadingItems(false);
    }
  }

  async function handleRemove(itemId: number) {
    try {
      await apiFetch(`/cart/${itemId}`, { method: "DELETE" });
      setItems((current) => current.filter((item) => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item");
    }
  }

  async function handleQuantityChange(itemId: number, quantity: number) {
    if (quantity < 1) return;
    try {
      await apiFetch(`/cart/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
      setItems((current) =>
        current.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quantity");
    }
  }

  if (checkingAuth || loadingItems) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading cart...</p>
      </main>
    );
  }

  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Your Cart</h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-6">
            {error}
          </p>
        )}

        {items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <Link
              href="/"
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-5">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">{item.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    ${(item.priceCents / 100).toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                    ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-sm text-red-600 hover:text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="flex items-center justify-between mt-6 px-1">
            <span className="text-sm text-gray-500">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
            <span className="text-xl font-bold text-gray-900">
              Total: ${(total / 100).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </main>
  );
}