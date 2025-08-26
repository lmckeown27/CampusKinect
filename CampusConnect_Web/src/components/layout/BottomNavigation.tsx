'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMessagesStore } from '../../stores/messagesStore';
import { Home, Plus, MessageCircle, User } from 'lucide-react';

const BottomNavigation: React.FC = () => {
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full py-2 px-3 rounded-lg transition-colors ${
                item.current
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation; 