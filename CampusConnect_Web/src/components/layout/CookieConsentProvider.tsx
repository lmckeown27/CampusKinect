'use client';

import React from 'react';
import CookieConsent from '../ui/CookieConsent';
import { useCookieConsent } from '../../hooks/useCookieConsent';

export default function CookieConsentProvider() {
  const { saveCookieConsent, clearCookieConsent } = useCookieConsent();

  const handleAccept = (preferences: any) => {
    saveCookieConsent(preferences);
  };

  const handleReject = () => {
    clearCookieConsent();
  };

  return (
    <CookieConsent onAccept={handleAccept} onReject={handleReject} />
  );
} 