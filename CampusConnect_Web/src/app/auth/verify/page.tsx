'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/authStore';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';

const VerifyPage: React.FC = () => {
  const router = useRouter();
  const { verifyEmail, isLoading, error, clearError } = useAuthStore();
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await verifyEmail(verificationCode);
      // If verification succeeds, user will be authenticated and can be redirected
      router.push('/home');
    } catch (error) {
      console.error('Verification failed:', error);
      // Error will be displayed by the auth store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = () => {
    router.push('/auth/resend-code');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 w-full">
          <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center mb-6 shadow-xl">
            <Mail className="h-8 w-8 text-white" />
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
            Verify Your Email Address
          </p>
          <p 
            className="text-neutral-500 w-full text-sm"
            style={{ textAlign: 'center' }}
          >
            We've sent a 6-digit verification code to your email
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-box-xl p-6 border border-neutral-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Verification Code Input */}
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-neutral-700 mb-2">
                Verification Code
              </label>
              <input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                required
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !verificationCode.trim()}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </button>

            {/* Resend Code Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-primary hover:text-primary-600 font-medium text-sm transition-colors"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </form>

          {/* Back to Registration */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <Link 
              href="/auth/register" 
              className="flex items-center justify-center space-x-2 text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Registration</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage; 