'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiLoader, FiX, FiChevronDown } from 'react-icons/fi';

interface Product {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  images: Array<{ url: string; publicId: string }>;
  createdAt: string;
}

interface UserSession {
  email: string;
  fullName: string;
  userType: 'buyer' | 'seller';
}

interface Filters {
  category: string;
  sortBy: 'price-low' | 'price-high' | 'newest';
}

export default function ProductsAnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    sortBy: 'newest',
  });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verify user is authenticated and is a seller
        const userResponse = await fetch('/api/auth/user');
        const userData = await userResponse.json();

        if (!userData.user) {
          router.push('/auth/login');
          return;
        }

        if (userData.user.userType !== 'seller') {
          router.push('/');
          return;
        }

        setUser(userData.user);

        // Fetch products
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();

        if (productsData.products) {
          setProducts(productsData.products);
          setFilteredProducts(productsData.products);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    // Sort by price or date
    if (filters.sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredProducts(filtered);
  }, [filters, products]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#ccf5d1] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/auth/profile"
              className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-4 transition-colors"
            >
              <FiArrowLeft className="text-lg" />
              Back to Profile
            </Link>
            <h1 className="text-4xl font-black text-[#1b5e20]">Products Analytics</h1>
            <p className="text-lg text-[#689f38] mt-2">Total Products: {filteredProducts.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-[#1b5e20] mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-[#1b5e20] font-semibold"
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as Filters['sortBy'])}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-[#1b5e20] font-semibold"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg font-semibold text-gray-600">No products found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#689f38] text-white">
                    <th className="px-6 py-4 text-left font-bold">Product Name</th>
                    <th className="px-6 py-4 text-left font-bold">Category</th>
                    <th className="px-6 py-4 text-left font-bold">Price</th>
                    <th className="px-6 py-4 text-left font-bold">Discount</th>
                    <th className="px-6 py-4 text-left font-bold">Stock</th>
                    <th className="px-6 py-4 text-left font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-gray-200 hover:bg-[#e8f5e9] transition-colors cursor-pointer"
                      onClick={() => openModal(product)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0].url}
                              alt={product.itemName}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <span className="font-semibold text-[#1b5e20]">{product.itemName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{product.category}</td>
                      <td className="px-6 py-4 font-bold text-[#689f38]">₹{product.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {product.discount > 0 ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                            {product.discount}%
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold px-3 py-1 rounded-full ${
                            product.stock > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(product);
                          }}
                          className="bg-[#689f38] hover:bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                    <p className="text-sm font-semibold text-gray-600">Stock</p>
                    <p
                      className={`text-lg font-bold ${
                        selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {selectedProduct.stock} units
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600">Description</p>
                  <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 bg-[#e8f5e9] p-6 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Price</p>
                    <p className="text-2xl font-black text-[#689f38]">₹{selectedProduct.price.toFixed(2)}</p>
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
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => {
                    closeModal();
                    router.push(`/seller/products/edit/${selectedProduct._id}`);
                  }}
                  className="flex-1 bg-[#689f38] hover:bg-[#1b5e20] text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Edit Product
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
