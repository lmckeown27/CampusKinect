import React from 'react';
import LoginForm from '../../../components/auth/LoginForm';

// Disable static generation since LoginForm imports images
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginForm />;
} 