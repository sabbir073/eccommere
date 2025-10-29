import Link from 'next/link';
import type { Metadata } from 'next';
import ProductCard from '@/components/product/ProductCard';

export const metadata: Metadata = {
  title: 'Alabili - Your Trusted Online Shopping Destination in Bangladesh',
  description: 'Shop the latest products at Alabili with great deals. Quality products, fast delivery, and cash on delivery across Bangladesh.',
};

async function getFeaturedProducts() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products?featured=true&limit=8`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.error('Failed to fetch featured products');
      return [];
    }

    const { data } = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-20 md:py-32"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(/images/hero-bg.jpg)'
        }}
      >
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Welcome to Alabili
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white drop-shadow-md">
              Discover amazing products at unbeatable prices. Shop at Alabili and enjoy fast delivery across Bangladesh!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition text-center shadow-lg">
                Shop Now
              </Link>
              <Link href="/category/electronics" className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-center shadow-lg">
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'Electronics', slug: 'electronics', icon: '📱' },
              { name: 'Fashion', slug: 'fashion', icon: '👕' },
              { name: 'Home & Living', slug: 'home-living', icon: '🏠' },
              { name: 'Beauty', slug: 'beauty', icon: '💄' },
              { name: 'Sports', slug: 'sports', icon: '⚽' },
            ].map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="card p-6 text-center hover:shadow-xl transition"
              >
                <div className="text-5xl mb-3">{category.icon}</div>
                <h3 className="font-semibold">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link href="/products?featured=true" className="text-primary-600 hover:underline">
              View All →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="font-bold mb-2 text-sm md:text-base">Fast Delivery</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Quick delivery across Bangladesh
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold mb-2 text-sm md:text-base">Cash on Delivery</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Pay when you receive your order
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold mb-2 text-sm md:text-base">Secure Shopping</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Your data is safe with us
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="font-bold mb-2 text-sm md:text-base">Quality Products</h3>
              <p className="text-xs md:text-sm text-gray-600">
                100% authentic products
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="mb-6">
            Get the latest updates on new products and upcoming sales
          </p>
          <form className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 outline-none"
            />
            <button type="submit" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
