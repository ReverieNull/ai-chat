import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { AiModel } from '@/types';

export function useModels() {
  const [models, setModels] = useState<AiModel[]>([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    axiosInstance.get('/ai/models')
      .then(res => {
        const list = (Array.isArray(res) ? res : res.data ?? []).filter(
          (m: AiModel) => m.value && m.label && typeof m.enabled === 'boolean'
        );
        setModels(list);
        if (list.length) setSelected(list.find((m: AiModel) => m.enabled)?.value || list[0].value);
      })
      .catch(() => {
        const fallback: AiModel[] = [
          { value: 'deepseek-chat', label: 'DeepSeek', enabled: true },
        ];
        setModels(fallback);
        setSelected(fallback[0].value);
      });
  }, []);

  return { models, selected, setSelected };
}
