'use client';
import { useState } from 'react';
import Link from 'next/link';

// 模拟历史会话数据（实际需对接后端）
const mockConversations = [
  { id: 'session-123', title: 'AI助手功能咨询' },
  { id: 'session-456', title: '青蓝系风格设计建议' },
  { id: 'session-789', title: '西游记五庄观设定讨论' },
];

export default function SidebarItem() {
  const [activeId, setActiveId] = useState('');

  return (
    <div className="flex flex-col w-full px-2">
      <h3 className="text-sm font-semibold text-teal-800 mb-3 px-2">历史会话</h3>
      <div className="space-y-1 overflow-y-auto flex-1">
        {mockConversations.map((conv) => (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            className={`block w-full px-3 py-2 text-left rounded-md text-gray-700 text-sm hover:bg-teal-100 transition-colors ${
              activeId === conv.id ? 'bg-teal-100 text-teal-700 font-medium' : ''
            }`}
            onClick={() => setActiveId(conv.id)}
          >
            {conv.title}
          </Link>
        ))}
      </div>
    </div>
  );
}