'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiLoader,
  FiHeart,
  FiShoppingCart,
  FiTruck,
  FiShield,
  FiRotateCcw,
  FiStar,
  FiMapPin,
} from 'react-icons/fi';
import Header from '../../../../components/Header';

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
  sellerEmail: string;
  createdAt: string;
  views: number;
}

interface UserSession {
  email: string;
  fullName: string;
  userType: 'buyer' | 'seller';
}

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch user, product, and cart
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const userResponse = await fetch('/api/auth/user');
        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch product
        const productResponse = await fetch(`/api/products/${productId}`);
        const productData = await productResponse.json();
        if (productData.product) {
          setProduct(productData.product);
        }

        // Fetch cart
        const cartResponse = await fetch('/api/cart', { method: 'GET' });
        const cartData = await cartResponse.json();
        if (cartData.cart && cartData.cart.items) {
          setCart(cartData.cart.items);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !product) return;
      try {
        const res = await fetch('/api/wishlist', { method: 'GET' });
        const data = await res.json();
        if (data.wishlist && data.wishlist.items.some((i: any) => i.productId === product._id)) {
          setInWishlist(true);
        } else {
          setInWishlist(false);
        }
      } catch (e) {}
    };
    checkWishlist();
  }, [user, product]);

  const finalPrice = product ? product.price * (1 - product.discount / 100) : 0;
  const savingAmount = product ? product.price - finalPrice : 0;

  const inCart = product && cart.some(i => (i.productId === product._id || i._id === product._id));

  const handleAddToCart = async () => {
    if (!product) return;
    setCartLoading(true);
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product._id,
        itemName: product.itemName,
        price: product.price,
        discount: product.discount,
        images: product.images,
        quantity,
        sellerId: product._id, // Include product ID as seller ID
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.cart && data.cart.items) {
        setCart(data.cart.items);
      }
      setShowToast(true);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setShowToast(false), 2000);
    }
    setCartLoading(false);
  };

  const handleRemoveFromCart = async () => {
    if (!product) return;
    setCartLoading(true);
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product._id })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.cart && data.cart.items) {
        setCart(data.cart.items);
      }
    }
    setCartLoading(false);
  };

  const handleToggleWishlist = async () => {
    if (!user || !product) return;
    if (inWishlist) {
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id })
      });
      setInWishlist(false);
    } else {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          itemName: product.itemName,
          price: product.price,
          discount: product.discount,
          images: product.images
        })
      });
      setInWishlist(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8f5e9]">
        <div className="flex flex-col items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#689f38] mb-6"></div>
          <p className="text-2xl font-bold text-[#1b5e20]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#ccf5d1] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/products"
            className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-8 transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            Back to Products
          </Link>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-lg font-semibold text-gray-600">Product not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />

      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#e8f5e9] border-2 border-[#689f38] rounded-lg px-8 py-4 shadow-lg flex items-center gap-4 animate-slide-in">
          <span className="text-[#1b5e20] font-bold text-lg">Added to cart!</span>
          <div className="w-24 h-2 bg-[#ccf5d1] rounded-full overflow-hidden">
            <div className="h-2 bg-[#689f38] animate-toast-bar" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#ccf5d1] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link
            href="/products"
            className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-8 transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            Back to Products
          </Link>

          {/* Main Content */}
          <div className="rounded-2xl shadow-2xl overflow-hidden lg:bg-transparent bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Left Side - Image Gallery */}
              <div className="flex flex-col lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]">
                {/* Main Image */}
                <div className="relative mb-6">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                    {product.images && product.images.length > 0 ? (
                      <>
                        <img
                          src={product.images[selectedImageIndex].url}
                          alt={product.itemName}
                          className="w-full h-full object-contain"
                        />
                        {/* Discount Badge */}
                        {product.discount > 0 && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                            -{product.discount}%
                          </div>
                        )}

                        {/* Stock Badge */}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <div className="text-white text-center">
                              <p className="text-2xl font-bold">Out of Stock</p>
                              <p className="text-sm mt-2">This product is currently unavailable</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <p className="text-lg font-semibold">No Image Available</p>
                      </div>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={handleToggleWishlist}
                    className={`absolute top-4 left-4 p-3 rounded-full transition-all shadow-lg ${
                      inWishlist
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <FiHeart className={`text-2xl ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === idx
                            ? 'border-[#689f38] shadow-md'
                            : 'border-gray-300 hover:border-[#689f38]'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`${product.itemName} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side - Product Information */}
              <div className="flex flex-col overflow-y-auto lg:max-h-[calc(100vh-6rem)] pr-2 lg:scrollbar-none">
                {/* Category and Shop */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase text-[#689f38] bg-[#e8f5e9] px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                    {product.stock > 0 && (
                      <span className="text-xs font-bold uppercase text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        In Stock
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FiMapPin className="text-[#689f38]" />
                    <strong>Shop:</strong> {product.shopName}
                  </p>
                </div>

                {/* Product Name */}
                <h1 className="text-4xl font-black text-[#1b5e20] mb-4 leading-tight">
                  {product.itemName}
                </h1>

                {/* Rating and Views */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b-2 border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`text-lg ${
                            i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(4.0)</span>
                  </div>
                  {/* <p className="text-sm text-gray-600">
                    <strong>{product.views || 0}</strong> views
                  </p> */}
                </div>

                {/* Price Section */}
                <div className="mb-8 p-6 bg-[#e8f5e9] rounded-lg">
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="text-5xl font-black text-[#689f38]">
                      ₹{finalPrice.toFixed(2)}
                    </span>
                    {product.discount > 0 && (
                      <>
                        <span className="text-2xl line-through text-gray-500">
                          ₹{product.price.toFixed(2)}
                        </span>
                        <span className="text-xl font-bold text-red-600">
                          Save ₹{savingAmount.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {product.discount > 0
                      ? `${product.discount}% discount applied`
                      : 'Best price available'}
                  </p>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-[#1b5e20] mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {product.description}
                  </p>
                </div>

                {/* Stock Information */}
                <div className="mb-8 p-4 border-2 border-[#689f38] rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Stock Available</p>
                  <p className={`text-2xl font-black ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
                  </p>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mb-8 flex items-center gap-4">
                    <span className="font-bold text-[#1b5e20]">Quantity:</span>
                    <div className="flex items-center border-2 border-[#689f38] rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 font-bold text-[#689f38] hover:bg-[#e8f5e9]"
                      >
                        −
                      </button>
                      <span className="px-6 py-2 font-bold text-[#1b5e20]">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-2 font-bold text-[#689f38] hover:bg-[#e8f5e9]"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.stock > 10 ? 'Max 10 per order' : `Max ${product.stock}`}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mb-8">
                  {inCart ? (
                    <button
                      onClick={handleRemoveFromCart}
                      disabled={cartLoading}
                      className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 disabled:bg-gray-400 font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
                    >
                      <FiShoppingCart className="text-2xl" />
                      Remove from Cart
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0 || cartLoading}
                      className="flex-1 bg-[#689f38] hover:bg-[#1b5e20] disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
                    >
                      <FiShoppingCart className="text-2xl" />
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  )}
                  <button
                    onClick={handleToggleWishlist}
                    className={`px-6 py-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 text-lg ${
                      inWishlist
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FiHeart className={inWishlist ? 'fill-current' : ''} />
                    {inWishlist ? 'Saved' : 'Save'}
                  </button>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-3 gap-4 pt-8 border-t-2 border-gray-200">
                  <div className="text-center p-4 bg-[#e8f5e9] rounded-lg">
                    <FiTruck className="text-3xl text-[#689f38] mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#1b5e20]">Fast Delivery</p>
                  </div>
                  <div className="text-center p-4 bg-[#e8f5e9] rounded-lg">
                    <FiShield className="text-3xl text-[#689f38] mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#1b5e20]">Secure Payment</p>
                  </div>
                  <div className="text-center p-4 bg-[#e8f5e9] rounded-lg">
                    <FiRotateCcw className="text-3xl text-[#689f38] mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#1b5e20]">Easy Returns</p>
                  </div>
                </div>

                {/* Seller Contact Info */}
                <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <h3 className="font-bold text-[#1b5e20] mb-2">Seller Information</h3>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Shop:</strong> {product.shopName}
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Email:</strong> {product.sellerEmail}
                  </p>
                  <button className="w-full px-4 py-2 bg-[#689f38] hover:bg-[#1b5e20] text-white font-bold rounded-lg transition-colors">
                    Contact Seller
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-black text-[#1b5e20] mb-8">Related Products</h2>
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 font-semibold">
                Related products feature coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
