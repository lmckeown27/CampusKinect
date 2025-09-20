'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Monitor, 
  Globe, 
  User, 
  Home, 
  Plus, 
  MessageCircle, 
  Settings,
  Search,
  Filter,
  Upload,
  Edit,
  Trash2,
  Eye,
  Lock,
  Shield,
  Smartphone,
  Tablet
} from 'lucide-react';

export default function WebGuide() {
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
            <Monitor size={48} className="text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2" style={{ textAlign: 'center' }}>
              CampusKinect Web Platform Guide
            </h1>
            <p className="text-xl text-white opacity-90" style={{ textAlign: 'center' }}>
              Complete guide to using CampusKinect in your web browser
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
                <h3 className="text-lg font-semibold text-white mb-2">Access the Platform</h3>
                <p className="mb-4 text-gray-300">
                  Visit CampusKinect in any modern web browser - no download required!
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Browser Requirements:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Chrome 90+ (recommended)</li>
                    <li>• Safari 14+ (macOS/iOS)</li>
                    <li>• Firefox 88+</li>
                    <li>• Edge 90+</li>
                    <li>• JavaScript enabled</li>
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
                  Sign up using your university email for instant campus verification.
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Registration Process:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Navigate to the registration page</li>
                    <li>• Enter your university email (.edu required)</li>
                    <li>• Create a secure password</li>
                    <li>• Verify your email through the confirmation link</li>
                    <li>• Complete your profile setup</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Layout */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Navigation & Layout</h2>
          <p className="text-gray-300 mb-6">
            The web platform features a responsive design that works on desktop, tablet, and mobile browsers.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Desktop Navigation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                  <Home size={24} style={{ color: '#99afa7' }} />
                  <div>
                    <h4 className="font-semibold text-white">Home Feed</h4>
                    <p className="text-sm text-gray-300">Browse campus marketplace posts</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                  <Plus size={24} style={{ color: '#99afa7' }} />
                  <div>
                    <h4 className="font-semibold text-white">Create Post</h4>
                    <p className="text-sm text-gray-300">List items for sale</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                  <MessageCircle size={24} style={{ color: '#99afa7' }} />
                  <div>
                    <h4 className="font-semibold text-white">Messages</h4>
                    <p className="text-sm text-gray-300">Chat with other users</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                  <User size={24} style={{ color: '#99afa7' }} />
                  <div>
                    <h4 className="font-semibold text-white">Profile</h4>
                    <p className="text-sm text-gray-300">Manage account and posts</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Mobile Web Experience</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Responsive Features:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Bottom navigation bar (similar to mobile apps)</li>
                  <li>• Touch-optimized interface</li>
                  <li>• Swipe gestures for certain actions</li>
                  <li>• Optimized for thumb navigation</li>
                  <li>• Fast loading on mobile networks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Key Web Features */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Key Web Platform Features</h2>
          
          <div className="space-y-8">
            {/* Advanced Search */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Search size={24} style={{ color: '#99afa7' }} />
                <h3 className="text-xl font-semibold text-white">Advanced Search & Filtering</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Powerful search capabilities to find exactly what you're looking for.
              </p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Search Features:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Real-time search suggestions</li>
                  <li>• Category-based filtering</li>
                  <li>• Price range filters</li>
                  <li>• Location-based results</li>
                  <li>• Sort by date, price, or relevance</li>
                </ul>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Upload size={24} style={{ color: '#99afa7' }} />
                <h3 className="text-xl font-semibold text-white">File Upload & Management</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Easy drag-and-drop file uploads with preview and editing capabilities.
              </p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Upload Features:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Drag and drop image upload</li>
                  <li>• Multiple file selection</li>
                  <li>• Image preview before posting</li>
                  <li>• Automatic image optimization</li>
                  <li>• Progress indicators for uploads</li>
                </ul>
              </div>
            </div>

            {/* Real-time Messaging */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <MessageCircle size={24} style={{ color: '#99afa7' }} />
                <h3 className="text-xl font-semibold text-white">Real-time Messaging</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Instant messaging system with browser notifications and conversation management.
              </p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Messaging Features:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Real-time message delivery</li>
                  <li>• Browser push notifications</li>
                  <li>• Conversation threading</li>
                  <li>• Message status indicators</li>
                  <li>• Easy conversation deletion</li>
                </ul>
              </div>
            </div>

            {/* Multi-device Sync */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Globe size={24} style={{ color: '#99afa7' }} />
                <h3 className="text-xl font-semibold text-white">Cross-Device Synchronization</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Access your account from any device with automatic synchronization.
              </p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Sync Features:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Automatic login state persistence</li>
                  <li>• Cross-device message sync</li>
                  <li>• Consistent user experience</li>
                  <li>• Secure session management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Creating & Managing Posts */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Creating & Managing Posts</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Creating a New Post</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Step-by-Step Process:</h4>
                <ol className="space-y-1 text-sm text-gray-300">
                  <li>1. Click the "Create Post" button or navigate to /create-post</li>
                  <li>2. Add a clear, descriptive title for your item</li>
                  <li>3. Upload high-quality photos (drag & drop supported)</li>
                  <li>4. Set your asking price</li>
                  <li>5. Write a detailed description</li>
                  <li>6. Select appropriate categories and tags</li>
                  <li>7. Review and publish your post</li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Managing Your Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Edit size={16} style={{ color: '#99afa7' }} />
                    <h4 className="font-semibold text-white">Edit Posts</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Update prices and descriptions</li>
                    <li>• Add or remove photos</li>
                    <li>• Change categories</li>
                    <li>• Mark as sold</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Trash2 size={16} style={{ color: '#99afa7' }} />
                    <h4 className="font-semibold text-white">Delete Posts</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Hover over post for delete button</li>
                    <li>• Confirmation dialog prevents accidents</li>
                    <li>• Immediate removal from marketplace</li>
                    <li>• Related conversations preserved</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messaging System */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Web Messaging System</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Starting Conversations</h3>
              <p className="text-gray-300 mb-4">
                Click on any post to start a conversation with the seller.
              </p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Conversation Flow:</h4>
                <ol className="space-y-1 text-sm text-gray-300">
                  <li>1. Click on a marketplace post</li>
                  <li>2. Conversation is automatically created</li>
                  <li>3. Navigate to Messages tab to continue chatting</li>
                  <li>4. Real-time message delivery</li>
                  <li>5. Browser notifications for new messages</li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Managing Conversations</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Web-Specific Features:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Hover-to-show delete buttons (no swipe needed)</li>
                  <li>• Keyboard shortcuts for quick actions</li>
                  <li>• Multi-tab support for different conversations</li>
                  <li>• Copy/paste support for sharing information</li>
                  <li>• Browser notification management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Browser-Specific Features */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Browser-Specific Features</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Keyboard Shortcuts</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Useful Shortcuts:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• <kbd className="bg-gray-600 px-2 py-1 rounded">Ctrl/Cmd + K</kbd> - Quick search</li>
                  <li>• <kbd className="bg-gray-600 px-2 py-1 rounded">Ctrl/Cmd + N</kbd> - New post</li>
                  <li>• <kbd className="bg-gray-600 px-2 py-1 rounded">Ctrl/Cmd + M</kbd> - Go to messages</li>
                  <li>• <kbd className="bg-gray-600 px-2 py-1 rounded">Esc</kbd> - Close modals/dialogs</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Browser Notifications</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Notification Settings:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Allow notifications when prompted</li>
                  <li>• Customize notification preferences in settings</li>
                  <li>• Desktop notifications for new messages</li>
                  <li>• Sound alerts (if enabled)</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Bookmarking & Favorites</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Browser Integration:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Bookmark specific posts or searches</li>
                  <li>• Browser history for easy navigation</li>
                  <li>• Share posts via browser sharing</li>
                  <li>• Print-friendly post views</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Privacy & Security</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Lock size={24} style={{ color: '#99afa7' }} />
                <h3 className="text-lg font-semibold text-white">Data Security</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• HTTPS encryption for all data</li>
                <li>• Secure session management</li>
                <li>• Protected API endpoints</li>
                <li>• Regular security updates</li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Shield size={24} style={{ color: '#99afa7' }} />
                <h3 className="text-lg font-semibold text-white">Privacy Controls</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Campus-only visibility</li>
                <li>• Block and report functionality</li>
                <li>• Profile privacy settings</li>
                <li>• Data deletion options</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Troubleshooting</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Common Web Issues:</h3>
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Page won't load or is slow?</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Check your internet connection</li>
                    <li>• Clear browser cache and cookies</li>
                    <li>• Disable browser extensions temporarily</li>
                    <li>• Try incognito/private browsing mode</li>
                    <li>• Update your browser to the latest version</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Images not uploading?</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Check file size (max 10MB per image)</li>
                    <li>• Ensure files are in supported formats (JPG, PNG, WebP)</li>
                    <li>• Disable ad blockers temporarily</li>
                    <li>• Check browser permissions for file access</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Not receiving notifications?</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Allow notifications when prompted by browser</li>
                    <li>• Check browser notification settings</li>
                    <li>• Ensure the tab isn't muted</li>
                    <li>• Check if Do Not Disturb is enabled</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Layout looks broken on mobile?</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Refresh the page</li>
                    <li>• Check if you're using a supported browser</li>
                    <li>• Clear browser cache</li>
                    <li>• Try rotating your device</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Browser Compatibility */}
        <div className="mb-12 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-6 text-white">Browser Compatibility</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Fully Supported</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-green-900 bg-opacity-30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white">Chrome 90+</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-900 bg-opacity-30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white">Safari 14+</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-900 bg-opacity-30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white">Firefox 88+</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-900 bg-opacity-30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white">Edge 90+</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Limited Support</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-yellow-900 bg-opacity-30 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-white">Internet Explorer (not recommended)</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-900 bg-opacity-30 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-white">Older mobile browsers</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-lg">
                <p className="text-sm text-blue-200">
                  <strong>Tip:</strong> For the best experience, keep your browser updated to the latest version.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Need More Help?</h2>
            <p className="text-white opacity-90 mb-4">
              If you're still having trouble with the web platform, our support team is here to help.
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