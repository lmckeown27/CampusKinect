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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">K</span>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">
            Welcome to CampusKinect
          </h1>
          <p className="text-lg text-neutral-600">
            Connect with your university community
          </p>
        </div>

        {/* Authentication Options */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-6">
            Get Started
          </h2>

          <div className="space-y-4">
            <Link 
              href="/auth/register" 
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-md"
            >
              Create Account
            </Link>
            <Link 
              href="/auth/login" 
              className="w-full flex justify-center py-3 px-4 border border-neutral-300 rounded-lg text-base font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-sm"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:text-primary-600">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:text-primary-600">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-neutral-500 text-sm mb-2">
            Currently supporting Cal Poly SLO • More universities coming soon
          </p>
          <div className="flex justify-center space-x-4 text-xs text-neutral-400">
            <Link href="/terms" className="hover:text-neutral-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-neutral-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookie-settings" className="hover:text-neutral-600 transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
