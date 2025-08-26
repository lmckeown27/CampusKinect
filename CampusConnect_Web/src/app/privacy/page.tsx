'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Eye, Shield, Database, Bell, Users } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <Lock size={24} className="text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">CampusKinect Privacy Policy</h2>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h3>
                <p className="text-gray-700 leading-relaxed">
                  At CampusKinect, we are committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h3>
                
                <h4 className="text-lg font-medium text-gray-900 mb-3">2.1 Personal Information</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you create an account, we collect:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li>Name (first and last)</li>
                  <li>Educational email address</li>
                  <li>Username</li>
                  <li>University and major</li>
                  <li>Academic year</li>
                  <li>Hometown</li>
                  <li>Profile picture (optional)</li>
                </ul>

                <h4 className="text-lg font-medium text-gray-900 mb-3">2.2 Usage Information</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We automatically collect information about how you use CampusKinect:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li>Posts and interactions</li>
                  <li>Search queries</li>
                  <li>Messages and conversations</li>
                  <li>Page views and navigation</li>
                  <li>Device and browser information</li>
                </ul>

                <p className="text-gray-700 leading-relaxed mb-4">
                  We verify your educational email address to ensure you are a legitimate university student. 
                  This helps maintain the integrity of our academic community.
                </p>
              </section>

              {/* How We Use Information */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use your information to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h3>
                
                <h4 className="text-lg font-medium text-gray-900 mb-3">4.1 What We Share</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li><strong>Public Profile:</strong> Your name, major, and year are visible to other users</li>
                  <li><strong>Posts:</strong> Content you post is visible to the community</li>
                  <li><strong>Messages:</strong> Direct messages are shared with recipients</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
                </ul>

                <h4 className="text-lg font-medium text-gray-900 mb-3">4.2 What We Don't Share</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We never share your email address with other users, your password or account credentials, 
                  your personal messages without consent, or your data with third-party advertisers.
                </p>
              </section>

              {/* Data Security */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal information by staff</li>
                  <li>Secure hosting infrastructure</li>
                </ul>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  While we protect your data, you should also use strong passwords, keep your account secure, 
                  and be cautious about sharing personal information with other users.
                </p>
              </section>

              {/* Data Retention */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h3>
                <p className="text-gray-700 leading-relaxed">
                  We retain your information for as long as your account is active or as needed to provide services. 
                  When you delete your account, we will remove your personal information within 30 days, 
                  though some information may be retained for legal or security purposes.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li>Access and review your personal information</li>
                  <li>Update or correct your profile information</li>
                  <li>Delete your account and personal data</li>
                  <li>Control your privacy settings and visibility</li>
                  <li>Opt out of non-essential communications</li>
                  <li>Request data portability</li>
                </ul>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h3>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                  and provide personalized content. You can control cookie settings through your browser preferences.
                </p>
              </section>

              {/* Third-Party Services */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Third-Party Services</h3>
                <p className="text-gray-700 leading-relaxed">
                  CampusKinect may integrate with third-party services (such as email providers for verification). 
                  These services have their own privacy policies, and we encourage you to review them.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h3>
                <p className="text-gray-700 leading-relaxed">
                  CampusKinect is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If you are a parent or guardian and believe your 
                  child has provided us with personal information, please contact us.
                </p>
              </section>

              {/* International Users */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">11. International Users</h3>
                <p className="text-gray-700 leading-relaxed">
                  CampusKinect is operated from the United States. If you are accessing our platform from outside 
                  the U.S., please be aware that your information may be transferred to, stored, and processed 
                  in the U.S. where our servers are located.
                </p>
              </section>

              {/* Changes to Privacy Policy */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes 
                  through the platform or email. Your continued use of CampusKinect after changes constitutes 
                  acceptance of the updated policy.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Us</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>Email:</strong> privacy@campuskinect.com<br />
                    <strong>Data Protection Officer:</strong> dpo@campuskinect.com<br />
                    <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM PST
                  </p>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                  This Privacy Policy is effective as of the date listed above and applies to all users of CampusKinect.
              </p>
              <div className="mt-4">
                <Link 
                  href="/terms" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Terms of Service →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 