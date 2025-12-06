'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function Privacy() {
  return (
    <main className="bg-[#e8f5e9] min-h-screen">
      {/* Header */}
      <div className="bg-[#1b5e20] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-[#c8e6c9] hover:text-green-300 mb-4">
            <FiArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-700 mb-6">
            <strong>Last Updated: January 2025</strong>
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Local Bazar ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-2">Personal Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  We collect personal information you provide directly, including name, email address, phone number, postal address, and payment information. We also collect information about your transactions and communications with us.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-2">Automatically Collected Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  We automatically collect certain information when you use our platform, including IP address, browser type, operating system, pages visited, time and date of visits, and duration of visits. We use cookies and similar tracking technologies to collect this information.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-2">Payment Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you make a purchase, we collect payment information such as credit card number, billing address, and transaction history. Payment processing is handled by secure third-party payment processors.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">3. How We Use Your Information</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Process and fulfill your orders</li>
              <li>• Verify your identity and prevent fraud</li>
              <li>• Provide customer support and respond to inquiries</li>
              <li>• Send promotional emails and marketing communications (with your consent)</li>
              <li>• Improve our website and services</li>
              <li>• Comply with legal obligations</li>
              <li>• Analyze usage patterns and trends</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">4. Information Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information. However, we may share information with:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Service providers (payment processors, delivery partners)</li>
              <li>• Legal authorities when required by law</li>
              <li>• Other users (limited information for marketplace functionality)</li>
              <li>• Business partners with your consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">6. Your Rights and Choices</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-2">Access and Correction</h3>
                <p className="text-gray-700 leading-relaxed">
                  You have the right to access and correct your personal information. You can update your profile information directly in your account settings.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-2">Opt-Out</h3>
                <p className="text-gray-700 leading-relaxed">
                  You can opt out of marketing communications by clicking the unsubscribe link in our emails or by contacting us directly.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-2">Data Deletion</h3>
                <p className="text-gray-700 leading-relaxed">
                  You can request deletion of your account and associated personal information. Please note that some information may be retained for legal and operational purposes.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies to enhance your user experience, remember your preferences, and analyze site usage. You can control cookie settings through your browser. Disabling cookies may affect functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">8. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of external sites. We encourage you to review their privacy policies before providing any information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Local Bazar is not intended for children under 13. We do not knowingly collect information from children under 13. If we discover we have collected information from a child under 13, we will delete it immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-[#e8f5e9] rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@localbazar.com<br />
                <strong>Address:</strong> Local Bazar, Community Center, Your City<br />
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">11. Policy Changes</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be effective immediately upon posting to the website. We will notify you of significant changes via email or a prominent notice on our website.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
