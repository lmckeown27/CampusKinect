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
        {/* Contact Support Section */}
        <div className="mb-8">
          <div className="p-8 rounded-xl border-2 border-[#708d81]" style={{ backgroundColor: '#708d81' }}>
            <div className="text-center mb-6">
              <Mail size={48} className="text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Need Help?</h2>
              <p className="text-white opacity-90">We're here to support you with any questions or issues</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#5a7268' }}>
                <h3 className="text-lg font-semibold text-white mb-3">Contact us for:</h3>
                <ul className="space-y-2 text-white">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Account issues & login problems</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Bug reports & technical issues</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Feature requests & feedback</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>University verification help</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Privacy & safety concerns</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#5a7268' }}>
                <h3 className="text-lg font-semibold text-white mb-3">What to include:</h3>
                <ul className="space-y-2 text-white">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Your university email address</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Detailed description of the issue</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Screenshots (if applicable)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Device & browser information</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Steps to reproduce the problem</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => handleContactEmail('support')}
                className="px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 cursor-pointer"
                style={{ 
                  backgroundColor: 'white', 
                  color: '#708d81',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <Mail size={20} className="inline mr-2" />
                Email Support: campuskinect01@gmail.com
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <div className="p-6 rounded-xl border-2 border-[#708d81]" style={{ backgroundColor: '#708d81' }}>
            <div className="flex items-center space-x-3 mb-6">
              <Book size={28} className="text-white" />
              <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#708d81]" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-white bg-white text-[#708d81] placeholder-gray-500 focus:outline-none focus:border-[#5a7268]"
              />
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4 mt-6">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="border-2 border-[#5a7268] rounded-lg overflow-hidden"
                style={{ backgroundColor: '#5a7268' }}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left hover:bg-[#525252] transition-colors flex items-center justify-between cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="text-sm text-white opacity-80 font-medium mb-1">{faq.category}</div>
                    <div className="text-white font-medium">{faq.question}</div>
                  </div>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown size={20} className="text-white" />
                  ) : (
                    <ChevronRight size={20} className="text-white" />
                  )}
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="px-6 py-4 border-t border-[#708d81] bg-white">
                    <p className="text-[#525252] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white opacity-80">No FAQs found matching your search.</p>
            </div>
          )}
        </div>

        {/* Support Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Support Hours */}
          <div className="p-6 rounded-xl border-2 border-[#708d81]" style={{ backgroundColor: '#708d81' }}>
            <div className="flex items-center space-x-3 mb-4">
              <Clock size={24} className="text-white" />
              <h3 className="text-lg font-semibold text-white">Support Hours</h3>
            </div>
            <div className="space-y-2 text-white">
              <p><strong>Available Hours:</strong> Whenever I am free</p>
              <p className="text-sm text-white opacity-80 mt-3">
                We typically respond to emails as soon as possible. Response times may vary based on availability.
              </p>
            </div>
          </div>

          {/* Response Time */}
          <div className="p-6 rounded-xl border-2 border-[#708d81]" style={{ backgroundColor: '#708d81' }}>
            <div className="flex items-center space-x-3 mb-4">
              <MessageCircle size={24} className="text-white" />
              <h3 className="text-lg font-semibold text-white">Response Time</h3>
            </div>
            <div className="space-y-2 text-white">
              <p><strong>Typical Response:</strong> Within 24-48 hours</p>
              <p className="text-sm text-white opacity-80 mt-3">
                For urgent issues affecting multiple users, we prioritize faster responses. Complex technical issues may take longer to resolve.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 p-6 rounded-xl border-2 border-[#708d81]" style={{ backgroundColor: '#708d81' }}>
          <div className="flex items-center space-x-3 mb-4">
            <Shield size={24} className="text-white" />
            <h3 className="text-lg font-semibold text-white">Additional Resources</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/privacy')}
              className="text-left p-4 rounded-lg hover:bg-white transition-colors border border-white cursor-pointer"
              style={{ cursor: 'pointer', backgroundColor: '#5a7268' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#708d81';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = '#5a7268';
                e.currentTarget.style.color = 'white';
              }}
            >
              <h4 className="text-white font-medium mb-1">Privacy Policy</h4>
              <p className="text-white opacity-80 text-sm">Learn how we protect your data</p>
            </button>
            <button
              onClick={() => router.push('/terms')}
              className="text-left p-4 rounded-lg hover:bg-white transition-colors border border-white cursor-pointer"
              style={{ cursor: 'pointer', backgroundColor: '#5a7268' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#708d81';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = '#5a7268';
                e.currentTarget.style.color = 'white';
              }}
            >
              <h4 className="text-white font-medium mb-1">Terms of Service</h4>
              <p className="text-white opacity-80 text-sm">Read our terms and conditions</p>
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