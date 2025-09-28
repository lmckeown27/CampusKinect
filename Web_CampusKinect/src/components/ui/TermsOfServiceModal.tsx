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
    }
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
    onAccept(shouldRemember);
    setShowRememberChoiceDialog(false);
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-semibold text-sm">Zero Tolerance Policy</p>
                    <p className="text-red-700 text-sm mt-1">
                      CampusKinect has ZERO TOLERANCE for objectionable content or abusive behavior. All content is monitored and violations result in immediate account termination.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-700">
                You agree to use CampusKinect only for lawful purposes and in accordance with these Terms. You may not use our platform to post, share, or distribute content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Content Guidelines</h3>
              <p className="text-gray-700 mb-3">All content must be appropriate for a university community. Prohibited content includes:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Hate speech, discrimination, or harassment</li>
                <li>Sexually explicit or suggestive content</li>
                <li>Violence, threats, or intimidation</li>
                <li>Illegal activities or substances</li>
                <li>Spam, scams, or fraudulent content</li>
                <li>Personal information of others without consent</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Privacy and Data</h3>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using CampusKinect, you consent to our data practices as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Account Responsibility</h3>
              <p className="text-gray-700">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Termination</h3>
              <p className="text-gray-700">
                We reserve the right to terminate or suspend your account at any time for violations of these Terms or for any other reason at our sole discretion. Upon termination, your right to use CampusKinect will cease immediately.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Changes to Terms</h3>
              <p className="text-gray-700">
                We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms on our platform. Your continued use of CampusKinect after such changes constitutes acceptance of the new Terms.
              </p>
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