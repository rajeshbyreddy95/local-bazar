'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { FiArrowLeft, FiLoader, FiPlus, FiCheck } from 'react-icons/fi';
import { GrMoney } from 'react-icons/gr';
import { MdQrCode2 } from 'react-icons/md';
import { BsCreditCard } from 'react-icons/bs';
import { showToast } from '@/components/Toast';

interface Address {
  _id: string;
  street: string;
  village: string;
  mandal: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

interface CartItem {
  _id: string;
  itemName: string;
  price: number;
  discount: number;
  images: Array<{ url: string }>;
  quantity: number;
  sellerId: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<'upi' | 'qr' | 'card'>('upi');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * (1 - item.discount / 100) * item.quantity, 0);

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Razorpay SDK loaded successfully');
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay SDK');
      showToast('Failed to load payment gateway', 'error');
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch('/api/cart', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          if (data.cart && data.cart.items) {
            setCart(data.cart.items.map((item: any) => ({
              _id: item.productId || item._id,
              itemName: item.itemName,
              price: item.price,
              discount: item.discount,
              images: item.images,
              quantity: item.quantity,
              sellerId: item.sellerId || '',
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        showToast('Failed to load cart', 'error');
      } finally {
        setIsLoadingCart(false);
      }
    }
    fetchCart();
  }, []);

  // Fetch addresses
  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch('/api/address', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.addresses || []);
          if (data.addresses && data.addresses.length > 0) {
            setSelectedAddress(data.addresses[0]._id);
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        showToast('Failed to load addresses', 'error');
      } finally {
        setIsLoadingAddresses(false);
      }
    }
    fetchAddresses();
  }, []);

  const handleAddAddress = () => {
    router.push('/addaddress');
  };

  const handleProcessPayment = async () => {
    if (!selectedAddress) {
      showToast('Please select an address', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!razorpayLoaded) {
      showToast('Payment gateway is still loading. Please try again.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // First, create order in database to store transaction
      const response = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to paise
          addressId: selectedAddress,
          cartItems: cart,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to create payment order';
        
        // Check if it's a stock issue
        if (errorMessage.includes('Insufficient stock')) {
          showToast(`❌ ${errorMessage}`, 'error');
        } else {
          showToast(errorMessage, 'error');
        }
        setIsProcessing(false);
        return;
      }

      const { orderId, orderDbId } = await response.json();

      console.log('📦 Order created - DB ID:', orderDbId, 'Receipt:', orderId);

      // Now open Razorpay with simple payment (no order_id required)
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'Local Bazar',
        description: 'Purchase from Local Bazar',
        method: selectedPayment === 'card' ? 'emandate' : selectedPayment,
        handler: async (response: any) => {
          try {
            console.log('=== 🎉 Payment Successful ===');
            console.log('💳 Payment ID:', response.razorpay_payment_id);
            console.log('💰 Amount:', Math.round(total * 100), 'paise');

            // Verify payment with backend
            console.log('📤 Sending verification request...');
            const verifyResponse = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: orderDbId, // Use our MongoDB order ID
              }),
            });

            const verifyData = await verifyResponse.json();
            console.log('📥 Verification response:', verifyData);

            if (verifyResponse.ok) {
              console.log('✅ Payment verified successfully');
              showToast('✅ Payment successful! Order placed.', 'success');

              // Clear cart
              try {
                await fetch('/api/cart', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({}),
                });
              } catch (cartError) {
                console.error('Error clearing cart:', cartError);
              }

              setTimeout(() => router.push('/orders'), 2000);
            } else {
              const errorMsg = verifyData.error || verifyData.details || 'Payment verification failed';
              console.error('❌ Verification failed:', errorMsg);
              showToast(`❌ ${errorMsg}`, 'error');
              setIsProcessing(false);
            }
          } catch (error) {
            console.error('=== ❌ Payment Verification Error ===');
            console.error('Error:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
            showToast(`❌ ${errorMsg}`, 'error');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#689f38',
        },
      };

      // Cast window and Razorpay
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const rzp = new Razorpay(options);
      
      rzp.on('payment.failed', (error: any) => {
        console.error('❌ Payment failed:', error);
        showToast(`❌ Payment failed: ${error.description}`, 'error');
        setIsProcessing(false);
      });

      rzp.open();
    } catch (error) {
      console.error('❌ Payment error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to process payment';
      showToast(`❌ ${errorMsg}`, 'error');
      setIsProcessing(false);
    }
  };

  if (isLoadingCart || isLoadingAddresses) {
    return (
      <main className="bg-[#ccf5d1] min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FiLoader className="text-6xl text-[#689f38] animate-spin mx-auto mb-4" />
            <p className="text-xl font-bold text-[#1b5e20]">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#ccf5d1] min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/cart" className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-8">
          <FiArrowLeft /> Back to Cart
        </Link>

        <h1 className="text-4xl font-black text-[#1b5e20] mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary - Left 60% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#1b5e20] mb-4">📍 Delivery Address</h2>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No addresses found</p>
                  <button
                    onClick={handleAddAddress}
                    className="flex items-center justify-center gap-2 mx-auto bg-[#689f38] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#1b5e20] transition"
                  >
                    <FiPlus /> Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label key={addr._id} className="flex items-start gap-4 p-4 border-2 border-[#e8f5e9] rounded-lg cursor-pointer hover:border-[#689f38] transition">
                      <input
                        type="radio"
                        name="address"
                        value={addr._id}
                        checked={selectedAddress === addr._id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-[#1b5e20]">{addr.street}</p>
                        <p className="text-sm text-gray-600">{addr.fullAddress}</p>
                        <p className="text-sm text-gray-600">{addr.pincode}, {addr.state}</p>
                      </div>
                    </label>
                  ))}
                  <button
                    onClick={handleAddAddress}
                    className="w-full flex items-center justify-center gap-2 mt-4 bg-[#e8f5e9] text-[#1b5e20] px-6 py-2 rounded-lg font-bold hover:bg-[#ccf5d1] transition"
                  >
                    <FiPlus /> Add New Address
                  </button>
                </div>
              )}
            </div>

            {/* Cart Items Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#1b5e20] mb-4">📦 Order Items</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-4 pb-4 border-b border-[#e8f5e9] last:border-b-0">
                    <img src={item.images[0]?.url} alt={item.itemName} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="font-bold text-[#1b5e20]">{item.itemName}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-bold text-[#689f38]">₹{(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Section */}
            
            {/* <div className="bg-white rounded-xl shadow-lg p-6"> */}
              {/* <h2 className="text-2xl font-bold text-[#1b5e20] mb-4">💳 Payment Method</h2>
              <div className="grid grid-cols-3 gap-4"> */}
                {/* UPI Option */}
                {/* <label className={`p-4 rounded-xl border-2 cursor-pointer transition ${selectedPayment === 'upi' ? 'border-[#689f38] bg-[#f1f8e9]' : 'border-[#e8f5e9] bg-white'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={selectedPayment === 'upi'}
                    onChange={(e) => setSelectedPayment(e.target.value as any)}
                    className="hidden"
                  />
                  <div className="text-center">
                    <GrMoney className="text-4xl text-[#689f38] mx-auto mb-2" />
                    <p className="font-bold text-[#1b5e20]">UPI</p>
                    <p className="text-xs text-gray-600 mt-1">Google Pay, PhonePe</p>
                  </div>
                </label> */}

                {/* QR Code Option */}
                {/* <label className={`p-4 rounded-xl border-2 cursor-pointer transition ${selectedPayment === 'qr' ? 'border-[#689f38] bg-[#f1f8e9]' : 'border-[#e8f5e9] bg-white'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="qr"
                    checked={selectedPayment === 'qr'}
                    onChange={(e) => setSelectedPayment(e.target.value as any)}
                    className="hidden"
                  />
                  <div className="text-center">
                    <MdQrCode2 className="text-4xl text-[#689f38] mx-auto mb-2" />
                    <p className="font-bold text-[#1b5e20]">QR Code</p>
                    <p className="text-xs text-gray-600 mt-1">Scan to pay</p>
                  </div>
                </label> */}

                {/* Card Option */}
                {/* <label className={`p-4 rounded-xl border-2 cursor-pointer transition ${selectedPayment === 'card' ? 'border-[#689f38] bg-[#f1f8e9]' : 'border-[#e8f5e9] bg-white'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={selectedPayment === 'card'}
                    onChange={(e) => setSelectedPayment(e.target.value as any)}
                    className="hidden"
                  />
                  <div className="text-center">
                    <BsCreditCard className="text-4xl text-[#689f38] mx-auto mb-2" />
                    <p className="font-bold text-[#1b5e20]">Card</p>
                    <p className="text-xs text-gray-600 mt-1">Debit/Credit</p>
                  </div>
                </label> */}
              {/* </div> */}
            {/* </div> */}


          </div>

          {/* Order Total - Right 40% */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <h2 className="text-2xl font-bold text-[#1b5e20] mb-4">💰 Order Summary</h2>
            <div className="space-y-3 border-b border-[#e8f5e9] pb-4 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Items ({cart.length})</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>₹0</span>
              </div>
            </div>
            <div className="flex justify-between text-2xl font-bold text-[#1b5e20] mb-6">
              <span>Total</span>
              <span className="text-[#689f38]">₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing || cart.length === 0 || addresses.length === 0 || !razorpayLoaded}
              className="w-full flex items-center justify-center gap-2 bg-[#689f38] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#1b5e20] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!razorpayLoaded ? (
                <>
                  <FiLoader className="animate-spin" /> Loading Gateway...
                </>
              ) : isProcessing ? (
                <>
                  <FiLoader className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <FiCheck /> Proceed to Pay
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              {selectedPayment === 'upi' && '💡 Use Google Pay or PhonePe for instant payment'}
              {selectedPayment === 'qr' && '💡 Scan the QR code with any UPI app'}
              {selectedPayment === 'card' && '💡 Enter your debit/credit card details'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
