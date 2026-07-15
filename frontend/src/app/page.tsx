import AddToCartButton from "../components/AddToCartButton";

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    cache: "no-store",
  });
  const data = await res.json();
  return data.products;
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div>
      <h1>Products</h1>
      {products.length === 0 && <p>No products yet.</p>}
      <ul>
        {products.map((product: any) => (
          <li key={product.id}>
            <strong>{product.name}</strong> — ${(product.priceCents / 100).toFixed(2)}
            <p>{product.description}</p>
            <AddToCartButton productId={product.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}