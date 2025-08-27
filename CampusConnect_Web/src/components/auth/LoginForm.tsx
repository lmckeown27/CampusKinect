'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for empty fields
    if (!formData.usernameOrEmail.trim() || !formData.password.trim()) {
      alert(`⚠️ VALIDATION ERROR!
      
❌ Missing required fields:
• Username/Email: ${formData.usernameOrEmail.trim() ? '✅ Filled' : '❌ EMPTY'}
• Password: ${formData.password.trim() ? '✅ Filled' : '❌ EMPTY'}

💡 Please fill in all required fields before submitting.`);
      return;
    }
    
    // Show form data in alert
    alert(`🔍 LOGIN ATTEMPT DEBUG INFO:
    
📝 Form Data:
• Username/Email: ${formData.usernameOrEmail}
• Password: ${formData.password ? '***' : 'EMPTY'}

🔗 Backend URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}

⏳ Starting login process...`);
    
    try {
      await login(formData);
      
      // Show success alert
      alert(`✅ LOGIN SUCCESS!
      
🎯 User authenticated successfully
🔑 Access token generated
📱 Redirecting to home page...`);
      
      // Redirect to home page after successful login
      router.push('/home');
      
    } catch (error) {
      // Show error alert
      alert(`❌ LOGIN FAILED!
      
🚨 Error: ${error instanceof Error ? error.message : 'Unknown error'}
📊 Response: ${error instanceof Error && 'response' in error ? JSON.stringify((error as any).response?.data) : 'No response data'}
💡 Check browser console for more details`);
      
      // Error is handled by the store
      console.error('Login failed:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isEducationalEmail = (email: string): boolean => {
    const eduDomains = ['.edu', '.ac.uk', '.ca', '.edu.au', '.de', '.fr'];
    return eduDomains.some(domain => email.toLowerCase().includes(domain));
  };

  // Helper function to get appropriate error message and icon
  const getErrorDisplay = (errorMessage: string) => {
    if (errorMessage.toLowerCase().includes('invalid credentials') || 
        errorMessage.toLowerCase().includes('not found') ||
        errorMessage.toLowerCase().includes('does not exist')) {
      return {
        message: 'The username/email or password you entered is incorrect. Please check your credentials and try again.',
        icon: <AlertCircle className="text-red-500" size={20} />,
        type: 'error'
      };
    }
    
    if (errorMessage.toLowerCase().includes('not verified') || 
        errorMessage.toLowerCase().includes('verification')) {
      return {
        message: 'Please verify your university email address before logging in. Check your university email for a verification code.',
        icon: <Info className="text-blue-500" size={20} />,
        type: 'info'
      };
    }
    
    return {
      message: errorMessage,
      icon: <AlertCircle className="text-red-500" size={20} />,
      type: 'error'
    };
  };

  const errorDisplay = error ? getErrorDisplay(error) : null;

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
            Your Go-To University Marketplace
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-box-xl p-6 border border-neutral-100" style={{ width: '400px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} className="space-y-8" style={{ marginBottom: '2rem' }}>
            <div className="space-y-3" style={{ marginBottom: '2rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="usernameOrEmail" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  Username or University Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="usernameOrEmail"
                    value={formData.usernameOrEmail}
                    onChange={(e) => handleInputChange('usernameOrEmail', e.target.value)}
                    required
                    className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                    placeholder=""
                  />
                  {formData.usernameOrEmail && formData.usernameOrEmail.includes('@') && !isEducationalEmail(formData.usernameOrEmail) && (
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <p style={{ color: 'red', fontSize: '14px', fontWeight: '500' }}>Use university email</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3" style={{ marginBottom: '2rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="password" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                    placeholder=""
                  />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary hover:text-primary-600 transition-colors bg-transparent border-none"
                  style={{ background: 'transparent', boxShadow: 'none' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

            {errorDisplay && (
              <div className={`bg-${errorDisplay.type === 'info' ? 'blue' : 'red'}-50 border border-${errorDisplay.type === 'info' ? 'blue' : 'red'}-200 rounded-xl p-4`}>
                {errorDisplay.icon}
                <p className={`text-sm font-medium ${
                  errorDisplay.type === 'info' ? 'text-blue-700' : 'text-red-700'
                }`}>{errorDisplay.message}</p>
                {errorDisplay.type === 'info' && (
                  <div className="mt-2">
                    <Link 
                      href="/auth/resend-code" 
                      className="text-primary hover:text-primary-600 text-sm font-medium underline decoration-2 underline-offset-2"
                    >
                      Resend verification code
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4">
              <div style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-4 px-6 border border-transparent rounded-md text-lg font-semibold text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ 
                    backgroundColor: '#708d81',
                    backgroundImage: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5a7268';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/auth/register" 
              className="text-primary hover:text-primary-600 font-medium text-sm transition-colors duration-200"
            >
              ← Don't have an Account?
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-8">
          <p>
            By logging in, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 