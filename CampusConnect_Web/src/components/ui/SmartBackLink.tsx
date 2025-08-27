'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackLink {
  href: string;
  text: string;
}

interface SmartBackLinkProps {
  className?: string;
}

export default function SmartBackLink({ className = "" }: SmartBackLinkProps) {
  const [backLink, setBackLink] = useState<BackLink>({ href: '/', text: 'Back to Landing' });

  useEffect(() => {
    // Determine the appropriate back link based on referrer
    const determineBackLink = () => {
      // Check if we have a referrer from the browser
      if (typeof document !== 'undefined' && document.referrer) {
        const referrer = new URL(document.referrer);
        const pathname = referrer.pathname;
        
        // Determine the appropriate back link based on the referrer path
        if (pathname === '/' || pathname === '') {
          // Came from main landing page
          setBackLink({ href: '/', text: 'Back to Landing' });
        } else if (pathname.startsWith('/auth/')) {
          // Came from authentication pages
          setBackLink({ href: '/auth/login', text: 'Back to Login' });
        } else if (pathname === '/home') {
          // Came from logged-in home page
          setBackLink({ href: '/home', text: 'Back to Home' });
        } else if (pathname.startsWith('/home/')) {
          // Came from a logged-in page
          setBackLink({ href: '/home', text: 'Back to Home' });
        } else {
          // Default fallback
          setBackLink({ href: '/', text: 'Back to Landing' });
        }
      } else {
        // No referrer, default to landing page
        setBackLink({ href: '/', text: 'Back to Landing' });
      }
    };

    determineBackLink();
  }, []);

  return (
    <Link 
      href={backLink.href}
      className={`flex items-center space-x-2 text-primary hover:text-primary-600 transition-colors duration-200 font-medium ${className}`}
    >
      <ArrowLeft size={20} />
      <span>{backLink.text}</span>
    </Link>
  );
} 