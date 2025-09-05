'use client';

import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import UserProfileTab from '@/components/tabs/UserProfileTab';

interface UserProfilePageProps {
  params: {
    userId: string;
  };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return (
    <MainLayout>
      <UserProfileTab userId={params.userId} />
    </MainLayout>
  );
} 