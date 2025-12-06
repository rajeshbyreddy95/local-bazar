'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';

interface Product {
  _id: string;
  itemName: string;
  category: string;
  price: number;
  discount: number;
  stock: number;
  images: { url: string }[];
  createdAt: string;
}

interface UserSession {
  email: string;
  fullName: string;
  userType: 'buyer' | 'seller';
  shopName?: string;
}

export default function ProductsListPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserAndProducts = async () => {
      try {
        // Fetch user
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

        if (productsResponse.ok) {
          setProducts(productsData.products);
        } else {
          setError(productsData.error || 'Failed to fetch products');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProducts();
  }, [router]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ccf5d1] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#689f38]"></div>
          <p className="mt-4 text-[#1b5e20] font-bold text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#ccf5d1] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-8 transition-colors"
        >
          <FiArrowLeft className="text-lg" />
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-[#1b5e20] mb-2">My Products</h1>
            <p className="text-gray-600 font-medium">
              Shop: <span className="text-[#689f38] font-bold">{user.shopName}</span>
            </p>
          </div>
          <Link
            href="/seller/products"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#689f38] text-white font-bold hover:bg-[#1b5e20] transition duration-300"
          >
            <FiPlus className="text-lg" />
            Add Product
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 font-medium text-lg mb-6">No products added yet</p>
            <Link
              href="/seller/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#689f38] text-white font-bold hover:bg-[#1b5e20] transition duration-300"
            >
              <FiPlus className="text-lg" />
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
              >
                {/* Product Image */}
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.itemName}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-[#ccf5d1] flex items-center justify-center">
                    <p className="text-gray-500">No image</p>
                  </div>
                )}

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[#1b5e20] mb-1 truncate">
                    {product.itemName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{product.category}</p>

                  {/* Price Section */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-black text-[#689f38]">
                      ₹{product.price.toFixed(2)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Stock Badge */}
                  <p className="text-sm font-semibold mb-4">
                    <span className="text-[#1b5e20]">Stock: </span>
                    <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.stock} units
                    </span>
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/seller/products/edit/${product._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#689f38] text-white font-semibold hover:bg-[#1b5e20] transition duration-300"
                    >
                      <FiEdit className="text-lg" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition duration-300"
                    >
                      <FiTrash2 className="text-lg" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
