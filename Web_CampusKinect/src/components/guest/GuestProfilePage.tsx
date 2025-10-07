'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { User, LogIn, MapPin, GraduationCap } from 'lucide-react';

export default function GuestProfilePage() {
  const router = useRouter();
  const { guestUniversityName, exitGuestMode } = useAuthStore();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  return (
    <div className="min-h-screen bg-grey-medium p-6">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-grey-light rounded-xl shadow-lg border-2 border-gray-600 overflow-hidden">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-r from-[#708d81] to-[#5a7166]"></div>
          
          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Profile Picture */}
            <div className="flex justify-center -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full bg-grey-medium border-4 border-grey-light flex items-center justify-center">
                <User size={64} className="text-gray-400" />
              </div>
            </div>

            {/* Guest Info */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Guest</h1>
              <p className="text-gray-400 mb-4">Browsing as Guest</p>
              
              {guestUniversityName && (
                <div className="inline-flex items-center bg-grey-medium px-4 py-2 rounded-lg border border-gray-600">
                  <MapPin size={16} className="text-[#708d81] mr-2" />
                  <span className="text-gray-300">Viewing: {guestUniversityName}</span>
                </div>
              )}
            </div>

            {/* Message Box */}
            <div className="bg-[#708d81] bg-opacity-20 border border-[#708d81] rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <GraduationCap className="text-[#708d81] mr-3 mt-1 flex-shrink-0" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Join Your Campus Community
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Create an account to post, comment, message other students, and unlock all features of CampusKinect.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSignUp}
                className="w-full bg-[#708d81] hover:bg-[#5a7166] text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-lg"
              >
                <User size={20} className="mr-2" />
                Create Account
              </button>

              <button
                onClick={handleLogin}
                className="w-full bg-grey-medium hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 border-2 border-[#708d81] flex items-center justify-center"
              >
                <LogIn size={20} className="mr-2" />
                Sign In
              </button>
            </div>

            {/* Guest Limitations */}
            <div className="mt-8 pt-6 border-t border-gray-600">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">
                As a guest, you can:
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Browse posts from your selected university</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>View post categories and content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Explore your campus community</span>
                </li>
              </ul>

              <h4 className="text-sm font-semibold text-gray-400 mb-3 mt-4">
                Create an account to:
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="text-[#708d81] mr-2">•</span>
                  <span>Post, comment, and like content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#708d81] mr-2">•</span>
                  <span>Message other students</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#708d81] mr-2">•</span>
                  <span>Bookmark and save posts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#708d81] mr-2">•</span>
                  <span>Build your campus network</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
