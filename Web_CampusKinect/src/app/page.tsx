'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';
import UniversitySelectModal from '../components/guest/UniversitySelectModal';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isGuest, guestUniversityId, enterGuestMode } = useAuthStore();
  const [showUniversitySelect, setShowUniversitySelect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication and guest status
    if (isAuthenticated) {
      // User is logged in - go to main app
      router.push('/home');
    } else if (isGuest && guestUniversityId) {
      // User is in guest mode with university selected - go to guest feed
      router.push('/home');
    } else {
      // No auth and no guest mode - show university select
      setShowUniversitySelect(true);
      setIsLoading(false);
    }
  }, [isAuthenticated, isGuest, guestUniversityId, router]);

  const handleUniversitySelect = (university: any) => {
    enterGuestMode(university.id, university.name);
    setShowUniversitySelect(false);
    router.push('/home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-medium">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#708d81]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-medium flex items-center justify-center">
      <UniversitySelectModal
        isOpen={showUniversitySelect}
        onClose={() => {}} // Don't allow closing without selection
        onSelect={handleUniversitySelect}
      />
    </div>
  );
}