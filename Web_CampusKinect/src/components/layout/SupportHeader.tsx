'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import KinectLogo from '@/assets/logos/KinectLogo.png';

export default function SupportHeader() {
  const router = useRouter();

  return (
    <>
      {/* Header */}
      <div className="bg-grey-light border-b border-gray-600">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between relative">
            {/* Login Button on Left */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/auth/login')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium border-2"
                style={{ 
                  backgroundColor: '#708d81',
                  borderColor: '#708d81',
                  color: 'white',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#a8c4a2';
                  e.currentTarget.style.borderColor = '#a8c4a2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#708d81';
                  e.currentTarget.style.borderColor = '#708d81';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
                <span>Login</span>
              </button>
            </div>
            
            {/* Centered Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => router.push('/auth/login')}
                className="hover:opacity-80 transition-opacity"
                style={{ cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }}
              >
                <img 
                  src={KinectLogo.src} 
                  alt="CampusKinect" 
                  className="h-12 w-12 object-cover rounded-md"
                  style={{ backgroundColor: '#708d81' }}
                />
              </button>
            </div>
            
            {/* Contact Support Button on Right */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => window.open('mailto:campuskinect01@gmail.com?subject=CampusKinect Support Request - Bug Report', '_blank')}
                className="px-4 py-2 rounded-lg transition-all duration-200 font-medium border-2"
                style={{ 
                  backgroundColor: '#708d81',
                  borderColor: '#708d81',
                  color: 'white',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#a8c4a2';
                  e.currentTarget.style.borderColor = '#a8c4a2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#708d81';
                  e.currentTarget.style.borderColor = '#708d81';
                }}
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 