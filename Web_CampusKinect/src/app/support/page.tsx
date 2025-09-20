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
        { id: 'verify-email', title: 'Verify Your University Email', category: 'Getting Started', description: 'Step-by-step email verification guide' }
      ]
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      icon: <ShoppingBag size={24} />,
      description: 'Buy and sell items',
      articles: [
        { id: 'post-item-detailed', title: 'Post an Item for Sale', category: 'Marketplace', description: 'Create and manage listings' }
      ]
    },
    {
      id: 'messaging',
      title: 'Messaging',
      icon: <MessageCircle size={24} />,
      description: 'Chat with other users',
      articles: [
        { id: 'message-users', title: 'How to Message Users', category: 'Messaging', description: 'Start conversations and manage chats' }
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Trust',
      icon: <Shield size={24} />,
      description: 'Stay safe while trading',
      articles: [
        { id: 'safe-trading', title: 'Safety Guidelines', category: 'Safety', description: 'Essential safety tips and reporting' }
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
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-white hover:text-[#99afa7] transition-colors"
                style={{ cursor: 'pointer' }}
              >
                CampusKinect
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-8 bg-grey-light rounded-xl border border-gray-600"
                style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#99afa7' }}>
                    <div className="text-white">{category.icon}</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{category.title}</h3>
                    <p className="text-gray-300 mt-1">{category.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
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
                      className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-600 transition-colors text-left"
                      style={{ cursor: 'pointer' }}
                    >
                      <div>
                        <h4 className="text-white font-medium">{article.title}</h4>
                        <p className="text-gray-300 text-sm mt-1">{article.description}</p>
                      </div>
                      <ChevronRight size={18} className="text-[#99afa7]" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. User Guides / Resources */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6" style={{ textAlign: 'center' }}>
            Platform Guides
          </h2>
          <div className="flex justify-center space-x-6">
                         <button
               onClick={() => router.push('/support/guides/ios')}
               className="flex items-center px-6 py-4 bg-grey-light rounded-lg border border-gray-600 hover:border-[#99afa7] transition-colors"
               style={{ cursor: 'pointer' }}
             >
               <ExternalLink size={20} className="mr-3 text-[#99afa7]" />
               <span className="text-white font-medium">iOS Guide</span>
             </button>
             <button
               onClick={() => router.push('/support/guides/web')}
               className="flex items-center px-6 py-4 bg-grey-light rounded-lg border border-gray-600 hover:border-[#99afa7] transition-colors"
               style={{ cursor: 'pointer' }}
             >
               <ExternalLink size={20} className="mr-3 text-[#99afa7]" />
               <span className="text-white font-medium">Web Guide</span>
             </button>
          </div>
        </div>

        {/* 5. Search Bar */}
        <div className="mb-16">
          <div className="max-w-2xl mx-auto">
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
                          <p className="text-gray-300 text-sm mt-1">{article.description}</p>
                        </div>
                        <ChevronRight size={16} className="text-[#99afa7]" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300">No articles found matching your search.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 6. Contact & Support Section */}
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
                  onClick={() => setShowContactForm(true)}
                  className="w-full px-6 py-3 bg-[#708d81] text-white rounded-lg font-semibold hover:bg-[#5a7268] transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  Contact Support
                </button>
                <button
                  onClick={() => router.push('/support/guides/safety')}
                  className="w-full px-6 py-3 border-2 border-[#708d81] text-[#708d81] rounded-lg font-semibold hover:bg-[#708d81] hover:text-white transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  Report a Problem
                </button>
              </div>
            </div>

            {/* Right Column: Community */}
            <div className="bg-grey-light rounded-xl p-8 border border-gray-600">
              <h3 className="text-2xl font-bold text-white mb-4">Community</h3>
              <p className="text-gray-300 mb-6">
                Connect with other CampusKinect users and stay updated.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => window.open('mailto:feedback@campuskinect.net', '_blank')}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  Send Feedback
                </button>
                <button
                  onClick={() => router.push('/support/guides/verify-email')}
                  className="w-full px-6 py-3 border-2 border-blue-600 text-blue-400 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  App Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-grey-light rounded-xl p-8 max-w-md w-full border border-gray-600">
            <h3 className="text-2xl font-bold text-white mb-6" style={{ textAlign: 'center' }}>
              Contact Support
            </h3>
            
            <form onSubmit={handleContactFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Campus</label>
                  <input
                    type="text"
                    required
                    value={contactForm.campus}
                    onChange={(e) => setContactForm({...contactForm, campus: e.target.value})}
                    placeholder="e.g., University of California, Berkeley"
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
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select an issue type</option>
                    <option value="account">Account Issues</option>
                    <option value="marketplace">Marketplace Problems</option>
                    <option value="safety">Safety Concerns</option>
                    <option value="bug">Bug Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  required
                  value={contactForm.description}
                  onChange={(e) => setContactForm({...contactForm, description: e.target.value})}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
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
                  <Send size={18} className="inline mr-2" />
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="px-6 py-3 rounded-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-[#99afa7] transition-all duration-200"
                  style={{ cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Footer */}
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
            <button
              onClick={() => router.push('/')}
              className="hover:text-white transition-colors"
              style={{ cursor: 'pointer' }}
            >
              About CampusKinect
            </button>
            <span className="text-gray-400">Version 1.0.0</span>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">
              © 2024 CampusKinect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 