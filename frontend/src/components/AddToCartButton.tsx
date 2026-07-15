"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../app/lib/api";

export default function AddToCartButton({ productId }: { productId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleClick() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/cart", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setAdded(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  }

  return (
  <button
    onClick={handleClick}
    disabled={loading}
    className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {added ? "Added!" : loading ? "Adding..." : "Add to Cart"}
  </button>
);
}