"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    return <p>Loading cart...</p>;
  }

  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  return (
    <div>
      <h1>Your Cart</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {items.length === 0 && <p>Your cart is empty.</p>}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.name}</strong> — ${(item.priceCents / 100).toFixed(2)} each
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
            />
            <button onClick={() => handleRemove(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      {items.length > 0 && <h2>Total: ${(total / 100).toFixed(2)}</h2>}
    </div>
  );
}