'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../stores/authStore';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CampusKinect...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to /home
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center justify-center mb-8 space-x-6">
            <div className="h-24 w-24 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300 flex-shrink-0">
              <span className="text-white font-bold text-4xl">K</span>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 leading-tight whitespace-nowrap">
              <span className="text-primary">CampusKinect</span>
            </h1>
          </div>
          <p className="text-xl text-neutral-600 leading-relaxed">
            Connect with your university community
          </p>
        </div>

        {/* Authentication Section - Login Form */}
        <div className="bg-white rounded-lg shadow-box-2xl p-10 border border-neutral-100">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-8">
            Sign In
          </h2>
          
          {/* Login Form */}
          <form className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-3 border border-neutral-200 rounded-md focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-neutral-200 rounded-md focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 transition-all duration-200"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-4 px-6 bg-primary text-white font-semibold rounded-md hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-neutral-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <p className="text-neutral-600 text-sm">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
                Create one here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-neutral-500 text-sm mb-4">
            Currently supporting Cal Poly SLO • More universities coming soon
          </p>
          <div className="flex justify-center space-x-6 text-xs text-neutral-400">
            <Link href="/terms" className="hover:text-neutral-600 transition-colors duration-200">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-neutral-600 transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/cookie-settings" className="hover:text-neutral-600 transition-colors duration-200">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
