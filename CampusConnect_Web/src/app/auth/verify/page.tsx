'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/authStore';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';

const VerifyPage: React.FC = () => {
  const router = useRouter();
  const { verifyEmail, resendVerificationCode, isLoading, error, clearError } = useAuthStore();
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      return;
    }

    alert('🔍 DEBUG: Starting verification process...');
    console.log('🔍 DEBUG: Verification code entered:', verificationCode);
    
    setIsSubmitting(true);
    clearError();

    try {
      alert('📡 DEBUG: Calling verifyEmail function...');
      console.log('📡 DEBUG: Calling verifyEmail with code:', verificationCode);
      
      await verifyEmail(verificationCode);
      
      alert('✅ DEBUG: Verification successful! Redirecting to home...');
      console.log('✅ DEBUG: Verification completed successfully');
      
      // If verification succeeds, user will be authenticated and can be redirected
      router.push('/home');
    } catch (error: any) {
      alert(`❌ DEBUG: Verification failed!\n\nError: ${error.message}\nStatus: ${error.response?.status}\nDetails: ${JSON.stringify(error.response?.data, null, 2)}`);
      console.error('=== VERIFICATION FAILED ===');
      console.error('Verification failed in form:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    alert('🔍 DEBUG: Starting resend process...');
    
    try {
      // Get the email from localStorage
      const storedEmail = localStorage.getItem('registrationEmail');
      
      if (!storedEmail) {
        alert('❌ DEBUG: No email found in localStorage. Please go back to registration and try again.');
        return;
      }
      
      alert(`📡 DEBUG: Resending verification code to: ${storedEmail}`);
      console.log('📡 DEBUG: Resending verification code to:', storedEmail);
      
      // Call the resend verification code function
      await resendVerificationCode(storedEmail);
      
      // Show success message
      alert(`✅ DEBUG: Verification code resent successfully to ${storedEmail}! Please check your email.`);
      
    } catch (error: any) {
      alert(`❌ DEBUG: Failed to resend code!\n\nError: ${error.message}\nStatus: ${error.response?.status}\nDetails: ${JSON.stringify(error.response?.data, null, 2)}`);
      console.error('=== RESEND FAILED ===');
      console.error('Failed to resend code:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center mb-6 shadow-xl">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 
            className="text-3xl font-bold text-neutral-900 mb-2 text-center"
          >
            <span className="text-primary">CampusKinect</span>
          </h1>
          <p 
            className="text-neutral-600 text-center"
          >
            Verify Your Email Address
          </p>
          <p 
            className="text-neutral-500 text-sm text-center"
          >
            We've sent a 6-digit verification code to your email
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-box-xl p-6 border border-neutral-100 mx-auto">
          <form onSubmit={handleSubmit} className="space-y-16">
            {/* Verification Code Input */}
            <div className="flex flex-col items-center" style={{ marginBottom: '0px' }}>
              <input
                id="verificationCode"
                type="text"
                inputMode="numeric"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers
                  if (/^\d*$/.test(value)) {
                    setVerificationCode(value);
                  }
                }}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-48 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-center text-lg font-mono"
                style={{ 
                  letterSpacing: verificationCode ? '0.5em' : 'normal',
                  fontFamily: verificationCode ? 'monospace' : 'inherit',
                  textAlign: 'center',
                  paddingLeft: verificationCode ? '0.5em' : '1rem',
                  paddingRight: verificationCode ? '0.5em' : '1rem'
                }}
                required
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg" style={{ marginBottom: '40px' }}>
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Resend Code Link */}
            <div className="text-center" style={{ marginBottom: '40px' }}>
              <span className="text-neutral-900 text-sm">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-primary hover:text-primary-600 font-medium text-sm transition-colors bg-transparent border-none p-0 cursor-pointer"
                  style={{ 
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  Resend
                </button>
              </span>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center" style={{ marginBottom: '40px' }}>
              <button
                type="submit"
                disabled={isSubmitting || !verificationCode.trim()}
                className="w-48 bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg"
                style={{ 
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
          </form>

          {/* Back to Registration */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
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