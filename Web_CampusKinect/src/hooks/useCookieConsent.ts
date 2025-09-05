import { useState, useEffect } from 'react';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
}

export interface CookieConsent {
  hasConsented: boolean;
  preferences: CookiePreferences;
  timestamp: number;
}

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log('useCookieConsent hook: useEffect running');
    loadCookieConsent();
  }, []);

  const loadCookieConsent = () => {
    console.log('useCookieConsent hook: loadCookieConsent called');
    
    if (typeof window === 'undefined') {
      setIsLoaded(true);
      return;
    }
    
    try {
      const consentData = localStorage.getItem(COOKIE_CONSENT_KEY);
      const preferencesData = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      
      console.log('useCookieConsent hook: localStorage data:', { consentData, preferencesData });
      
      if (consentData && preferencesData) {
        const preferences: CookiePreferences = JSON.parse(preferencesData);
        const consentInfo: CookieConsent = {
          hasConsented: true,
          preferences,
          timestamp: Date.now(),
        };
        setConsent(consentInfo);
        console.log('useCookieConsent hook: consent data set');
      } else {
        console.log('useCookieConsent hook: no existing consent data');
      }
    } catch (error) {
      console.error('useCookieConsent hook: Error loading cookie consent:', error);
    } finally {
      console.log('useCookieConsent hook: setting isLoaded to true');
      setIsLoaded(true);
    }
  };

  const saveCookieConsent = (preferences: CookiePreferences) => {
    if (typeof window === 'undefined') return false;
    
    try {
      const consentInfo: CookieConsent = {
        hasConsented: true,
        preferences,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentInfo));
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
      
      setConsent(consentInfo);
      
      // Apply cookie preferences
      applyCookiePreferences(preferences);
      
      return true;
    } catch (error) {
      console.error('Error saving cookie consent:', error);
      return false;
    }
  };

  const clearCookieConsent = () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      localStorage.removeItem(COOKIE_PREFERENCES_KEY);
      setConsent(null);
      
      // Remove non-essential cookies
      removeNonEssentialCookies();
      
      return true;
    } catch (error) {
      console.error('Error clearing cookie consent:', error);
      return false;
    }
  };

  const applyCookiePreferences = (preferences: CookiePreferences) => {
    // Essential cookies are always enabled
    if (preferences.essential) {
      // Enable essential cookies (authentication, etc.)
      console.log('Essential cookies enabled');
    }

    if (preferences.analytics) {
      // Enable analytics cookies
      console.log('Analytics cookies enabled');
      // Here you would initialize analytics services like Google Analytics
    } else {
      // Disable analytics cookies
      console.log('Analytics cookies disabled');
      // Here you would disable analytics services
    }

    if (preferences.functional) {
      // Enable functional cookies
      console.log('Functional cookies enabled');
      // Here you would enable personalization features
    } else {
      // Disable functional cookies
      console.log('Functional cookies disabled');
      // Here you would disable personalization features
    }
  };

  const removeNonEssentialCookies = () => {
    // Remove analytics and functional cookies
    console.log('Removing non-essential cookies');
    // Here you would remove cookies and disable services
  };

  const updatePreferences = (newPreferences: Partial<CookiePreferences>) => {
    if (!consent) return false;
    
    const updatedPreferences = { ...consent.preferences, ...newPreferences };
    return saveCookieConsent(updatedPreferences);
  };

  const hasConsented = consent?.hasConsented || false;
  const preferences = consent?.preferences || {
    essential: true,
    analytics: false,
    functional: false,
  };

  return {
    consent,
    isLoaded,
    hasConsented,
    preferences,
    saveCookieConsent,
    clearCookieConsent,
    updatePreferences,
    loadCookieConsent,
  };
} 