'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Clock, User, Flag, Ban, CheckCircle, XCircle, 
  BarChart3, TrendingUp, MessageSquare, FileText, Users, Activity,
  Calendar, Eye, UserCheck, UserX, Search, Filter, Download
} from 'lucide-react';
import { apiService } from '../../services/api';
import { ContentReport } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import MainLayout from '../../components/layout/MainLayout';

interface ModerationStats {
  pendingReports: number;
  resolvedToday: number;
  averageResponseTime: number;
  totalUsers: number;
  bannedUsers: number;
}

interface AnalyticsData {
  totalPosts: number;
  totalMessages: number;
  activeUsers: number;
  newUsersToday: number;
  postsToday: number;
  messagesPerDay: number;
  topUniversities: Array<{ name: string; userCount: number }>;
  contentTrends: Array<{ date: string; posts: number; messages: number }>;
  reportsByReason: Array<{ reason: string; count: number }>;
  userGrowth: Array<{ date: string; users: number }>;
}

interface BannedUser {
  id: string;
  username: string;
  email: string;
  bannedAt: string;
  banReason: string;
  university: string;
}

export default function AdminModerationPage() {
  console.log('🚨 ADMIN PAGE COMPONENT EXECUTING - TOP OF FUNCTION');
  const { user } = useAuthStore(); // Use the same user source as Profilebar
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'users' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('all');

  useEffect(() => {
    checkAdminAuthorization();
  }, []);

  const checkAdminAuthorization = async () => {
    try {
      console.log('🔍 ADMIN PAGE: Starting authorization check...');
      console.log('🔍 ADMIN PAGE: User from authStore:', user);
      setAuthLoading(true);
      
      // Check if user is logged in and is the authorized admin (use same source as Profilebar)
      if (!user) {
        console.log('❌ ADMIN PAGE: No user in authStore, redirecting to /home');
        window.location.href = '/home';
        return;
      }

      console.log('🔍 ADMIN PAGE: User email:', user.email);
      console.log('🔍 ADMIN PAGE: User username:', user.username);
      
      const isAuthorizedAdmin = user.email === 'lmckeown@calpoly.edu' || user.username === 'liam_mckeown38';
      console.log('🔍 ADMIN PAGE: Is authorized admin?', isAuthorizedAdmin);
      
      if (!isAuthorizedAdmin) {
        console.log('❌ ADMIN PAGE: User not authorized, redirecting to /home');
        window.location.href = '/home';
        return;
      }

      console.log('✅ ADMIN PAGE: User authorized, loading admin dashboard');
      setIsAuthorized(true);
      setAuthLoading(false);
      
      // Only load moderation data if authorized
      loadModerationData();
    } catch (error) {
      console.error('❌ ADMIN PAGE: Error checking admin authorization:', error);
      window.location.href = '/home';
    }
  };

  const loadModerationData = async () => {
    try {
      setLoading(true);
      // Load all admin data with fallbacks
      const [reportsResponse, statsResponse, analyticsResponse, bannedUsersResponse] = await Promise.all([
        apiService.getPendingReports().catch(() => ({ data: [] })),
        apiService.getModerationStats().catch(() => ({ pendingReports: 0, resolvedToday: 0, averageResponseTime: 0, totalUsers: 0, bannedUsers: 0 })),
        apiService.getAnalyticsData().catch(() => null),
        apiService.getBannedUsers().catch(() => ({ data: [] }))
      ]);
      
      setReports(reportsResponse.data || []);
      setStats(statsResponse);
      setAnalytics(analyticsResponse);
      setBannedUsers(bannedUsersResponse.data || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
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

  const handleUnbanUser = async (userId: string) => {
    try {
      setActionLoading(true);
      await apiService.unbanUser(userId);
      
      // Refresh data
      await loadModerationData();
    } catch (error) {
      console.error('Failed to unban user:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">CampusKinect Admin Dashboard</h1>
                  <p className="text-gray-600">Data Analytics & Content Moderation</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'reports', name: 'Content Reports', icon: Flag },
              { id: 'users', name: 'User Management', icon: Users },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Posts</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.totalPosts || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Messages</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.totalMessages || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.activeUsers || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">New Users Today</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.newUsersToday || 0}</p>
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

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Resolved {stats.resolvedToday} reports today</p>
                      <p className="text-xs text-gray-500">Average response time: {stats.averageResponseTime}h</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{stats.pendingReports} reports pending review</p>
                      <p className="text-xs text-gray-500">Must be resolved within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Reports</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Content Reports</h2>
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
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Banned Users</h2>
                <p className="text-sm text-gray-600">Manage banned users and review ban reasons</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        University
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ban Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Banned Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bannedUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.university}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.banReason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.bannedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUnbanUser(user.id)}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-900"
                          >
                            Unban User
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {bannedUsers.length === 0 && (
                <div className="text-center py-12">
                  <UserCheck className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No banned users</h3>
                  <p className="mt-1 text-sm text-gray-500">All users are in good standing.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Posts Today</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.postsToday}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Messages/Day</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.messagesPerDay}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.activeUsers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Universities */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Top Universities</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analytics.topUniversities?.map((uni, index) => (
                    <div key={uni.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm text-gray-900">{uni.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{uni.userCount} users</span>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">No university data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
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
    </MainLayout>
  );
} 