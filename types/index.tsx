export interface Message {
  id: string;
  role: 'user' | 'assistant'| 'system';
  type: 'text' | 'file' | 'deep_think';
  content: string;
  conversationId: string;
  userId: string;
  modelUsed?: string;
  fileName?: string;
  streamId?: string;
  createdAt: string;
  files?: Array<{ name: string; size: number; type: string }>;
}

export interface AiModel {
  value: string;
  label: string;
  enabled: boolean;
}

export interface ChatContextItem {
  role: 'user' | 'assistant';
  content: string;
}

export type MessageData = Message[] | { chatMessages: Message[] };

export interface CreateConversationResponse {
  id?: string;
  title?: string;
  userId?: string;
  createdAt?: string;
  success?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
