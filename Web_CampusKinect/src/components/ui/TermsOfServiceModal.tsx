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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Terms of Service</h2>
          <p className="text-gray-600">Please read our terms and community guidelines</p>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed"
          onScroll={handleScroll}
        >
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction</h3>
              <p className="text-gray-700">
                Welcome to CampusKinect, a student community platform designed to connect university students for sharing events, finding roommates, offering tutoring services, and engaging in campus life activities. By accessing or using our platform, you agree to be bound by these Terms of Service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Eligibility</h3>
              <p className="text-gray-700">
                CampusKinect is exclusively for university students with valid educational email addresses. You must have a valid educational email address (.edu, .ac.uk, .ca, .edu.au, .de, .fr) to create an account and use CampusKinect.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Acceptable Use</h3>
              
              {/* Zero Tolerance Policy Banner */}
              <div className="bg-red-600 border-2 border-red-700 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-white mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-bold text-lg mb-2">ZERO TOLERANCE POLICY</p>
                    <p className="text-white font-semibold mb-3">
                      CampusKinect maintains ABSOLUTE ZERO TOLERANCE for objectionable content or abusive behavior of any kind.
                    </p>
                    <ul className="text-white text-sm space-y-1">
                      <li>• All content is actively monitored and filtered</li>
                      <li>• Reports are reviewed and acted upon within 24 hours</li>
                      <li>• Violating users are immediately ejected from the platform</li>
                      <li>• Content removal is swift and permanent</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 font-semibold mb-3">
                You agree to use CampusKinect only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Post false, misleading, or fraudulent information</li>
                <li>Harass, bully, or discriminate against other users</li>
                <li>Share inappropriate, offensive, or illegal content</li>
                <li>Post content that is hateful, threatening, or promotes violence</li>
                <li>Share sexually explicit or suggestive content</li>
                <li>Post spam, scams, or fraudulent offers</li>
                <li>Attempt to gain unauthorized access to other accounts</li>
                <li>Use the platform for commercial purposes without permission</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Engage in any form of abusive behavior toward other users</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. User Content</h3>
              <p className="text-gray-700 mb-3">
                You retain ownership of content you post on CampusKinect. However, by posting content, you grant us a license to use, display, and distribute that content on our platform.
              </p>
              
              <p className="text-gray-700 font-medium mb-3">
                <strong>Third-Party Content Disclaimer:</strong> The contents requested or offered on this website is sole property of the third party individual and not in any way affiliated with the platform. CampusKinect does not endorse, guarantee, or assume responsibility for any user-generated content, including but not limited to goods, services, housing, events, or any other listings.
              </p>
              
              <p className="text-gray-700 font-medium mb-4">
                <strong>Content Moderation:</strong> We actively monitor all user-generated content and will act on objectionable content reports within 24 hours by removing the content and ejecting users who provide offending content. We maintain the authority to review, edit, or remove any content that we deem inappropriate, harmful, or in violation of these terms. Users who violate our content policies will be immediately suspended or permanently banned from the platform.
              </p>

              {/* Content Responsibility Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-orange-800 font-semibold text-sm">Content Responsibility</p>
                    <p className="text-orange-700 text-sm mt-1">
                      You are responsible for all content you post and its accuracy. We reserve the right to remove content that violates our terms or community guidelines.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Privacy and Data</h3>
              <p className="text-gray-700">
                Your privacy is important to us. We collect and process your personal information in accordance with our Privacy Policy. By using CampusKinect, you consent to our data practices as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Safety and Security</h3>
              <p className="text-gray-700 mb-3">
                We are committed to maintaining a safe and secure platform for all users. We implement various security measures and content moderation policies to protect our community.
              </p>
              
              <p className="text-gray-700 font-medium mb-3">
                <strong>Reporting and Blocking:</strong> Users can report inappropriate content or behavior through our reporting system. You can also block users who engage in abusive behavior. All reports are reviewed promptly, and appropriate action is taken within 24 hours.
              </p>
              
              <p className="text-gray-700">
                We reserve the right to suspend or terminate your account if you violate these Terms of Service or engage in behavior that is harmful to our community.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Changes to Terms</h3>
              <p className="text-gray-700">
                We may update these Terms of Service from time to time. We will notify you of any material changes via email or through our platform. Your continued use of CampusKinect after such changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Contact Us</h3>
              <p className="text-gray-700 mb-3">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              
              <div className="text-gray-700 space-y-1">
                <p className="font-medium">Email: support@campuskinect.com</p>
                <p>Address: CampusKinect, Inc.</p>
                <p className="text-sm text-gray-500 mt-2">Last updated: September 2024</p>
              </div>
            </section>

            {/* Bottom marker */}
            <div className="text-center py-4 border-t border-gray-200">
              <p className="text-gray-500 text-sm">End of Terms</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
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
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAcceptClick}
              disabled={!hasScrolledToBottom}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                hasScrolledToBottom
                  ? 'bg-[#708d81] text-white hover:bg-[#5a7268]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms of Service Accepted</h3>
            <p className="text-gray-600 mb-6">
              Would you like to disable the Terms of Service popup for future logins?
              <br /><br />
              Note: You can always review the terms in Settings.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleRememberChoice(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Show every time
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