'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useCookieConsent } from '../../hooks/useCookieConsent';

export default function CookieConsent() {
  const { preferences, saveCookieConsent, clearCookieConsent } = useCookieConsent();
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAcceptAll = () => {
    setIsAnimating(true);
    setTimeout(() => {
      saveCookieConsent({
        essential: true,
        analytics: true,
        functional: true
      });
      setTimeout(() => {
        setIsVisible(false);
      }, 50); // Small delay after animation completes
    }, 300); // Match the transition duration
  };

  const handleRejectAll = () => {
    setIsAnimating(true);
    setTimeout(() => {
      clearCookieConsent();
      setTimeout(() => {
        setIsVisible(false);
      }, 50); // Small delay after animation completes
    }, 300); // Match the transition duration
  };

  const handleCustomize = () => {
    // Navigate to cookie settings page
    window.location.href = '/cookie-settings';
  }

  // Don't render if banner should be hidden
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-2xl z-50 p-6 transition-transform duration-300 ease-in-out ${
      isAnimating ? 'transform translate-y-full' : 'transform translate-y-0'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="text-primary" size={24} />
              <h3 className="font-semibold text-neutral-900 text-lg">We use cookies</h3>
            </div>
            <p className="text-neutral-600 text-sm leading-relaxed mb-4 sm:mb-0">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
              By clicking "Accept All", you consent to our use of cookies.{' '}
              <Link href="/cookie-settings" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
                Learn more
              </Link>
            </p>
          </div>
          
          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
              Accept All
            </button>
            <button
              onClick={handleCustomize}
              className="px-6 py-2.5 text-sm font-medium text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-200"
            >
              Customize
            </button>
            <button
              onClick={handleRejectAll}
              className="px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-200"
              style={{ 
                backgroundColor: '#99afa7',
                backgroundImage: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#708d81';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#99afa7';
              }}
            >
              Reject All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 