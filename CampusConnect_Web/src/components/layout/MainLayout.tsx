'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import Header from '../layout/Header';
import LeftSidebar from '../layout/LeftSidebar';
import { Users, Calendar, DollarSign, BookOpen, TrendingUp, UserPlus } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9f6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#708d81] mx-auto mb-4"></div>
          <p className="text-[#708d81]">Loading CampusKinect...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9f6' }}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9f6' }}>
      <Header />
      <div className="flex pt-16">
        {/* Left Sidebar - Navigation */}
        <LeftSidebar />
        
        {/* Center Column - Main Content */}
        <main className="flex-1 max-w-2xl mx-auto px-4">
          {children}
        </main>
        
        {/* Right Sidebar - Suggestions & Trending */}
        <div className="w-80 hidden xl:block p-6">
          <div className="sticky top-24">
            <div className="bg-white rounded-lg border border-[#708d81] p-4 mb-6">
              <h3 className="text-lg font-semibold text-[#708d81] mb-4 flex items-center">
                <TrendingUp size={20} className="mr-2" />
                Trending on Campus
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#708d81] rounded-full flex items-center justify-center">
                    <Users size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#708d81]">Study Groups</p>
                    <p className="text-xs text-[#708d81] opacity-70">Join the discussion</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#708d81] rounded-full flex items-center justify-center">
                    <Calendar size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#708d81]">Campus Events</p>
                    <p className="text-xs text-[#708d81] opacity-70">Don't miss out</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#708d81] rounded-full flex items-center justify-center">
                    <DollarSign size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#708d81]">Student Deals</p>
                    <p className="text-xs text-[#708d81] opacity-70">Save money today</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#708d81] rounded-full flex items-center justify-center">
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#708d81]">Tutoring Services</p>
                    <p className="text-xs text-[#708d81] opacity-70">Get help with classes</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-[#708d81] p-4">
              <h3 className="text-lg font-semibold text-[#708d81] mb-4 flex items-center">
                <UserPlus size={20} className="mr-2" />
                Suggested for You
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#708d81] rounded-full flex items-center justify-center">
                      <Users size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#708d81]">Campus Connect</p>
                      <p className="text-xs text-[#708d81] opacity-70">Official account</p>
                    </div>
                  </div>
                  <button className="text-xs text-[#708d81] hover:text-[#5a7268] font-medium">
                    Follow
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#708d81] rounded-full flex items-center justify-center">
                      <Calendar size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#708d81]">Student Life</p>
                      <p className="text-xs text-[#708d81] opacity-70">Campus updates</p>
                    </div>
                  </div>
                  <button className="text-xs text-[#708d81] hover:text-[#5a7268] font-medium">
                    Follow
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#708d81] rounded-full flex items-center justify-center">
                      <BookOpen size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#708d81]">Academic Support</p>
                      <p className="text-xs text-[#708d81] opacity-70">Study resources</p>
                    </div>
                  </div>
                  <button className="text-xs text-[#708d81] hover:text-[#5a7268] font-medium">
                    Follow
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 