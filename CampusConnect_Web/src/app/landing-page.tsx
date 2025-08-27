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
        <div className="text-center mb-10">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-primary to-primary-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-4xl">K</span>
          </div>
          <h1 className="text-5xl font-bold text-neutral-900 mb-4 leading-tight">
            Welcome to <span className="text-primary">CampusKinect</span>
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed">
            Connect with your university community
          </p>
        </div>

        {/* Authentication Options */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-neutral-100">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-8">
            Get Started
          </h2>

          <div className="space-y-5">
            <Link 
              href="/auth/register" 
              className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Account
            </Link>
            <Link 
              href="/auth/login" 
              className="w-full flex justify-center py-4 px-6 border-2 border-neutral-200 rounded-xl text-lg font-semibold text-neutral-700 bg-white hover:bg-neutral-50 hover:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500 leading-relaxed">
              By continuing, you agree to our{' '}
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
