'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../stores/authStore';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9f6' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#708d81] mx-auto mb-4"></div>
        <p className="text-[#708d81]">Loading CampusKinect...</p>
      </div>
    </div>
  );
}
