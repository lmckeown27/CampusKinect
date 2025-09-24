'use client';

import React, { useState } from 'react';
import { X, Shield, AlertTriangle } from 'lucide-react';

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'post' | 'message' | 'user';
  contentAuthor: string;
  onSubmit?: (reportData: ReportData) => Promise<void>;
}

interface ReportData {
  contentId: string;
  contentType: string;
  reason: string;
  details?: string;
}

const REPORT_REASONS = [
  {
    value: 'harassment',
    label: 'Harassment or Bullying',
    description: 'Targeting, intimidating, or bullying behavior'
  },
  {
    value: 'hate_speech',
    label: 'Hate Speech or Discrimination',
    description: 'Content that attacks or discriminates against individuals or groups'
  },
  {
    value: 'spam',
    label: 'Spam or Unwanted Content',
    description: 'Repetitive, irrelevant, or promotional content'
  },
  {
    value: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Content that violates community guidelines'
  },
  {
    value: 'scam',
    label: 'Scam or Fraud',
    description: 'Fraudulent offers or deceptive practices'
  },
  {
    value: 'violence',
    label: 'Violence or Threats',
    description: 'Threats of violence or promoting harmful activities'
  },
  {
    value: 'sexual_content',
    label: 'Sexual or Suggestive Content',
    description: 'Sexually explicit or suggestive material'
  },
  {
    value: 'false_information',
    label: 'False or Misleading Information',
    description: 'Deliberately false or misleading information'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other violations not listed above'
  }
];

const ReportContentModal: React.FC<ReportContentModalProps> = ({
  isOpen,
  onClose,
  contentId,
  contentType,
  contentAuthor,
  onSubmit
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) return;

    setIsSubmitting(true);

    try {
      const reportData: ReportData = {
        contentId,
        contentType,
        reason: selectedReason,
        details: additionalDetails.trim() || undefined
      };

      if (onSubmit) {
        await onSubmit(reportData);
      } else {
        // Default API call if no custom onSubmit provided
        const response = await fetch('/api/v1/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(reportData)
        });

        if (!response.ok) {
          throw new Error('Failed to submit report');
        }
      }

      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        onClose();
        // Reset form
        setSelectedReason('');
        setAdditionalDetails('');
      }, 2000);

    } catch (error) {
      console.error('Failed to submit report:', error);
      // You could show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Report Submitted</h3>
            <p className="text-sm text-gray-500">
              Thank you for helping keep CampusKinect safe. Our moderation team will review this report within 24 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Report {contentType}</h2>
              <p className="text-sm text-gray-500">Help us keep CampusKinect safe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Content Info */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Reporting {contentType} by:</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900">{contentAuthor}</p>
            </div>
          </div>

          {/* Report Reasons */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Why are you reporting this {contentType}?
            </h3>
            <div className="space-y-3">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedReason === reason.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{reason.label}</p>
                    <p className="text-sm text-gray-500">{reason.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-6">
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Provide any additional context that might help our moderation team.
            </p>
            <textarea
              id="details"
              rows={4}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional: Provide additional context..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1">
              {additionalDetails.length}/1000 characters
            </p>
          </div>

          {/* Warning */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Report Policy</p>
                <p className="text-sm text-blue-700 mt-1">
                  False reports may result in action against your account. We review all reports within 24 hours and take appropriate action against violating content and users.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedReason || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportContentModal; 