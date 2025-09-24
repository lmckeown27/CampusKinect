'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import SupportHeader from '@/components/layout/SupportHeader';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-grey-medium">
      <SupportHeader />
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 shadow-sm relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back to Login Link - Positioned absolutely on left */}
          <div className="absolute left-4 sm:left-6 lg:left-8 top-6 w-auto h-auto">
            <Link 
              href="/auth/login"
              className="flex items-center space-x-2 text-primary hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              <ArrowLeft size={20} />
              <span>Login</span>
            </Link>
          </div>
          
          {/* Privacy Policy Link - Positioned below Login link */}
          <div className="absolute left-4 sm:left-6 lg:left-8 top-16 w-auto h-auto">
            <Link 
              href="/privacy"
              className="flex items-center space-x-2 text-primary hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              <ArrowLeft size={20} />
              <span>Privacy</span>
            </Link>
          </div>
          
          {/* Centered Title */}
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold text-neutral-900">Terms of Service</h1>
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
                  Welcome to CampusKinect, a student community platform designed to connect university students 
                  for sharing events, finding roommates, offering tutoring services, and engaging in campus life activities. 
                  By accessing or using our platform, you agree to be bound by these Terms of Service.
                </p>
              </section>

              {/* Eligibility */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">2. Eligibility</h3>
                <p className="text-gray-300 leading-relaxed">
                  CampusKinect is exclusively for university students with valid educational email addresses. 
                  You must have a valid educational email address (.edu, .ac.uk, .ca, .edu.au, .de, .fr) 
                  to create an account and use CampusKinect.
                </p>
              </section>

              {/* Acceptable Use */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">3. Acceptable Use</h3>
                <p className="text-gray-300 leading-relaxed mb-4 font-semibold">
                  <strong className="text-red-400">CampusKinect has ZERO TOLERANCE for objectionable content or abusive behavior.</strong> You agree to use CampusKinect only for lawful purposes and in accordance with these Terms. 
                  You agree not to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Harass, bully, or discriminate against other users</li>
                  <li>Share inappropriate, offensive, or illegal content</li>
                  <li>Post content that is hateful, threatening, or promotes violence</li>
                  <li>Share sexually explicit or suggestive content</li>
                  <li>Post spam, scams, or fraudulent offers</li>
                  <li>Engage in any form of abusive behavior toward other users</li>
                  <li>Attempt to gain unauthorized access to other accounts</li>
                  <li>Use the platform for commercial purposes without permission</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </section>

              {/* User Content */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">4. User Content</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You retain ownership of content you post on CampusKinect. However, by posting content, you grant us 
                  a license to use, display, and distribute that content on our platform.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong>Third-Party Content Disclaimer:</strong> The contents requested or offered on this website is sole property of the third party individual and not in any way affiliated with the platform. CampusKinect does not endorse, guarantee, or assume responsibility for any user-generated content, including but not limited to goods, services, housing, events, or any other listings.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong>Content Moderation:</strong> We actively monitor all user-generated content and will act on objectionable content reports within 24 hours by removing the content and ejecting users who provide offending content. We maintain the authority to review, edit, or remove any content that we deem inappropriate, harmful, or in violation of these terms. Users who violate our content policies will be immediately suspended or permanently banned from the platform.
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
                <h3 className="text-xl font-semibold text-white mb-4">5. Privacy and Data</h3>
                <p className="text-gray-300 leading-relaxed">
                  Your privacy is important to us. We collect and process your personal information in accordance 
                  with our Privacy Policy. By using CampusKinect, you consent to our data practices as described 
                  in our Privacy Policy.
                </p>
              </section>

              {/* Safety and Security */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">6. Safety and Security</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We are committed to maintaining a safe and secure platform for all users. We implement various 
                  security measures to protect your information and maintain platform integrity.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  If you encounter any suspicious activity or security concerns, please report them immediately 
                  through our support channels.
                </p>
              </section>

              {/* Account Termination */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">7. Account Termination</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We reserve the right to suspend or terminate your account if you violate these Terms of Service 
                  or engage in behavior that is harmful to our community.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  You may also terminate your account at any time by contacting our support team.
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">8. Changes to Terms</h3>
                <p className="text-gray-300 leading-relaxed">
                  We may update these Terms of Service from time to time. We will notify you of any material changes 
                  via email or through our platform. Your continued use of CampusKinect after such changes constitutes 
                  acceptance of the new terms.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">9. Contact Information</h3>
                <p className="text-gray-300 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-blue-800 font-medium">CampusKinect Support</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Email: campuskinect01@gmail.com<br />
                    Response time: Whenever I get around to it
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