'use client';

import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, Mail, MessageCircle, Bug, Book, Users, Shield, ChevronDown, ChevronRight, Search, Phone, Clock, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SupportPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'How do I create an account on CampusKinect?',
      answer: 'To create an account, you need a valid university email address (.edu). Click "Register" on the login page, enter your university email, create a password, and verify your email. Once verified, complete your profile with your major, year, and other details.'
    },
    {
      id: 2,
      category: 'Account & Profile',
      question: 'How do I update my profile information?',
      answer: 'Go to Settings > Account section. You can update your display name, bio, major, year, hometown, and profile picture. Changes are saved automatically when you click "Save Settings".'
    },
    {
      id: 3,
      category: 'Privacy & Security',
      question: 'Who can see my posts and profile?',
      answer: 'Only verified students from your university can see your posts and profile. CampusKinect is campus-exclusive, ensuring your content stays within your university community.'
    },
    {
      id: 4,
      category: 'Messaging',
      question: 'How do I send a message to another student?',
      answer: 'You can message other students by clicking on their profile or tapping anywhere on their post. This will open a chat conversation where you can send direct messages in real-time.'
    },
    {
      id: 5,
      category: 'Posts & Feed',
      question: 'How do I create a post with images?',
      answer: 'Click the "Create Post" button, write your message, and click the camera icon to add photos. You can add multiple images to a single post. Posts appear in your campus feed immediately.'
    },
    {
      id: 6,
      category: 'Technical Issues',
      question: 'Why am I not receiving notifications?',
      answer: 'Check your browser notification settings and ensure CampusKinect has permission to send notifications. On mobile, check your device notification settings. You can also manage notification preferences in Settings.'
    },
    {
      id: 7,
      category: 'Account & Profile',
      question: 'How do I delete my account?',
      answer: 'Currently, account deletion must be requested through our support team. Contact us at campuskinect01@gmail.com with your request, and we\'ll process it within 48 hours.'
    },
    {
      id: 8,
      category: 'Campus Verification',
      question: 'My university email isn\'t working for registration',
      answer: 'Ensure you\'re using your official university email ending in .edu. If you\'re still having issues, your university might not be supported yet. Contact us to request adding your university to our platform.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactEmail = (type: string) => {
    const subjects = {
      support: 'CampusKinect Support Request',
      bug: 'Bug Report - CampusKinect',
      feedback: 'Feedback - CampusKinect'
    };
    
    const email = 'campuskinect01@gmail.com';

    window.location.href = `mailto:${email}?subject=${subjects[type as keyof typeof subjects]}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#525252' }}>
      {/* Header */}
      <div className="border-b border-[#708d81] sticky top-0 z-10" style={{ backgroundColor: '#737373' }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-[#708d81] transition-colors cursor-pointer"
                style={{ cursor: 'pointer' }}
              >
                <ArrowLeft size={24} className="text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Support Center</h1>
                <p className="text-[#708d81]">Get help with CampusKinect</p>
              </div>
            </div>
            <HelpCircle size={32} className="text-[#708d81]" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => handleContactEmail('support')}
            className="p-6 rounded-xl border-2 border-[#708d81] hover:bg-[#708d81] transition-all duration-200 group cursor-pointer"
            style={{ backgroundColor: '#737373', cursor: 'pointer' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Mail size={32} className="text-[#708d81] group-hover:text-white mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Contact Support</h3>
            <p className="text-gray-300 group-hover:text-gray-100">Get direct help from our team</p>
          </button>

          <button
            onClick={() => handleContactEmail('bug')}
            className="p-6 rounded-xl border-2 border-[#708d81] hover:bg-[#708d81] transition-all duration-200 group cursor-pointer"
            style={{ backgroundColor: '#737373', cursor: 'pointer' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Bug size={32} className="text-[#708d81] group-hover:text-white mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Report a Bug</h3>
            <p className="text-gray-300 group-hover:text-gray-100">Found something broken? Let us know</p>
          </button>

          <button
            onClick={() => handleContactEmail('feedback')}
            className="p-6 rounded-xl border-2 border-[#708d81] hover:bg-[#708d81] transition-all duration-200 group cursor-pointer"
            style={{ backgroundColor: '#737373', cursor: 'pointer' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <MessageCircle size={32} className="text-[#708d81] group-hover:text-white mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Send Feedback</h3>
            <p className="text-gray-300 group-hover:text-gray-100">Share your thoughts and ideas</p>
          </button>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Book size={24} className="text-[#708d81]" />
            <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-[#708d81] bg-[#737373] text-white placeholder-gray-400 focus:outline-none focus:border-[#5a7268]"
            />
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="border-2 border-[#708d81] rounded-lg overflow-hidden"
                style={{ backgroundColor: '#737373' }}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left hover:bg-[#708d81] transition-colors flex items-center justify-between cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="text-sm text-[#708d81] font-medium mb-1">{faq.category}</div>
                    <div className="text-white font-medium">{faq.question}</div>
                  </div>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown size={20} className="text-white" />
                  ) : (
                    <ChevronRight size={20} className="text-white" />
                  )}
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="px-6 py-4 border-t border-gray-600 bg-[#525252]">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No FAQs found matching your search.</p>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Support Hours */}
          <div className="p-6 rounded-xl border-2 border-[#708d81]" style={{ backgroundColor: '#737373' }}>
            <div className="flex items-center space-x-3 mb-4">
              <Clock size={24} className="text-[#708d81]" />
              <h3 className="text-lg font-semibold text-white">Support Hours</h3>
            </div>
            <div className="space-y-2 text-gray-300">
              <p><strong>Available Hours:</strong> Whenever I am free</p>
              <p className="text-sm text-gray-400 mt-3">
                We typically respond to emails as soon as possible. Response times may vary based on availability.
              </p>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="p-6 rounded-xl border-2 border-[#708d81]" style={{ backgroundColor: '#737373' }}>
            <div className="flex items-center space-x-3 mb-4">
              <Users size={24} className="text-[#708d81]" />
              <h3 className="text-lg font-semibold text-white">Get in Touch</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail size={16} className="text-[#708d81]" />
                <span>campuskinect01@gmail.com</span>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                For all support, bug reports, feedback, and general inquiries, please use the email above.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 p-6 rounded-xl border-2 border-[#708d81]" style={{ backgroundColor: '#737373' }}>
          <div className="flex items-center space-x-3 mb-4">
            <Shield size={24} className="text-[#708d81]" />
            <h3 className="text-lg font-semibold text-white">Additional Resources</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/privacy')}
              className="text-left p-4 rounded-lg hover:bg-[#708d81] transition-colors border border-[#708d81] cursor-pointer"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h4 className="text-white font-medium mb-1">Privacy Policy</h4>
              <p className="text-gray-400 text-sm">Learn how we protect your data</p>
            </button>
            <button
              onClick={() => router.push('/terms')}
              className="text-left p-4 rounded-lg hover:bg-[#708d81] transition-colors border border-[#708d81] cursor-pointer"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h4 className="text-white font-medium mb-1">Terms of Service</h4>
              <p className="text-gray-400 text-sm">Read our terms and conditions</p>
            </button>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="mt-8 p-4 rounded-lg border-l-4 border-red-500 bg-red-900/20">
          <p className="text-red-200 text-sm">
            <strong>Emergency:</strong> If you're experiencing a mental health crisis or emergency, 
            please contact your campus counseling center, call 988 (Suicide & Crisis Lifeline), 
            or go to your nearest emergency room immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage; 