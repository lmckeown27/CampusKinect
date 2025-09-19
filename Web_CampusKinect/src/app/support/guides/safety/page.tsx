'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, MapPin, Users, AlertTriangle, CheckCircle, Phone, Eye, Lock } from 'lucide-react';

export default function SafetyGuide() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#525252' }}>
      {/* Header */}
      <div className="py-8" style={{ backgroundColor: '#708d81' }}>
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-200 font-medium cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              <ArrowLeft size={20} />
              <span>Back to Help Center</span>
            </button>
          </div>
          
          <div className="text-center">
            <Shield size={48} className="text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Staying Safe on CampusKinect</h1>
            <p className="text-xl text-white opacity-90">Essential safety tips for campus trading</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Safety Overview */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>Your Safety is Our Priority</h2>
          <p className="mb-4" className="text-gray-300">
            CampusKinect is designed to be a safe, campus-only marketplace. However, it's important to follow safety guidelines when meeting other students and conducting transactions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <Users size={32} className="mx-auto mb-2" style={{ color: '#99afa7' }} />
              <h3 className="font-semibold text-white mb-2">Verified Community</h3>
              <p className="text-sm text-gray-300">Only verified students with .edu emails can join</p>
            </div>
            <div className="text-center p-4">
              <MapPin size={32} className="mx-auto mb-2" style={{ color: '#99afa7' }} />
              <h3 className="font-semibold text-white mb-2">Campus-Only</h3>
              <p className="text-sm text-gray-300">All transactions happen within your campus community</p>
            </div>
            <div className="text-center p-4">
              <Lock size={32} className="mx-auto mb-2" style={{ color: '#99afa7' }} />
              <h3 className="font-semibold text-white mb-2">Secure Platform</h3>
              <p className="text-sm text-gray-300">Encrypted messages and secure user verification</p>
            </div>
          </div>
        </div>

        {/* Meeting Safety */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#99afa7' }}>Safe Meeting Practices</h2>
          
          {/* Public Places */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <MapPin size={32} style={{ color: '#99afa7' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Always Meet in Public Places</h3>
                <p className="mb-4" className="text-gray-300">
                  Choose busy, well-lit locations on campus where other people are around.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Great Meeting Spots:</h4>
                    <ul className="space-y-1 text-sm text-green-700">
                      <li>Campus library entrance</li>
                      <li>Student union building</li>
                      <li>Campus security office</li>
                      <li>Busy dining halls</li>
                      <li>Main campus quad</li>
                      <li>Campus coffee shops</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">❌ Avoid These Places:</h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      <li>Dorm rooms or apartments</li>
                      <li>Empty parking lots</li>
                      <li>Isolated campus areas</li>
                      <li>Off-campus locations</li>
                      <li>Late night meetings</li>
                      <li>Private study rooms</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bring a Friend */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Users size={32} style={{ color: '#99afa7' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Bring a Friend When Possible</h3>
                <p className="mb-4" className="text-gray-300">
                  Having someone with you adds an extra layer of safety and can help with larger items.
                </p>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Benefits of Bringing a Friend:</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>Added safety and peace of mind</li>
                    <li>Help carrying large or heavy items</li>
                    <li>Witness to the transaction</li>
                    <li>Someone to help inspect items</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Daytime Meetings */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Eye size={32} style={{ color: '#99afa7' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Meet During Daylight Hours</h3>
                <p className="mb-4" className="text-gray-300">
                  Schedule meetings during busy campus hours when there's good visibility and foot traffic.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Best Meeting Times:</h4>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>Between classes (10am - 4pm)</li>
                    <li>Lunch hours (11am - 2pm)</li>
                    <li>Early evening (5pm - 7pm)</li>
                    <li>Avoid late nights or early mornings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Safety */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#99afa7' }}>Transaction Safety</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
              <h3 className="text-lg font-semibold text-white mb-3">Payment Safety</h3>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-1">✅ Safe Payment Methods:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>Cash (exact change preferred)</li>
                    <li>Venmo, Zelle, or PayPal</li>
                    <li>Campus payment systems</li>
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-1">❌ Avoid:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>Wire transfers</li>
                    <li>Gift cards</li>
                    <li>Cryptocurrency</li>
                    <li>Personal checks</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
              <h3 className="text-lg font-semibold text-white mb-3">Item Inspection</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-1">Before You Buy:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>Inspect the item thoroughly</li>
                    <li>Test electronics if possible</li>
                    <li>Check for damage or wear</li>
                    <li>Verify authenticity</li>
                    <li>Ask questions about history</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Red Flags */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>Red Flags to Watch For</h2>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-3">Warning Signs:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm text-red-700">
                    <li>Pressure to meet immediately</li>
                    <li>Requests for personal information</li>
                    <li>Prices that seem too good to be true</li>
                    <li>Insistence on meeting in private</li>
                    <li>Requests for unusual payment methods</li>
                  </ul>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li>Poor communication or grammar</li>
                    <li>Reluctance to answer questions</li>
                    <li>No photos or stock photos only</li>
                    <li>Aggressive or pushy behavior</li>
                    <li>Stories that don't add up</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Your Instincts */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>Trust Your Instincts</h2>
          
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-3">If Something Feels Wrong:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm text-purple-700">
                <li>Don't ignore your gut feeling</li>
                <li>It's okay to cancel or walk away</li>
                <li>You don't owe anyone an explanation</li>
                <li>Your safety is more important than any deal</li>
              </ul>
              <ul className="space-y-2 text-sm text-purple-700">
                <li>End the conversation politely</li>
                <li>Don't feel pressured to continue</li>
                <li>Report suspicious behavior</li>
                <li>Find another seller/buyer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reporting Issues */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>Reporting Safety Issues</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-3">When to Report:</h3>
              <ul className="space-y-1 text-sm" className="text-gray-300">
                <li>Inappropriate or threatening messages</li>
                <li>Suspicious or fraudulent behavior</li>
                <li>Harassment or bullying</li>
                <li>Scam attempts</li>
                <li>Unsafe meeting requests</li>
                <li>Any behavior that makes you uncomfortable</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">How to Report:</h3>
              <ul className="space-y-1 text-sm" className="text-gray-300">
                <li>Use the "Report User" feature in messages</li>
                <li>Contact CampusKinect support</li>
                <li>Provide screenshots if possible</li>
                <li>Include specific details</li>
                <li>For emergencies, contact campus security</li>
                <li>We take all reports seriously</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>Emergency Contacts</h2>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Phone size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-3">Important Numbers:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm text-red-700">
                    <li><strong>Emergency:</strong> 911</li>
                    <li><strong>Campus Security:</strong> Check your university's website</li>
                    <li><strong>Campus Police:</strong> Usually available 24/7</li>
                  </ul>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li><strong>CampusKinect Support:</strong> campuskinect01@gmail.com</li>
                    <li><strong>Title IX Office:</strong> For harassment issues</li>
                    <li><strong>Student Affairs:</strong> For campus-related concerns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Safety Resources */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>Additional Safety Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-3">Campus Resources:</h3>
              <ul className="space-y-1 text-sm" className="text-gray-300">
                <li>Campus safety escorts</li>
                <li>Emergency blue light phones</li>
                <li>Campus safety apps</li>
                <li>Security camera locations</li>
                <li>Safe ride programs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Personal Safety:</h3>
              <ul className="space-y-1 text-sm" className="text-gray-300">
                <li>Share your location with friends</li>
                <li>Keep your phone charged</li>
                <li>Stay aware of your surroundings</li>
                <li>Trust your instincts</li>
                <li>Have an exit plan</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Need More Help */}
        <div className="p-6 rounded-lg border-2 border-[#708d81]" style={{ backgroundColor: '#708d81' }}>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Safety Concerns or Questions?</h2>
            <p className="text-white opacity-90 mb-4">
              If you have safety concerns or need to report an issue, contact our support team immediately.
            </p>
            <button
              onClick={() => router.push('/support')}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
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