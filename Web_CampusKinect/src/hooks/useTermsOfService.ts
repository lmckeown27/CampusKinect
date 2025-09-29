'use client';

import { useState, useEffect } from 'react';
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

  const checkTermsForUser = (userId: string) => {
    // Prevent multiple simultaneous checks
    if (isCheckingTerms) {
      console.log('📋 CRITICAL: Terms check already in progress - ignoring duplicate request');
      return;
    }

    setIsCheckingTerms(true);
    
    // Small delay to ensure UI is stable before checking terms
    setTimeout(() => {
      const needsTerms = termsOfServiceManager.shouldShowTermsPopup(userId);
      
      setShouldShowTerms(needsTerms);
      setIsCheckingTerms(false);
      
      if (needsTerms) {
        console.log(`📋 CRITICAL: Terms popup WILL BE SHOWN for user ${userId}`);
        setIsTermsCheckComplete(false);
      } else {
        console.log(`📋 CRITICAL: Terms popup NOT NEEDED for user ${userId}`);
        setIsTermsCheckComplete(true);
      }
    }, 100);
  };

  const acceptTerms = (userId: string, shouldRememberChoice: boolean) => {
    console.log(`📋 Hook: acceptTerms called - userId: ${userId}, shouldRemember: ${shouldRememberChoice}`);
    console.log(`📋 Hook: Before - shouldShowTerms: ${shouldShowTerms}, isTermsCheckComplete: ${isTermsCheckComplete}`);
    
    termsOfServiceManager.acceptTerms(userId, shouldRememberChoice);
    setShouldShowTerms(false);
    setIsTermsCheckComplete(true);
    
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