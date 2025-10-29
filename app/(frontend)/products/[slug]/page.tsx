import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import ProductDetail from '@/components/product/ProductDetail';
import ProductActions from '@/components/product/ProductActions';
import ProductCard from '@/components/product/ProductCard';
import ProductTabs from '@/components/product/ProductTabs';
import { query, queryOne } from '@/lib/db';

async function getProduct(slug: string) {
  try {
    // Get product
    const product = await queryOne(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = TRUE`,
      [slug]
    );

    if (!product) {
      return null;
    }

    // Get images
    const images = await query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order, is_primary DESC',
      [product.id]
    );

    // Get variants
    const variants = await query(
      'SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE ORDER BY name',
      [product.id]
    );

    // Get reviews (approved only)
    const reviews = await query(
      `SELECT r.*, u.first_name, u.last_name
       FROM product_reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_approved = TRUE
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [product.id]
    );

    return {
      ...product,
      images,
      variants,
      reviews,
    };
  } catch (error) {
    console.error('Get product error:', error);
    return null;
  }
}

async function getRelatedProducts(productId: number, categoryId: number) {
  try {
    const products = await query(
      `SELECT p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM products p
       WHERE p.category_id = ?
         AND p.id != ?
         AND p.is_active = TRUE
       ORDER BY RAND()
       LIMIT 8`,
      [categoryId, productId]
    );
    return products;
  } catch (error) {
    console.error('Get related products error:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.meta_title || `${product.name} - Alabili`,
    description: product.meta_description || product.description,
    keywords: product.meta_keywords,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.[0]?.image_url
        ? [{ url: product.images[0].image_url }]
        : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const discount = calculateDiscount(product.price, product.compare_price);
  const relatedProducts = await getRelatedProducts(product.id, product.category_id);

  return (
    <div className="bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <nav className="container-custom py-4">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-primary-600">Products</Link></li>
            {product.category_slug && (
              <>
                <li>/</li>
                <li>
                  <Link href={`/category/${product.category_slug}`} className="hover:text-primary-600">
                    {product.category_name}
                  </Link>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>
      </div>

      {/* Main Product Section */}
      <div className="bg-white">
        <div className="container-custom py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Images & Interactive Elements */}
            <ProductDetail product={product} />

            {/* Right Column - Product Info */}
            <div className="space-y-5">
              {/* Brand */}
              {product.brand && (
                <div className="text-sm">
                  <span className="text-gray-600">Brand: </span>
                  <span className="text-primary-600 font-semibold">{product.brand}</span>
                </div>
              )}

              {/* Product Name */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4">
                {parseFloat(product.average_rating) > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-500">
                        {'★'.repeat(Math.round(parseFloat(product.average_rating)))}
                        {'☆'.repeat(5 - Math.round(parseFloat(product.average_rating)))}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        {parseFloat(product.average_rating).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.total_reviews} {product.total_reviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">No reviews yet</span>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-b py-4">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl lg:text-4xl font-bold text-primary-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price && product.compare_price > product.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{discount}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.stock_quantity > 0 ? (
                  <>
                    <span className="text-green-600 font-medium flex items-center gap-1 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      In Stock
                    </span>
                    {product.stock_quantity <= product.low_stock_threshold && (
                      <span className="text-orange-600 text-xs">
                        (Only {product.stock_quantity} left)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-red-600 font-medium flex items-center gap-1 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.description && (
                <div className="text-gray-700 text-sm leading-relaxed">
                  {product.description}
                </div>
              )}

              {/* Product Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Specifications</h3>
                <dl className="space-y-2 text-sm">
                  {product.sku && (
                    <div className="flex">
                      <dt className="text-gray-600 w-24">SKU:</dt>
                      <dd className="text-gray-900">{product.sku}</dd>
                    </div>
                  )}
                  {product.category_name && (
                    <div className="flex">
                      <dt className="text-gray-600 w-24">Category:</dt>
                      <dd className="text-gray-900">
                        <Link href={`/category/${product.category_slug}`} className="text-primary-600 hover:underline">
                          {product.category_name}
                        </Link>
                      </dd>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex">
                      <dt className="text-gray-600 w-24">Weight:</dt>
                      <dd className="text-gray-900">{product.weight} kg</dd>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex">
                      <dt className="text-gray-600 w-24">Dimensions:</dt>
                      <dd className="text-gray-900">{product.dimensions}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Add to Cart Section */}
              <ProductActions product={product} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section - Description & Reviews */}
      <div className="bg-white border-t">
        <div className="container-custom">
          <ProductTabs
            description={product.long_description}
            reviews={product.reviews}
            totalReviews={product.total_reviews}
          />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="bg-white border-t">
          <div className="container-custom py-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold">Related Products</h2>
              {product.category_slug && (
                <Link
                  href={`/category/${product.category_slug}`}
                  className="text-primary-600 hover:underline text-sm font-medium"
                >
                  View All →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((relatedProduct: any) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
