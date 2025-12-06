'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiLoader, FiX, FiUpload } from 'react-icons/fi';

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [user, setUser] = useState<UserSession | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
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

  const [imagePreview, setImagePreview] = useState<Array<{ url: string; isNew: boolean }>>([]);

  // Fetch user and product data
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

        // Fetch product
        const productResponse = await fetch(`/api/products/${productId}`);
        const productData = await productResponse.json();

        if (!productData.product) {
          setError('Product not found');
          return;
        }

        const prod = productData.product;
        setProduct(prod);

        // Pre-fill form
        setFormData({
          itemName: prod.itemName,
          category: prod.category,
          description: prod.description,
          price: prod.price.toString(),
          discount: prod.discount.toString(),
          stock: prod.stock.toString(),
          images: [],
        });

        // Set image previews
        if (prod.images && prod.images.length > 0) {
          setImagePreview(
            prod.images.map((img: any) => ({
              url: img.url,
              isNew: false,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, productId]);

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
      const newPreviews: Array<{ url: string; isNew: boolean }> = [];

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const result = event.target.result as string;
            newImages.push(result);
            newPreviews.push({
              url: result,
              isNew: true,
            });

            if (newPreviews.length === files.length) {
              setImagePreview([...imagePreview, ...newPreviews]);
              setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...newImages],
              }));
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const removedImage = imagePreview[index];
    setImagePreview((prev) => prev.filter((_, i) => i !== index));

    // If it's a new image, remove from formData.images
    if (removedImage.isNew) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
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
      setError('Please keep at least one product image');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
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
          images: formData.images, // Only new images to upload
          existingImages: imagePreview
            .filter((img) => !img.isNew)
            .map((img) => img.url), // Existing images to keep
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update product');
        setSubmitting(false);
        return;
      }

      setSuccessMessage('Product updated successfully! 🎉');

      setTimeout(() => {
        router.push('/seller/products/analytics');
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
          <p className="mt-4 text-[#1b5e20] font-bold text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!user || !product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#ccf5d1] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/seller/products/analytics"
          className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-8 transition-colors"
        >
          <FiArrowLeft className="text-lg" />
          Back to Analytics
        </Link>

        {/* Header */}
        <h1 className="text-4xl font-black text-[#1b5e20] mb-8">Edit Product</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border-2 border-red-200">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border-2 border-green-200">
            <p className="text-green-700 font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Product Name and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-[#1b5e20] mb-2">Product Name *</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-[#1b5e20] font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1b5e20] mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-[#1b5e20] font-semibold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#1b5e20] mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={4}
              className="w-full px-4 py-3 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-[#1b5e20] font-semibold"
            />
          </div>

          {/* Price, Discount, Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-[#1b5e20] mb-2">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-[#1b5e20] font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1b5e20] mb-2">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="100"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-[#1b5e20] font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1b5e20] mb-2">Stock (units) *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#689f38] focus:outline-none focus:border-[#1b5e20] text-[#1b5e20] font-semibold"
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#1b5e20] mb-4">Product Images *</label>

            {/* Image Upload Area */}
            <div className="border-2 border-dashed border-[#689f38] rounded-lg p-8 mb-6 text-center hover:bg-[#e8f5e9] transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-input"
              />
              <label htmlFor="image-input" className="cursor-pointer">
                <FiUpload className="text-4xl text-[#689f38] mx-auto mb-3" />
                <p className="text-[#1b5e20] font-bold text-lg mb-1">Click to upload more images</p>
                <p className="text-gray-600 text-sm">or drag and drop</p>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreview.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX className="text-lg" />
                    </button>
                    {img.isNew && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        NEW
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#689f38] hover:bg-[#1b5e20] disabled:opacity-50 text-white font-bold py-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 text-lg"
          >
            {submitting ? (
              <>
                <FiLoader className="animate-spin" />
                Updating Product...
              </>
            ) : (
              'Update Product'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
