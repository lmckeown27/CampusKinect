'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, AlertTriangle, FileText, MessageSquare, User as UserIcon, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../../services/api';
import MainLayout from '../../../components/layout/MainLayout';

interface UserReport {
  id: number;
  contentId: string;
  contentType: 'post' | 'message' | 'user';
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  moderatorNotes?: string;
}

const MyReportsPage: React.FC = () => {
  const router = useRouter();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getUserReports();
      setReports(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        return diffInMins <= 1 ? 'Just now' : `${diffInMins} min ago`;
      }
      return diffInHours === 1 ? '1 hr ago' : `${diffInHours} hrs ago`;
    } else if (diffInDays === 1) {
      return '1 day ago';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} wk${weeks > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} mo${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} yr${years > 1 ? 's' : ''} ago`;
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'post':
        return <FileText size={16} className="text-blue-500" />;
      case 'message':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'user':
        return <UserIcon size={16} className="text-blue-500" />;
      default:
        return <FileText size={16} className="text-blue-500" />;
    }
  };

  const getContentTypeName = (contentType: string) => {
    switch (contentType) {
      case 'post':
        return 'Post';
      case 'message':
        return 'Chat';
      case 'user':
        return 'User';
      default:
        return contentType;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(251, 146, 60, 0.15)', text: '#fb923c' }; // orange
      case 'reviewed':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' }; // blue
      case 'resolved':
        return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' }; // green
      case 'dismissed':
        return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af' }; // gray
      default:
        return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af' };
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'reviewed':
        return 'Under Review';
      case 'resolved':
        return 'Resolved';
      case 'dismissed':
        return 'Dismissed';
      default:
        return status;
    }
  };

  const getReasonName = (reason: string) => {
    return reason.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#525252' }}>
        {/* Header */}
        <div className="border-b" style={{ backgroundColor: '#737373', borderColor: '#708d81' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 transition-colors duration-200 font-medium"
                style={{ color: '#708d81' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#a8c4a2'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#708d81'}
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">My Reports</h1>
                <p className="text-sm text-gray-300 mt-1">Track your submitted reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-lg shadow-lg" style={{ backgroundColor: '#737373' }}>
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#708d81' }}></div>
                <p className="text-gray-300">Loading your reports...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900 bg-opacity-20 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Error Loading Reports</h3>
                <p className="text-sm text-gray-300 mb-4">{error}</p>
                <button
                  onClick={loadReports}
                  className="px-4 py-2 rounded-md transition-colors"
                  style={{ backgroundColor: '#708d81', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a7268'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#708d81'}
                >
                  Try Again
                </button>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900 bg-opacity-20 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Reports</h3>
                <p className="text-sm text-gray-300 max-w-md mx-auto">
                  You haven't submitted any reports yet. When you report content, you can track its status here.
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ divideColor: '#525252' }}>
                {reports.map((report) => {
                  const statusColors = getStatusColor(report.status);
                  
                  return (
                    <div key={report.id} className="p-6">
                      <div className="space-y-3">
                        {/* Header - Status and Date */}
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-semibold px-3 py-1.5 rounded-md"
                            style={{
                              backgroundColor: statusColors.bg,
                              color: statusColors.text
                            }}
                          >
                            {getStatusName(report.status)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(report.createdAt)}
                          </span>
                        </div>

                        {/* Content Type */}
                        <div className="flex items-center space-x-2">
                          {getContentTypeIcon(report.contentType)}
                          <span className="text-sm font-medium text-white">
                            {getContentTypeName(report.contentType)}
                          </span>
                        </div>

                        {/* Reason */}
                        <p className="text-sm text-gray-300">
                          <span className="font-medium">Reason:</span> {getReasonName(report.reason)}
                        </p>

                        {/* Details */}
                        {report.details && report.details.trim() !== '' && (
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {report.details}
                          </p>
                        )}

                        {/* Moderator Notes */}
                        {report.status !== 'pending' && report.moderatorNotes && report.moderatorNotes.trim() !== '' && (
                          <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#525252' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: '#3b82f6' }}>
                              Admin Response:
                            </p>
                            <p className="text-sm text-gray-300">
                              {report.moderatorNotes}
                            </p>
                          </div>
                        )}

                        {/* Resolved Date */}
                        {report.resolvedAt && (
                          <p className="text-xs text-gray-500">
                            Resolved {formatTimeAgo(report.resolvedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 rounded-lg p-6" style={{ backgroundColor: '#737373', border: '2px solid #708d81' }}>
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 mt-0.5" style={{ color: '#708d81' }} />
              <div>
                <h3 className="font-medium text-white mb-2">About Your Reports</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>Report Status Meanings:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><span className="font-medium" style={{ color: '#fb923c' }}>Pending:</span> Awaiting admin review</li>
                    <li><span className="font-medium" style={{ color: '#3b82f6' }}>Under Review:</span> Being investigated by admins</li>
                    <li><span className="font-medium" style={{ color: '#22c55e' }}>Resolved:</span> Action taken on reported content</li>
                    <li><span className="font-medium" style={{ color: '#9ca3af' }}>Dismissed:</span> No action needed</li>
                  </ul>
                  <p className="mt-3">
                    Our team reviews all reports carefully. We'll update the status as we investigate and take appropriate action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MyReportsPage;
