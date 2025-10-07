'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(true);
  const [actionTaken, setActionTaken] = useState<string | null>(null);

  // Check if user has already consented on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasUserConsented = localStorage.getItem('cookie-consent') !== null;
      const hasUserPreferences = localStorage.getItem('cookie-preferences') !== null;
      
      if (hasUserConsented || hasUserPreferences) {
        setIsVisible(false);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    if (typeof window !== 'undefined') {
      // Save to localStorage
      localStorage.setItem('cookie-consent', 'true');
      localStorage.setItem('cookie-preferences', JSON.stringify({
        essential: true,
        analytics: true,
        functional: true
      }));
    }
    
    // Hide banner immediately
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem('cookie-consent');
      localStorage.removeItem('cookie-preferences');
    }
    
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
    <div className="fixed bottom-0 left-0 right-0 bg-grey-medium border-t border-neutral-200 shadow-2xl z-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#708d81] rounded-lg p-6 shadow-lg" style={{ backgroundColor: '#708d81', width: 'fit-content', margin: '0 auto' }}>
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="text-center max-w-lg">
              <h3 className="font-semibold text-white text-lg mb-3" style={{ textAlign: 'center', color: 'white' }}>We use cookies</h3>
              <p className="text-white text-sm leading-relaxed mb-2" style={{ textAlign: 'center', color: 'white' }}>
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
              </p>
              <p className="text-white text-sm leading-relaxed mb-4" style={{ textAlign: 'center', color: 'white' }}>
                By clicking "Accept All", you consent to our use of cookies.{' '}
                <Link href="/cookie-settings" className="text-blue-900 hover:text-blue-800 font-medium underline decoration-2 underline-offset-2" style={{ color: '#1e3a8a' }}>
                  Learn more
                </Link>
              </p>
            </div>
            
            <div className="flex flex-row justify-center">
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{ 
                  backgroundColor: 'white',
                  backgroundImage: 'none',
                  color: '#708d81',
                  marginRight: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#708d81';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#708d81';
                  e.currentTarget.style.cursor = 'default';
                }}
              >
                Accept All
              </button>
              
              <button
                onClick={handleCustomize}
                className="px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{ 
                  backgroundColor: 'white',
                  backgroundImage: 'none',
                  color: '#708d81',
                  marginRight: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#708d81';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#708d81';
                  e.currentTarget.style.cursor = 'default';
                }}
              >
                Customize
              </button>
              
              <button
                onClick={handleRejectAll}
                className="px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{ 
                  backgroundColor: 'white',
                  backgroundImage: 'none',
                  color: '#708d81'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#708d81';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#708d81';
                  e.currentTarget.style.cursor = 'default';
                }}
              >
                Reject All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 