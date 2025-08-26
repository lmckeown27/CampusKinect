'use client';

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useCookieConsent } from '../../hooks/useCookieConsent';

export default function CookieConsent() {
  const { preferences, saveCookieConsent, clearCookieConsent } = useCookieConsent();

  const handleAcceptAll = () => {
    saveCookieConsent({
      essential: true,
      analytics: true,
      functional: true
    });
  };

  const handleRejectAll = () => {
    clearCookieConsent();
  };

  const handleCustomize = () => {
    // Navigate to cookie settings page
    window.location.href = '/cookie-settings';
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-2xl z-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="text-primary" size={24} />
              <h3 className="font-semibold text-neutral-900 text-lg">We use cookies</h3>
            </div>
            <p className="text-neutral-600 text-sm leading-relaxed mb-4 sm:mb-0">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
              By clicking &quot;Accept All&quot;, you consent to our use of cookies. 
              <Link href="/cookie-settings" className="text-primary hover:text-primary-600 font-medium ml-1 underline decoration-2 underline-offset-2">
                Learn more
              </Link>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleRejectAll}
              className="px-6 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors duration-200"
            >
              Reject All
            </button>
            <button
              onClick={handleCustomize}
              className="px-6 py-2.5 text-sm font-medium text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-200"
            >
              Customize
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 