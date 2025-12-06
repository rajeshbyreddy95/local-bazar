'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiLoader, FiX, FiChevronDown, FiSearch, FiHeart } from 'react-icons/fi';
import Header from '../../components/Header';

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

interface Filters {
  category: string;
  sortBy: 'newest' | 'price-low' | 'price-high' | 'popular';
  minPrice: string;
  maxPrice: string;
  search: string;
}

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Sports',
  'Beauty',
  'Toys',
  'Food & Beverages',
  'Furniture',
  'Automotive',
  'Other',
];

export default function ExploreProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [user, setUser] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    sortBy: 'newest',
    minPrice: '',
    maxPrice: '',
    search: '',
  });

  // Fetch all products with client-side caching
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.category !== 'all') queryParams.append('category', filters.category);
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
        if (filters.search) queryParams.append('search', filters.search);

        const queryString = queryParams.toString();
        const cacheKey = `products_cache_${queryString}`;
        const cachedData = localStorage.getItem(cacheKey);

        // Check client-side cache (localStorage) with 15 minute TTL
        if (cachedData) {
          try {
            const { products: cachedProducts, timestamp } = JSON.parse(cachedData);
            const cacheAge = Date.now() - timestamp;
            const cacheTTL = 15 * 60 * 1000; // 15 minutes

            if (cacheAge < cacheTTL) {
              console.log(`✅ Client Cache HIT (Products): ${cacheKey}`);
              setProducts(cachedProducts);
              setFilteredProducts(cachedProducts);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Invalid cache data, fetching fresh:', e);
          }
        }

        console.log(`📝 Client Cache MISS (Products): ${cacheKey}`);
        const response = await fetch(`/api/products/explore?${queryString}`);
        const data = await response.json();

        if (data.products) {
          setProducts(data.products);
          setFilteredProducts(data.products);

          // Store in client-side cache
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                products: data.products,
                timestamp: Date.now(),
              })
            );
            console.log(`📝 Client Cached (Products): ${cacheKey}`);
          } catch (e) {
            console.warn('Failed to cache products locally:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters]);

  useEffect(() => {
    const fetchUserAndWishlist = async () => {
      try {
        const userRes = await fetch('/api/auth/user');
        const userData = await userRes.json();
        setUser(userData.user);
        if (userData.user) {
          const res = await fetch('/api/wishlist');
          const data = await res.json();
          if (data.wishlist && data.wishlist.items) {
            setWishlist(new Set(data.wishlist.items.map((i: any) => i.productId)));
          }
        }
      } catch (e) {}
    };
    fetchUserAndWishlist();
  }, []);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) return;
    let newWishlist = new Set(wishlist);
    if (wishlist.has(productId)) {
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      newWishlist.delete(productId);
    } else {
      const product = products.find(p => p._id === productId);
      if (product) {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            itemName: product.itemName,
            price: product.price,
            discount: product.discount,
            images: product.images
          })
        });
        newWishlist.add(productId);
      }
    }
    setWishlist(newWishlist);

    // Clear products cache to force refresh on next filter change
    // This ensures product availability and stock info is current
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('products_cache_'));
      keys.forEach(key => localStorage.removeItem(key));
      console.log(`🗑️  Cleared ${keys.length} client-side product caches`);
    } catch (e) {
      console.warn('Failed to clear product cache:', e);
    }
  };

  const openModal = (product: Product) => {
    router.push(`/product/${product._id}/details`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
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
    <div className="min-h-screen bg-[#ccf5d1] py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-4 transition-colors"
            >
              <FiArrowLeft className="text-lg" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-black text-[#1b5e20]">Explore Products</h1>
            <p className="text-lg text-[#689f38] mt-2">
              Discover {filteredProducts.length} amazing products
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <button
              className="w-full flex items-center justify-between bg-white rounded-lg shadow-md px-6 py-4 font-bold text-[#1b5e20] text-lg border-2 border-[#689f38]"
              onClick={() => setShowMobileFilters((prev) => !prev)}
            >
              Filter
              <FiChevronDown className={`ml-2 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
            </button>
            {showMobileFilters && (
              <div className="mt-2 bg-white rounded-lg shadow-md p-6 border-2 border-[#689f38]">
                {/* ...existing filter controls (copy from sidebar below)... */}
                <h2 className="text-xl font-bold text-[#1b5e20] mb-6">Filters</h2>
                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-3 py-2 pl-9 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-sm"
                    />
                    <FiSearch className="absolute left-3 top-2.5 text-[#689f38]" />
                  </div>
                </div>
                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] font-semibold text-sm"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Sort Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] font-semibold text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      placeholder="Min Price"
                      className="w-full px-3 py-2 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-sm"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      placeholder="Max Price"
                      className="w-full px-3 py-2 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-sm"
                    />
                  </div>
                </div>
                {/* Reset Filters */}
                <button
                  onClick={() =>
                    setFilters({
                      category: 'all',
                      sortBy: 'newest',
                      minPrice: '',
                      maxPrice: '',
                      search: '',
                    })
                  }
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
          {/* Sidebar Filters for desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-[#1b5e20] mb-6">Filters</h2>
              {/* ...existing filter controls (same as above)... */}
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 pl-9 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-sm"
                  />
                  <FiSearch className="absolute left-3 top-2.5 text-[#689f38]" />
                </div>
              </div>
              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] font-semibold text-sm"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {/* Sort Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] font-semibold text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min Price"
                    className="w-full px-3 py-2 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-sm"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max Price"
                    className="w-full px-3 py-2 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-sm"
                  />
                </div>
              </div>
              {/* Reset Filters */}
              <button
                onClick={() =>
                  setFilters({
                    category: 'all',
                    sortBy: 'newest',
                    minPrice: '',
                    maxPrice: '',
                    search: '',
                  })
                }
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-lg font-semibold text-gray-600">
                  No products found. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 cursor-pointer group"
                  >
                    {/* Image Container */}
                    <div
                      className="relative h-48 bg-gray-200 overflow-hidden"
                      onClick={() => openModal(product)}
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
                        onClick={() => openModal(product)}
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
                        onClick={() => openModal(product)}
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
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#689f38] text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Details</h2>
              <button
                onClick={closeModal}
                className="hover:bg-[#1b5e20] p-2 rounded-lg transition-colors"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Images Gallery */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[#1b5e20] mb-4">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProduct.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={`${selectedProduct.itemName} ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-lg shadow-md"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Product Information */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Product Name</p>
                  <p className="text-2xl font-black text-[#1b5e20]">{selectedProduct.itemName}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Category</p>
                    <p className="text-lg font-bold text-[#689f38]">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Shop</p>
                    <p className="text-lg font-bold text-[#1b5e20]">{selectedProduct.shopName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Stock</p>
                    <p
                      className={`text-lg font-bold ${
                        selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {selectedProduct.stock > 0
                        ? `${selectedProduct.stock} units available`
                        : 'Out of stock'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Views</p>
                    <p className="text-lg font-bold text-[#689f38]">{selectedProduct.views || 0} views</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600">Description</p>
                  <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 bg-[#e8f5e9] p-6 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Price</p>
                    <p className="text-2xl font-black text-[#689f38]">
                      ₹{selectedProduct.price.toFixed(2)}
                    </p>
                  </div>
                  {selectedProduct.discount > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Discount</p>
                      <p className="text-2xl font-black text-red-600">{selectedProduct.discount}%</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Final Price</p>
                    <p className="text-2xl font-black text-[#1b5e20]">
                      ₹{(selectedProduct.price * (1 - selectedProduct.discount / 100)).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600">Added On</p>
                  <p className="text-gray-700">
                    {new Date(selectedProduct.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => {
                    toggleWishlist(selectedProduct._id);
                  }}
                  className={`flex-1 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    wishlist.has(selectedProduct._id)
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  <FiHeart
                    className={`text-lg ${wishlist.has(selectedProduct._id) ? 'fill-current' : ''}`}
                  />
                  {wishlist.has(selectedProduct._id) ? 'Added to Wishlist' : 'Add to Wishlist'}
                </button>
                <button
                  disabled={selectedProduct.stock === 0}
                  className="flex-1 bg-[#689f38] hover:bg-[#1b5e20] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Add to Cart
                </button>
              </div>

              <button
                onClick={closeModal}
                className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
