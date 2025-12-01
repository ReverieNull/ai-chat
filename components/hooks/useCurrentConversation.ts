import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import  chatHttp  from '@/utils/chatHttp';
import { Conversation } from '@/types';
import { log } from './useLogger';

export function useCurrentConversation(urlId?: string) {
  const router = useRouter();
  const [id, setId] = useState(urlId || '');
  const [loading, setLoading] = useState(!urlId);

  const createOnce = async (title = '新对话') => {
    if (id) return id;
    setLoading(true);
    const { data } = await chatHttp.post<Conversation>('/conversations', { title });
    log('创建对话', data.id);
    setId(data.id);
    router.replace(`/chat/${data.id}`);
    setLoading(false);
    return data.id;
  };

  useEffect(() => {
    if (urlId && urlId !== id) setId(urlId);
  }, [urlId]);

  return { id, loading, createOnce };
}
