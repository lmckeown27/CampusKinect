'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, MessageCircle, User, Settings } from 'lucide-react';

const LeftSidebar: React.FC = () => {
  const pathname = usePathname();

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
    <nav className="w-64 lg:w-72 xl:w-80 bg-white border-r border-[#708d81] flex flex-col py-6">
      {/* Navigation Header */}
      <div className="px-6 mb-8">
        <h2 className="text-xl font-bold text-[#708d81]">CampusConnect</h2>
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-4 w-full px-4 py-3 mb-2 rounded-xl transition-colors ${
                item.current
                  ? 'text-[#708d81] bg-[#f0f2f0] font-semibold'
                  : 'text-[#708d81] hover:bg-[#f8f9f6] hover:text-[#5a7268]'
              }`}
            >
              <Icon size={24} />
              <span className="text-base font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Bottom Section - Additional Options */}
      <div className="px-4 mt-8">
        <div className="border-t border-[#f0f2f0] pt-4">
          <button className="flex items-center space-x-4 w-full px-4 py-3 text-[#708d81] hover:bg-[#f0f2f0] hover:text-[#5a7268] rounded-xl transition-colors">
            <Settings size={24} />
            <span className="text-base font-medium">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LeftSidebar; 