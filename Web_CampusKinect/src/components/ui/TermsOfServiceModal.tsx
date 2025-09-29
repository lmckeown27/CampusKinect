'use client';

import React, { useState, useEffect } from 'react';
import { FileText, ChevronDown, AlertTriangle } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onAccept: (shouldRememberChoice: boolean) => void;
  onDecline: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  isOpen,
  onAccept,
  onDecline
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showRememberChoiceDialog, setShowRememberChoiceDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      console.log('📋 Terms modal opened - Accept button starts disabled');
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
    
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      console.log('📋 ✅ User reached bottom - Accept button enabled');
    } else if (!isAtBottom && hasScrolledToBottom) {
      setHasScrolledToBottom(false);
      console.log('📋 ❌ User scrolled away from bottom - Accept button disabled');
    }
  };

  const handleAcceptClick = () => {
    setShowRememberChoiceDialog(true);
  };

  const handleRememberChoice = (shouldRemember: boolean) => {
    console.log(`📋 Modal: User chose shouldRemember: ${shouldRemember}`);
    setShowRememberChoiceDialog(false);
    onAccept(shouldRemember);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-black rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border-2 border-gray-600">
        {/* Header */}
        <div className="p-6 border-b border-gray-600 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Terms of Service</h2>
          <p className="text-gray-300">Please read our terms and community guidelines</p>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed"
          onScroll={handleScroll}
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
                          <h2 className="text-xl font-bold text-white mb-2">CAMPUSKINECT TERMS OF SERVICE</h2>
            <p className="text-sm text-gray-300">Last Updated: September 27, 2025</p>
            </div>

            {/* Zero Tolerance Policy Header */}
            <div className="bg-red-600 border-2 border-red-700 rounded-lg p-4 mb-6">
              <div className="text-center">
                <h3 className="text-white font-bold text-lg mb-2">ZERO-TOLERANCE POLICY FOR OBJECTIONABLE CONTENT</h3>
                <p className="text-white font-semibold">
                  CampusKinect maintains a strict zero-tolerance policy for objectionable content and abusive behavior. By using this platform, you agree to these terms and our community guidelines.
                </p>
              </div>
            </div>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">1. PROHIBITED CONTENT</h3>
              <p className="text-gray-200 mb-3 font-medium">
                The following content is strictly prohibited and will result in immediate account suspension:
              </p>
              
              <ul className="list-disc list-inside text-gray-200 space-y-2 ml-4 mb-4">
                <li>Harassment, bullying, or threatening behavior</li>
                <li>Hate speech or discriminatory content</li>
                <li>Spam, scams, or fraudulent activities</li>
                <li>Sexual or adult content</li>
                <li>Violence or threats of violence</li>
                <li>False information or misinformation</li>
                <li>Content that violates community standards</li>
                <li>Any illegal activities or content</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">2. USER RESPONSIBILITIES</h3>
              <p className="text-gray-200 mb-3 font-medium">
                By creating an account, you agree to:
              </p>
              
              <ul className="list-disc list-inside text-gray-200 space-y-2 ml-4 mb-4">
                <li>Provide accurate and truthful information</li>
                <li>Respect other users and maintain civil discourse</li>
                <li>Report inappropriate content immediately</li>
                <li>Use the platform only for legitimate academic and social purposes</li>
                <li>Follow community guidelines and standards</li>
                <li>Take responsibility for all content you post</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">3. CONTENT MODERATION</h3>
              <p className="text-gray-200 mb-3 font-medium">
                CampusKinect employs both automated and human moderation:
              </p>
              
              <ul className="list-disc list-inside text-gray-200 space-y-2 ml-4 mb-4">
                <li>All content is subject to review</li>
                <li>Reported content is reviewed within 24 hours</li>
                <li>Violations result in immediate content removal</li>
                <li>Repeat offenders face permanent account suspension</li>
                <li>We maintain independent moderation standards</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">4. REPORTING MECHANISM</h3>
              <p className="text-gray-200 mb-3 font-medium">
                Users can report inappropriate content through:
              </p>
              
              <ul className="list-disc list-inside text-gray-200 space-y-2 ml-4 mb-4">
                <li>The report button on any post or message</li>
                <li>Direct contact with moderation team</li>
                <li>Email: campuskinect01@gmail.com (Response: 2-6 pm)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">5. USER BLOCKING</h3>
              <p className="text-gray-200 mb-3 font-medium">
                Users can block other users to:
              </p>
              
              <ul className="list-disc list-inside text-gray-200 space-y-2 ml-4 mb-4">
                <li>Prevent unwanted contact</li>
                <li>Filter out inappropriate interactions</li>
                <li>Maintain a safe personal experience</li>
                <li>Report persistent harassment</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">6. ENFORCEMENT ACTIONS</h3>
              <p className="text-gray-200 mb-3 font-medium">
                Violations may result in:
              </p>
              
              <ul className="list-disc list-inside text-gray-200 space-y-2 ml-4 mb-4">
                <li>Content removal</li>
                <li>Temporary account suspension</li>
                <li>Permanent account ban</li>
                <li>Cooperation with law enforcement if necessary</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">7. PRIVACY AND DATA</h3>
              <ul className="list-disc list-inside text-gray-200 space-y-2 ml-4 mb-4">
                <li>Your data is protected according to our Privacy Policy</li>
                <li>We maintain strict data privacy standards</li>
                <li>Content may be preserved for moderation purposes</li>
                <li>Account information may be shared with law enforcement if required</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">8. PLATFORM SAFETY</h3>
              <p className="text-gray-200 mb-3 font-medium">
                CampusKinect is committed to maintaining a safe environment:
              </p>
              
              <ul className="list-disc list-inside text-gray-200 space-y-2 ml-4 mb-4">
                <li>Advanced content filtering technology</li>
                <li>24/7 monitoring for inappropriate content</li>
                <li>Rapid response to safety concerns</li>
                <li>Continuous improvement of safety measures</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">9. PLATFORM COMPLIANCE</h3>
              <p className="text-gray-200 mb-3 font-medium">
                This platform operates in compliance with:
              </p>
              
              <ul className="list-disc list-inside text-gray-200 space-y-2 ml-4 mb-4">
                <li>Community safety standards</li>
                <li>Federal education privacy laws</li>
                <li>State and local regulations</li>
                <li>Apple App Store guidelines</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">10. CONTACT INFORMATION</h3>
              <p className="text-gray-200 mb-3 font-medium">
                For questions, concerns, or reports:
              </p>
              
              <ul className="list-disc list-inside text-gray-200 space-y-2 ml-4 mb-4">
                <li>Email: campuskinect01@gmail.com</li>
                <li>Response Time: 2-6 pm</li>
                <li>For emergencies: Contact local authorities</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">11. CHANGES TO TERMS</h3>
              <ul className="list-disc list-inside text-gray-200 space-y-2 ml-4 mb-4">
                <li>Terms may be updated to improve safety</li>
                <li>Users will be notified of significant changes</li>
                <li>Continued use constitutes acceptance of new terms</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">12. AGREEMENT</h3>
              <p className="text-gray-200 mb-3">
                By clicking "Accept," you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and Community Guidelines. You understand that violation of these terms may result in immediate account suspension.
              </p>
              
              <p className="text-gray-200 mb-3">
                You also acknowledge that CampusKinect has a zero-tolerance policy for objectionable content and that the platform actively moderates content to maintain a safe educational environment.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-semibold text-center">
                  REMEMBER: This platform is designed to enhance your university experience. Help us maintain a positive, safe, and respectful community for all students.
                </p>
              </div>
            </section>

            {/* Bottom marker */}
            <div className="text-center py-4 border-t border-gray-600">
                              <p className="text-gray-400 text-sm">End of Terms</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-600 bg-gray-800">
          {/* Scroll indicator */}
          {!hasScrolledToBottom && (
            <div className="flex items-center justify-center mb-4 text-orange-600">
              <ChevronDown className="w-5 h-5 mr-2" />
              <p className="text-sm">You must scroll through and read all terms to continue</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onDecline}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAcceptClick}
              disabled={!hasScrolledToBottom}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                hasScrolledToBottom
                  ? 'bg-[#708d81] text-white hover:bg-[#5a7268]'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Accept
            </button>
          </div>
        </div>
      </div>

      {/* Remember choice dialog */}
      {showRememberChoiceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-black rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border-2 border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4">Terms of Service Accepted</h3>
            <p className="text-gray-300 mb-6">
              How would you like to handle the Terms of Service popup for future logins?
              <br /><br />
              Note: You can always review the terms in Settings.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleRememberChoice(false)}
                                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
              >
                Show every login
              </button>
              <button
                onClick={() => handleRememberChoice(true)}
                className="flex-1 px-4 py-2 bg-[#708d81] text-white rounded-lg font-medium hover:bg-[#5a7268] transition-colors"
              >
                Don't show again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsOfServiceModal; 