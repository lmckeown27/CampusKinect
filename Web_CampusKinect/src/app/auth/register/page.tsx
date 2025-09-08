import React from 'react';
import RegisterForm from '../../../components/auth/RegisterForm';

// Disable static generation since RegisterForm imports images
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return <RegisterForm />;
} 