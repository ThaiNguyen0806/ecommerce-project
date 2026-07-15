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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Browse Products</h1>
          <p className="text-gray-500 mt-2">
            {products.length} {products.length === 1 ? "item" : "items"} available right now
          </p>
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500">No products yet. </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No image</span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-base font-semibold text-gray-900">{product.name}</h2>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xl font-bold text-gray-900">
                    ${(product.priceCents / 100).toFixed(2)}
                  </span>
                  <AddToCartButton productId={product.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}