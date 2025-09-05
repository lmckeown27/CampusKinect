'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ChatPage from '../../../components/chat/ChatPage';

export default function UserChatPage() {
  const params = useParams();
  const userId = params.userId as string;

  return <ChatPage userId={userId} />;
} 