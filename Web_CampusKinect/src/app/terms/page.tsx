'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SupportHeader from '@/components/layout/SupportHeader';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-grey-medium">
      <SupportHeader />
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 shadow-sm relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back to Login Link - Positioned absolutely on left */}
          <div className="absolute left-4 sm:left-6 lg:left-8 top-6 w-auto h-auto">
            <Link 
              href="/auth/login"
              className="flex items-center space-x-2 text-primary hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              <ArrowLeft size={20} />
              <span>Login</span>
            </Link>
          </div>
          
          {/* Privacy Policy Link - Positioned below Login link */}
          <div className="absolute left-4 sm:left-6 lg:left-8 top-16 w-auto h-auto">
            <Link 
              href="/privacy"
              className="flex items-center space-x-2 text-primary hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              <ArrowLeft size={20} />
              <span>Privacy</span>
            </Link>
          </div>
          
          {/* Centered Title */}
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold text-neutral-900">Terms of Service</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-grey-light rounded-xl p-8 border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <div className="prose prose-lg max-w-none">
            <div className="space-y-6 text-gray-300" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {`CAMPUSKINECT TERMS OF SERVICE

Last Updated: September 27, 2025

ZERO-TOLERANCE POLICY FOR OBJECTIONABLE CONTENT

CampusKinect maintains a strict zero-tolerance policy for objectionable content and abusive behavior. By using this platform, you agree to these terms and our community guidelines.

1. PROHIBITED CONTENT

The following content is strictly prohibited and will result in immediate account suspension:

• Harassment, bullying, or threatening behavior
• Hate speech or discriminatory content
• Spam, scams, or fraudulent activities
• Sexual or adult content
• Violence or threats of violence
• False information or misinformation
• Content that violates community standards
• Any illegal activities or content

2. USER RESPONSIBILITIES

By creating an account, you agree to:

• Provide accurate and truthful information
• Respect other users and maintain civil discourse
• Report inappropriate content immediately
• Use the platform only for legitimate academic and social purposes
• Follow community guidelines and standards
• Take responsibility for all content you post

3. CONTENT MODERATION

CampusKinect employs both automated and human moderation:

• All content is subject to review
• Reported content is reviewed within 24 hours
• Violations result in immediate content removal
• Repeat offenders face permanent account suspension
• We maintain independent moderation standards

4. REPORTING MECHANISM

Users can report inappropriate content through:

• The report button on any post or message
• Direct contact with moderation team
• Email: campuskinect01@gmail.com (Response: 2-6 pm)

5. USER BLOCKING

Users can block other users to:

• Prevent unwanted contact
• Filter out inappropriate interactions
• Maintain a safe personal experience
• Report persistent harassment

6. ENFORCEMENT ACTIONS

Violations may result in:

• Content removal
• Temporary account suspension
• Permanent account ban
• Cooperation with law enforcement if necessary

7. PRIVACY AND DATA

• Your data is protected according to our Privacy Policy
• We maintain strict data privacy standards
• Content may be preserved for moderation purposes
• Account information may be shared with law enforcement if required

8. PLATFORM SAFETY

CampusKinect is committed to maintaining a safe environment:

• Advanced content filtering technology
• 24/7 monitoring for inappropriate content
• Rapid response to safety concerns
• Continuous improvement of safety measures

9. PLATFORM COMPLIANCE

This platform operates in compliance with:

• Community safety standards
• Federal education privacy laws
• State and local regulations
• Apple App Store guidelines

10. CONTACT INFORMATION

For questions, concerns, or reports:
• Email: campuskinect01@gmail.com
• Response Time: 2-6 pm
• For emergencies: Contact local authorities

11. CHANGES TO TERMS

• Terms may be updated to improve safety
• Users will be notified of significant changes
• Continued use constitutes acceptance of new terms

12. AGREEMENT

By clicking "Accept," you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and Community Guidelines. You understand that violation of these terms may result in immediate account suspension.

You also acknowledge that CampusKinect has a zero-tolerance policy for objectionable content and that the platform actively moderates content to maintain a safe educational environment.

REMEMBER: This platform is designed to enhance your university experience. Help us maintain a positive, safe, and respectful community for all students.`}
              
              {/* Footer Navigation */}
              <div className="border-t border-gray-600 pt-8 mt-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-400">
                    Last updated: September 27, 2025
                  </div>
                  <div className="flex items-center">
                    <Link 
                      href="/auth/login" 
                      className="text-primary hover:text-primary-600 font-medium text-sm transition-colors duration-200"
                    >
                      Login
                    </Link>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Link 
                      href="/auth/register" 
                      className="text-primary hover:text-primary-600 font-medium text-sm transition-colors duration-200"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 