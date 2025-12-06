'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function About() {
  return (
    <main className="bg-[#e8f5e9] min-h-screen">
      {/* Header */}
      <div className="bg-[#1b5e20] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-[#c8e6c9] hover:text-green-300 mb-4">
            <FiArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">About Local Bazar</h1>
          <p className="text-xl text-[#c8e6c9]">Connecting communities through local commerce</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Mission */}
        <section className="mb-16 bg-white rounded-lg shadow-md p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-5xl">🎯</div>
            <div>
              <h2 className="text-3xl font-black text-[#1b5e20] mb-4">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Local Bazar is dedicated to empowering small businesses, farmers, and artisans by providing them with a digital marketplace to reach customers directly. We believe in the power of community commerce and sustainable local growth.
              </p>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-black text-[#1b5e20] mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-black text-[#1b5e20] mb-3">Sustainability</h3>
              <p className="text-gray-700">Supporting local businesses reduces carbon footprint and promotes sustainable economic growth.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-black text-[#1b5e20] mb-3">Community</h3>
              <p className="text-gray-700">We believe in building strong communities where businesses and customers support each other.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-black text-[#1b5e20] mb-3">Innovation</h3>
              <p className="text-gray-700">We continuously innovate to provide the best platform for local commerce and fair trade.</p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-black text-[#1b5e20] mb-8">Why Choose Local Bazar?</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-[#1b5e20] text-2xl font-black">✓</span>
              <span className="text-lg text-gray-700"><strong>Direct Support:</strong> Your purchases directly support local businesses and farmers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#1b5e20] text-2xl font-black">✓</span>
              <span className="text-lg text-gray-700"><strong>Fresh Products:</strong> Get fresh, quality products directly from local suppliers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#1b5e20] text-2xl font-black">✓</span>
              <span className="text-lg text-gray-700"><strong>Fair Pricing:</strong> No middlemen means better prices for customers and better margins for sellers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#1b5e20] text-2xl font-black">✓</span>
              <span className="text-lg text-gray-700"><strong>Fast Delivery:</strong> Enjoy quick delivery from nearby sellers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#1b5e20] text-2xl font-black">✓</span>
              <span className="text-lg text-gray-700"><strong>Safe & Secure:</strong> Secure payments and verified sellers for a safe shopping experience</span>
            </li>
          </ul>
        </section>

        {/* Call to Action */}
        <section className="bg-linear-to-r from-[#1b5e20] to-[#2e7d32] rounded-lg shadow-md p-8 text-white text-center">
          <h2 className="text-3xl font-black mb-4">Join the Local Bazar Community</h2>
          <p className="text-lg mb-6">Whether you're a buyer or seller, you're part of something bigger - building a stronger local economy.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/products" className="bg-[#c8e6c9] text-[#1b5e20] px-8 py-3 rounded-lg font-bold hover:bg-green-300 transition-colors">
              Explore Products
            </Link>
            <Link href="/auth/signup" className="bg-[#689f38] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#558b2f] transition-colors">
              Join as Seller
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
