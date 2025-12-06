'use client';

import Link from 'next/link';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#e8f5e9] min-h-screen">
      {/* Header */}
      <div className="bg-[#1b5e20] text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-[#c8e6c9] hover:text-green-300 mb-4">
            <FiArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Contact Us</h1>
          <p className="text-xl text-[#c8e6c9]">We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-black text-[#1b5e20] mb-6">Send us a Message</h2>
            
            {submitted && (
              <div className="mb-6 p-4 bg-[#c8e6c9] text-[#1b5e20] rounded-lg font-bold">
                ✓ Thank you for your message! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-[#1b5e20] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8e6c9]"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-[#1b5e20] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8e6c9]"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-2">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-[#1b5e20] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8e6c9]"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Support</option>
                  <option value="seller">Seller Inquiry</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border-2 border-[#1b5e20] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8e6c9] resize-none"
                  placeholder="Your message..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1b5e20] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#2e7d32] transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Email */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-[#c8e6c9] text-[#1b5e20] p-4 rounded-lg text-2xl">
                  <FiMail />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1b5e20] mb-2">Email</h3>
                  <p className="text-gray-700 mb-1">General Inquiries</p>
                  <a href="mailto:info@localbazar.com" className="text-[#1b5e20] font-bold hover:text-[#2e7d32]">
                    info@localbazar.com
                  </a>
                  <p className="text-gray-700 mt-3 mb-1">Support</p>
                  <a href="mailto:support@localbazar.com" className="text-[#1b5e20] font-bold hover:text-[#2e7d32]">
                    support@localbazar.com
                  </a>
                  <p className="text-gray-700 mt-3 mb-1">Sellers</p>
                  <a href="mailto:sellers@localbazar.com" className="text-[#1b5e20] font-bold hover:text-[#2e7d32]">
                    sellers@localbazar.com
                  </a>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-[#c8e6c9] text-[#1b5e20] p-4 rounded-lg text-2xl">
                  <FiPhone />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1b5e20] mb-2">Phone</h3>
                  <p className="text-gray-700 mb-1">Customer Support</p>
                  <a href="tel:+15551234567" className="text-[#1b5e20] font-bold hover:text-[#2e7d32]">
                    +1 (555) 123-4567
                  </a>
                  <p className="text-gray-700 mt-3 text-sm">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday - Sunday: 10:00 AM - 4:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-[#c8e6c9] text-[#1b5e20] p-4 rounded-lg text-2xl">
                  <FiMapPin />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1b5e20] mb-2">Office</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Local Bazar Headquarters<br />
                    Community Center, 123 Main Street<br />
                    Your City, Your State 12345<br />
                    Country
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-[#1b5e20] text-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-black mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="bg-[#c8e6c9] text-[#1b5e20] w-12 h-12 rounded-full flex items-center justify-center font-bold hover:bg-green-300 transition-colors">
                  f
                </a>
                <a href="#" className="bg-[#c8e6c9] text-[#1b5e20] w-12 h-12 rounded-full flex items-center justify-center font-bold hover:bg-green-300 transition-colors">
                  𝕏
                </a>
                <a href="#" className="bg-[#c8e6c9] text-[#1b5e20] w-12 h-12 rounded-full flex items-center justify-center font-bold hover:bg-green-300 transition-colors">
                  📷
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-black text-[#1b5e20] mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-[#1b5e20] mb-2">What is your response time?</h3>
              <p className="text-gray-700">We aim to respond to all inquiries within 24 business hours.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-[#1b5e20] mb-2">How can I report an issue?</h3>
              <p className="text-gray-700">Use the contact form above or email support@localbazar.com with details.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-[#1b5e20] mb-2">Do you offer partnerships?</h3>
              <p className="text-gray-700">Yes! Email us at partnerships@localbazar.com to discuss collaboration opportunities.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-[#1b5e20] mb-2">Where can I find more resources?</h3>
              <p className="text-gray-700">Check our <Link href="/help" className="text-[#1b5e20] font-bold hover:text-[#2e7d32]">Help Center</Link> for detailed guides.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
