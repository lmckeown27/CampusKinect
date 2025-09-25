'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Flag } from 'lucide-react';
import { CreateReportForm } from '../../types';
import { apiService } from '../../services/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'post' | 'message' | 'user';
  contentTitle?: string;
  onReportSubmitted?: () => void;
}

const REPORT_REASONS = [
  { value: 'harassment', label: 'Harassment or Bullying', description: 'Targeting someone with unwanted behavior' },
  { value: 'hate_speech', label: 'Hate Speech', description: 'Content that attacks or demeans a group' },
  { value: 'spam', label: 'Spam', description: 'Repetitive, unwanted, or promotional content' },
  { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Content not suitable for this platform' },
  { value: 'scam', label: 'Scam or Fraud', description: 'Deceptive or fraudulent activity' },
  { value: 'violence', label: 'Violence or Threats', description: 'Content promoting or threatening violence' },
  { value: 'sexual_content', label: 'Sexual Content', description: 'Inappropriate sexual material' },
  { value: 'false_information', label: 'False Information', description: 'Misleading or false content' },
  { value: 'other', label: 'Other', description: 'Something else that violates community guidelines' }
] as const;

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  contentId,
  contentType,
  contentTitle,
  onReportSubmitted
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setError('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reportData: CreateReportForm = {
        contentId,
        contentType,
        reason: selectedReason as any,
        details: details.trim() || undefined
      };

      await apiService.reportContent(reportData);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        onReportSubmitted?.();
        // Reset form
        setSelectedReason('');
        setDetails('');
        setSuccess(false);
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form
      setSelectedReason('');
      setDetails('');
      setError(null);
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Flag size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Report Content</h2>
              <p className="text-sm text-gray-500">
                Help us keep the community safe
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Flag size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Submitted</h3>
              <p className="text-gray-600">
                Thank you for helping keep our community safe. We'll review this report within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Content Info */}
              {contentTitle && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Reporting {contentType}:</p>
                  <p className="font-medium text-gray-900 truncate">{contentTitle}</p>
                </div>
              )}

              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Why are you reporting this {contentType}? *
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason.value}
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedReason === reason.value
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="mt-1 text-red-600 focus:ring-red-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{reason.label}</div>
                        <div className="text-sm text-gray-600">{reason.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any additional context that might help us understand the issue..."
                  rows={4}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {details.length}/1000 characters
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedReason}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal; 