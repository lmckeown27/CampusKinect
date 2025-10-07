'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Eye, RefreshCw, Building, Search, X, Check } from 'lucide-react';
import { apiService } from '../../services/api';

interface University {
  id: number;
  name: string;
  domain: string;
}

export default function GuestUniversityBanner() {
  const { guestUniversityName, guestUniversityId, enterGuestMode } = useAuthStore();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showSwitcher) {
      loadUniversities();
    }
  }, [showSwitcher]);

  const loadUniversities = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.fetchUniversities();
      setUniversities(response.data);
    } catch (error) {
      console.error('Failed to load universities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUniversity = (university: University) => {
    enterGuestMode(university.id, university.name);
    setShowSwitcher(false);
    setSearchTerm('');
  };

  return (
    <>
      {/* Banner */}
      <div className="bg-blue-900 bg-opacity-20 border-2 border-blue-500 rounded-lg px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Status */}
          <div className="flex items-center">
            <Eye size={20} className="text-blue-400 mr-3" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Browsing as Guest</p>
              <p className="text-sm text-white font-semibold">{guestUniversityName}</p>
            </div>
          </div>

          {/* Right Side - Switch Button */}
          <button
            onClick={() => setShowSwitcher(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            <span>Switch</span>
          </button>
        </div>
      </div>

      {/* University Switcher Modal */}
      {showSwitcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setShowSwitcher(false)}>
          <div 
            className="bg-grey-light rounded-xl shadow-2xl w-full max-w-2xl mx-4 border-2 border-[#708d81] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-600">
              <h2 className="text-2xl font-bold text-white">Switch University</h2>
              <button
                onClick={() => setShowSwitcher(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Current Selection */}
            {guestUniversityName && (
              <div className="px-6 pt-4 pb-2">
                <div className="bg-[#708d81] bg-opacity-20 border border-[#708d81] rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Currently Viewing</p>
                  <p className="text-sm font-semibold text-[#708d81]">{guestUniversityName}</p>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="px-6 py-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search universities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#708d81]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Universities List */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#708d81]"></div>
                </div>
              ) : filteredUniversities.length === 0 ? (
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400 font-medium">No universities found</p>
                  <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUniversities.map((university) => {
                    const isSelected = university.id === guestUniversityId;
                    return (
                      <button
                        key={university.id}
                        onClick={() => handleSelectUniversity(university)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-[#708d81] bg-opacity-20 border-2 border-[#708d81]'
                            : 'bg-gray-700 border-2 border-transparent hover:bg-gray-600'
                        }`}
                      >
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-[#708d81]' : 'bg-[#708d81] bg-opacity-30'
                        }`}>
                          {isSelected ? (
                            <Check size={24} className="text-white" />
                          ) : (
                            <Building size={24} className="text-[#708d81]" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left">
                          <p className="text-white font-semibold">{university.name}</p>
                          <p className="text-gray-400 text-sm">{university.domain}</p>
                        </div>

                        {/* Badge */}
                        {isSelected && (
                          <div className="bg-[#708d81] bg-opacity-30 text-[#708d81] px-3 py-1 rounded-full text-xs font-medium">
                            Current
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
