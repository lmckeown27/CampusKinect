'use client';

import React, { useState } from 'react';
import { User, Shield, Bell, Palette, Save } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const SettingsTab: React.FC = () => {
  const { user: authUser } = useAuthStore();
  
  // Mock user data for testing (same as ProfileTab)
  const mockUser = {
    firstName: "Liam",
    lastName: "McKeown",
    email: "lmckeown@calpoly.edu",
    username: "liam_mckeown38",
    major: "Computer Science",
    year: 3,
    hometown: "San Jose, CA",
    biography: "Passionate computer science student with a love for problem-solving and innovation.",
    profileImage: null
  };
  
  // Use auth user if available, otherwise fall back to mock data
  const user = authUser || mockUser;
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true
  });

  const [theme, setTheme] = useState('light');

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', { notifications, privacy, theme });
    // You could add a toast notification here
  };

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Settings Sections - Horizontal Layout */}
          <div className="flex space-x-6 justify-center">
            {/* Account Settings - 1st Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-96">
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || 'Loading...'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings - 2nd Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-96">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Bell size={20} className="text-[#708d81]" />
                  <div className="w-3"></div>
                  <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#708d81] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#708d81]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Receive push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#708d81] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#708d81]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Marketing Emails</h3>
                    <p className="text-sm text-gray-500">Receive promotional content</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.marketing}
                      onChange={(e) => setNotifications(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#708d81] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#708d81]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy Settings - 3rd Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-96">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Shield size={20} className="text-[#708d81]" />
                  <div className="w-3"></div>
                  <h2 className="text-lg font-semibold text-gray-900">Privacy</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Show Email</h3>
                    <p className="text-sm text-gray-500">Display email on profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.showEmail}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, showEmail: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#708d81] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#708d81]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Show Location</h3>
                    <p className="text-sm text-gray-500">Display location on profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.showLocation}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, showLocation: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#708d81] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#708d81]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Theme Settings - 4th Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-96">
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
                      className="px-4 py-2 text-white rounded-lg transition-colors"
                      style={{ backgroundColor: theme === 'light' ? '#708d81' : '#f0f2f0' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'light' ? '#5a7268' : '#e8ebe8'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme === 'light' ? '#708d81' : '#f0f2f0'}
                    >
                      <span style={{ color: theme === 'light' ? 'white' : '#708d81' }}>Light</span>
                    </button>
                    <button
                      onClick={() => alert('Dark mode coming soon :)')}
                      className="px-4 py-2 text-white rounded-lg transition-colors"
                      style={{ backgroundColor: '#f0f2f0' }}
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
              className="px-6 py-3 text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#708d81' }}
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