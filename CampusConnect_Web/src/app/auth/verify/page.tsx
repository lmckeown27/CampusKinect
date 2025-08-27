'use client';

import React from 'react';
import Link from 'next/link';

const VerifyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 w-full">
          <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center mb-6 shadow-xl">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <h1 
            className="text-3xl font-bold text-neutral-900 mb-2 w-full"
            style={{ textAlign: 'center' }}
          >
            <span className="text-primary">CampusKinect</span>
          </h1>
          <p 
            className="text-neutral-600 w-full"
            style={{ textAlign: 'center' }}
          >
            Verify Your Email Address
          </p>
          <p 
            className="text-neutral-500 w-full text-sm"
            style={{ textAlign: 'center' }}
          >
            TEST PAGE - This page exists and is accessible!
          </p>
        </div>

        {/* Simple Test Content */}
        <div className="bg-white rounded-lg shadow-box-xl p-6 border border-neutral-100" style={{ width: '400px', margin: '0 auto' }}>
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-green-600">
              ✅ Verification Page is Working!
            </h2>
            <p className="text-neutral-600">
              If you can see this, the verification page exists and is accessible.
            </p>
            <div className="pt-4">
              <Link 
                href="/auth/register" 
                className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-600 transition-colors"
              >
                ← Back to Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage; 