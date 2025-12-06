'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function Terms() {
  return (
    <main className="bg-[#e8f5e9] min-h-screen">
      {/* Header */}
      <div className="bg-[#1b5e20] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-[#c8e6c9] hover:text-green-300 mb-4">
            <FiArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Terms of Service</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-700 mb-6">
            <strong>Last Updated: January 2025</strong>
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Local Bazar, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">2. Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on Local Bazar for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Modify or copy the materials</li>
              <li>• Use the materials for any commercial purpose or for any public display</li>
              <li>• Attempt to decompile or reverse engineer any software</li>
              <li>• Remove any copyright or other proprietary notations</li>
              <li>• Transfer the materials to another person or "mirror" the materials on any other server</li>
              <li>• Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account information and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">4. Buyer Obligations</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-2">Order Accuracy</h3>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for providing accurate delivery information. We are not liable for orders delivered to incorrect addresses due to your error.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-2">Payment</h3>
                <p className="text-gray-700 leading-relaxed">
                  You agree to pay all charges incurred by you or any user of your account at the prices currently in effect. We reserve the right to change prices at any time.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-2">Prohibited Activities</h3>
                <p className="text-gray-700 leading-relaxed">
                  You agree not to engage in any illegal activity, fraud, or harassment of other users. Violating these terms may result in account suspension or termination.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">5. Seller Obligations</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-2">Product Accuracy</h3>
                <p className="text-gray-700 leading-relaxed">
                  Sellers must provide accurate descriptions, images, and pricing for products. Misleading information may result in removal of listings and account penalties.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-2">Fulfillment</h3>
                <p className="text-gray-700 leading-relaxed">
                  Sellers must fulfill orders within the specified timeframe. Failure to fulfill orders may result in penalties, refunds, or account suspension.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#1b5e20] mb-2">Legal Compliance</h3>
                <p className="text-gray-700 leading-relaxed">
                  Sellers are responsible for ensuring all products comply with applicable laws and regulations. Local Bazar is not liable for illegal products sold on the platform.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">6. Return and Refund Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              Products can be returned within 30 days of purchase if they are defective, damaged, or not as described. Refunds are processed within 7-10 business days. Return shipping is the responsibility of the buyer unless the product is defective.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">7. Intellectual Property Rights</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on Local Bazar, including text, graphics, logos, images, and software, is the property of Local Bazar or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, or transmit the content without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              In no event shall Local Bazar, its directors, employees, or agents be liable to you or any third-party for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">9. Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              Any disputes arising from these terms or the use of Local Bazar shall be resolved through negotiation, mediation, or arbitration as per applicable laws. Users agree not to pursue litigation without first attempting resolution through these methods.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">10. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              Local Bazar reserves the right to terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including if you breach these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">11. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-[#e8f5e9] rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> support@localbazar.com<br />
                <strong>Address:</strong> Local Bazar, Community Center, Your City<br />
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-black text-[#1b5e20] mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Local Bazar reserves the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of any modifications.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
