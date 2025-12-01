import { AiModel } from '@/types';

interface Props {
  models: AiModel[];
  selected: string;
  onChange: (v: string) => void;
  enableStream: boolean;
  onToggleStream: () => void;
  showAbort: boolean;
  onAbort: () => void;
}

export default function ModelSelect({
  models,
  selected,
  onChange,
  enableStream,
  onToggleStream,
  showAbort,
  onAbort,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* 模型选择 */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-teal-600">选择模型：</label>
        <select
          className="
            border border-teal-200 rounded-lg px-3 py-1.5 text-sm
            bg-teal-50/70 text-teal-800
            focus:outline-none focus:ring-2 focus:ring-teal-300/50
            transition-all duration-200
          "
          value={selected}
          onChange={e => onChange(e.target.value)}
        >
          {models.map(m => (
            <option key={m.value} value={m.value} disabled={!m.enabled}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* 流式开关 + 中断按钮 */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-teal-600">流式输出：</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enableStream}
            onChange={onToggleStream}
            className="sr-only peer"
          />
          <div className="
            w-9 h-5 bg-teal-100 rounded-full peer
            peer-focus:ring-2 peer-focus:ring-teal-300/50
            after:absolute after:top-[2px] after:left-[2px]
            after:bg-white after:border-teal-200 after:border
            after:rounded-full after:h-4 after:w-4 after:transition-all
            peer-checked:bg-teal-500 peer-checked:after:translate-x-full
          "></div>
        </label>

        {showAbort && (
          <button
            onClick={onAbort}
            className="text-xs text-teal-600 hover:text-red-500 transition-colors"
          >
            中断
          </button>
        )}
      </div>
    </div>
  );
}
