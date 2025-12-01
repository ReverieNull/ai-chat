import { useState } from 'react';
import { useCurrentConversation } from './useCurrentConversation';
import chatHttp from '@/utils/chatHttp';
import { Message } from '@/types';
import { log } from './useLogger';

export function useSendMessage() {
  const { id: convId, createOnce } = useCurrentConversation();
  const [messages, setMessages] = useState<Message[]>([]);

  const append = (m: Message) => setMessages(prev => [...prev, m]);

  /* 统一发送：内部保证只创建一次对话 */
  const send = async (p: {
    text: string;
    model: string;
    userId: string;
    stream?: boolean;
  }) => {
    const cid = await createOnce();
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      type: 'text',
      content: p.text,
      conversationId: cid,
      userId: p.userId,
      createdAt: new Date().toISOString(),
    };
    append(userMsg);

    if (p.stream) {
      // 流式：占位消息
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        type: 'text',
        content: '',
        conversationId: cid,
        userId: 'ai',
        streamId: `s-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      append(assistantMsg);
      log('流式开始');
      // 这里后续接 EventSource / fetch-stream 即可
    } else {
      /* 同步 */
      const { data } = await chatHttp.post<Message>('/ai/chat', {
        conversationId: cid,
        userId: p.userId,
        model: p.model,
        chatContext: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
        stream: false,
      });
      append({ ...data, userId: 'ai' });
    }
  };

  return { messages, send };
}
