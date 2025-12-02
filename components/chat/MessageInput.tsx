'use client';
import { useRef, KeyboardEvent, useState } from 'react';
import { AiModel } from '@/types';
import ModelSelect from './ModelSelect';

interface Props {
  models: AiModel[];
  selectedModel: string;
  onChangeModel: (v: string) => void;

  showAbort: boolean;
  onAbort: () => void;
  onSend: (text: string) => void; // 仅接收文本，路由逻辑移到ChatPage
  onDeepThink: (text: string) => void;
  onUpload: (file: File) => void;
  loading: boolean;
}

export default function MessageInput({
  models,
  selectedModel,
  onChangeModel,
  showAbort,
  onAbort,
  onSend,
  onDeepThink,
  onUpload,
  loading,
}: Props) {
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [deepThinkOn, setDeepThinkOn] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  // 简化submit：仅调用外部传递的onSend
  const submit = () => {
    if (!text.trim() || loading) return;
    onSend(text); // 外部已处理路由+存储逻辑
    setText('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onUpload(f);
    e.target.value = '';
  };

  const toggleDeepThink = async () => {
    if (thinking) return;          
    if (!text.trim()) {
      setDeepThinkOn(p => !p);     
      return;
    }
    if (deepThinkOn) {
      setThinking(true);
      await onDeepThink(text);     
      setThinking(false);
    }
  };

  return (
    <div className="p-5 bg-white/5 backdrop-blur-xl space-y-4 rounded-b-2xl">
      <div className="flex gap-3">
        <textarea
          className="
            flex-1 rounded-xl px-4 py-3 resize-none border border-teal-700/20
            bg-white/10 text-teal-100
            placeholder:text-teal-300/70
            focus:bg-white/15 focus:border-teal-400/50
            focus:ring-2 focus:ring-teal-300/20
            outline-none transition-all duration-200
            disabled:bg-white/5 disabled:opacity-80
          "
          rows={2}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="开始聊天"
          disabled={loading}
        />
        <button
          className="px-5 py-3 bg-teal-600/90 text-white rounded-xl hover:bg-teal-700 active:scale-95 
            disabled:opacity-50 transition-all duration-200 min-w-[80px]"
          onClick={submit}
          disabled={loading || !text.trim()}
        >
          发送
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              ref={fileRef}
              onChange={onFileChange}
              disabled={loading}
            />
            <span
              className={`inline-block px-3 py-1.5 rounded-xl border border-teal-400/50 text-teal-200 
                bg-white/10 hover:bg-white/15 transition-all duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
            >
              上传文件
            </span>
          </label>

          <button
            onClick={toggleDeepThink}
            disabled={thinking}
            className={`px-3 py-1.5 rounded-xl border transition-all duration-200 ${
              deepThinkOn
                ? 'bg-teal-600/90 text-white border-teal-400/50 hover:bg-teal-700'
                : 'bg-white/10 text-teal-200 border-teal-400/50 hover:bg-white/15'
            } ${thinking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {thinking ? '思考中…' : '深度思考'}
          </button>
        </div>

        <ModelSelect
          models={models}
          selected={selectedModel}
          onChange={onChangeModel}
          showAbort={showAbort}
          onAbort={onAbort}
        />
      </div>
    </div>
  );
}