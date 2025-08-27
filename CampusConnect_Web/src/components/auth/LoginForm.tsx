'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff, AlertCircle, Info } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(formData);
    } catch (error) {
      // Error is handled by the store
      console.error('Login failed:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to get appropriate error message and icon
  const getErrorDisplay = (errorMessage: string) => {
    if (errorMessage.toLowerCase().includes('invalid credentials') || 
        errorMessage.toLowerCase().includes('not found') ||
        errorMessage.toLowerCase().includes('does not exist')) {
      return {
        message: 'The email or password you entered is incorrect. Please check your credentials and try again.',
        icon: <AlertCircle className="text-red-500" size={20} />,
        type: 'error'
      };
    }
    
    if (errorMessage.toLowerCase().includes('not verified') || 
        errorMessage.toLowerCase().includes('verification')) {
      return {
        message: 'Please verify your email address before logging in. Check your email for a verification code.',
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 w-full">
          <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
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
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-neutral-900 placeholder-neutral-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-neutral-900 placeholder-neutral-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
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
      </div>
    </div>
  );
};

export default LoginForm; 