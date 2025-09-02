'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';

const ResendCodePage: React.FC = () => {
  const router = useRouter();
  const { resendVerificationCode, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await resendVerificationCode(email);
      setIsSuccess(true);
      // Redirect to login after 10 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 10000);
      
    } catch (error: any) {
      // Error is handled by the store
      console.error('Failed to resend code:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEmail(value);
    // Clear validation error for this field
    if (error) {
      // setError(null); // This line was removed as per the new_code
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-box-xl p-6 border border-neutral-100" style={{ width: '400px', margin: '0 auto' }}>
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Code Sent!</h1>
              <p className="text-neutral-600 mb-4">
                A new verification code has been sent to your university email address.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <Mail className="text-blue-500 mt-0.5" size={16} />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Can't find the email?</p>
                    <p>• Check your <strong>spam/junk mail folder</strong></p>
                    <p>• Make sure you entered the correct email address</p>
                    <p>• If you still don't see it, you can request another code</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="flex-1 py-2 px-4 border border-primary text-primary rounded-md text-sm font-medium hover:bg-primary hover:text-white transition-colors duration-200"
                  style={{ cursor: 'pointer' }}
                >
                  Send Another Code
                </button>
                <Link
                  href="/auth/verify"
                  className="flex-1 py-2 px-4 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-600 transition-colors duration-200 text-center"
                  style={{ backgroundColor: '#708d81', cursor: 'pointer' }}
                >
                  Verify Code
                </Link>
              </div>
              <div className="text-sm text-neutral-500 mt-4">
                Auto-redirecting to login in 10 seconds...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 w-full">
          <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center mb-6 shadow-xl">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <h1 
            className="text-3xl font-bold text-neutral-900 mb-2 w-full"
            style={{ textAlign: 'center' }}
          >
            <span className="text-primary">CampusKinect</span>
          </h1>
          <p 
            className="text-neutral-600 w-full"
            style={{ textAlign: 'center' }}
          >
            Resend Verification Code
          </p>
        </div>

        {/* Resend Code Form */}
        <div className="bg-white rounded-lg shadow-box-xl p-6 border border-neutral-100" style={{ width: '400px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} className="space-y-8" style={{ marginBottom: '2rem' }}>
            <div className="space-y-3" style={{ marginBottom: '2rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="email" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  University Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                  placeholder="yourname@yourcollege.edu"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="text-red-500" size={20} />
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="pt-4">
              <div style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full flex justify-center py-4 px-6 border border-transparent rounded-md text-lg font-semibold text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ 
                    backgroundColor: '#708d81',
                    backgroundImage: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && email.trim()) {
                      e.currentTarget.style.backgroundColor = '#5a7268';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && email.trim()) {
                      e.currentTarget.style.backgroundColor = '#708d81';
                    }
                  }}
                >
                  {isLoading ? 'Sending...' : 'Send New Code'}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/auth/login" 
              className="text-primary hover:text-primary-600 font-medium text-sm transition-colors duration-200"
            >
              ← Back to Login
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link 
              href="/auth/verify" 
              className="text-primary hover:text-primary-600 font-medium text-sm transition-colors duration-200"
            >
              Already have a code? Verify here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendCodePage;
