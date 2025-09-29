'use client';

import React, { useState } from 'react';
import { User, FileText, Save, Cookie, ScrollText, ShieldCheck, HelpCircle, MessageCircle, Mail, Bug } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'next/navigation';

const SettingsTab: React.FC = () => {
  const { user: authUser } = useAuthStore();
  const router = useRouter();
  
  // Use real user data from auth store
  const user = authUser;
  
  // Add username state for editing
  const [username, setUsername] = useState(user?.username || '');

  const handleSave = () => {
    // Save settings logic here (username)
    console.log('Settings saved:', { username });
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

  const handleSupport = () => {
    router.push('/support');
  };

  const handleContactUs = () => {
    window.location.href = 'mailto:campuskinect01@gmail.com?subject=CampusKinect Support Request';
  };

  const handleReportBug = () => {
    window.location.href = 'mailto:campuskinect01@gmail.com?subject=Bug Report - CampusKinect Web';
  };

  const handleFeedback = () => {
  };

  const handleBlockedUsers = () => {
    router.push('/settings/blocked-users');
  };

  const handleFeedbackEmail = () => {
    window.location.href = 'mailto:campuskinect01@gmail.com?subject=Feedback - CampusKinect';
  };

  return (
    <div className="flex-1 p-6 min-h-screen" style={{ backgroundColor: '#525252' }}>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Settings Sections - Horizontal Layout with spacing */}
          <div className="flex space-x-6 justify-center">
            {/* Account Settings - 1st Section */}
            <div className="shadow-lg border-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 w-80" style={{ backgroundColor: '#737373', borderRadius: '24px', border: '2px solid #708d81', overflow: 'hidden' }}>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <User size={20} className="text-[#708d81]" />
                  <div className="w-3"></div>
                  <h2 className="text-lg font-semibold text-white">Account</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-grey-medium text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#708d81] focus:border-transparent text-white"
                  />
                  <div className="mt-2">
                    <p className="text-sm text-white">
                      <span className="font-medium">Email:</span> {user?.email || 'Loading...'}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">Email cannot be changed for security reasons</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal & Documents - 2nd Section */}
            <div className="shadow-lg border-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 w-80" style={{ backgroundColor: '#737373', borderRadius: '24px', border: '2px solid #708d81', overflow: 'hidden' }}>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <FileText size={20} className="text-[#708d81]" />
                  <div className="w-3"></div>
                  <h2 className="text-lg font-semibold text-white">Legal & Documents</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Cookie Settings Button */}
                <button
                  onClick={handleCookieSettings}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 cursor-pointer border-2 border-[#708d81] transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                  style={{ 
                    backgroundColor: '#525252',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#525252';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                >
                  <Cookie size={18} className="text-white mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-white">Cookie Settings</h3>
                    <p className="text-sm text-gray-300">Manage your cookie preferences</p>
                  </div>
                </button>

                {/* Terms & Conditions Button */}
                <button
                  onClick={handleTermsAndConditions}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 cursor-pointer border-2 border-[#708d81] transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                  style={{ 
                    backgroundColor: '#525252',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#525252';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                >
                  <ScrollText size={18} className="text-white mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-white">Terms & Conditions</h3>
                    <p className="text-sm text-gray-300">View our terms of service</p>
                  </div>
                </button>

                {/* Privacy Policy Button */}
                <button
                  onClick={handlePrivacyPolicy}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 cursor-pointer border-2 border-[#708d81] transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                  style={{ 
                    backgroundColor: '#525252',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#525252';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                >
                  <ShieldCheck size={18} className="text-white mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-white">Privacy Policy</h3>
                    <p className="text-sm text-gray-300">View our privacy policy</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Privacy & Safety - 3rd Section */}
            <div className="shadow-lg border-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 w-80" style={{ backgroundColor: '#737373', borderRadius: '24px', border: '2px solid #708d81', overflow: 'hidden' }}>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <ShieldCheck size={20} className="text-[#708d81]" />
                  <div className="w-3"></div>
                  <h2 className="text-lg font-semibold text-white">Privacy & Safety</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Blocked Users Button */}
                <button
                  onClick={handleBlockedUsers}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 cursor-pointer border-2 border-[#708d81] transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                  style={{ 
                    backgroundColor: '#525252',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#525252';
                  }}
                >
                  <User size={18} className="text-white" />
                  <div className="w-3"></div>
                  <div>
                    <div className="text-white font-medium">Blocked Users</div>
                    <div className="text-gray-300 text-sm">Manage users you have blocked</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Support & Help - 4th Section */}            {/* Support & Help - 3rd Section */}
            <div className="shadow-lg border-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 w-80" style={{ backgroundColor: '#737373', borderRadius: '24px', border: '2px solid #708d81', overflow: 'hidden' }}>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <HelpCircle size={20} className="text-[#708d81]" />
                  <div className="w-3"></div>
                  <h2 className="text-lg font-semibold text-white">Support & Help</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Help Center Button */}
                <button
                  onClick={handleSupport}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 cursor-pointer border-2 border-[#708d81] transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                  style={{ 
                    backgroundColor: '#525252',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#525252';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                >
                  <HelpCircle size={18} className="text-white mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-white">Help Center</h3>
                    <p className="text-sm text-gray-300">FAQs and guides</p>
                  </div>
                </button>

                {/* Contact Us Button */}
                <button
                  onClick={handleContactUs}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 cursor-pointer border-2 border-[#708d81] transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                  style={{ 
                    backgroundColor: '#525252',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#525252';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                >
                  <Mail size={18} className="text-white mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-white">Contact Us</h3>
                    <p className="text-sm text-gray-300">Get direct support</p>
                  </div>
                </button>

                {/* Report Bug Button */}
                <button
                  onClick={handleReportBug}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 cursor-pointer border-2 border-[#708d81] transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                  style={{ 
                    backgroundColor: '#525252',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#525252';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                >
                  <Bug size={18} className="text-white mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-white">Report Bug</h3>
                    <p className="text-sm text-gray-300">Report technical issues</p>
                  </div>
                </button>

                {/* Send Feedback Button */}
                <button
                  onClick={handleFeedback}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 cursor-pointer border-2 border-[#708d81] transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                  style={{ 
                    backgroundColor: '#525252',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#525252';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                >
                  <MessageCircle size={18} className="text-white mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-white">Send Feedback</h3>
                    <p className="text-sm text-gray-300">Share your thoughts</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSave}
              className="flex items-center px-6 py-3 rounded-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
              style={{ 
                backgroundColor: '#708d81',
                color: 'white',
                border: '2px solid #708d81',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5a7268';
                e.currentTarget.style.borderColor = '#5a7268';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#708d81';
                e.currentTarget.style.borderColor = '#708d81';
              }}
            >
              <Save size={18} className="mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab; 