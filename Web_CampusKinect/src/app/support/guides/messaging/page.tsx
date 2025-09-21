'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Shield, Bell, UserCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import SupportHeader from '@/components/layout/SupportHeader';
export default function MessagingGuide() {
  const router = useRouter();
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#525252' }}>
      <SupportHeader />
      {/* Header */}
      <div className="py-8" style={{ backgroundColor: '#708d81' }}>
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
            <h1 className="text-3xl font-bold text-white mb-2" style={{ textAlign: 'center' }}>Message a Buyer or Seller</h1>
            <p className="text-xl text-white opacity-90" style={{ textAlign: 'center' }}>Start conversations and manage your messages</p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Overview */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>How Messaging Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <UserCheck size={32} className="mx-auto mb-2" style={{ color: '#99afa7' }} />
              <h3 className="font-semibold text-white mb-2">Verified Users Only</h3>
              <p className="text-sm text-gray-300">Only verified students can send and receive messages</p>
            </div>
            <div className="text-center p-4">
              <Shield size={32} className="mx-auto mb-2" style={{ color: '#99afa7' }} />
              <h3 className="font-semibold text-white mb-2">Safe & Secure</h3>
              <p className="text-sm text-gray-300">All messages are encrypted and campus-only</p>
            </div>
            <div className="text-center p-4">
              <Bell size={32} className="mx-auto mb-2" style={{ color: '#99afa7' }} />
              <h3 className="font-semibold text-white mb-2">Real-time Notifications</h3>
              <p className="text-sm text-gray-300">Get notified instantly when you receive messages</p>
            </div>
          </div>
        </div>
        {/* How to Start a Conversation */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#99afa7' }}>Starting a Conversation</h2>
          {/* Method 1 */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">From a Marketplace Post</h3>
                <p className="mb-4 text-gray-300">
                  The easiest way to start a conversation is by messaging someone about their post.
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Steps:</h4>
                  <ol className="space-y-1 text-sm text-gray-300">
                    <li>1. Find a post you're interested in</li>
                    <li>2. Click anywhere on the post card</li>
                    <li>3. Confirm you want to start a conversation</li>
                    <li>4. You'll be taken to the chat page</li>
                    <li>5. Type your message and hit send</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          {/* Method 2 */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                2
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">From Messages Page</h3>
                <p className="mb-4 text-gray-300">
                  You can also start new conversations from your messages page.
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Steps:</h4>
                  <ol className="space-y-1 text-sm text-gray-300">
                    <li>1. Go to the Messages tab</li>
                    <li>2. Look for existing conversations</li>
                    <li>3. Click on any conversation to continue</li>
                    <li>4. Or find users through their posts first</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Message Best Practices */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>Message Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">✅ Good Messages:</h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li>"Hi! Is your MacBook still available?"</li>
                <li>"I'm interested in your textbook. Can we meet on campus?"</li>
                <li>"What condition is the bike in? Any issues?"</li>
                <li>"Would you consider $80 for the desk?"</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-3">❌ Avoid:</h3>
              <ul className="space-y-2 text-sm text-red-700">
                <li>Just "Hi" or "Hey" with no context</li>
                <li>Asking for personal information</li>
                <li>Lowball offers without explanation</li>
                <li>Being pushy or demanding</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Managing Conversations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#99afa7' }}>Managing Your Conversations</h2>
          <div className="space-y-6">
            {/* Viewing Messages */}
            <div className="p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
              <h3 className="text-lg font-semibold text-white mb-3">Viewing Your Messages</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Web Platform:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>Click "Messages" in the navigation</li>
                    <li>See all conversations in one place</li>
                    <li>Click any conversation to open chat</li>
                    <li>Hover over conversations to see delete option</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">iOS App:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>Tap "Messages" in the bottom tab bar</li>
                    <li>Swipe left on conversations to delete</li>
                    <li>Tap any conversation to open chat</li>
                    <li>Get push notifications for new messages</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Deleting Conversations */}
            <div className="p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
              <h3 className="text-lg font-semibold text-white mb-3">Deleting Conversations</h3>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Important:</h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      Deleting a conversation removes it for both you and the other person. This action cannot be undone.
                    </p>
                    <ul className="space-y-1 text-sm text-yellow-700">
                      <li>Web: Hover over conversation and click delete button</li>
                      <li>iOS: Swipe left on conversation and tap delete</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Notifications */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>Message Notifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-2">iOS Push Notifications:</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>Get instant notifications on your phone</li>
                <li>Shows sender name and message preview</li>
                <li>Tap notification to open conversation</li>
                <li>Badge count shows unread messages</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Managing Notifications:</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>Go to Settings → Notifications</li>
                <li>Toggle notifications on/off</li>
                <li>Customize notification preferences</li>
                <li>Control when you receive alerts</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Safety & Etiquette */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>Safety & Etiquette</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">Message Etiquette:</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>Be polite and respectful</li>
                <li>Respond within 24 hours</li>
                <li>Be clear about your intentions</li>
                <li>Use proper grammar and spelling</li>
                <li>Stay on topic</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-3">Safety Tips:</h3>
              <ul className="space-y-1 text-sm text-red-700">
                <li>Never share personal information</li>
                <li>Don't send money or payments</li>
                <li>Meet only in public places</li>
                <li>Trust your instincts</li>
                <li>Report inappropriate behavior</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Troubleshooting */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>Troubleshooting</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Can't send messages?</h3>
              <ul className="space-y-1 text-sm ml-4 text-gray-300">
                <li>Make sure your email is verified</li>
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>The other user may have deleted the conversation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Not receiving notifications?</h3>
              <ul className="space-y-1 text-sm ml-4 text-gray-300">
                <li>Check notification settings in the app</li>
                <li>Verify iOS notification permissions</li>
                <li>Make sure notifications are enabled for CampusKinect</li>
                <li>Check your device's Do Not Disturb settings</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Messages not loading?</h3>
              <ul className="space-y-1 text-sm ml-4 text-gray-300">
                <li>Check your internet connection</li>
                <li>Try closing and reopening the app</li>
                <li>Clear your browser cache (web)</li>
                <li>Contact support if issues persist</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Need More Help */}
        <div className="p-6 rounded-lg border-2 border-[#708d81]" style={{ backgroundColor: '#708d81' }}>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Having Message Issues?</h2>
            <p className="text-white opacity-90 mb-4">
              Our support team can help you with messaging problems and answer any questions.
            </p>
            <button
              onClick={() => router.push('/support')}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{ 
                backgroundColor: 'white', 
                color: '#99afa7',
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