'use client';

import React, { useState } from 'react';
import { User, FileText, Palette, Save, Cookie, ScrollText, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'next/navigation';

const SettingsTab: React.FC = () => {
  const { user: authUser } = useAuthStore();
  const router = useRouter();
  
  // Use real user data from auth store
  const user = authUser;
  
  // Add username state for editing
  const [username, setUsername] = useState(user?.username || '');

  const [theme, setTheme] = useState('light');

  const handleSave = () => {
    // Save settings logic here (username, theme)
    console.log('Settings saved:', { username, theme });
    // You could add a toast notification here
  };

  const handleCookieSettings = () => {
    router.push('/cookie-settings');
  };

  const handleTermsAndConditions = () => {
    router.push('/terms');
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy');
  };

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Settings Sections - Horizontal Layout */}
          <div className="flex space-x-6 justify-center">
            {/* Account Settings - 1st Section */}
            <div className="bg-grey-light rounded-lg shadow-sm border border-gray-200 w-96">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <User size={20} className="text-[#708d81]" />
                  <div className="w-3"></div>
                  <h2 className="text-lg font-semibold text-gray-900">Account</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
                  />
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {user?.email || 'Loading...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal & Documents - 2nd Section */}
            <div className="bg-grey-light rounded-lg shadow-sm border border-gray-200 w-96">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <FileText size={20} className="text-[#708d81]" />
                  <div className="w-3"></div>
                  <h2 className="text-lg font-semibold text-gray-900">Legal & Documents</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Cookie Settings Button */}
                <button
                  onClick={handleCookieSettings}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors cursor-pointer border border-gray-300 hover:bg-gray-50"
                  style={{ 
                    backgroundColor: '#737373', 
                    color: 'black', 
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                >
                  <Cookie size={18} className="text-gray-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Cookie Settings</h3>
                    <p className="text-sm text-gray-500">Manage your cookie preferences</p>
                  </div>
                </button>

                {/* Terms & Conditions Button */}
                <button
                  onClick={handleTermsAndConditions}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors cursor-pointer border border-gray-300 hover:bg-gray-50"
                  style={{ 
                    backgroundColor: '#737373', 
                    color: 'black', 
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                >
                  <ScrollText size={18} className="text-gray-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Terms & Conditions</h3>
                    <p className="text-sm text-gray-500">View our terms of service</p>
                  </div>
                </button>

                {/* Privacy Policy Button */}
                <button
                  onClick={handlePrivacyPolicy}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors cursor-pointer border border-gray-300 hover:bg-gray-50"
                  style={{ 
                    backgroundColor: '#737373', 
                    color: 'black', 
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                >
                  <ShieldCheck size={18} className="text-gray-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Privacy Policy</h3>
                    <p className="text-sm text-gray-500">View our privacy policy</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Theme Settings - 3rd Section */}
            <div className="bg-grey-light rounded-lg shadow-sm border border-gray-200 w-96">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Palette size={20} className="text-[#708d81]" />
                  <div className="w-3"></div>
                  <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                </div>
              </div>
              <div className="p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setTheme('light')}
                      className="px-4 py-2 text-white rounded-lg transition-colors cursor-pointer"
                      style={{ 
                        backgroundColor: theme === 'light' ? '#708d81' : '#f0f2f0', 
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'light' ? '#5a7268' : '#e8ebe8'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme === 'light' ? '#708d81' : '#f0f2f0'}
                    >
                      <span style={{ color: theme === 'light' ? 'white' : '#708d81' }}>Light</span>
                    </button>
                    <button
                      onClick={() => alert('Dark mode coming soon :)')}
                      className="px-4 py-2 text-white rounded-lg transition-colors cursor-pointer"
                      style={{ 
                        backgroundColor: '#f0f2f0', 
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8ebe8'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f2f0'}
                    >
                      <span style={{ color: '#708d81' }}>Dark</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-3 text-white rounded-lg transition-colors cursor-pointer"
              style={{ 
                backgroundColor: '#708d81', 
                cursor: 'pointer',
                color: 'white',
                WebkitTapHighlightColor: 'transparent',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a7268'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#708d81'}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab; 