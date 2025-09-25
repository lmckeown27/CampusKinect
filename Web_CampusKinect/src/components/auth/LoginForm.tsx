'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { LoginForm as LoginFormType } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import KinectLogo from '@/assets/logos/KinectLogo.png';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState<LoginFormType>({
    usernameOrEmail: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData);
      
      // Login successful, redirect to home
      router.push('/home');
    } catch (error: any) {
      // Handle banned user with special popup
      if (error.message && error.message.startsWith('BANNED:')) {
        const bannedMessage = error.message.replace('BANNED: ', '');
        alert(`🚫 Account Banned\n\n${bannedMessage}`);
        setError('Your account has been banned. Please check the popup message for details.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.usernameOrEmail.trim() !== '' && formData.password.trim() !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 w-full">
          <img 
            src={KinectLogo.src} 
            alt="Kinect Logo" 
            className="h-12 w-12 rounded-lg mb-6 shadow-xl object-contain"
          />
          <h1 
            className="text-3xl font-bold text-neutral-900 mb-2 w-full"
            style={{ textAlign: 'center' }}
          >
            <span className="text-primary">Welcome Back</span>
          </h1>
          <p 
            className="text-neutral-600 w-full"
            style={{ textAlign: 'center' }}
          >
            Sign in to your CampusKinect account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-box-xl p-6 border border-neutral-100" style={{ width: '400px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} className="space-y-8" style={{ marginBottom: '2rem' }}>
            
            {/* Username or Email */}
            <div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="usernameOrEmail" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  Username or Email
                </label>
                <input
                  type="text"
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleInputChange}
                  required
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="username"
                  spellCheck="false"
                  className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                  placeholder="Enter your username or email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="password" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete="current-password"
                    className="w-full pt-10 pb-6 px-4 pr-12 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6" style={{ width: '320px', margin: '0 auto' }}>
                <div className="flex items-start space-x-3">
                  <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium text-sm">Login Failed</p>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Button */}
            <div style={{ width: '320px', margin: '0 auto' }}>
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full py-4 px-6 rounded-md font-semibold text-lg transition-all duration-200 ${
                  isFormValid && !isLoading
                    ? 'bg-primary hover:bg-primary-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-center" style={{ marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  // You can implement forgot password functionality here
                  alert('Please contact support at campuskinect01@gmail.com for password reset assistance.');
                }}
                className="text-sm text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2"
              >
                Forgot your password?
              </button>
            </div>
          </form>

          {/* Zero Tolerance Policy Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <div className="flex items-start space-x-3">
              <Shield size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-semibold text-sm">Zero Tolerance Policy</p>
                <p className="text-red-700 text-xs mt-1">
                  CampusKinect has ZERO TOLERANCE for objectionable content or abusive behavior.
                  All content is monitored and violations result in immediate account termination.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-[#708d81] mt-8">
            <p className="font-semibold mb-2">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
                Create Account
              </Link>
            </p>
            <p className="mb-2">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
                Privacy Policy
              </Link>
            </p>
            <p className="text-[10px] text-neutral-400">
              CampusKinect • Connecting Campus Communities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 