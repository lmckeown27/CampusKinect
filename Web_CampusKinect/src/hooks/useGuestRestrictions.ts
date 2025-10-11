import { useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

export const useGuestRestrictions = () => {
  const { isAuthenticated, isGuest } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restrictedFeature, setRestrictedFeature] = useState('');

  const checkRestriction = useCallback((featureName: string): boolean => {
    // If user is authenticated, allow all actions
    if (isAuthenticated) {
      return true;
    }

    // If user is a guest, show restriction modal
    if (isGuest) {
      setRestrictedFeature(featureName);
      setIsModalOpen(true);
      return false;
    }

    // Not authenticated and not guest (shouldn't happen but handle it)
    return false;
  }, [isAuthenticated, isGuest]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setRestrictedFeature('');
  }, []);

  return {
    checkRestriction,
    isModalOpen,
    restrictedFeature,
    closeModal,
    isGuest: isGuest && !isAuthenticated
  };
};

