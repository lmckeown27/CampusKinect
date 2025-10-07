'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, LogIn, Eye } from 'lucide-react';

interface GuestBannerProps {
  universityName: string;
}

export default function GuestBanner({ universityName }: GuestBannerProps) {
  const router = useRouter();

  return (
    <div className="bg-[#708d81] bg-opacity-30 border-b-2 border-[#708d81] px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Side - Status */}
        <div className="flex items-center text-white text-sm">
          <Eye size={18} className="mr-2 text-[#708d81]" />
          <span className="font-medium">Browsing as Guest</span>
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-gray-300">Viewing: <span className="font-semibold">{universityName}</span></span>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-grey-medium hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors border border-[#708d81] flex items-center"
          >
            <LogIn size={16} className="mr-2" />
            Sign In
          </button>
          <button
            onClick={() => router.push('/auth/register')}
            className="px-4 py-2 bg-[#708d81] hover:bg-[#5a7166] text-white text-sm font-medium rounded-lg transition-colors flex items-center"
          >
            <User size={16} className="mr-2" />
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
