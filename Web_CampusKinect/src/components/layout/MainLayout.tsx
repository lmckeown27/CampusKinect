'use client';

import React, { useEffect, useState, useRef } from 'react';
import Header from '../layout/Header';
import { NavigationProvider, useNavigation } from './NavigationContext';
import Navigationbar from '../layout/Navigationbar';
import Profilebar from '../layout/Profilebar';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
// import { useNavigation } from './NavigationContext';
// import { Users, Calendar, DollarSign, BookOpen, TrendingUp, UserPlus, Menu } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayoutContent: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, checkAuth, isLoading, user } = useAuthStore();
  const { showNavigation, setShowNavigation, showProfileDropdown, setShowProfileDropdown } = useNavigation();
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Define sections for horizontal scrolling on mobile
  const mobileSections = [
    { id: 'navigation', title: 'Menu', component: <Navigationbar /> },
    { id: 'main', title: 'Main', component: children },
    { id: 'profile', title: 'Profile', component: <Profilebar showProfileDropdown={true} setShowProfileDropdown={setShowProfileDropdown} user={user} /> }
  ];

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const sectionWidth = container.clientWidth;
      container.scrollTo({
        left: index * sectionWidth,
        behavior: 'smooth'
      });
      setCurrentSection(index);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const sectionWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;
      const newSection = Math.round(scrollLeft / sectionWidth);
      if (newSection !== currentSection) {
        setCurrentSection(newSection);
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentSection]);

  useEffect(() => {
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
    <div style={{ backgroundColor: '#f8f9f6', minHeight: '100vh' }}>
      <Header />
      
      {/* Mobile Horizontal Scroll Layout */}
      <div className="lg:hidden">
        {/* Mobile Navigation Dots */}
        <div className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-2">
          <div className="flex justify-center space-x-2">
            {mobileSections.map((section, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(index)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                  currentSection === index 
                    ? 'bg-[#708d81] text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Horizontal Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden pt-12"
          style={{
            display: 'flex',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            height: 'calc(100vh - 112px)'
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Navigation Section - Mobile */}
          <section 
            className="flex-shrink-0 w-full px-4 py-6 overflow-y-auto"
            style={{ 
              scrollSnapAlign: 'start',
              minWidth: '100vw'
            }}
          >
            <div className="max-w-sm mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Navigation</h3>
              <Navigationbar />
            </div>
          </section>

          {/* Main Content Section - Mobile */}
          <section 
            className="flex-shrink-0 w-full px-4 py-6 overflow-y-auto"
            style={{ 
              scrollSnapAlign: 'start',
              minWidth: '100vw'
            }}
          >
            <div className="max-w-2xl mx-auto">
              {children}
            </div>
          </section>

          {/* Profile Section - Mobile */}
          <section 
            className="flex-shrink-0 w-full px-4 py-6 overflow-y-auto"
            style={{ 
              scrollSnapAlign: 'start',
              minWidth: '100vw'
            }}
          >
            <div className="max-w-sm mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Profile</h3>
              <Profilebar 
                showProfileDropdown={true} 
                setShowProfileDropdown={setShowProfileDropdown} 
                user={user} 
              />
            </div>
          </section>
        </div>
      </div>

      {/* Desktop Layout (Original) */}
      <div className="hidden lg:flex pt-16">
        {/* Left Sidebar - Navigation */}
        {showNavigation && (
          <div className="transition-all duration-300 ease-in-out ml-2">
            <Navigationbar />
          </div>
        )}
        
        {/* Center Column - Main Content */}
        <main className={`flex-1 mx-auto px-4 transition-all duration-300 ease-in-out ${
          showNavigation && showProfileDropdown ? 'max-w-3xl' : 
          showNavigation ? 'max-w-4xl' : 
          showProfileDropdown ? 'max-w-4xl' : 'max-w-6xl'
        }`}>
          {children}
        </main>

        {/* Right Sidebar - Profile Dropdown (when open) */}
        {showProfileDropdown && (
          <div className="relative">
            <Profilebar 
              showProfileDropdown={showProfileDropdown}
              setShowProfileDropdown={setShowProfileDropdown}
              user={user}
            />
          </div>
        )}

        {/* Click outside to close profile dropdown */}
        {showProfileDropdown && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowProfileDropdown(false)}
          />
        )}
      </div>
    </div>
  );
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return <MainLayoutContent>{children}</MainLayoutContent>;
};

export default MainLayout; 