'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, MessageCircle, User, Settings } from 'lucide-react';

const LeftSidebar: React.FC = () => {
  const pathname = usePathname();

  // Debug logging
  console.log('🔍 LeftSidebar render:', { pathname });

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
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: pathname === '/profile',
    },
  ];

  return (
    <nav className="w-64 lg:w-72 xl:w-80 border-r border-[#708d81] flex flex-col py-6 transition-all duration-300 ease-in-out transform" style={{ backgroundColor: '#708d81' }}>

      
      {/* Navigation Header */}
      <div className="px-6 mb-8">
        <h2 className="text-xl font-bold text-white">CampusConnect</h2> {/* White text for visibility */}
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <div // Wrapped Link in a div for mouse events
              key={item.name}
              className={`flex items-center space-x-4 w-full px-4 py-3 mb-2 rounded-xl transition-colors cursor-pointer ${
                item.current
                  ? 'text-white font-semibold'
                  : 'text-[#708d81]'
              }`}
              style={{
                backgroundColor: item.current ? '#5a7268' : '#f0f2f0'
              }}
              onMouseEnter={(e) => {
                if (!item.current) {
                  e.currentTarget.style.backgroundColor = '#e8ebe8';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.current) {
                  e.currentTarget.style.backgroundColor = '#f0f2f0';
                }
              }}
            >
              <Link // Simplified Link styling
                href={item.href}
                className="flex items-center space-x-4 w-full"
              >
                <div className="relative">
                  <Icon size={24} /> {/* Increased icon size */}
                  {/* {item.badge && ( // Removed badge for simplification
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )} */}
                </div>
                <span className="text-base font-medium">{item.name}</span>
              </Link>
            </div>
          );
        })}
      </div>
      
      {/* Bottom Section - Additional Options */}
      <div className="px-4 mt-8">
        <div className="border-t border-[#f0f2f0] pt-4">
          <button 
            className="flex items-center space-x-4 w-full px-4 py-3 text-[#708d81] rounded-xl transition-colors"
            style={{ backgroundColor: '#f0f2f0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e8ebe8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f2f0';
            }}
          >
            <Settings size={24} /> {/* Added Settings icon */}
            <span className="text-base font-medium">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LeftSidebar; 