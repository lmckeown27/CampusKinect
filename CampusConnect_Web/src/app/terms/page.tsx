'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-primary hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
            <div className="h-6 w-px bg-neutral-300"></div>
            <div className="flex items-center space-x-3">
              <Shield size={28} className="text-primary" />
              <h1 className="text-3xl font-bold text-neutral-900">Terms of Service</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h3>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to CampusKinect, a student community platform designed to connect university students 
                  for sharing events, finding roommates, offering tutoring services, and engaging in campus life activities. 
                  By accessing or using our platform, you agree to be bound by these Terms of Service.
                </p>
              </section>

              {/* Eligibility */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Eligibility</h3>
                <p className="text-gray-700 leading-relaxed">
                  CampusKinect is exclusively for university students with valid educational email addresses. 
                  You must have a valid educational email address (.edu, .ac.uk, .ca, .edu.au, .de, .fr) 
                  to create an account and use CampusKinect.
                </p>
              </section>

              {/* Acceptable Use */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Acceptable Use</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree to use CampusKinect only for lawful purposes and in accordance with these Terms. 
                  You agree not to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Harass, bully, or discriminate against other users</li>
                  <li>Share inappropriate, offensive, or illegal content</li>
                  <li>Attempt to gain unauthorized access to other accounts</li>
                  <li>Use the platform for commercial purposes without permission</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </section>

              {/* User Content */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">4. User Content</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You retain ownership of content you post on CampusKinect. However, by posting content, you grant us 
                  a license to use, display, and distribute that content on our platform.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 font-medium">Content Responsibility</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        You are responsible for all content you post and its accuracy. We reserve the right to remove 
                        content that violates our terms or community guidelines.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy and Data */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Privacy and Data</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. We collect and process your personal information in accordance 
                  with our Privacy Policy. By using CampusKinect, you consent to our data practices as described 
                  in our Privacy Policy.
                </p>
              </section>

              {/* Safety and Security */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Safety and Security</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  While we strive to maintain a safe environment, CampusKinect is a community platform where users 
                  interact directly with each other. We recommend:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Meeting in public places for first-time in-person interactions</li>
                  <li>Verifying user identities before sharing personal information</li>
                  <li>Reporting suspicious or inappropriate behavior</li>
                  <li>Using common sense and following your university&apos;s safety guidelines</li>
                </ul>
              </section>

              {/* Disclaimers */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Disclaimers</h3>
                <p className="text-gray-700 leading-relaxed">
                  CampusKinect is provided &quot;as is&quot; without warranties of any kind. We are not responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>The accuracy of user-generated content</li>
                  <li>User conduct or interactions</li>
                  <li>Any damages resulting from platform use</li>
                  <li>Third-party services or content</li>
                </ul>
              </section>

              {/* Termination */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Account Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may suspend or terminate your account if you violate these Terms or engage in inappropriate behavior. 
                  You may also terminate your account at any time by contacting our support team.
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may update these Terms of Service from time to time. We will notify users of significant changes 
                  through the platform or email. Continued use of CampusKinect after changes constitutes acceptance 
                  of the new terms.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="text-gray-700">
                    <strong>Email:</strong> liam.mckeown38415@gmail.com<br />
                    <strong>Support Hours:</strong> Whenever I&apos;m free<br />
                    <strong>Cookie Settings:</strong> <Link href="/cookie-settings" className="text-primary hover:text-primary-600">Manage Cookie Preferences</Link>
                  </p>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                By using CampusKinect, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
              <div className="mt-4">
                <Link 
                  href="/privacy" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Privacy Policy →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 