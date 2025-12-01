// types/chat.ts
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date | string;
  isLoading?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  messages?: Message[]; // 可选，因为列表页不需要完整消息
}