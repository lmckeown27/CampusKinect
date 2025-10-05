'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Flag, Users, TrendingUp, FileText, MessageSquare, 
  UserPlus, CheckCircle, RefreshCw, ShieldOff, AlertTriangle,
  Ban, UserCheck, Clock, ChevronRight, X
} from 'lucide-react';
import { apiService } from '../../services/api';
import { ContentReport } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import MainLayout from '../../components/layout/MainLayout';

interface AnalyticsData {
  totalPosts: number;
  totalMessages: number;
  activeUsers: number;
  newUsersToday: number;
  postsToday: number;
  messagesPerDay: number;
  topUniversities: Array<{ id: number; name: string; userCount: number }>;
  contentTrends: Array<{ date: string; posts: number; messages: number }>;
  userActivity: {
    activeUsersLast7Days: number;
    newSignupsLast7Days: number;
  } | null;
}

interface BannedUser {
  id: string;
  username: string;
  email: string;
  bannedAt: string;
  banReason: string;
  university: string;
}

type AdminTab = 'analytics' | 'reports' | 'users';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [refreshing, setRefreshing] = useState(false);
  const [showAllUniversities, setShowAllUniversities] = useState(false);

  // Authorization check
  useEffect(() => {
    checkAdminAuthorization();
  }, []);

  const checkAdminAuthorization = async () => {
    try {
      setAuthLoading(true);
      
      if (!user) {
        window.location.href = '/home';
        return;
      }
      
      const isAuthorizedAdmin = user.email === 'lmckeown@calpoly.edu' || user.username === 'liam_mckeown38';
      
      if (!isAuthorizedAdmin) {
        window.location.href = '/home';
        return;
      }

      setIsAuthorized(true);
      setAuthLoading(false);
      loadAllData();
    } catch (error) {
      console.error('Authorization error:', error);
      window.location.href = '/home';
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAnalyticsData(),
        loadReportsData(),
        loadBannedUsers()
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const data = await apiService.getAnalyticsData();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadReportsData = async () => {
    try {
      const response = await apiService.getPendingReports();
      setReports(response.data || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const loadBannedUsers = async () => {
    try {
      const response = await apiService.getBannedUsers();
      setBannedUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load banned users:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to unban this user? They will be able to access the platform again.')) {
      return;
    }
    
    try {
      await apiService.unbanUser(userId);
      await loadBannedUsers();
    } catch (error) {
      console.error('Failed to unban user:', error);
      alert('Failed to unban user. Please try again.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#708d81' }}></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div className="text-center p-8">
          <ShieldOff size={60} className="mx-auto mb-4" style={{ color: '#dc2626' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>Access Denied</h2>
          <p className="mb-4" style={{ color: '#9ca3af' }}>You don't have permission to access the admin dashboard.</p>
          <button
            onClick={() => window.location.href = '/home'}
            className="px-6 py-2 rounded-lg font-medium"
            style={{ backgroundColor: '#708d81', color: '#ffffff' }}
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#000000', paddingBottom: '100px' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 border-b" style={{ backgroundColor: '#000000', borderColor: '#525252' }}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Admin Dashboard</h1>
                <p className="text-sm" style={{ color: '#9ca3af' }}>CampusKinect Management Console</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all"
                style={{ 
                  backgroundColor: '#708d81', 
                  color: '#ffffff',
                  opacity: refreshing ? 0.5 : 1
                }}
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
            
            {/* Tab Navigation - Matching iOS order */}
            <nav className="flex space-x-1 overflow-x-auto">
              {[
                { id: 'analytics' as AdminTab, name: 'Analytics', icon: BarChart3 },
                { id: 'reports' as AdminTab, name: 'Reports', icon: Flag },
                { id: 'users' as AdminTab, name: 'Users', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: activeTab === tab.id ? '#708d81' : 'transparent',
                    color: activeTab === tab.id ? '#ffffff' : '#9ca3af',
                    border: `2px solid ${activeTab === tab.id ? '#708d81' : 'transparent'}`
                  }}
                >
                  <tab.icon size={18} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#708d81' }}></div>
              <p style={{ color: '#9ca3af' }}>Loading {activeTab}...</p>
            </div>
          ) : (
            <>
              {/* Analytics Tab - FIRST (matches iOS) */}
              {activeTab === 'analytics' && analytics && (
                <div className="space-y-6">
                  {/* Platform Statistics */}
                  <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1a1a' }}>
                    <h2 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>Platform Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#262626', border: '1px solid #525252' }}>
                        <div className="flex items-center space-x-3">
                          <FileText size={32} style={{ color: '#3b82f6' }} />
                          <div>
                            <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{analytics.totalPosts}</p>
                            <p className="text-sm" style={{ color: '#9ca3af' }}>Total Posts</p>
                            <p className="text-xs" style={{ color: '#10b981' }}>+{analytics.postsToday} today</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg p-4" style={{ backgroundColor: '#262626', border: '1px solid #525252' }}>
                        <div className="flex items-center space-x-3">
                          <MessageSquare size={32} style={{ color: '#8b5cf6' }} />
                          <div>
                            <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{analytics.totalMessages}</p>
                            <p className="text-sm" style={{ color: '#9ca3af' }}>Total Messages</p>
                            <p className="text-xs" style={{ color: '#10b981' }}>{analytics.messagesPerDay} avg/day</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg p-4" style={{ backgroundColor: '#262626', border: '1px solid #525252' }}>
                        <div className="flex items-center space-x-3">
                          <Users size={32} style={{ color: '#10b981' }} />
                          <div>
                            <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{analytics.activeUsers}</p>
                            <p className="text-sm" style={{ color: '#9ca3af' }}>Active Users</p>
                            <p className="text-xs" style={{ color: '#10b981' }}>+{analytics.newUsersToday} new today</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg p-4" style={{ backgroundColor: '#262626', border: '1px solid #525252' }}>
                        <div className="flex items-center space-x-3">
                          <UserPlus size={32} style={{ color: '#f59e0b' }} />
                          <div>
                            <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{analytics.newUsersToday}</p>
                            <p className="text-sm" style={{ color: '#9ca3af' }}>New Users Today</p>
                            <p className="text-xs" style={{ color: '#9ca3af' }}>Daily signups</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Universities */}
                  <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1a1a' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>Top Universities</h2>
                      {analytics.topUniversities && analytics.topUniversities.length > 0 && (
                        <button 
                          onClick={() => setShowAllUniversities(true)}
                          className="flex items-center space-x-1 text-sm font-medium transition-colors hover:opacity-80" 
                          style={{ color: '#708d81' }}
                        >
                          <span>View All</span>
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                    
                    {analytics.topUniversities && analytics.topUniversities.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.topUniversities.slice(0, 5).map((university, index) => {
                          const maxCount = analytics.topUniversities[0]?.userCount || 1;
                          const percentage = (university.userCount / maxCount) * 100;
                          
                          return (
                            <div key={university.id} className="flex items-center space-x-4">
                              <span className="text-lg font-bold w-8" style={{ color: '#9ca3af' }}>#{index + 1}</span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium" style={{ color: '#ffffff' }}>{university.name}</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}>
                                      ID: {university.id}
                                    </span>
                                    <span className="text-sm" style={{ color: '#9ca3af' }}>
                                      {university.userCount} {university.userCount === 1 ? 'user' : 'users'}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full rounded-full h-2" style={{ backgroundColor: '#262626' }}>
                                  <div
                                    className="h-2 rounded-full transition-all"
                                    style={{ 
                                      width: `${percentage}%`,
                                      backgroundColor: '#708d81'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {analytics.topUniversities.length > 5 && (
                          <p className="text-center text-xs pt-2" style={{ color: '#9ca3af' }}>
                            + {analytics.topUniversities.length - 5} more universities
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-center py-8" style={{ color: '#9ca3af' }}>No university data available</p>
                    )}
                  </div>

                  {/* Content Trends (Last 7 Days) */}
                  <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1a1a' }}>
                    <h2 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>Content Trends (Last 7 Days)</h2>
                    
                    {analytics.contentTrends && analytics.contentTrends.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.contentTrends.slice(-7).map((trend, index) => {
                          const date = new Date(trend.date);
                          const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
                          
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center space-x-4">
                                <span className="text-xs font-medium w-12" style={{ color: '#9ca3af' }}>
                                  {formattedDate}
                                </span>
                                <div className="flex-1 space-y-1">
                                  {/* Posts bar */}
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="h-2 rounded transition-all"
                                      style={{
                                        width: `${Math.max(trend.posts * 2, 8)}px`,
                                        backgroundColor: '#3b82f6'
                                      }}
                                    />
                                    <span className="text-xs" style={{ color: '#9ca3af' }}>
                                      {trend.posts} posts
                                    </span>
                                  </div>
                                  {/* Messages bar */}
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="h-2 rounded transition-all"
                                      style={{
                                        width: `${Math.max(trend.messages * 0.5, 8)}px`,
                                        backgroundColor: '#8b5cf6'
                                      }}
                                    />
                                    <span className="text-xs" style={{ color: '#9ca3af' }}>
                                      {trend.messages} messages
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center py-8" style={{ color: '#9ca3af' }}>No trend data available</p>
                    )}
                  </div>

                  {/* User Activity (Last 7 Days) */}
                  <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1a1a' }}>
                    <h2 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>User Activity (Last 7 Days)</h2>
                    
                    <div className="space-y-4">
                      {/* Active Users */}
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium w-24" style={{ color: '#ffffff' }}>
                          Active Users
                        </span>
                        <div className="flex items-center space-x-2 flex-1">
                          <div
                            className="h-5 rounded transition-all"
                            style={{
                              width: `${Math.max((analytics.userActivity?.activeUsersLast7Days || 0) * 20, 8)}px`,
                              backgroundColor: '#10b981'
                            }}
                          />
                          <span className="text-xs" style={{ color: '#9ca3af' }}>
                            {analytics.userActivity?.activeUsersLast7Days || 0} active users
                          </span>
                        </div>
                      </div>

                      {/* New Signups */}
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium w-24" style={{ color: '#ffffff' }}>
                          New Signups
                        </span>
                        <div className="flex items-center space-x-2 flex-1">
                          <div
                            className="h-5 rounded transition-all"
                            style={{
                              width: `${Math.max((analytics.userActivity?.newSignupsLast7Days || 0) * 20, 8)}px`,
                              backgroundColor: '#3b82f6'
                            }}
                          />
                          <span className="text-xs" style={{ color: '#9ca3af' }}>
                            {analytics.userActivity?.newSignupsLast7Days || 0} new signups
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reports Tab - SECOND (matches iOS) */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1a1a' }}>
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>Content Reports</h2>
                    <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
                      All reports must be resolved within 24 hours
                    </p>
                    
                    {reports.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#10b981' }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>No Pending Reports</h3>
                        <p style={{ color: '#9ca3af' }}>All content reports have been resolved.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reports.map((report) => {
                          const createdDate = new Date(report.createdAt);
                          const hoursElapsed = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60));
                          const hoursRemaining = 24 - hoursElapsed;
                          const isUrgent = hoursRemaining <= 4;
                          const isOverdue = hoursRemaining <= 0;
                          
                          return (
                            <div
                              key={report.id}
                              className="rounded-lg p-4"
                              style={{
                                backgroundColor: isUrgent ? '#7f1d1d' : '#262626',
                                border: `2px solid ${isOverdue ? '#dc2626' : isUrgent ? '#f59e0b' : '#525252'}`
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Flag size={16} style={{ color: '#f59e0b' }} />
                                    <span className="font-medium" style={{ color: '#ffffff' }}>
                                      Report #{String(report.id).slice(-8)}
                                    </span>
                                    <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}>
                                      {report.contentType}
                                    </span>
                                  </div>
                                  
                                  <p className="text-sm mb-2" style={{ color: '#9ca3af' }}>
                                    <strong>Reason:</strong> {report.reason.replace(/_/g, ' ')}
                                  </p>
                                  
                                  {report.details && (
                                    <p className="text-sm mb-2" style={{ color: '#9ca3af' }}>
                                      <strong>Details:</strong> {report.details}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center space-x-4 text-xs" style={{ color: '#9ca3af' }}>
                                    <span className="flex items-center space-x-1">
                                      <Clock size={12} />
                                      <span>{createdDate.toLocaleDateString()}</span>
                                    </span>
                                    <span className={`font-bold ${isOverdue ? 'text-red-500' : isUrgent ? 'text-orange-500' : ''}`}>
                                      {isOverdue ? 'OVERDUE' : `${hoursRemaining}h remaining`}
                                    </span>
                                    {isUrgent && !isOverdue && (
                                      <span className="flex items-center space-x-1 text-orange-500">
                                        <AlertTriangle size={12} />
                                        <span>URGENT</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col space-y-2 ml-4">
                                  <button
                                    className="px-3 py-1 rounded text-xs font-medium whitespace-nowrap"
                                    style={{ backgroundColor: '#708d81', color: '#ffffff' }}
                                  >
                                    Review
                                  </button>
                                  <button
                                    className="px-3 py-1 rounded text-xs font-medium whitespace-nowrap"
                                    style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                                  >
                                    Remove
                                  </button>
                                  <button
                                    className="px-3 py-1 rounded text-xs font-medium whitespace-nowrap"
                                    style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Users Tab - THIRD (matches iOS) */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1a1a' }}>
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>Banned Users</h2>
                    <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
                      Manage banned users and review ban reasons
                    </p>
                    
                    {bannedUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <UserCheck size={48} className="mx-auto mb-4" style={{ color: '#10b981' }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>No Banned Users</h3>
                        <p style={{ color: '#9ca3af' }}>All users are currently in good standing.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bannedUsers.map((user) => (
                          <div
                            key={user.id}
                            className="rounded-lg p-4 flex items-start justify-between"
                            style={{ backgroundColor: '#262626', border: '1px solid #525252' }}
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Ban size={16} style={{ color: '#dc2626' }} />
                                <span className="font-bold" style={{ color: '#ffffff' }}>{user.username}</span>
                              </div>
                              <p className="text-sm mb-1" style={{ color: '#9ca3af' }}>{user.email}</p>
                              <p className="text-sm mb-1" style={{ color: '#9ca3af' }}>
                                <strong>University:</strong> {user.university}
                              </p>
                              <p className="text-sm mb-1" style={{ color: '#9ca3af' }}>
                                <strong>Reason:</strong> {user.banReason}
                              </p>
                              <p className="text-xs" style={{ color: '#71717a' }}>
                                Banned on {new Date(user.bannedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleUnbanUser(user.id)}
                              className="px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                              style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                            >
                              Unban User
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* All Universities Modal */}
      {showAllUniversities && analytics && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAllUniversities(false)}
        >
          <div 
            className="rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            style={{ backgroundColor: '#1a1a1a' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#525252' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#ffffff' }}>All Universities</h2>
              <button
                onClick={() => setShowAllUniversities(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X size={24} style={{ color: '#ffffff' }} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="grid grid-cols-2 gap-4 p-6 rounded-lg" style={{ backgroundColor: '#262626' }}>
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#9ca3af' }}>Total Universities</p>
                    <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>
                      {analytics.topUniversities.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#9ca3af' }}>Total Users</p>
                    <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>
                      {analytics.topUniversities.reduce((sum, u) => sum + u.userCount, 0)}
                    </p>
                  </div>
                </div>

                {/* All Universities List */}
                <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#262626' }}>
                  {analytics.topUniversities
                    .sort((a, b) => b.userCount - a.userCount)
                    .map((university, index) => {
                      const totalUsers = analytics.topUniversities.reduce((sum, u) => sum + u.userCount, 0);
                      const percentage = totalUsers > 0 ? (university.userCount / totalUsers) * 100 : 0;
                      
                      const getRankColor = (rank: number) => {
                        switch (rank) {
                          case 1: return '#eab308'; // gold/yellow
                          case 2: return '#9ca3af'; // silver/gray
                          case 3: return '#f97316'; // bronze/orange
                          default: return '#3b82f6'; // blue
                        }
                      };

                      const rankColor = getRankColor(index + 1);

                      return (
                        <div key={university.id}>
                          <div className="p-4 hover:bg-gray-700 transition-colors">
                            <div className="flex items-center space-x-4">
                              {/* Rank Badge */}
                              <div
                                className="flex items-center justify-center w-11 h-11 rounded-full font-bold"
                                style={{
                                  backgroundColor: `${rankColor}33`,
                                  color: rankColor
                                }}
                              >
                                #{index + 1}
                              </div>

                              {/* University Info */}
                              <div className="flex-1">
                                <h3 className="font-semibold text-base mb-1" style={{ color: '#ffffff' }}>
                                  {university.name}
                                </h3>
                                <div className="flex items-center space-x-2 text-xs">
                                  <span 
                                    className="px-2 py-0.5 rounded font-medium"
                                    style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}
                                  >
                                    ID: {university.id}
                                  </span>
                                  <Users size={12} style={{ color: '#9ca3af' }} />
                                  <span style={{ color: '#9ca3af' }}>
                                    {university.userCount} {university.userCount === 1 ? 'user' : 'users'}
                                  </span>
                                  <span style={{ color: '#9ca3af' }}>•</span>
                                  <span style={{ color: '#9ca3af' }}>
                                    {percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </div>

                              {/* User Count and Progress Bar */}
                              <div className="flex flex-col items-end space-y-2">
                                <p className="text-xl font-semibold" style={{ color: '#ffffff' }}>
                                  {university.userCount}
                                </p>
                                <div className="w-20 h-1 rounded-full" style={{ backgroundColor: '#525252' }}>
                                  <div
                                    className="h-1 rounded-full transition-all"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: rankColor
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          {index < analytics.topUniversities.length - 1 && (
                            <div className="h-px mx-4" style={{ backgroundColor: '#525252' }} />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t" style={{ borderColor: '#525252' }}>
              <button
                onClick={() => setShowAllUniversities(false)}
                className="w-full py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#708d81', color: '#ffffff' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}