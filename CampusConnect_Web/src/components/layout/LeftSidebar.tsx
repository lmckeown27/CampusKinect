'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMessagesStore } from '../../stores/messagesStore';
import { Home, Plus, MessageCircle, User } from 'lucide-react';

const LeftSidebar: React.FC = () => {
  const pathname = usePathname();
  const { unreadCount } = useMessagesStore();

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
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: pathname === '/profile',
    },
  ];

  return (
    <nav className="fixed left-0 top-16 bottom-0 w-64 lg:w-72 xl:w-80 bg-white border-r border-[#708d81] z-40 flex flex-col py-6">
      {/* Navigation Header */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-semibold text-[#708d81]">Navigation</h2>
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 w-full px-4 py-3 mb-2 rounded-lg transition-colors ${
                item.current
                  ? 'text-[#708d81] bg-[#f0f2f0]'
                  : 'text-[#708d81] hover:text-[#5a7268] hover:bg-[#f8f9f6]'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default LeftSidebar; 