'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';

interface University {
  id: number;
  name: string;
  domain: string;
  city: string | null;
  state: string | null;
  country: string;
}

interface UniversitySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (university: University) => void;
}

export default function UniversitySelectModal({ isOpen, onClose, onSelect }: UniversitySelectModalProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUniversities();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUniversities(universities);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = universities.filter(uni =>
        uni.name.toLowerCase().includes(query) ||
        uni.city?.toLowerCase().includes(query) ||
        uni.state?.toLowerCase().includes(query)
      );
      setFilteredUniversities(filtered);
    }
  }, [searchQuery, universities]);

  const fetchUniversities = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://campuskinect.net/api/v1/guest/universities');
      if (!response.ok) throw new Error('Failed to fetch universities');
      
      const data = await response.json();
      setUniversities(data.data);
      setFilteredUniversities(data.data);
    } catch (err) {
      setError('Failed to load universities. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (university: University) => {
    onSelect(university);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-grey-light rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col border-2 border-[#708d81]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div>
            <h2 className="text-2xl font-bold text-white">Select Your University</h2>
            <p className="text-gray-300 text-sm mt-1">Browse posts from your campus community</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-600">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search universities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-grey-medium border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#708d81]"
              autoFocus
            />
          </div>
        </div>

        {/* University List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#708d81]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchUniversities}
                className="px-4 py-2 bg-[#708d81] text-white rounded-lg hover:bg-[#5a7166] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredUniversities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No universities found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUniversities.map((university) => (
                <button
                  key={university.id}
                  onClick={() => handleSelect(university)}
                  className="w-full flex items-center justify-between p-4 bg-grey-medium hover:bg-gray-600 rounded-lg transition-colors text-left border border-gray-600 hover:border-[#708d81]"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{university.name}</h3>
                    {(university.city || university.state) && (
                      <div className="flex items-center text-gray-400 text-sm mt-1">
                        <MapPin size={14} className="mr-1" />
                        <span>
                          {university.city}{university.city && university.state && ', '}{university.state}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 px-4 py-2 bg-[#708d81] text-white text-sm font-medium rounded-lg">
                    Select
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-600 bg-grey-medium">
          <p className="text-gray-400 text-sm text-center">
            You'll be able to browse posts from this university. 
            <br />
            <span className="text-[#708d81]">Create an account to post and connect!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
