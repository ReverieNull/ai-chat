'use client';
import { use } from 'react';
import ChatPage from '@/components/chat/ChatPage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ★ 解包
  return <ChatPage params={{ id }} />;
}
