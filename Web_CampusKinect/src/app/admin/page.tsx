'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Flag, Users, TrendingUp, FileText, MessageSquare, 
  UserPlus, CheckCircle, RefreshCw, ShieldOff, AlertTriangle,
  Ban, UserCheck, Clock, ChevronRight
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
  userActivity: Array<{ date: string; activeUsers: number }>;
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
                      {analytics.topUniversities && analytics.topUniversities.length > 5 && (
                        <button className="flex items-center space-x-1 text-sm font-medium" style={{ color: '#708d81' }}>
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
    </MainLayout>
  );
}