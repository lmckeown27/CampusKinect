'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';

export default function VerifyEmailGuide() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-grey-medium">
      {/* Header */}
      <div className="py-8" style={{ backgroundColor: '#708d81' }}>
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              <ArrowLeft size={20} />
              <span className="text-lg">Back to Help Center</span>
            </button>
          </div>
          
          <div className="text-center">
            <Mail size={48} className="text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your University Email</h1>
            <p className="text-xl text-white opacity-90">Step-by-step guide to verify your .edu email address</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Overview */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4 text-white">Why Verify Your Email?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <Shield size={32} className="mx-auto mb-2" style={{ color: '#708d81' }} />
              <h3 className="font-semibold text-white mb-2">Campus Security</h3>
              <p className="text-sm text-gray-300">Only verified students can access your campus community</p>
            </div>
            <div className="text-center p-4">
              <CheckCircle size={32} className="mx-auto mb-2" style={{ color: '#708d81' }} />
              <h3 className="font-semibold text-white mb-2">Trust & Safety</h3>
              <p className="text-sm text-gray-300">Verified accounts build trust in the marketplace</p>
            </div>
            <div className="text-center p-4">
              <Mail size={32} className="mx-auto mb-2" style={{ color: '#708d81' }} />
              <h3 className="font-semibold text-white mb-2">Full Access</h3>
              <p className="text-sm text-gray-300">Unlock all CampusKinect features and messaging</p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#708d81' }}>Step-by-Step Verification</h2>
          
          {/* Step 1 */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Create Your Account</h3>
                <p className="mb-4" className="text-gray-300">
                  Start by creating your CampusKinect account with your university email address.
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Requirements:</h4>
                  <ul className="space-y-1 text-sm" className="text-gray-300">
                    <li>• Must use your official university email (.edu domain)</li>
                    <li>• Email must be active and accessible</li>
                    <li>• One account per email address</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                2
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Check Your Email</h3>
                <p className="mb-4" className="text-gray-300">
                  After registration, check your university email for a verification message from CampusKinect.
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">What to Look For:</h4>
                  <ul className="space-y-1 text-sm" className="text-gray-300">
                    <li>• Subject: "Verify Your CampusKinect Account"</li>
                    <li>• From: noreply@campuskinect.com</li>
                    <li>• Contains a verification link</li>
                    <li>• Check spam/junk folder if not in inbox</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                3
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Click the Verification Link</h3>
                <p className="mb-4" className="text-gray-300">
                  Click the verification link in the email to confirm your university email address.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Important:</h4>
                      <p className="text-sm text-yellow-700">
                        The verification link expires after 24 hours. If expired, you can request a new one from your account settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                4
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Confirmation & Access</h3>
                <p className="mb-4" className="text-gray-300">
                  Once verified, you'll see a confirmation message and gain full access to CampusKinect.
                </p>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Success!</h4>
                      <p className="text-sm text-green-700">
                        Your account is now verified. You can post items, send messages, and access all campus features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#708d81' }}>Troubleshooting</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Didn't receive the verification email?</h3>
              <ul className="space-y-1 text-sm ml-4" className="text-gray-300">
                <li>• Check your spam/junk folder</li>
                <li>• Verify you entered your email correctly</li>
                <li>• Wait 5-10 minutes for delivery</li>
                <li>• Request a new verification email from Settings</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">Verification link expired?</h3>
              <ul className="space-y-1 text-sm ml-4" className="text-gray-300">
                <li>• Go to Account Settings</li>
                <li>• Click "Resend Verification Email"</li>
                <li>• Check for the new email</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">Using a non-.edu email?</h3>
              <ul className="space-y-1 text-sm ml-4" className="text-gray-300">
                <li>• CampusKinect requires official university email addresses</li>
                <li>• Contact your university IT department for your .edu email</li>
                <li>• Some schools use different domains - contact support if needed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Need More Help */}
        <div className="p-6 rounded-lg border-2 border-[#708d81]" style={{ backgroundColor: '#708d81' }}>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Still Need Help?</h2>
            <p className="text-white opacity-90 mb-4">
              If you're still having trouble verifying your email, our support team is here to help.
            </p>
            <button
              onClick={() => router.push('/support')}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
              style={{ 
                backgroundColor: 'white', 
                color: '#708d81',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 