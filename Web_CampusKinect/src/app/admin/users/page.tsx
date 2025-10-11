'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Building2, Search, Eye, Ban, 
  UserCheck, Mail, MapPin, GraduationCap, Calendar, 
  FileText, MessageSquare, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../../services/api';
import { useAuthStore } from '../../../stores/authStore';
import MainLayout from '../../../components/layout/MainLayout';

interface University {
  id: number;
  name: string;
  domain: string;
  location: string;
  userCount: number;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  profilePicture: string;
  year: string;
  major: string;
  hometown: string;
  bio: string;
  isActive: boolean;
  isVerified: boolean;
  isBanned: boolean;
  banReason: string;
  createdAt: string;
  postCount: number;
  messageCount: number;
}

export default function AdminUsersManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Authorization check
  useEffect(() => {
    checkAdminAuthorization();
  }, []);

  const checkAdminAuthorization = async () => {
    try {
      if (!user) {
        router.push('/home');
        return;
      }
      
      const isAuthorizedAdmin = user.email === 'lmckeown@calpoly.edu' || user.username === 'liam_mckeown38';
      
      if (!isAuthorizedAdmin) {
        router.push('/home');
        return;
      }

      setIsAuthorized(true);
      loadUniversities();
    } catch (error) {
      console.error('Authorization error:', error);
      router.push('/home');
    }
  };

  const loadUniversities = async () => {
    try {
      setLoading(true);
      const data = await apiService.adminGetAllUniversities();
      setUniversities(data);
    } catch (error) {
      console.error('Failed to load universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUniversityUsers = async (university: University, page: number = 1) => {
    try {
      setLoadingUsers(true);
      setSelectedUniversity(university);
      const response = await apiService.adminGetUniversityUsers(university.id, page, 50);
      setUsers(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Failed to load university users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleViewUserProfile = (userId: string) => {
    router.push(`/admin/users/profile/${userId}`);
  };

  const handleBackToUniversities = () => {
    setSelectedUniversity(null);
    setUsers([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUniversities = universities.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#708d81' }}></div>
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
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => selectedUniversity ? handleBackToUniversities() : router.push('/admin')}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft size={24} style={{ color: '#ffffff' }} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                    {selectedUniversity ? selectedUniversity.name : 'User Management'}
                  </h1>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>
                    {selectedUniversity 
                      ? `${selectedUniversity.userCount} users • ${selectedUniversity.location}` 
                      : 'View all users by university'}
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder={selectedUniversity ? "Search users by name, username, or email..." : "Search universities..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  borderColor: '#525252',
                  border: '1px solid'
                }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#708d81' }}></div>
              <p style={{ color: '#9ca3af' }}>Loading...</p>
            </div>
          ) : selectedUniversity ? (
            // Users List View
            <div className="space-y-4">
              {loadingUsers ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#708d81' }}></div>
                  <p style={{ color: '#9ca3af' }}>Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
                  <Users size={48} className="mx-auto mb-4" style={{ color: '#9ca3af' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>No Users Found</h3>
                  <p style={{ color: '#9ca3af' }}>
                    {searchQuery ? 'Try adjusting your search query.' : 'This university has no users yet.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* User Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="rounded-lg p-6"
                        style={{ 
                          backgroundColor: '#1a1a1a', 
                          border: `2px solid ${user.isBanned ? '#dc2626' : '#525252'}`
                        }}
                      >
                        {/* User Header */}
                        <div className="flex items-start space-x-4 mb-4">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.displayName}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div 
                              className="w-16 h-16 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: '#262626' }}
                            >
                              <Users size={32} style={{ color: '#708d81' }} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg truncate" style={{ color: '#ffffff' }}>
                              {user.displayName}
                            </h3>
                            <p className="text-sm truncate" style={{ color: '#9ca3af' }}>
                              @{user.username}
                            </p>
                            {user.isBanned && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Ban size={14} style={{ color: '#dc2626' }} />
                                <span className="text-xs font-semibold" style={{ color: '#dc2626' }}>
                                  BANNED
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail size={14} style={{ color: '#9ca3af' }} />
                            <span className="truncate" style={{ color: '#9ca3af' }}>{user.email}</span>
                          </div>
                          {user.major && (
                            <div className="flex items-center space-x-2">
                              <GraduationCap size={14} style={{ color: '#9ca3af' }} />
                              <span className="truncate" style={{ color: '#9ca3af' }}>{user.major}</span>
                            </div>
                          )}
                          {user.year && (
                            <div className="flex items-center space-x-2">
                              <Calendar size={14} style={{ color: '#9ca3af' }} />
                              <span style={{ color: '#9ca3af' }}>{user.year}</span>
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between mb-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <FileText size={14} style={{ color: '#3b82f6' }} />
                            <span style={{ color: '#ffffff' }}>{user.postCount}</span>
                            <span style={{ color: '#9ca3af' }}>posts</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare size={14} style={{ color: '#8b5cf6' }} />
                            <span style={{ color: '#ffffff' }}>{user.messageCount}</span>
                            <span style={{ color: '#9ca3af' }}>messages</span>
                          </div>
                          {user.isVerified && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle size={14} style={{ color: '#10b981' }} />
                              <span style={{ color: '#10b981' }}>Verified</span>
                            </div>
                          )}
                        </div>

                        {/* View Profile Button */}
                        <button
                          onClick={() => handleViewUserProfile(user.id)}
                          className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                          style={{ backgroundColor: '#708d81', color: '#ffffff' }}
                        >
                          <Eye size={16} />
                          <span>View Profile</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-6">
                      <button
                        onClick={() => loadUniversityUsers(selectedUniversity, currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                        style={{ backgroundColor: '#708d81', color: '#ffffff' }}
                      >
                        Previous
                      </button>
                      <span style={{ color: '#ffffff' }}>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => loadUniversityUsers(selectedUniversity, currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                        style={{ backgroundColor: '#708d81', color: '#ffffff' }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            // Universities List View
            <div className="space-y-4">
              {filteredUniversities.length === 0 ? (
                <div className="text-center py-12 rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
                  <Building2 size={48} className="mx-auto mb-4" style={{ color: '#9ca3af' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>No Universities Found</h3>
                  <p style={{ color: '#9ca3af' }}>Try adjusting your search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUniversities.map((university) => (
                    <button
                      key={university.id}
                      onClick={() => loadUniversityUsers(university)}
                      className="rounded-lg p-6 text-left transition-all hover:opacity-80"
                      style={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '2px solid #525252'
                      }}
                    >
                      <div className="mb-4">
                        <h3 className="font-bold text-lg mb-2" style={{ color: '#ffffff' }}>
                          {university.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin size={14} style={{ color: '#9ca3af' }} />
                          <span className="truncate" style={{ color: '#9ca3af' }}>
                            {university.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#525252' }}>
                        <div className="flex items-center space-x-2">
                          <Users size={20} style={{ color: '#708d81' }} />
                          <span className="font-semibold text-xl" style={{ color: '#ffffff' }}>
                            {university.userCount}
                          </span>
                          <span className="text-sm" style={{ color: '#9ca3af' }}>
                            {university.userCount === 1 ? 'user' : 'users'}
                          </span>
                        </div>
                        <Eye size={20} style={{ color: '#708d81' }} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

