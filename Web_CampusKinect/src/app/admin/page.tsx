'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Clock, User, Flag, Ban, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import { ContentReport } from '../../types';

interface ModerationStats {
  pendingReports: number;
  resolvedToday: number;
  averageResponseTime: number;
  totalUsers: number;
  bannedUsers: number;
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkAdminAuthorization();
  }, []);

  const checkAdminAuthorization = async () => {
    try {
      setAuthLoading(true);
      
      // Check if user is logged in and is the authorized admin
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        // Redirect to home without any indication
        window.location.href = '/home';
        return;
      }

      const user = JSON.parse(userStr);
      const isAuthorizedAdmin = user.email === 'lmckeown@calpoly.edu' || user.username === 'liam_mckeown38';
      
      if (!isAuthorizedAdmin) {
        // Silently redirect to home - no indication admin page exists
        window.location.href = '/home';
        return;
      }

      setIsAuthorized(true);
      setAuthLoading(false);
      
      // Only load moderation data if authorized
      loadModerationData();
    } catch (error) {
      console.error('Error checking admin authorization:', error);
      // Redirect on any error
      window.location.href = '/home';
    }
  };

  const loadModerationData = async () => {
    try {
      setLoading(true);
      // Load pending reports and moderation stats
      const [reportsResponse, statsResponse] = await Promise.all([
        apiService.getPendingReports(),
        apiService.getModerationStats()
      ]);
      
      setReports(reportsResponse.data);
      setStats(statsResponse);
    } catch (error) {
      console.error('Failed to load moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'dismiss', moderatorNotes?: string) => {
    try {
      setActionLoading(true);
      await apiService.moderateReport(reportId, action, moderatorNotes);
      
      // Refresh data
      await loadModerationData();
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to moderate report:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      setActionLoading(true);
      await apiService.banUser(userId, reason);
      
      // Refresh data
      await loadModerationData();
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to ban user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) {
    // Show a generic loading screen that doesn't indicate what's being loaded
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authorized, the user will have been redirected already
  // This should never render for unauthorized users

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading moderation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Moderation Dashboard</h1>
              <p className="text-gray-600">Apple Guideline 1.2 Compliance - 24 Hour Response System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Flag className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolvedToday}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageResponseTime}h</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Ban className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Banned Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bannedUsers}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pending Content Reports</h2>
            <p className="text-sm text-gray-600">All reports must be resolved within 24 hours per Apple guidelines</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => {
                  const hoursRemaining = 24 - Math.floor((Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60));
                  const isUrgent = hoursRemaining <= 4;
                  
                  return (
                    <tr key={report.id} className={isUrgent ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Report #{report.id.slice(-8)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {report.contentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {report.reason.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                          {hoursRemaining > 0 ? `${hoursRemaining}h remaining` : 'OVERDUE'}
                        </div>
                        {isUrgent && (
                          <div className="flex items-center text-xs text-red-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgent
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-primary hover:text-primary-600 mr-4"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleReportAction(report.id, 'approve', 'Content removed for policy violation')}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900 mr-4"
                        >
                          Remove Content
                        </button>
                        <button
                          onClick={() => handleReportAction(report.id, 'dismiss', 'Report reviewed - no violation found')}
                          disabled={actionLoading}
                          className="text-green-600 hover:text-green-900"
                        >
                          Dismiss
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {reports.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reports</h3>
              <p className="mt-1 text-sm text-gray-500">All content reports have been resolved.</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Content Report Details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Report ID</label>
                  <p className="text-sm text-gray-900">{selectedReport.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content Type</label>
                  <p className="text-sm text-gray-900">{selectedReport.contentType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <p className="text-sm text-gray-900">{selectedReport.reason.replace('_', ' ')}</p>
                </div>
                
                {selectedReport.details && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Additional Details</label>
                    <p className="text-sm text-gray-900">{selectedReport.details}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reported At</label>
                  <p className="text-sm text-gray-900">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleReportAction(selectedReport.id, 'approve', 'Content removed for policy violation')}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Remove Content & Ban User'}
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport.id, 'dismiss', 'Report reviewed - no violation found')}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Dismiss Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 