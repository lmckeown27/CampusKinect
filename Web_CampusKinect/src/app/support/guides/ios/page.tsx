'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Smartphone, 
  Download, 
  User, 
  Home, 
  Plus, 
  MessageCircle, 
  Settings,
  Bell,
  Shield,
  Camera,
  MapPin,
  Eye,
  Lock,
  Fingerprint,
  Wifi,
  RefreshCw
} from 'lucide-react';

export default function IOSGuide() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-grey-medium">
      {/* Header */}
      <div className="py-12" style={{ backgroundColor: '#708d81' }}>
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
              style={{ color: '#708d81', cursor: 'pointer' }}
            >
              <ArrowLeft size={20} />
              <span>Back to Help Center</span>
            </button>
          </div>
          
          <div className="text-center">
            <Smartphone size={48} className="text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2" style={{ textAlign: 'center' }}>
              CampusKinect iOS App Guide
            </h1>
            <p className="text-xl text-white opacity-90" style={{ textAlign: 'center' }}>
              Complete guide to using CampusKinect on your iPhone
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Getting Started */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Getting Started</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Download & Install</h3>
                <p className="mb-4 text-gray-300">
                  Download CampusKinect from the App Store and install it on your iPhone.
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Requirements:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>iOS 14.0 or later</li>
                    <li>iPhone 6s or newer</li>
                    <li>Active university email (.edu domain)</li>
                    <li>Camera and location permissions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                2
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Create Your Account</h3>
                <p className="mb-4 text-gray-300">
                  Sign up using your university email address for campus verification.
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Account Setup Process:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>Enter your university email (.edu required)</li>
                    <li>Create a secure password</li>
                    <li>Verify your email through the confirmation link</li>
                    <li>Complete your profile with photo and details</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">App Navigation</h2>
          <p className="text-gray-300 mb-6">
            CampusKinect iOS uses a bottom tab bar for easy navigation between main features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                <Home size={24} style={{ color: '#99afa7' }} />
                <div>
                  <h3 className="font-semibold text-white">Home</h3>
                  <p className="text-sm text-gray-300">Browse marketplace posts from your campus</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                <Plus size={24} style={{ color: '#99afa7' }} />
                <div>
                  <h3 className="font-semibold text-white">Create</h3>
                  <p className="text-sm text-gray-300">Post items for sale with photos and details</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                <MessageCircle size={24} style={{ color: '#99afa7' }} />
                <div>
                  <h3 className="font-semibold text-white">Messages</h3>
                  <p className="text-sm text-gray-300">Chat with buyers and sellers</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                <User size={24} style={{ color: '#99afa7' }} />
                <div>
                  <h3 className="font-semibold text-white">Profile</h3>
                  <p className="text-sm text-gray-300">Manage your posts and account settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Key iOS Features</h2>
          
          <div className="space-y-8">
            {/* Push Notifications */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Bell size={24} style={{ color: '#99afa7' }} />
                <h3 className="text-xl font-semibold text-white">Push Notifications</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Get instant notifications for new messages, even when the app is closed.
              </p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Notification Features:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>Real-time message notifications</li>
                  <li>Badge count on app icon</li>
                  <li>Customizable notification settings</li>
                  <li>Silent notifications for background updates</li>
                </ul>
              </div>
            </div>

            {/* Biometric Authentication */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Fingerprint size={24} style={{ color: '#99afa7' }} />
                <h3 className="text-xl font-semibold text-white">Biometric Security</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Secure your account with Face ID or Touch ID for quick, safe access.
              </p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Security Options:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>Face ID authentication</li>
                  <li>Touch ID support</li>
                  <li>Secure keychain storage</li>
                  <li>Automatic session management</li>
                </ul>
              </div>
            </div>

            {/* Camera Integration */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Camera size={24} style={{ color: '#99afa7' }} />
                <h3 className="text-xl font-semibold text-white">Camera & Photos</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Take photos directly in the app or choose from your photo library.
              </p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Photo Features:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>Built-in camera for posting items</li>
                  <li>Photo library access</li>
                  <li>Image compression and optimization</li>
                  <li>Multiple photo support per post</li>
                </ul>
              </div>
            </div>

            {/* Location Services */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <MapPin size={24} style={{ color: '#99afa7' }} />
                <h3 className="text-xl font-semibold text-white">Location Services</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Automatic campus detection and location-based post filtering.
              </p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Location Features:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>Campus location detection</li>
                  <li>Location-based post filtering</li>
                  <li>Privacy-focused location sharing</li>
                  <li>Manual location override</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Messaging System */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Messaging System</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Starting Conversations</h3>
              <p className="text-gray-300 mb-4">
                Tap anywhere on a post to start a conversation with the seller.
              </p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">How to Message:</h4>
                <ol className="space-y-1 text-sm text-gray-300">
                  <li>1. Find a post you're interested in</li>
                  <li>2. Tap anywhere on the post card</li>
                  <li>3. Confirm you want to start a conversation</li>
                  <li>4. You'll be taken to the chat page</li>
                  <li>5. Type your message and hit send</li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Managing Conversations</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">iOS-Specific Features:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>Swipe left on conversations to delete</li>
                  <li>Real-time message delivery</li>
                  <li>Message read receipts</li>
                  <li>Automatic conversation creation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Settings & Privacy */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Settings & Privacy</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Settings size={24} style={{ color: '#99afa7' }} />
                <h3 className="text-lg font-semibold text-white">App Settings</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Notification preferences</li>
                <li>Account management</li>
                <li>Privacy controls</li>
                <li>App preferences</li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Shield size={24} style={{ color: '#99afa7' }} />
                <h3 className="text-lg font-semibold text-white">Privacy & Safety</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Block and report users</li>
                <li>Control profile visibility</li>
                <li>Secure data storage</li>
                <li>Campus-only interactions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Offline Features */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Offline Capabilities</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Wifi size={24} style={{ color: '#99afa7' }} className="mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Background Sync</h3>
                <p className="text-gray-300 mb-4">
                  The iOS app includes advanced offline capabilities for seamless usage.
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Offline Features:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>Cache recent posts for offline viewing</li>
                    <li>Queue messages when offline</li>
                    <li>Background sync when connection returns</li>
                    <li>Offline draft saving</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Troubleshooting</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Common Issues:</h3>
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">App won't load posts?</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>Check your internet connection</li>
                    <li>Force close and reopen the app</li>
                    <li>Ensure you're verified with your university email</li>
                    <li>Try logging out and back in</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Not receiving notifications?</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>Check notification settings in the app</li>
                    <li>Verify iOS notification permissions</li>
                    <li>Ensure the app is updated to the latest version</li>
                    <li>Restart your device if needed</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Camera not working?</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>Check camera permissions in iOS Settings</li>
                    <li>Ensure sufficient storage space</li>
                    <li>Close other apps using the camera</li>
                    <li>Restart the app</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Need More Help?</h2>
            <p className="text-white opacity-90 mb-4">
              If you're still having trouble with the iOS app, our support team is here to help.
            </p>
            <button
              onClick={() => router.push('/support')}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{ 
                backgroundColor: 'white', 
                color: '#99afa7',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 