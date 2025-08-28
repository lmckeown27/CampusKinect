'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  const [showNavigation, setShowNavigation] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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