'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';

export default function CookieSettingsPage() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    functional: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load existing preferences on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('cookie-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      }
    }
  }, []);

  const handlePreferenceChange = (type: keyof typeof preferences, value: boolean) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleReset = () => {
    // Reset to default preferences
    setPreferences({
      essential: true,
      analytics: false,
      functional: false,
    });
  };

  const handleClearAll = () => {
    // Clear localStorage
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-preferences');
    
    setPreferences({
      essential: true,
      analytics: false,
      functional: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 shadow-sm relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back to Login Link - Positioned absolutely on left */}
          <div className="absolute left-4 sm:left-6 lg:left-8 top-6 w-auto h-auto">
            <Link 
              href="/auth/login"
              className="flex items-center space-x-2 text-primary hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              <ArrowLeft size={20} />
              <span>Login</span>
            </Link>
          </div>
          
          {/* Centered Title */}
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold text-neutral-900 text-center">Cookies</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100">
          <div className="prose prose-lg max-w-none text-center">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Introduction</h3>
                <p className="text-gray-700 leading-relaxed">
                  This page explains how we use cookies and similar technologies on CampusKinect to enhance your experience, 
                  provide personalized content, and analyze our traffic. Cookies are small text files that are stored on 
                  your device when you visit our website.
                </p>
              </section>

              {/* Essential Cookies */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Essential Cookies</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      These cookies are necessary for the website to function and cannot be disabled. 
                      They include authentication tokens, session management, and security features.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Without these cookies, you would not be able to log in, create posts, or use 
                      the core features of CampusKinect. These cookies are automatically set when you 
                      visit our platform and are essential for basic functionality.
                    </p>
                  </div>
                  <div className="ml-6">
                    <input
                      type="checkbox"
                      checked={preferences.essential}
                      disabled
                      className="w-6 h-6 text-[#6B7C3A] bg-gray-100 border-gray-300 rounded focus:ring-[#6B7C3A] cursor-not-allowed"
                    />
                  </div>
                </div>
              </section>

              {/* Analytics Cookies */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Analytics Cookies</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      These cookies help us understand how visitors interact with our website by collecting 
                      and reporting information anonymously. This includes data about which pages are most 
                      popular, how long users stay on the site, and what features are used most frequently.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      This information helps us improve our platform and user experience. Analytics cookies 
                      are optional and can be disabled through your browser settings without affecting 
                      the core functionality of CampusKinect.
                    </p>
                  </div>
                  <div className="ml-6">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                      className="w-6 h-6 text-[#6B7C3A] bg-gray-100 border-gray-300 rounded focus:ring-[#6B7C3A] cursor-pointer"
                    />
                  </div>
                </div>
              </section>

              {/* Functional Cookies */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Functional Cookies</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      These cookies enable enhanced functionality and personalization, such as remembering 
                      your preferences, language settings, and providing a more tailored experience.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      They help us show you relevant content and remember your choices to make your 
                      time on CampusKinect more enjoyable. Functional cookies are optional and can be 
                      disabled through your browser settings.
                    </p>
                  </div>
                  <div className="ml-6">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                      className="w-6 h-6 text-[#6B7C3A] bg-gray-100 border-gray-300 rounded focus:ring-[#6B7C3A] cursor-pointer"
                    />
                  </div>
                </div>
              </section>

              {/* How to Manage Cookies */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">How to Manage Cookies</h3>
                
                <h4 className="text-lg font-medium text-gray-900 mb-3 text-center">Browser Settings</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Most web browsers allow you to control cookies through their settings preferences. 
                  You can usually find these settings in the "Options" or "Preferences" menu of your browser. 
                  Look for sections related to "Privacy," "Security," or "Cookies."
                </p>

                <h4 className="text-lg font-medium text-gray-900 mb-3 text-center">Mobile Devices</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  On mobile devices, cookie settings are typically found in your device's settings app 
                  under the browser settings. You can usually control cookies for all browsers on your device.
                </p>

                <h4 className="text-lg font-medium text-gray-900 mb-3 text-center">Third-Party Tools</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  There are also browser extensions and third-party tools available that can help you 
                  manage cookies more granularly, allowing you to block specific types of cookies 
                  while allowing others.
                </p>
              </section>

              {/* Cookie Preferences */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Your Cookie Preferences</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can control your cookie preferences using the checkboxes above. However, please note that:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Essential cookies cannot be disabled as they are required for basic functionality</li>
                  <li>Disabling analytics cookies may limit our ability to improve the platform</li>
                  <li>Disabling functional cookies may reduce the personalization of your experience</li>
                  <li>Changes to cookie settings will be saved when you click "Save Preferences"</li>
                </ul>
              </section>

              {/* Action Buttons */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Save Your Preferences</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Use the buttons below to save your cookie preferences or reset to default settings.
                </p>
                
                {/* Success Message */}
                {showSuccess && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-green-700 font-medium">Cookie preferences saved successfully!</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-row items-center gap-4 justify-center flex-wrap">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    style={{ 
                      backgroundColor: '#708d81',
                      backgroundImage: 'none',
                      color: 'white',
                      marginRight: '16px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#5a7268';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#708d81';
                    }}
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    style={{ 
                      backgroundColor: '#708d81',
                      backgroundImage: 'none',
                      color: 'white',
                      marginRight: '16px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#5a7268';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#708d81';
                    }}
                  >
                    Clear All Preferences
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: '#708d81',
                      backgroundImage: 'none',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSaving) {
                        e.currentTarget.style.backgroundColor = '#5a7268';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSaving) {
                        e.currentTarget.style.backgroundColor = '#708d81';
                      }
                    }}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </button>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about this cookie policy or our use of cookies, please contact us:
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-blue-800 font-medium">CampusKinect Cookie Team</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Email: support@campuskinect.com<br />
                    Response time: Whenever I get around to it
                  </p>
                </div>
              </section>

              {/* Footer Navigation */}
              <div className="border-t border-gray-200 pt-8 mt-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    Last updated: August 2025
                  </div>
                  <div className="flex items-center">
                    <Link 
                      href="/auth/login" 
                      className="text-primary hover:text-primary-600 font-medium text-sm transition-colors duration-200"
                    >
                      Login
                    </Link>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Link 
                      href="/auth/register" 
                      className="text-primary hover:text-primary-600 font-medium text-sm transition-colors duration-200"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 