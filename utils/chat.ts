import { Message, ChatContextItem } from '@/types';

/* 后端需要的上下文格式 */
export const buildChatContext = (msgs: Message[]): ChatContextItem[] =>
  msgs.map(m => ({ role: m.role, content: m.content }));
