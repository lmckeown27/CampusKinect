'use client';

import React, { useState } from 'react';
import { FileText, Cookie, ScrollText, ShieldCheck, HelpCircle, Mail, User, Flag, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'next/navigation';
import { apiService } from '../../services/api';

const SettingsTab: React.FC = () => {
  const { user: authUser, logout } = useAuthStore();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  // Use real user data from auth store
  const user = authUser;

  const handleCookieSettings = () => {
    router.push('/settings/cookie-settings');
  };

  const handleTermsAndConditions = () => {
    router.push('/settings/terms');
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy');
  };

  const handlePrivacyData = () => {
    router.push('/settings/privacy-data');
  };

  const handleSupport = () => {
    router.push('/settings/help-center');
  };

  const handleContactUs = () => {
    window.open('mailto:campuskinect01@gmail.com?subject=CampusKinect Support Request - Bug Report', '_blank');
  };

  const handleBlockedUsers = () => {
    router.push('/settings/blocked-users');
  };

  const handleMyReports = () => {
    router.push('/settings/my-reports');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await apiService.deleteAccount();
      
      if (response.success) {
        // Account deleted successfully - logout and redirect
        logout();
        router.push('/auth/login');
      } else {
        setDeleteError('Failed to delete account. Please try again.');
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      setDeleteError(error.message || 'Network error. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 p-6 min-h-screen" style={{ backgroundColor: '#525252' }}>
      <div className="max-w-full mx-auto px-4">
        <div className="space-y-6">
          {/* Settings Sections - Responsive Layout with spacing */}
          <div className="flex flex-wrap gap-6 justify-center">
            {/* Legal & Documents - 1st Section */}
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

            {/* Privacy & Safety - 2nd Section */}
            <div className="shadow-lg border-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 w-80" style={{ backgroundColor: '#737373', borderRadius: '24px', border: '2px solid #708d81', overflow: 'hidden' }}>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <ShieldCheck size={20} className="text-[#708d81]" />
                  <div className="w-3"></div>
                  <h2 className="text-lg font-semibold text-white">Privacy & Safety</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Privacy & Data Management Button */}
                <button
                  onClick={handlePrivacyData}
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
                  <ShieldCheck size={18} className="text-white" />
                  <div className="w-3"></div>
                  <div>
                    <div className="text-white font-medium">Privacy & Data</div>
                    <div className="text-gray-300 text-sm">Manage your data and privacy settings</div>
                  </div>
                </button>

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

                {/* My Reports Button */}
                <button
                  onClick={handleMyReports}
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
                  <Flag size={18} className="text-white" />
                  <div className="w-3"></div>
                  <div>
                    <div className="text-white font-medium">My Reports</div>
                    <div className="text-gray-300 text-sm">View your submitted reports</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Support & Help - 3rd Section */}
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
              </div>
            </div>

            {/* Account Actions - 4th Section (Delete Account) */}
            <div className="shadow-lg border-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 w-80" style={{ backgroundColor: '#737373', borderRadius: '24px', border: '2px solid #dc2626', overflow: 'hidden' }}>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Trash2 size={20} className="text-red-500" />
                  <div className="w-3"></div>
                  <h2 className="text-lg font-semibold text-white">Account Actions</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Delete Account Button */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 cursor-pointer border-2 border-red-500 transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                  style={{ 
                    backgroundColor: '#525252',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#525252';
                  }}
                >
                  <Trash2 size={18} className="text-red-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-red-500 font-semibold">Delete Account</h3>
                    <p className="text-sm text-gray-300">Permanently delete your account and all data</p>
                  </div>
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  This action cannot be undone. All your data will be permanently removed from our systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border-2 border-red-500">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center">
                <Trash2 size={24} className="text-red-500 mr-3" />
                <h2 className="text-xl font-bold text-white">Delete Account</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4">
                <p className="text-white text-sm font-medium mb-2">⚠️ Warning: This action is permanent</p>
                <p className="text-gray-300 text-sm">
                  All your data including posts, messages, and account information will be permanently deleted. This cannot be undone.
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Type <span className="font-bold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE in capital letters"
                  className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isDeleting}
                />
              </div>

              {deleteError && (
                <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{deleteError}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                  setDeleteError('');
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation.toUpperCase() !== 'DELETE'}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab; 