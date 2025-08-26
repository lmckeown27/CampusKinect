'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Plus, MessageCircle, User } from 'lucide-react';
import { useMessagesStore } from '@/stores/messagesStore';

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useMessagesStore();

  const navigation = [
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

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-colors ${
                item.current
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
} 