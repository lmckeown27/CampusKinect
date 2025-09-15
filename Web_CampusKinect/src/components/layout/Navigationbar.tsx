'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, MessageCircle } from 'lucide-react';

const Navigationbar: React.FC = () => {
  const pathname = usePathname();

  // Debug logging removed to prevent console spam

  const navigationItems = [
    {
      name: 'Home',
      href: '/home',
      icon: Home,
      current: pathname === '/home',
    },
    {
      name: 'Create Post',
      href: '/create-post',
      icon: Plus,
      current: pathname === '/create-post',
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageCircle,
      current: pathname === '/messages',
    },
  ];

    return (
    <nav className="w-64 lg:w-72 xl:w-80 border-r border-[#708d81] flex flex-col py-6 transition-all duration-300 ease-in-out transform rounded-lg bg-grey-medium">

      
      {/* Navigation Header */}
      <div className="px-6 mb-8">
        {/* Header removed for cleaner interface */}
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-4 w-full px-4 py-3 rounded-lg transition-all duration-200 ease-in-out cursor-pointer transform hover:scale-[1.02] hover:shadow-md ${
                item.current
                  ? 'text-white font-semibold'
                  : 'text-[#708d81]'
              }`}
              style={{
                backgroundColor: item.current ? '#5a7268' : '#f0f2f0',
                marginBottom: '16px',
                border: item.current ? '2px solid #4a5d54' : '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!item.current) {
                  e.currentTarget.style.backgroundColor = '#e8ebe8';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                } else {
                  e.currentTarget.style.backgroundColor = '#4a5d54';
                  e.currentTarget.style.borderColor = '#3d4d45';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.current) {
                  e.currentTarget.style.backgroundColor = '#f0f2f0';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                } else {
                  e.currentTarget.style.backgroundColor = '#5a7268';
                  e.currentTarget.style.borderColor = '#4a5d54';
                }
              }}
            >
              <div className="relative">
                <Icon 
                  size={24} 
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    item.current ? 'text-white' : 'text-[#708d81]'
                  }`}
                  style={{
                    color: item.current ? 'white' : '#708d81'
                  }}
                />
              </div>
              <span className={`text-base font-medium transition-colors duration-200 ${
                item.current ? 'text-white' : 'text-[#708d81]'
              }`}
              style={{
                color: item.current ? 'white' : '#708d81'
              }}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Bottom Section - Additional Options */}
      <div className="px-4 mt-8">
        <div className="border-t border-[#f0f2f0] pt-4">
          {/* Settings button moved to profile sidebar */}
        </div>
      </div>
    </nav>
  );
};

export default Navigationbar; 