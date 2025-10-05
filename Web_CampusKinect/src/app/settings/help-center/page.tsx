'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  ShoppingBag, 
  MessageCircle, 
  Shield,
  ArrowLeft
} from 'lucide-react';
import MainLayout from '../../../components/layout/MainLayout';

interface Article {
  id: string;
  title: string;
  category: string;
  description: string;
  popular?: boolean;
}

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  articles: Article[];
}

export default function SettingsHelpCenterPage() {
  const router = useRouter();

  const categories: Category[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <User size={24} />,
      description: 'Account & verification',
      articles: [
        { id: 'verify-email', title: 'Email Verification', category: 'Getting Started', description: 'Step-by-step email verification guide' }
      ]
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      icon: <ShoppingBag size={24} />,
      description: 'Buy & sell items',
      articles: [
        { id: 'post-item-detailed', title: 'Create Listing', category: 'Marketplace', description: 'Create and manage listings' }
      ]
    },
    {
      id: 'messaging',
      title: 'Messaging',
      icon: <MessageCircle size={24} />,
      description: 'Chat with users',
      articles: [
        { id: 'message-users', title: 'Send Messages', category: 'Messaging', description: 'Start conversations and manage chats' }
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Trust',
      icon: <Shield size={24} />,
      description: 'Safe trading tips',
      articles: [
        { id: 'safe-trading', title: 'Safety Guide', category: 'Safety', description: 'Essential safety tips and reporting' }
      ]
    }
  ];

  const quickLinks = [
    { title: 'iOS Guide', path: '/support/guides/ios' },
    { title: 'Web Guide', path: '/support/guides/web' }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#525252' }}>
        {/* Header */}
        <div className="border-b" style={{ backgroundColor: '#737373', borderColor: '#708d81' }}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/settings')}
                className="flex items-center space-x-2 transition-colors duration-200 font-medium"
                style={{ color: '#708d81' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#a8c4a2'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#708d81'}
              >
                <ArrowLeft size={20} />
                <span>Settings</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Help Center</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="py-16" style={{ backgroundColor: '#708d81' }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold text-white mb-4" style={{ textAlign: 'center' }}>
              CampusKinect Support
            </h1>
            <p className="text-xl text-white opacity-90 mb-8" style={{ textAlign: 'center' }}>
              Find answers, get help, and learn how to use CampusKinect
            </p>
            
            {/* Quick Link Buttons */}
            <div className="flex flex-wrap justify-center gap-8">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => router.push('/settings/help-center' + link.path.replace('/support', ''))}
                className="px-6 py-3 bg-white rounded-lg font-semibold transition-all duration-200 mx-4"
                style={{ cursor: 'pointer', color: '#708d81' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#99afa7';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#708d81';
                }}
              >
                {link.title}
              </button>
            ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Key Topics Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8" style={{ textAlign: 'center' }}>
              Browse by Topic
            </h2>
            
            <div className="flex justify-center w-full">
              <div className="flex flex-col items-center space-y-12 max-w-4xl">
                <div className="flex space-x-12">
                  {categories.slice(0, 2).map((category) => (
                    <div
                      key={category.id}
                      className="p-5 m-4 rounded-lg border flex flex-col flex-shrink-0 overflow-hidden"
                      style={{ 
                        backgroundColor: '#737373',
                        borderColor: '#708d81',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                        width: '200px', 
                        height: '200px', 
                        minWidth: '200px', 
                        minHeight: '200px', 
                        maxWidth: '200px', 
                        maxHeight: '200px' 
                      }}
                    >
                      <div className="flex flex-col items-center mb-2 text-center">
                        <div className="p-2 rounded-lg mb-1" style={{ backgroundColor: '#99afa7' }}>
                          <div className="text-white text-lg">{category.icon}</div>
                        </div>
                        <p className="text-gray-300 text-sm">{category.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        {category.articles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => {
                          const guideMap: { [key: string]: string } = {
                            'verify-email': '/settings/help-center/guides/verify-email',
                            'post-item-detailed': '/settings/help-center/guides/post-item',
                            'message-users': '/settings/help-center/guides/messaging',
                            'safe-trading': '/settings/help-center/guides/safety'
                          };
                              const guidePath = guideMap[article.id];
                              if (guidePath) {
                                router.push(guidePath);
                              }
                            }}
                            className="w-full h-12 mx-auto flex flex-col items-center justify-center p-2 rounded transition-colors text-center"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#99afa7';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '';
                              e.currentTarget.style.color = 'black';
                            }}
                          >
                            <h4 className="text-white font-medium text-sm">{article.title}</h4>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-12">
                  {categories.slice(2, 4).map((category) => (
                    <div
                      key={category.id}
                      className="p-5 m-4 rounded-lg border flex flex-col flex-shrink-0 overflow-hidden"
                      style={{ 
                        backgroundColor: '#737373',
                        borderColor: '#708d81',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                        width: '200px', 
                        height: '200px', 
                        minWidth: '200px', 
                        minHeight: '200px', 
                        maxWidth: '200px', 
                        maxHeight: '200px' 
                      }}
                    >
                      <div className="flex flex-col items-center mb-2 text-center">
                        <div className="p-2 rounded-lg mb-1" style={{ backgroundColor: '#99afa7' }}>
                          <div className="text-white text-lg">{category.icon}</div>
                        </div>
                        <p className="text-gray-300 text-sm">{category.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        {category.articles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => {
                          const guideMap: { [key: string]: string } = {
                            'verify-email': '/settings/help-center/guides/verify-email',
                            'post-item-detailed': '/settings/help-center/guides/post-item',
                            'message-users': '/settings/help-center/guides/messaging',
                            'safe-trading': '/settings/help-center/guides/safety'
                          };
                              const guidePath = guideMap[article.id];
                              if (guidePath) {
                                router.push(guidePath);
                              }
                            }}
                            className="w-full h-12 mx-auto flex flex-col items-center justify-center p-2 rounded transition-colors text-center"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#99afa7';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '';
                              e.currentTarget.style.color = 'black';
                            }}
                          >
                            <h4 className="text-white font-medium text-sm">{article.title}</h4>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Support Section */}
          <div className="mb-16 max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-6">
              {/* Need more help? */}
              <div className="rounded-lg border flex flex-col flex-shrink-0 overflow-hidden p-5 m-4 mx-auto"
                   style={{ 
                     backgroundColor: '#737373',
                     borderColor: '#708d81',
                     boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                     width: '400px', 
                     height: '200px', 
                     minWidth: '400px', 
                     minHeight: '200px', 
                     maxWidth: '400px', 
                     maxHeight: '200px' 
                   }}>
                <div className="flex flex-col items-center mb-2 text-center">
                  <h3 className="text-white font-medium text-sm mb-1">Need more help?</h3>
                  <p className="text-gray-300 text-xs">
                    Can't find what you're looking for?
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.href = 'mailto:campuskinect01@gmail.com?subject=CampusKinect Support Request - Bug Report'}
                    className="w-full h-12 mx-auto flex flex-col items-center justify-center p-2 rounded transition-colors text-center"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#99afa7';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.color = '';
                    }}
                  >
                    <h4 className="text-white font-medium text-sm">Contact Support</h4>
                  </button>
                </div>
              </div>

              {/* Community */}
              <div className="rounded-lg border flex flex-col flex-shrink-0 overflow-hidden p-5 m-4 mx-auto"
                   style={{ 
                     backgroundColor: '#737373',
                     borderColor: '#708d81',
                     boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                     width: '400px', 
                     height: '200px', 
                     minWidth: '400px', 
                     minHeight: '200px', 
                     maxWidth: '400px', 
                     maxHeight: '200px' 
                   }}>
                <div className="flex flex-col items-center mb-2 text-center">
                  <h3 className="text-white font-medium text-sm mb-1">Community</h3>
                  <p className="text-gray-300 text-xs">
                    Connect with other users
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => window.open('mailto:campuskinect01@gmail.com', '_blank')}
                    className="w-full h-12 mx-auto flex flex-col items-center justify-center p-2 rounded transition-colors text-center"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#99afa7';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.color = '';
                    }}
                  >
                    <h4 className="text-white font-medium text-sm">Send Feedback</h4>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
