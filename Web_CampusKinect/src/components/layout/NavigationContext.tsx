'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface NavigationContextType {
  showNavigation: boolean;
  setShowNavigation: (show: boolean) => void;
  showProfileDropdown: boolean;
  setShowProfileDropdown: (show: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const { user } = useAuthStore();
  
  // Mobile detection function
  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    
    // Check for touch support and screen size
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768; // Mobile/tablet breakpoint
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return hasTouchScreen && (isSmallScreen || isMobileUserAgent);
  };

  // Set initial navigation state based on device type
  const [showNavigation, setShowNavigation] = useState(!isMobileDevice()); // Closed on mobile, open on desktop
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Update navigation state when window resizes (orientation change, etc.)
  useEffect(() => {
    const handleResize = () => {
      // Auto-close navigation on mobile devices
      if (isMobileDevice()) {
        setShowNavigation(false);
      } else {
        // Auto-open navigation on desktop
        setShowNavigation(true);
      }
    };

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    // Run once on mount to set correct initial state
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close navigation on mobile when user logs in
  useEffect(() => {
    if (user && isMobileDevice()) {
      setShowNavigation(false);
    }
  }, [user]); // React to user login/logout changes

  return (
    <NavigationContext.Provider value={{ 
      showNavigation, 
      setShowNavigation, 
      showProfileDropdown, 
      setShowProfileDropdown 
    }}>
      {children}
    </NavigationContext.Provider>
  );
}; 