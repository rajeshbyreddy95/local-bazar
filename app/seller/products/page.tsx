'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiLoader, FiX, FiUpload } from 'react-icons/fi';

interface ProductFormData {
  itemName: string;
  category: string;
  description: string;
  price: string;
  discount: string;
  stock: string;
  images: string[];
}

interface UserSession {
  email: string;
  fullName: string;
  phone: string;
  userType: 'buyer' | 'seller';
  shopName?: string;
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

export default function AddProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState<ProductFormData>({
    itemName: '',
    category: 'Electronics',
    description: '',
    price: '',
    discount: '0',
    stock: '',
    images: [],
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();

        if (!data.user) {
          router.push('/auth/login');
          return;
        }

        if (data.user.userType !== 'seller') {
          router.push('/');
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      const newPreviews: string[] = [];

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newPreviews.push(event.target.result as string);
            if (newPreviews.length === files.length) {
              setImagePreview([...imagePreview, ...newPreviews]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    // Validation
    if (!formData.itemName || !formData.category || !formData.description || !formData.price || !formData.stock) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    if (imagePreview.length === 0) {
      setError('Please upload at least one product image');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName: formData.itemName,
          category: formData.category,
          description: formData.description,
          price: parseFloat(formData.price),
          discount: parseFloat(formData.discount) || 0,
          stock: parseInt(formData.stock),
          images: imagePreview,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add product');
        setSubmitting(false);
        return;
      }

      setSuccessMessage('Product added successfully! 🎉');
      setFormData({
        itemName: '',
        category: 'Electronics',
        description: '',
        price: '',
        discount: '0',
        stock: '',
        images: [],
      });
      setImagePreview([]);

      setTimeout(() => {
        router.push('/seller/products/list');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setSubmitting(false);
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
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-8 transition-colors"
        >
          <FiArrowLeft className="text-lg" />
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#1b5e20] mb-2">Add New Product</h1>
          <p className="text-gray-600 font-medium">
            Shop: <span className="text-[#689f38] font-bold">{user.shopName}</span>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-600 font-semibold">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 font-semibold">⚠ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                Product Name *
              </label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full px-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                required
              />
            </div>

            {/* Category and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7] text-[#1b5e20] font-semibold"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                  required
                />
              </div>
            </div>

            {/* Stock and Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                  Discount (%) 
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter detailed product description"
                rows={5}
                className="w-full px-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7] resize-none"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                Product Images * (Minimum 1)
              </label>
              <div className="border-2 border-dashed border-[#689f38] rounded-xl p-6 text-center hover:bg-[#f9fdf7] transition duration-300 cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="imageInput"
                />
                <label htmlFor="imageInput" className="cursor-pointer">
                  <FiUpload className="text-4xl text-[#689f38] mx-auto mb-2" />
                  <p className="text-[#1b5e20] font-bold">Click to upload images</p>
                  <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 5MB each</p>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreview.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-[#e8f5e9]"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition duration-300"
                      >
                        <FiX className="text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#689f38] hover:bg-[#1b5e20] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <FiLoader className="animate-spin" />
                  Adding Product...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
