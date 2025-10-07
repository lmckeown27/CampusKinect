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
                <p className="text-gray-300 leading-relaxed">
                  At CampusKinect, protecting your privacy is paramount. This Privacy Policy explains what data we collect, 
                  how we use it, who we share it with, and your rights regarding your personal information. 
                  <span className="font-semibold text-white"> Last updated: October 2024</span>
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h3>
                
                <h4 className="text-lg font-medium text-white mb-3">Personal Information:</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  When you create an account, we collect:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Name (first and last name)</li>
                  <li>Educational email address (for verification)</li>
                  <li>Username (chosen by you)</li>
                  <li>University and major</li>
                  <li>Academic year</li>
                  <li>Hometown (optional)</li>
                  <li>Profile picture (optional)</li>
                  <li>Bio and profile information (optional)</li>
                </ul>

                <h4 className="text-lg font-medium text-white mb-3">Content You Create:</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Posts, photos, and descriptions</li>
                  <li>Comments and messages</li>
                  <li>Bookmarks and saved content</li>
                  <li>Reports of content or users</li>
                </ul>

                <h4 className="text-lg font-medium text-white mb-3">Usage Information:</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Device information (device type, browser, OS)</li>
                  <li>Log data (access times, features used, IP address)</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">2. How We Use Your Information</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We only use your data for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>✓ Provide and maintain our campus community services</li>
                  <li>✓ Verify your university affiliation</li>
                  <li>✓ Enable communication with other verified students</li>
                  <li>✓ Ensure platform safety through content moderation</li>
                  <li>✓ Send important service notifications</li>
                  <li>✓ Respond to your support requests</li>
                  <li>✓ Comply with legal obligations</li>
                </ul>
                <p className="text-white font-semibold mt-4">
                  We do NOT use your data for advertising or marketing purposes.
                </p>
              </section>

              {/* Content Moderation and Safety */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">3. Content Moderation and Safety</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Your safety is our priority. We actively monitor user-generated content to maintain a safe community environment.
                </p>
                <div className="bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg p-6 mb-4">
                  <h4 className="text-lg font-semibold text-blue-300 mb-3">Content Safety Measures</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Automated content filtering for prohibited material</li>
                    <li>User reporting system for inappropriate content</li>
                    <li>24-hour response time for content reports</li>
                    <li>User blocking capabilities for personal safety</li>
                  </ul>
                </div>
              </section>

              {/* Data Sharing and Third Parties */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">4. Data Sharing and Third Parties</h3>
                <p className="text-white font-semibold mb-4">
                  We do NOT sell your personal information to anyone.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We may share your information only in these limited circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>→ With your consent: When you explicitly agree to share</li>
                  <li>→ Service Providers: Hosting infrastructure (AWS), analytics (minimal)</li>
                  <li>→ Legal Requirements: When required by law, court order, or to protect rights and safety</li>
                  <li>→ University Officials: Only when legally required for student safety concerns</li>
                </ul>
                
                <h4 className="text-lg font-medium text-white mb-3 mt-6">Third-Party Services:</h4>
                <p className="text-gray-300 leading-relaxed">
                  Any third parties we work with are required to provide the same level of data protection as described in this policy. 
                  They may only use your data to provide services to us, not for their own purposes.
                </p>
              </section>

              {/* Data Security */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">5. Data Security</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We implement industry-standard security measures:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>🔒 Encrypted data transmission (HTTPS/TLS)</li>
                  <li>🔒 Secure password storage (bcrypt hashing)</li>
                  <li>🔒 Session tokens stored securely</li>
                  <li>🔒 Regular security audits and updates</li>
                </ul>
                <p className="text-gray-400 text-sm mt-4">
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your data, 
                  we cannot guarantee absolute security.
                </p>
              </section>

              {/* Data Retention and Deletion */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">6. Data Retention and Deletion</h3>
                
                <h4 className="text-lg font-medium text-white mb-3">Retention Policy:</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>⏰ Account data: Retained while your account is active</li>
                  <li>⏰ Posts and messages: Retained until you delete them or close your account</li>
                  <li>⏰ Logs and analytics: Retained for 90 days for security and debugging</li>
                </ul>
                
                <h4 className="text-lg font-medium text-white mb-3 mt-6">Account Deletion:</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You can permanently delete your account at any time from Settings → Privacy & Data → Delete Account. 
                  Upon deletion:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>🗑️ All your personal information is permanently removed</li>
                  <li>🗑️ Your posts, comments, and messages are deleted</li>
                  <li>🗑️ Your profile becomes inaccessible immediately</li>
                  <li>🗑️ This action cannot be undone</li>
                </ul>
              </section>

              {/* Your Privacy Rights */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">7. Your Privacy Rights</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You have the following rights regarding your personal data:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Access: View all data we have about you</li>
                  <li>Download: Export your data in a portable JSON format</li>
                  <li>Correct: Update or correct inaccurate information</li>
                  <li>Delete: Permanently remove your account and all data</li>
                  <li>Withdraw Consent: Revoke cookie preferences at any time</li>
                  <li>Object: Opt out of certain data processing activities</li>
                </ul>
                <p className="text-gray-400 text-sm mt-4">
                  To exercise these rights, visit Settings → Privacy & Data or contact us at privacy@campuskinect.com
                </p>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">8. Cookies and Tracking</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Essential: Required for login and security</li>
                  <li>Functional: Remember your preferences</li>
                  <li>Analytics: Understand how the service is used (minimal, anonymized)</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  You can manage your cookie preferences through our Cookie Settings page or your browser settings.
                </p>
              </section>

              {/* Tracking and Analytics */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">9. Tracking and Analytics</h3>
                <p className="text-white font-semibold mb-4">
                  We do NOT track you across other websites for advertising purposes.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We only collect basic usage analytics within our platform to improve service quality and fix bugs. 
                  This data is never shared with third parties for advertising.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">10. Children's Privacy</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our service is intended for university students who are typically 18 years or older. 
                  We do not knowingly collect personal information from children under 13. 
                  If you believe we have collected information from a child under 13, please contact us immediately.
                </p>
              </section>

              {/* Changes to Privacy Policy */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">11. Changes to This Policy</h3>
                <p className="text-gray-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes 
                  through the platform or via email, and update the 'Last Updated' date at the top of this policy.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">12. Contact Us</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or want to exercise your privacy rights, please contact us:
                </p>
                <div className="bg-grey-medium p-4 rounded-lg space-y-2">
                  <p className="text-white font-medium">Email: privacy@campuskinect.com</p>
                  <p className="text-gray-300">Support: campuskinect01@gmail.com</p>
                  <p className="text-gray-300">Address: CampusKinect, Inc.</p>
                </div>
              </section>

              {/* Back Link */}
              <div className="mt-8 pt-8 border-t border-gray-600">
                <Link href="/settings" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                  <ArrowLeft size={20} className="mr-2" />
                  Back to Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}