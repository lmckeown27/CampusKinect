'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Trash2, Shield, Cookie } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'next/navigation';

export default function PrivacyDataPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportError, setExportError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleExportData = async () => {
    setIsExporting(true);
    setExportError('');
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('https://campuskinect.net/api/v1/users/profile/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const result = await response.json();
      
      // Create a download link for the JSON data
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `campuskinect-data-${user?.username || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('Your data has been exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('https://campuskinect.net/api/v1/users/profile/permanent', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmation: 'DELETE_MY_ACCOUNT'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Clear local storage and redirect to login
      localStorage.clear();
      alert('Your account has been permanently deleted.');
      router.push('/auth/login');
    } catch (error) {
      console.error('Delete error:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#525252' }}>
      {/* Header */}
      <div className="bg-grey-light border-b border-gray-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/settings" className="flex items-center text-gray-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Settings
          </Link>
          <div className="flex items-center">
            <Shield className="text-[#708d81] mr-3" size={32} />
            <h1 className="text-3xl font-bold text-white">Privacy & Data Management</h1>
          </div>
          <p className="text-gray-300 mt-2">
            Manage your personal data and privacy settings. You have full control over your information.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Export Data Section */}
          <div className="bg-grey-light rounded-xl p-6 border border-gray-600 shadow-lg">
            <div className="flex items-start mb-4">
              <Download className="text-[#708d81] mr-3 mt-1" size={24} />
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Download Your Data</h2>
                <p className="text-gray-300">
                  Export all your personal information, posts, comments, and activity. 
                  You'll receive a JSON file with all your data.
                </p>
              </div>
            </div>
            
            {exportError && (
              <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-4">
                <p className="text-red-300">{exportError}</p>
              </div>
            )}
            
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full bg-[#708d81] hover:bg-[#5a7166] text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={20} className="mr-2" />
                  Export My Data
                </>
              )}
            </button>
          </div>

          {/* Cookie Preferences Section */}
          <div className="bg-grey-light rounded-xl p-6 border border-gray-600 shadow-lg">
            <div className="flex items-start mb-4">
              <Cookie className="text-[#708d81] mr-3 mt-1" size={24} />
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Cookie Preferences</h2>
                <p className="text-gray-300">
                  Manage your cookie and tracking preferences.
                </p>
              </div>
            </div>
            
            <Link
              href="/cookie-settings"
              className="w-full bg-grey-medium hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center border border-gray-600"
            >
              <Cookie size={20} className="mr-2" />
              Manage Cookie Settings
            </Link>
          </div>

          {/* Privacy Policy Section */}
          <div className="bg-grey-light rounded-xl p-6 border border-gray-600 shadow-lg">
            <div className="flex items-start mb-4">
              <Shield className="text-[#708d81] mr-3 mt-1" size={24} />
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Privacy Policy</h2>
                <p className="text-gray-300">
                  Read our comprehensive privacy policy to understand how we protect your data.
                </p>
              </div>
            </div>
            
            <Link
              href="/privacy"
              className="w-full bg-grey-medium hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center border border-gray-600"
            >
              <Shield size={20} className="mr-2" />
              View Privacy Policy
            </Link>
          </div>

          {/* Delete Account Section */}
          <div className="bg-red-900 bg-opacity-10 rounded-xl p-6 border-2 border-red-500 shadow-lg">
            <div className="flex items-start mb-4">
              <Trash2 className="text-red-500 mr-3 mt-1" size={24} />
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Delete Account</h2>
                <p className="text-gray-300 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                <div className="bg-grey-light rounded-lg p-4 mb-4 border border-gray-600">
                  <p className="text-white font-medium mb-2">What will be deleted:</p>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Your profile and personal information</li>
                    <li>• All your posts and comments</li>
                    <li>• Your messages and conversations</li>
                    <li>• Bookmarks and saved content</li>
                    <li>• All account activity and history</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <Trash2 size={20} className="mr-2" />
                Delete My Account
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-grey-medium rounded-lg p-4 border border-red-500">
                  <p className="text-white font-medium mb-2">Type "DELETE" to confirm:</p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-4 py-2 bg-grey-light border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="Type DELETE"
                  />
                </div>
                
                {deleteError && (
                  <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4">
                    <p className="text-red-300">{deleteError}</p>
                  </div>
                )}
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                      setDeleteError('');
                    }}
                    className="flex-1 bg-grey-medium hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors border border-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={20} className="mr-2" />
                        Delete Forever
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
