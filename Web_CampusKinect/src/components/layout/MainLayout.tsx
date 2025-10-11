'use client';

import React, { useEffect } from 'react';
import Header from '../layout/Header';
import { NavigationProvider, useNavigation } from './NavigationContext';
import Navigationbar from '../layout/Navigationbar';
import Profilebar from '../layout/Profilebar';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { useTermsOfService } from '../../hooks/useTermsOfService';
import TermsOfServiceModal from '../ui/TermsOfServiceModal';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayoutContent: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, checkAuth, isLoading, user, logout, isGuest } = useAuthStore();
  const { showNavigation, setShowNavigation, showProfileDropdown, setShowProfileDropdown } = useNavigation();
  const { 
    shouldShowTerms, 
    isTermsCheckComplete, 
    checkTermsForUser, 
    acceptTerms, 
    declineTerms, 
    resetTermsCheck 
  } = useTermsOfService();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Check terms when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isTermsCheckComplete) {
      console.log(`📋 CRITICAL: Checking terms for user ${user.id}`);
      checkTermsForUser(user.id.toString());
    }
  }, [isAuthenticated, user, isTermsCheckComplete]);

  // Reset terms check when authentication state changes
  useEffect(() => {
    if (!isAuthenticated) {
      resetTermsCheck();
    }
  }, [isAuthenticated, resetTermsCheck]);

  // Debug terms state changes
  useEffect(() => {
    console.log(`📋 MainLayout: Terms state changed - shouldShowTerms: ${shouldShowTerms}, isTermsCheckComplete: ${isTermsCheckComplete}`);
  }, [shouldShowTerms, isTermsCheckComplete]);

  const handleAcceptTerms = (shouldRememberChoice: boolean) => {
    if (user) {
      console.log(`📋 MainLayout: Accepting terms for user ${user.id}, shouldRemember: ${shouldRememberChoice}`);
      acceptTerms(user.id.toString(), shouldRememberChoice);
      console.log(`📋 MainLayout: Terms accepted, shouldShowTerms: ${shouldShowTerms}, isTermsCheckComplete: ${isTermsCheckComplete}`);
    }
  };

  const handleDeclineTerms = () => {
    console.log('📋 Terms declined - logging out user');
    declineTerms();
    logout();
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#525252' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#708d81] mx-auto mb-4"></div>
          <p className="text-[#708d81]">Loading CampusKinect...</p>
        </div>
      </div>
    );
  }

  // Guest mode - show full UI but with restricted functionality
  if (!isAuthenticated && isGuest) {
    return (
      <div style={{ backgroundColor: '#525252', minHeight: '100vh' }}>
        <Header />

        <div className="flex pt-16">
          {/* Left Sidebar - Navigation */}
          {showNavigation && (
            <div className="w-80 flex-shrink-0 bg-grey-medium border-r-4 border-primary min-h-[calc(100vh-4rem)] overflow-y-auto" style={{ borderRight: '4px solid #708d81' }}>
              <Navigationbar />
            </div>
          )}

          {/* Center Column - Main Content */}
          <main className={`flex-1 transition-all duration-300 ${
            showNavigation ? 'ml-0' : 'ml-0'
          } ${showProfileDropdown ? 'mr-0' : 'mr-0'}`}>
            {children}
          </main>

          {/* Right Sidebar - Profile Dropdown (when open) - Guest users get null user */}
          {showProfileDropdown && (
            <div className="w-80 flex-shrink-0 bg-grey-medium border-l-4 border-primary min-h-[calc(100vh-4rem)] overflow-y-auto" style={{ borderLeft: '4px solid #708d81' }}>
              <Profilebar 
                showProfileDropdown={showProfileDropdown} 
                setShowProfileDropdown={setShowProfileDropdown} 
                user={null}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Not authenticated and not in guest mode
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#525252' }}>
        {children}
      </div>
    );
  }

  // Show loading while terms check is in progress
  if (isAuthenticated && !isTermsCheckComplete && !shouldShowTerms) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#525252' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#708d81] mx-auto mb-4"></div>
          <p className="text-[#708d81]">Checking Terms of Service...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#525252', minHeight: '100vh' }}>
      <Header />

      <div className="flex pt-16">
        {/* Left Sidebar - Navigation */}
        {showNavigation && (
          <div className="w-80 flex-shrink-0 bg-grey-medium border-r-4 border-primary min-h-[calc(100vh-4rem)] overflow-y-auto" style={{ borderRight: '4px solid #708d81' }}>
            <Navigationbar />
          </div>
        )}

        {/* Center Column - Main Content */}
        <main className={`flex-1 transition-all duration-300 ${
          showNavigation ? 'ml-0' : 'ml-0'
        } ${showProfileDropdown ? 'mr-0' : 'mr-0'}`}>
          {children}
        </main>

        {/* Right Sidebar - Profile Dropdown (when open) */}
        {showProfileDropdown && (
          <div className="w-80 flex-shrink-0 bg-grey-medium border-l-4 border-primary min-h-[calc(100vh-4rem)] overflow-y-auto" style={{ borderLeft: '4px solid #708d81' }}>
            <Profilebar 
              showProfileDropdown={showProfileDropdown} 
              setShowProfileDropdown={setShowProfileDropdown} 
              user={user} 
            />
          </div>
        )}
      </div>

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        isOpen={shouldShowTerms}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    </div>
  );
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <NavigationProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </NavigationProvider>
  );
};

export default MainLayout; 