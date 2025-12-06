'use client';

import Link from 'next/link';
import { FiArrowLeft, FiChevronDown } from 'react-icons/fi';
import { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    category: 'Buying',
    question: 'How do I place an order?',
    answer: 'Simply browse products, add them to your cart, and proceed to checkout. You can pay using credit card, debit card, or other available payment methods.'
  },
  {
    id: '2',
    category: 'Buying',
    question: 'What is the delivery time?',
    answer: 'Delivery times vary by location and seller. Typically, orders are delivered within 2-3 days. You can check the estimated delivery time before placing an order.'
  },
  {
    id: '3',
    category: 'Buying',
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel orders before they are dispatched. Go to "My Orders" in your profile and select the cancel option. Refunds are processed within 5-7 business days.'
  },
  {
    id: '4',
    category: 'Buying',
    question: 'Is my payment secure?',
    answer: 'Yes, all transactions are encrypted using SSL technology. We do not store your credit card information, and payments are processed through secure payment gateways.'
  },
  {
    id: '5',
    category: 'Selling',
    question: 'How do I become a seller?',
    answer: 'Sign up on Local Bazar, complete your seller profile with business information, and start listing products. Our team verifies your account within 24-48 hours.'
  },
  {
    id: '6',
    category: 'Selling',
    question: 'What are the seller fees?',
    answer: 'We charge a commission of 10% on each sale. This includes platform maintenance, payment processing, and customer support. No other hidden fees.'
  },
  {
    id: '7',
    category: 'Selling',
    question: 'How do I manage my products?',
    answer: 'Use your seller dashboard to add, edit, and delete products. You can manage inventory, prices, images, and product details from one place.'
  },
  {
    id: '8',
    category: 'Account',
    question: 'How do I update my profile?',
    answer: 'Go to your profile settings to update personal information, address, phone number, and password. Changes are saved immediately.'
  },
  {
    id: '9',
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page, enter your email, and follow the link sent to reset your password. The link expires in 24 hours.'
  },
  {
    id: '10',
    category: 'Account',
    question: 'Can I have multiple accounts?',
    answer: 'One person can have one buyer account and one seller account. Using multiple accounts for the same person is not allowed.'
  }
];

export default function Help() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const categories = Array.from(new Set(faqs.map(f => f.category)));

  return (
    <main className="bg-[#e8f5e9] min-h-screen">
      {/* Header */}
      <div className="bg-[#1b5e20] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-[#c8e6c9] hover:text-green-300 mb-4">
            <FiArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Help Center</h1>
          <p className="text-xl text-[#c8e6c9]">Find answers to your questions</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search Section */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full px-4 py-3 border-2 border-[#1b5e20] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8e6c9]"
            />
          </div>
        </div>

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-[#1b5e20] mb-6">Quick Help</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="#buying" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="font-bold text-[#1b5e20]">Buying</h3>
              <p className="text-sm text-gray-700">Questions about orders and purchases</p>
            </Link>
            <Link href="#selling" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="font-bold text-[#1b5e20]">Selling</h3>
              <p className="text-sm text-gray-700">Help for sellers and merchants</p>
            </Link>
            <Link href="#account" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="font-bold text-[#1b5e20]">Account</h3>
              <p className="text-sm text-gray-700">Manage your profile and settings</p>
            </Link>
          </div>
        </section>

        {/* FAQs by Category */}
        {categories.map((category) => (
          <section key={category} id={category.toLowerCase()} className="mb-12">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-6">{category} FAQs</h2>
            <div className="space-y-3">
              {faqs
                .filter(faq => faq.category === category)
                .map((faq) => (
                  <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <button
                      onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f0f7f0] transition-colors"
                    >
                      <span className="font-bold text-[#1b5e20] text-left">{faq.question}</span>
                      <FiChevronDown
                        className={`text-[#1b5e20] transition-transform ${expandedId === faq.id ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {expandedId === faq.id && (
                      <div className="px-6 py-4 bg-[#f0f7f0] border-t border-[#c8e6c9]">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        ))}

        {/* Contact Support */}
        <section className="bg-linear-to-r from-[#1b5e20] to-[#2e7d32] rounded-lg shadow-md p-8 text-white text-center">
          <h2 className="text-3xl font-black mb-4">Still need help?</h2>
          <p className="text-lg mb-6">Our support team is here to help you.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact" className="bg-[#c8e6c9] text-[#1b5e20] px-8 py-3 rounded-lg font-bold hover:bg-green-300 transition-colors">
              Contact Us
            </Link>
            <a href="mailto:support@localbazar.com" className="bg-[#689f38] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#558b2f] transition-colors">
              Email Support
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
