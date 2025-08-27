'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(true);
  const [actionTaken, setActionTaken] = useState<string | null>(null);

  // Check if user has already consented on mount
  useEffect(() => {
    console.log('CookieConsent component is MOUNTING');
    const hasUserConsented = localStorage.getItem('cookie-consent') !== null;
    const hasUserPreferences = localStorage.getItem('cookie-preferences') !== null;
    
    if (hasUserConsented || hasUserPreferences) {
      setIsVisible(false);
    }
  }, []);

  const handleAcceptAll = () => {
    console.log('Accept All button clicked - FUNCTION EXECUTING');
    alert('Accept All clicked!'); // This should definitely work if the function is called
    
    // Save to localStorage
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify({
      essential: true,
      analytics: true,
      functional: true
    }));
    
    setActionTaken('accepting');
    
    // Hide banner after delay
    setTimeout(() => {
      setIsVisible(false);
    }, 1000);
  };

  const handleRejectAll = () => {
    console.log('Reject All button clicked - FUNCTION EXECUTING');
    alert('Reject All clicked!'); // This should definitely work if the function is called
    
    // Clear localStorage
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-preferences');
    
    setActionTaken('rejecting');
    
    // Hide banner after delay
    setTimeout(() => {
      setIsVisible(false);
    }, 1000);
  };

  const handleCustomize = () => {
    console.log('Customize button clicked - FUNCTION EXECUTING');
    alert('Customize clicked!'); // This should definitely work if the function is called
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
              {actionTaken === 'accepting' ? (
                <span className="text-green-600 font-medium">Accepting cookies... Please wait.</span>
              ) : actionTaken === 'rejecting' ? (
                <span className="text-red-600 font-medium">Rejecting cookies... Please wait.</span>
              ) : (
                <>
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies.{' '}
                  <Link href="/cookie-settings" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
                    Learn more
                  </Link>
                </>
              )}
            </p>
          </div>
          
          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleAcceptAll}
              disabled={actionTaken !== null}
              className="px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#708d81',
                backgroundImage: 'none'
              }}
            >
              {actionTaken === 'accepting' ? 'Accepting...' : 'Accept All'}
            </button>
            
            <button
              onClick={handleCustomize}
              disabled={actionTaken !== null}
              className="px-6 py-2.5 text-sm font-medium text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Customize
            </button>
            
            <button
              onClick={handleRejectAll}
              disabled={actionTaken !== null}
              className="px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#99afa7',
                backgroundImage: 'none'
              }}
            >
              {actionTaken === 'rejecting' ? 'Rejecting...' : 'Reject All'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 