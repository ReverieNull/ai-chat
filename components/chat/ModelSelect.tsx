import { AiModel } from '@/types';

// 精简Props：移除流式开关相关属性
interface Props {
  models: AiModel[];          // 模型列表（结构：{value, label, enabled}）
  selected: string;           // 当前选中模型的value
  onChange: (v: string) => void; // 切换模型的回调
  showAbort: boolean;         // 是否显示中断按钮
  onAbort: () => void;        // 点击中断的回调
}

export default function ModelSelect({
  models,
  selected,
  onChange,
  showAbort,
  onAbort,
}: Props) {
  // 过滤仅启用的模型（可选：如果需要隐藏禁用模型，取消注释）
  // const enabledModels = models.filter(m => m.enabled);

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* 模型选择器（适配暗背景样式） */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-teal-200">选择模型：</label>
        <select
          className="
            border border-teal-700/30 rounded-lg px-3 py-1.5 text-sm
            bg-white/10 text-teal-100
            focus:outline-none focus:ring-2 focus:ring-teal-500/50
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          value={selected}
          onChange={e => onChange(e.target.value)}
          // 无可用模型时禁用（可选）
          disabled={!models.some(m => m.enabled)}
        >
          {/* 渲染所有模型，禁用的模型灰显 */}
          {models.map(m => (
            <option 
              key={m.value} 
              value={m.value} 
              disabled={!m.enabled}
              className={!m.enabled ? 'text-teal-400/50' : 'text-teal-100'}
            >
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* 中断按钮（仅在需要时显示） */}
      {showAbort && (
        <button
          onClick={onAbort}
          className="
            text-xs px-2 py-1 rounded
            text-red-200 bg-red-600/20 border border-red-500/30
            hover:bg-red-600/30 transition-colors
          "
        >
          中断
        </button>
      )}
    </div>
  );
}