'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

const jobs: JobListing[] = [
  {
    id: '1',
    title: 'Full Stack Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build and maintain our marketplace platform using modern web technologies.'
  },
  {
    id: '2',
    title: 'Community Manager',
    department: 'Community',
    location: 'Hybrid',
    type: 'Full-time',
    description: 'Engage with our seller and buyer communities to build lasting relationships.'
  },
  {
    id: '3',
    title: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    type: 'Full-time',
    description: 'Lead the vision and strategy for our platform features and user experience.'
  },
  {
    id: '4',
    title: 'Marketing Specialist',
    department: 'Marketing',
    location: 'On-site',
    type: 'Full-time',
    description: 'Develop and execute marketing campaigns to grow our seller and buyer base.'
  },
  {
    id: '5',
    title: 'Customer Support Specialist',
    department: 'Support',
    location: 'Hybrid',
    type: 'Full-time',
    description: 'Provide excellent support to our sellers and buyers, resolving issues and ensuring satisfaction.'
  },
  {
    id: '6',
    title: 'Data Analyst',
    department: 'Analytics',
    location: 'Remote',
    type: 'Full-time',
    description: 'Analyze marketplace data to provide insights and drive informed business decisions.'
  }
];

export default function Careers() {
  return (
    <main className="bg-[#e8f5e9] min-h-screen">
      {/* Header */}
      <div className="bg-[#1b5e20] text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-[#c8e6c9] hover:text-green-300 mb-4">
            <FiArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Careers at Local Bazar</h1>
          <p className="text-xl text-[#c8e6c9]">Join our mission to empower local communities</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* About Working at Local Bazar */}
        <section className="mb-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-black text-[#1b5e20] mb-4">Why Join Local Bazar?</h2>
          <p className="text-lg text-gray-700 mb-6">
            At Local Bazar, we're on a mission to transform commerce by connecting communities and supporting local businesses. We believe in fostering an inclusive, innovative, and collaborative work environment.
          </p>
          <ul className="grid md:grid-cols-2 gap-6">
            <li className="flex gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-1">Impact-Driven Work</h3>
                <p className="text-gray-700">Your work directly impacts local communities and small businesses.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-2xl">🤝</span>
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-1">Collaborative Culture</h3>
                <p className="text-gray-700">Work with talented individuals who care about making a difference.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-1">Growth Opportunities</h3>
                <p className="text-gray-700">Continuous learning and professional development opportunities.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-2xl">⚖️</span>
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-1">Work-Life Balance</h3>
                <p className="text-gray-700">Flexible working arrangements and support for your wellbeing.</p>
              </div>
            </li>
          </ul>
        </section>

        {/* Open Positions */}
        <section className="mb-16">
          <h2 className="text-3xl font-black text-[#1b5e20] mb-8">Open Positions</h2>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-[#1b5e20] mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <span className="inline-block bg-[#c8e6c9] text-[#1b5e20] px-3 py-1 rounded-full text-sm font-semibold">
                        {job.department}
                      </span>
                      <span className="inline-block bg-[#e8f5e9] text-[#1b5e20] px-3 py-1 rounded-full text-sm font-semibold border border-[#1b5e20]">
                        {job.location}
                      </span>
                      <span className="inline-block bg-[#689f38] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-gray-700">{job.description}</p>
                  </div>
                  <button className="bg-[#1b5e20] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#2e7d32] transition-colors whitespace-nowrap">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-black text-[#1b5e20] mb-8">Our Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold text-[#1b5e20] mb-2">Competitive Compensation</h3>
              <p className="text-gray-700">Competitive salaries and performance bonuses</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="font-bold text-[#1b5e20] mb-2">Health & Wellness</h3>
              <p className="text-gray-700">Comprehensive health insurance and wellness programs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-bold text-[#1b5e20] mb-2">Learning & Development</h3>
              <p className="text-gray-700">Budget for courses, conferences, and training</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-linear-to-r from-[#1b5e20] to-[#2e7d32] rounded-lg shadow-md p-8 text-white text-center">
          <h2 className="text-3xl font-black mb-4">Didn't find the right role?</h2>
          <p className="text-lg mb-6">Send us your resume and let us know how you can contribute to our mission.</p>
          <Link href="mailto:careers@localbazar.com" className="bg-[#c8e6c9] text-[#1b5e20] px-8 py-3 rounded-lg font-bold hover:bg-green-300 transition-colors inline-block">
            Send Your Resume
          </Link>
        </div>
      </div>
    </main>
  );
}
