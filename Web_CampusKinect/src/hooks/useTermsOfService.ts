'use client';

import { useState, useEffect, useCallback } from 'react';
import { termsOfServiceManager } from '../services/termsOfServiceManager';

interface UseTermsOfServiceReturn {
  shouldShowTerms: boolean;
  isTermsCheckComplete: boolean;
  checkTermsForUser: (userId: string) => void;
  acceptTerms: (userId: string, shouldRememberChoice: boolean) => void;
  declineTerms: () => void;
  resetTermsCheck: () => void;
}

export const useTermsOfService = (): UseTermsOfServiceReturn => {
  const [shouldShowTerms, setShouldShowTerms] = useState(false);
  const [isTermsCheckComplete, setIsTermsCheckComplete] = useState(false);
  const [isCheckingTerms, setIsCheckingTerms] = useState(false);
  const [hasAcceptedInCurrentSession, setHasAcceptedInCurrentSession] = useState(false);

  // Initialize terms check state from sessionStorage to persist across tab navigation
  useEffect(() => {
    const sessionTermsComplete = sessionStorage.getItem('campusConnect_termsCheckComplete');
    const sessionTermsAccepted = sessionStorage.getItem('campusConnect_termsAcceptedInSession');
    
    if (sessionTermsComplete === 'true') {
      setIsTermsCheckComplete(true);
      console.log('📋 Hook: Restored terms check complete state from session');
    }
    
    if (sessionTermsAccepted === 'true') {
      setHasAcceptedInCurrentSession(true);
      console.log('📋 Hook: Restored terms accepted in session state');
    }
  }, []);

  const checkTermsForUser = useCallback((userId: string) => {
    // Prevent multiple simultaneous checks
    if (isCheckingTerms) {
      console.log('📋 CRITICAL: Terms check already in progress - ignoring duplicate request');
      return;
    }

    // If user has already accepted terms in this session, don't check again
    if (hasAcceptedInCurrentSession) {
      console.log('📋 CRITICAL: Terms already accepted in current session - skipping check');
      setIsTermsCheckComplete(true);
      return;
    }

    // Quick check: if user doesn't need terms popup, set complete immediately
    const needsTerms = termsOfServiceManager.shouldShowTermsPopup(userId);
    if (!needsTerms) {
      console.log(`📋 CRITICAL: Terms popup NOT NEEDED for user ${userId} - setting complete immediately`);
      setIsTermsCheckComplete(true);
      setShouldShowTerms(false);
      return;
    }

    setIsCheckingTerms(true);
    
    // Small delay to ensure UI is stable before showing terms popup
    setTimeout(() => {
      setShouldShowTerms(true);
      setIsCheckingTerms(false);
      setIsTermsCheckComplete(false);
      console.log(`📋 CRITICAL: Terms popup WILL BE SHOWN for user ${userId}`);
    }, 100);
  }, [isCheckingTerms, hasAcceptedInCurrentSession]);

  const acceptTerms = (userId: string, shouldRememberChoice: boolean) => {
    console.log(`📋 Hook: acceptTerms called - userId: ${userId}, shouldRemember: ${shouldRememberChoice}`);
    console.log(`📋 Hook: Before - shouldShowTerms: ${shouldShowTerms}, isTermsCheckComplete: ${isTermsCheckComplete}`);
    
    termsOfServiceManager.acceptTerms(userId, shouldRememberChoice);
    setShouldShowTerms(false);
    setIsTermsCheckComplete(true);
    setHasAcceptedInCurrentSession(true); // Mark as accepted in current session
    
    // Persist session state to prevent re-showing terms when switching tabs
    sessionStorage.setItem('campusConnect_termsCheckComplete', 'true');
    sessionStorage.setItem('campusConnect_termsAcceptedInSession', 'true');
    
    console.log(`📋 Hook: After state updates called - Terms accepted for user ${userId}, remember choice: ${shouldRememberChoice}`);
    
    // Force immediate state update to ensure modal closes
    setTimeout(() => {
      console.log(`📋 Hook: Timeout check - shouldShowTerms: ${shouldShowTerms}, isTermsCheckComplete: ${isTermsCheckComplete}`);
    }, 100);
  };

  const declineTerms = () => {
    setShouldShowTerms(false);
    setIsTermsCheckComplete(true);
    console.log('📋 Terms declined - user should be logged out');
  };

  const resetTermsCheck = () => {
    setShouldShowTerms(false);
    setIsTermsCheckComplete(false);
    setIsCheckingTerms(false);
    setHasAcceptedInCurrentSession(false); // Reset session flag on logout
    
    // Clear session storage when resetting (e.g., on logout)
    sessionStorage.removeItem('campusConnect_termsCheckComplete');
    sessionStorage.removeItem('campusConnect_termsAcceptedInSession');
    
    console.log('📋 Hook: Terms check reset and session storage cleared');
  };

  return {
    shouldShowTerms,
    isTermsCheckComplete,
    checkTermsForUser,
    acceptTerms,
    declineTerms,
    resetTermsCheck
  };
}; 