'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import KinectLogo from '@/assets/logos/KinectLogo.png';

export default function SupportHeader() {
  const router = useRouter();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    campus: '',
    issueType: '',
    description: ''
  });

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your message. We\'ll get back to you within 24-48 hours.');
    setShowContactForm(false);
    setContactForm({ name: '', email: '', campus: '', issueType: '', description: '' });
  };

  return (
    <>
      {/* Header */}
      <div className="bg-grey-light border-b border-gray-600">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center md:justify-between">
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
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="px-4 py-2 bg-[#708d81] text-white rounded-lg hover:bg-[#5a7268] transition-colors"
                style={{ cursor: 'pointer' }}
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="bg-grey-medium border-b border-gray-600">
          <div className="max-w-4xl mx-auto px-6 py-8">
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
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#708d81] text-white rounded-lg hover:bg-[#5a7268] transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 