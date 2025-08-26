'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, BarChart3, Users, Save, RefreshCw } from 'lucide-react';
import { useCookieConsent } from '../../hooks/useCookieConsent';

export default function CookieSettingsPage() {
  const { preferences, saveCookieConsent, clearCookieConsent, isLoaded } = useCookieConsent();
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePreferenceChange = (type: keyof typeof preferences, value: boolean) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    setLocalPreferences(prev => ({ ...prev, [type]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await saveCookieConsent(localPreferences);
    setIsSaving(false);
    
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
  };

  const handleClearAll = () => {
    clearCookieConsent();
    setLocalPreferences({
      essential: true,
      analytics: false,
      functional: false,
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cookie settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-primary hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
            <div className="h-6 w-px bg-neutral-300"></div>
            <div className="flex items-center space-x-2">
              <Shield size={24} className="text-primary" />
              <h1 className="text-2xl font-bold text-neutral-900">Cookie Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Manage Cookie Preferences</h2>
            <p className="text-gray-600">
              Control how we use cookies to enhance your experience on CampusKinect. 
              You can change these settings at any time.
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-green-800 font-medium">Cookie preferences saved successfully!</p>
              </div>
            </div>
          )}

          {/* Cookie Categories */}
          <div className="space-y-6 mb-8">
            {/* Essential Cookies */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Shield className="text-green-600" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Essential Cookies</h3>
                    <p className="text-sm text-gray-600">Required for basic functionality</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localPreferences.essential}
                    disabled
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                These cookies are necessary for the website to function and cannot be disabled. 
                They include authentication tokens, session management, and security features.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="text-blue-600" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Analytics Cookies</h3>
                    <p className="text-sm text-gray-600">Help us improve our service</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localPreferences.analytics}
                    onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                These cookies help us understand how visitors interact with our website by collecting 
                and reporting information anonymously. This helps us improve our platform and user experience.
              </p>
            </div>

            {/* Functional Cookies */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Users className="text-purple-600" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Functional Cookies</h3>
                    <p className="text-sm text-gray-600">Enable enhanced features</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localPreferences.functional}
                    onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                These cookies enable enhanced functionality and personalization, such as remembering 
                your preferences, language settings, and providing a more tailored experience.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} />
              Reset to Current
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear All Preferences
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Preferences
                </>
              )}
            </button>
          </div>

          {/* Additional Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">More Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">How to manage cookies in your browser</h4>
                <p>
                  Most web browsers allow you to control cookies through their settings preferences. 
                  You can usually find these settings in the "Options" or "Preferences" menu of your browser.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Changes to this policy</h4>
                <p>
                  We may update this cookie policy from time to time. Any changes will be posted on this page 
                  with an updated revision date.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/privacy" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View our full Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 