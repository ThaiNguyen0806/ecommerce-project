"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";

export default function SellPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const priceCents = Math.round(parseFloat(price) * 100);
      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({ name, description, priceCents }),
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to list product");
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return <p>Checking login status...</p>;
  }

  return (
    <div>
      <h1>List a Product</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label>Price (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Listing..." : "List Product"}
        </button>
      </form>
    </div>
  );
}