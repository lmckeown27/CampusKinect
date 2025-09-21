'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  User, 
  ShoppingBag, 
  MessageCircle, 
  Shield, 
  Settings,
  ChevronRight,
  ChevronDown,
  Clock,
  Send,
  CheckCircle,
  AlertTriangle,
  Users,
  Lock,
  ArrowLeft,
  Search,
  ExternalLink
} from 'lucide-react';
import KinectLogo from '@/assets/logos/KinectLogo.png';

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

export default function SupportPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    campus: '',
    issueType: '',
    description: ''
  });

  // Existing data structure - keeping all current content
  const popularArticles: Article[] = [
    { id: 'verify-email', title: 'Verify Your University Email', category: 'Getting Started', description: 'Step-by-step guide to verify your .edu email address', popular: true },
    { id: 'post-item', title: 'Post an Item for Sale', category: 'Marketplace Basics', description: 'Create your first listing with photos and pricing', popular: true },
    { id: 'messaging', title: 'Message a Buyer or Seller', category: 'Messaging & Connections', description: 'Start conversations and manage your messages', popular: true },
    { id: 'safety', title: 'Staying Safe on CampusKinect', category: 'Safety & Trust', description: 'Essential safety tips for campus trading', popular: true }
  ];

  const categories: Category[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <User size={24} />,
      description: 'Account setup and verification',
      articles: [
        { id: 'verify-email', title: 'Email Verification', category: 'Getting Started', description: 'Step-by-step email verification guide' }
      ]
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      icon: <ShoppingBag size={24} />,
      description: 'Buy and sell items',
      articles: [
        { id: 'post-item-detailed', title: 'Create Listing', category: 'Marketplace', description: 'Create and manage listings' }
      ]
    },
    {
      id: 'messaging',
      title: 'Messaging',
      icon: <MessageCircle size={24} />,
      description: 'Chat with other users',
      articles: [
        { id: 'message-users', title: 'Send Messages', category: 'Messaging', description: 'Start conversations and manage chats' }
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Trust',
      icon: <Shield size={24} />,
      description: 'Stay safe while trading',
      articles: [
        { id: 'safe-trading', title: 'Safety Guide', category: 'Safety', description: 'Essential safety tips and reporting' }
      ]
    }
  ];

  const quickLinks = [
    { title: 'iOS Guide', path: '/support/guides/ios' },
    { title: 'Web Guide', path: '/support/guides/web' }
  ];

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your message. We\'ll get back to you within 24-48 hours.');
    setShowContactForm(false);
    setContactForm({ name: '', email: '', campus: '', issueType: '', description: '' });
  };

  const filteredArticles = searchQuery 
    ? categories.flatMap(cat => cat.articles).filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-grey-medium">
      {/* 1. Global Header / Navigation */}
      <div className="bg-grey-light border-b border-gray-600">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center md:justify-between">
            {/* Center: Logo (mobile) / Left: Logo (desktop) */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/auth/login')}
                className="hover:opacity-80 transition-opacity"
                style={{ cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }}
              >
                <img
                  src={KinectLogo.src}
                  alt="CampusKinect"
                  className="h-12 w-12 object-cover rounded-md"
                  style={{ backgroundColor: '#708d81' }}
                />
              </button>
            </div>
            
            {/* Right: Top-level navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setShowContactForm(true)}
                className="px-4 py-2 bg-[#708d81] text-white rounded-lg hover:bg-[#5a7268] transition-colors"
                style={{ cursor: 'pointer' }}
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="py-16" style={{ backgroundColor: '#708d81' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-4" style={{ textAlign: 'center' }}>
            CampusKinect Support
          </h1>
          <p className="text-xl text-white opacity-90 mb-8" style={{ textAlign: 'center' }}>
            Find answers, get help, and learn how to use CampusKinect
          </p>
          
          {/* Quick Link Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => router.push(link.path)}
                className="px-6 py-3 bg-white text-[#708d81] rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200"
                style={{ cursor: 'pointer' }}
              >
                {link.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* 3. Key Topics Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8" style={{ textAlign: 'center' }}>
            Browse by Topic
          </h2>
          
          {/* Search Bar */}
          <div className="mb-12">
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search CampusKinect Support"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-0 text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-[#708d81]"
                  style={{ backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                />
              </div>
              
              {/* Search Results */}
              {searchQuery && (
                <div className="mt-6 bg-grey-light rounded-xl p-6 border border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Search Results for "{searchQuery}"
                  </h3>
                  {filteredArticles.length > 0 ? (
                    <div className="space-y-3">
                      {filteredArticles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => {
                            const guideMap: { [key: string]: string } = {
                              'verify-email': '/support/guides/verify-email',
                              'post-item-detailed': '/support/guides/post-item',
                              'message-users': '/support/guides/messaging',
                              'safe-trading': '/support/guides/safety'
                            };
                            const guidePath = guideMap[article.id];
                            if (guidePath) {
                              router.push(guidePath);
                            }
                          }}
                          className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-600 transition-colors text-left"
                          style={{ cursor: 'pointer' }}
                        >
                          <div>
                            <span className="text-sm text-[#99afa7] font-medium">{article.category}</span>
                            <h4 className="text-white font-medium">{article.title}</h4>
                          </div>
                          <ChevronRight size={18} className="text-[#99afa7]" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No articles found matching your search.</p>
                  )}
                </div>
              )}
            </div>
          </div>
                      
          <div className="flex justify-center w-full">
            <div className="flex flex-col items-center space-y-12 max-w-4xl">
              <div className="flex space-x-12">
                {categories.slice(0, 2).map((category) => (
                  <div
                    key={category.id}
                    className="w-50 h-50 min-w-50 min-h-50 max-w-50 max-h-50 p-5 m-4 bg-grey-light rounded-lg border border-gray-600 flex flex-col flex-shrink-0 overflow-hidden"
                    style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', width: '200px', height: '200px', minWidth: '200px', minHeight: '200px', maxWidth: '200px', maxHeight: '200px' }}
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
                            'verify-email': '/support/guides/verify-email',
                            'post-item-detailed': '/support/guides/post-item',
                            'message-users': '/support/guides/messaging',
                            'safe-trading': '/support/guides/safety'
                          };
                          const guidePath = guideMap[article.id];
                          if (guidePath) {
                            router.push(guidePath);
                          }
                        }}
                        className="w-full h-12 mx-auto flex flex-col items-center justify-center p-2 rounded hover:bg-gray-600 transition-colors text-center"
                        style={{ cursor: 'pointer' }}
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
                    className="w-50 h-50 min-w-50 min-h-50 max-w-50 max-h-50 p-5 m-4 bg-grey-light rounded-lg border border-gray-600 flex flex-col flex-shrink-0 overflow-hidden"
                    style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', width: '200px', height: '200px', minWidth: '200px', minHeight: '200px', maxWidth: '200px', maxHeight: '200px' }}
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
                            'verify-email': '/support/guides/verify-email',
                            'post-item-detailed': '/support/guides/post-item',
                            'message-users': '/support/guides/messaging',
                            'safe-trading': '/support/guides/safety'
                          };
                          const guidePath = guideMap[article.id];
                          if (guidePath) {
                            router.push(guidePath);
                          }
                        }}
                        className="w-full h-12 mx-auto flex flex-col items-center justify-center p-2 rounded hover:bg-gray-600 transition-colors text-center"
                        style={{ cursor: 'pointer' }}
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





        {/* 4. Contact & Support Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Need more help? */}
            <div className="bg-grey-light rounded-xl p-8 border border-gray-600">
              <h3 className="text-2xl font-bold text-white mb-4">Need more help?</h3>
              <p className="text-gray-300 mb-6">
                Can't find what you're looking for? Get in touch with our support team.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="py-4 px-8 text-white font-medium rounded-lg transition-colors cursor-pointer text-lg w-full"
                  style={{ backgroundColor: '#708d81', color: 'white', cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5a7268';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                  }}
                >
                  Contact Support
                </button>

              </div>
              
              {/* Contact Form Dropdown */}
              {showContactForm && (
                <div className="mt-6 bg-grey-medium rounded-xl p-6 border border-gray-600">
                  <h4 className="text-xl font-bold text-white mb-4" style={{ textAlign: 'center' }}>
                    Contact Support
                  </h4>
                  
                  <form onSubmit={handleContactFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Name</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Email</label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Campus</label>
                      <input
                        type="text"
                        required
                        value={contactForm.campus}
                        onChange={(e) => setContactForm({...contactForm, campus: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Issue Type</label>
                      <select
                        required
                        value={contactForm.issueType}
                        onChange={(e) => setContactForm({...contactForm, issueType: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                      >
                        <option value="">Select an issue type</option>
                        <option value="account">Account Issues</option>
                        <option value="marketplace">Marketplace Problems</option>
                        <option value="safety">Safety Concerns</option>
                        <option value="bug">Bug Report</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Description</label>
                      <textarea
                        required
                        rows={4}
                        value={contactForm.description}
                        onChange={(e) => setContactForm({...contactForm, description: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white resize-none"
                        placeholder="Please describe your issue in detail..."
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                        style={{ cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="py-3 px-6 text-white font-medium rounded-lg transition-colors cursor-pointer"
                        style={{ backgroundColor: '#708d81', color: 'white', cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#5a7268';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#708d81';
                        }}
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Community */}
            <div className="bg-grey-light rounded-xl p-8 border border-gray-600">
              <h3 className="text-2xl font-bold text-white mb-4">Community</h3>
              <p className="text-gray-300 mb-6">
                Connect with other CampusKinect users and stay updated.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => window.open('mailto:campuskinect01@gmail.com', '_blank')}
                  className="py-4 px-8 text-white font-medium rounded-lg transition-colors cursor-pointer text-lg w-full"
                  style={{ backgroundColor: '#708d81', color: 'white', cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5a7268';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                  }}
                >
                  Send Feedback
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>


      {/* 5. Footer */}
      <div className="bg-grey-light border-t border-gray-600">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-wrap justify-center items-center space-x-8 text-sm text-gray-300">
            <button
              onClick={() => router.push('/privacy')}
              className="hover:text-white transition-colors"
              style={{ cursor: 'pointer' }}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => router.push('/terms')}
              className="hover:text-white transition-colors"
              style={{ cursor: 'pointer' }}
            >
              Terms of Service
            </button>

            <span className="text-gray-400">Version 1.0.0</span>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">
              © 2025 CampusKinect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 