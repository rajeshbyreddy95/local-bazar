'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiLoader, FiHeart, FiShoppingBag } from 'react-icons/fi';

interface Product {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  images: Array<{ url: string; publicId: string }>;
  shopName: string;
  createdAt: string;
  views: number;
}

const CATEGORY_MAP: { [key: string]: string } = {
  'vegetables': 'Vegetables',
  'fruits': 'Fruits',
  'dairy-more': 'Dairy & More',
  'clothing': 'Clothing',
  'electronics': 'Electronics',
  'home-kitchen': 'Home & Kitchen',
  'books': 'Books',
  'sports': 'Sports',
  'beauty': 'Beauty',
  'toys': 'Toys',
  'food-beverages': 'Food & Beverages',
  'furniture': 'Furniture',
  'automotive': 'Automotive',
  'other': 'Other',
};

const CATEGORY_EMOJIS: { [key: string]: string } = {
  'vegetables': '🥬',
  'fruits': '🍎',
  'dairy-more': '🧀',
  'clothing': '👔',
  'electronics': '📱',
  'home-kitchen': '🏠',
  'books': '📚',
  'sports': '⚽',
  'beauty': '💄',
  'toys': '🎮',
  'food-beverages': '🍔',
  'furniture': '🪑',
  'automotive': '🚗',
  'other': '📦',
};

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = params.slug as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const categoryName = CATEGORY_MAP[categorySlug] || categorySlug;
  const categoryEmoji = CATEGORY_EMOJIS[categorySlug] || '📦';

  // Fetch products by category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `/api/products/explore?category=${encodeURIComponent(categoryName)}`
        );
        const data = await response.json();

        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName !== categorySlug) {
      fetchProducts();
    }
  }, [categorySlug, categoryName]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ccf5d1] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#689f38]"></div>
          <p className="mt-4 text-[#1b5e20] font-bold text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ccf5d1] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-8 transition-colors"
        >
          <FiArrowLeft className="text-lg" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-[#1b5e20] mb-2">
            {categoryEmoji} {categoryName}
          </h1>
          <p className="text-xl text-[#689f38] font-semibold">
            {products.length} product{products.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Products or Empty State */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-16 text-center">
            <p className="text-6xl mb-4">🛍️</p>
            <p className="text-2xl font-bold text-[#1b5e20] mb-4">
              No products in {categoryName} category yet
            </p>
            <p className="text-gray-600 font-semibold mb-8">
              Check back soon or explore other categories!
            </p>
            <Link href="/products">
              <button className="bg-[#689f38] hover:bg-[#1b5e20] text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto text-lg">
                <FiShoppingBag className="text-xl" />
                Explore All Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 cursor-pointer group"
              >
                {/* Image Container */}
                <div
                  className="relative h-48 bg-gray-200 overflow-hidden"
                  onClick={() => router.push(`/product/${product._id}/details`)}
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.itemName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                      -{product.discount}%
                    </div>
                  )}

                  {/* Stock Status */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <p className="text-white font-bold text-lg">Out of Stock</p>
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product._id);
                    }}
                    className={`absolute top-3 left-3 p-2 rounded-full transition-all ${
                      wishlist.has(product._id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <FiHeart
                      className={`text-lg ${wishlist.has(product._id) ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                    {product.category}
                  </p>

                  <h3
                    className="text-lg font-bold text-[#1b5e20] mb-2 line-clamp-2 hover:text-[#689f38] cursor-pointer"
                    onClick={() => router.push(`/product/${product._id}/details`)}
                  >
                    {product.itemName}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>

                  {/* Shop Name */}
                  <p className="text-xs text-[#689f38] font-semibold mb-3">🏪 {product.shopName}</p>

                  {/* Price Section */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-black text-[#689f38]">
                      ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm line-through text-gray-500">
                        ₹{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <p
                    className={`text-sm font-bold ${
                      product.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </p>

                  {/* View Details Button */}
                  <button
                    onClick={() => router.push(`/product/${product._id}/details`)}
                    disabled={product.stock === 0}
                    className="w-full mt-4 bg-[#689f38] hover:bg-[#1b5e20] disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Explore All Products Button (if category has products) */}
        {products.length > 0 && (
          <div className="mt-12 text-center">
            <Link href="/products">
              <button className="bg-[#689f38] hover:bg-[#1b5e20] text-white font-bold py-4 px-8 rounded-lg transition-colors inline-flex items-center justify-center gap-2 text-lg">
                <FiShoppingBag className="text-xl" />
                Explore All Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
