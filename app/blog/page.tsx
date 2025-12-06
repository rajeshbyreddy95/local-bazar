'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How Local Farmers Are Transforming Agriculture',
    excerpt: 'Discover how Local Bazar is helping farmers reach customers directly and increase their income.',
    category: 'Agriculture',
    date: 'Jan 15, 2025',
    readTime: '5 min read',
    image: '🌾'
  },
  {
    id: '2',
    title: 'Supporting Small Businesses in Your Community',
    excerpt: 'Learn why supporting local businesses strengthens your community and creates sustainable growth.',
    category: 'Community',
    date: 'Jan 12, 2025',
    readTime: '7 min read',
    image: '🏪'
  },
  {
    id: '3',
    title: 'Fresh Produce: From Farm to Your Table',
    excerpt: 'Understand the journey of fresh produce and how direct sourcing ensures quality and freshness.',
    category: 'Farming',
    date: 'Jan 10, 2025',
    readTime: '6 min read',
    image: '🥬'
  },
  {
    id: '4',
    title: 'The Future of E-Commerce: Local First',
    excerpt: 'Exploring how local marketplaces are reshaping the e-commerce landscape and consumer behavior.',
    category: 'Technology',
    date: 'Jan 8, 2025',
    readTime: '8 min read',
    image: '💻'
  },
  {
    id: '5',
    title: 'Sustainable Shopping: Making a Difference',
    excerpt: 'Tips for conscious consumers on how to shop sustainably and support local economies.',
    category: 'Sustainability',
    date: 'Jan 5, 2025',
    readTime: '5 min read',
    image: '♻️'
  },
  {
    id: '6',
    title: 'Seller Spotlight: Success Stories',
    excerpt: 'Meet local sellers who have transformed their businesses through Local Bazar.',
    category: 'Success Stories',
    date: 'Jan 1, 2025',
    readTime: '6 min read',
    image: '⭐'
  }
];

export default function Blog() {
  return (
    <main className="bg-[#e8f5e9] min-h-screen">
      {/* Header */}
      <div className="bg-[#1b5e20] text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-[#c8e6c9] hover:text-green-300 mb-4">
            <FiArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Local Bazar Blog</h1>
          <p className="text-xl text-[#c8e6c9]">Stories, tips, and insights from our community</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="bg-linear-to-r from-[#1b5e20] to-[#2e7d32] p-6 text-center">
                <div className="text-6xl mb-2">{post.image}</div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block bg-[#c8e6c9] text-[#1b5e20] px-3 py-1 rounded-full text-sm font-semibold">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                </div>
                <h2 className="text-xl font-black text-[#1b5e20] mb-3 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{post.date}</span>
                  <button className="text-[#1b5e20] font-bold hover:text-[#2e7d32] transition-colors">
                    Read More →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Subscribe Section */}
        <div className="mt-16 bg-linear-to-r from-[#1b5e20] to-[#2e7d32] rounded-lg shadow-md p-8 text-white text-center">
          <h2 className="text-3xl font-black mb-4">Stay Updated</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive the latest stories, tips, and updates from Local Bazar community.
          </p>
          <div className="flex gap-2 max-w-md mx-auto flex-col sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#c8e6c9]"
            />
            <button className="bg-[#c8e6c9] text-[#1b5e20] px-6 py-3 rounded-lg font-bold hover:bg-green-300 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
