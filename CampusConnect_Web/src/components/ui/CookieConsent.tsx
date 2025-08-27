'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(true);
  const [actionTaken, setActionTaken] = useState<string | null>(null);

  // Check if user has already consented on mount
  useEffect(() => {
    const hasUserConsented = localStorage.getItem('cookie-consent') !== null;
    const hasUserPreferences = localStorage.getItem('cookie-preferences') !== null;
    
    // TEMPORARILY FORCE VISIBILITY FOR DEBUGGING
    setIsVisible(true);
    
    if (hasUserConsented || hasUserPreferences) {
      // setIsVisible(false); // Commented out temporarily
    }
  }, []);

  const handleAcceptAll = () => {
    // Save to localStorage
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify({
      essential: true,
      analytics: true,
      functional: true
    }));
    
    // Hide banner immediately
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    // Clear localStorage
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-preferences');
    
    // Hide banner immediately
    setIsVisible(false);
  };

  const handleCustomize = () => {
    // Navigate to cookie settings
    window.location.href = '/cookie-settings';
  }

  // Don't render if banner should be hidden
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-2xl z-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
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
              className="px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ 
                backgroundColor: '#99afa7',
                backgroundImage: 'none'
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