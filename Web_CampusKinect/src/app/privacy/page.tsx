'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';
import SupportHeader from '@/components/layout/SupportHeader';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-grey-medium">
      <SupportHeader />
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Centered Title */}
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold text-neutral-900">Privacy Policy</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-grey-light rounded-xl p-8 border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">1. Introduction</h3>
                <p className="text-gray-300 leading-relaxed">
                  At CampusKinect, we are committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h3>
                
                <h4 className="text-lg font-medium text-white mb-3">2.1 Personal Information</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  When you create an account, we collect:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Name (first and last)</li>
                  <li>Educational email address</li>
                  <li>Username</li>
                  <li>University and major</li>
                  <li>Academic year</li>
                  <li>Hometown</li>
                  <li>Profile picture (optional)</li>
                </ul>

                <h4 className="text-lg font-medium text-white mb-3">2.2 Usage Information</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We automatically collect information about how you use CampusKinect:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Posts and interactions</li>
                  <li>Search queries</li>
                  <li>Messages and conversations</li>
                  <li>Page views and navigation</li>
                  <li>Device and browser information</li>
                </ul>

                <p className="text-gray-300 leading-relaxed mb-4">
                  We verify your educational email address to ensure you are a legitimate university student. 
                  This helps maintain the integrity of our academic community.
                </p>
              </section>

              {/* How We Use Information */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use your information to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Provide and maintain our platform services</li>
                  <li>Verify your student identity and eligibility</li>
                  <li>Connect you with other students in your university</li>
                  <li>Personalize your experience and content recommendations</li>
                  <li>Send important updates and notifications</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">4. Information Sharing and Disclosure</h3>
                
                <h4 className="text-lg font-medium text-white mb-3">4.1 What We Share</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>With your consent or at your direction</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>To investigate potential violations of our terms</li>
                  <li>With service providers who assist in platform operations</li>
                </ul>

                <h4 className="text-lg font-medium text-white mb-3">4.2 What We Don't Share</h4>
                <p className="text-gray-300 leading-relaxed">
                  We do not sell, rent, or trade your personal information to third parties for marketing purposes. 
                  Your personal information is only shared as described in this policy.
                </p>
              </section>

              {/* Data Security */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">5. Data Security</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information, including:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Secure data centers and infrastructure</li>
                  <li>Employee training on data protection</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              {/* Data Retention */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">6. Data Retention</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We retain your personal information for as long as necessary to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Maintain platform security and integrity</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  When you delete your account, we will delete or anonymize your personal information, 
                  except where retention is required by law.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">7. Your Rights and Choices</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Access and review your personal information</li>
                  <li>Update or correct inaccurate information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt out of certain communications</li>
                  <li>Export your data in a portable format</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">8. Cookies and Tracking Technologies</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze platform usage and performance</li>
                  <li>Provide personalized content and features</li>
                  <li>Ensure platform security and functionality</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  You can control cookie settings through your browser preferences and our cookie consent banner.
                </p>
              </section>

              {/* Third-Party Services */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">9. Third-Party Services</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Our platform may contain links to third-party websites or services. We are not responsible for 
                  the privacy practices of these third parties. We encourage you to review their privacy policies 
                  before providing any personal information.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">10. Children's Privacy</h3>
                <p className="text-gray-300 leading-relaxed">
                  CampusKinect is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If you believe we have collected information from 
                  a child under 13, please contact us immediately.
                </p>
              </section>

              {/* International Transfers */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">11. International Data Transfers</h3>
                <p className="text-gray-300 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure that such transfers comply with applicable data protection laws and implement 
                  appropriate safeguards to protect your information.
                </p>
              </section>

              {/* Changes to Policy */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">12. Changes to This Policy</h3>
                <p className="text-gray-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes 
                  via email or through our platform. Your continued use of CampusKinect after such changes constitutes 
                  acceptance of the updated policy.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">13. Contact Information</h3>
                <p className="text-gray-300 leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-blue-800 font-medium">CampusKinect Privacy Team</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Email: campuskinect01@gmail.com<br />
                    Response time: 2-6 pm
                  </p>
                </div>
              </section>

              {/* Footer Navigation */}
              <div className="border-t border-gray-200 pt-8 mt-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    Last updated: August 2025
                  </div>
                  <div className="flex items-center">
                    <Link 
                      href="/auth/login" 
                      className="text-primary hover:text-primary-600 font-medium text-sm transition-colors duration-200"
                    >
                      Login
                    </Link>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Link 
                      href="/auth/register" 
                      className="text-primary hover:text-primary-600 font-medium text-sm transition-colors duration-200"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 