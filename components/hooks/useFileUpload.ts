// useFileUpload.ts  支持多文件
import { useState } from 'react';
import { Message } from '@/types';
import axios from 'axios';

export function useFileUpload(convId: string, userId: string) {
  const [uploading, setUploading] = useState(false);

  const upload = async (files: File[]): Promise<Message[]> => {
    console.log('>>> 上传前检查', { userId, convId, filesCount: files.length });
    if (!userId || !convId) throw new Error('userId 或 conversationId 为空');

    setUploading(true);
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    fd.append('conversationId', convId);
    fd.append('userId', userId);

    const { data } = await axios.post<Message[]>(
      'http://localhost:3001/ai/chat/files',
      fd,
      { withCredentials: true },
    );
    console.log('>>> 上传完成', data);
    setUploading(false);
    return data;
  };

  return { uploading, upload };
}
