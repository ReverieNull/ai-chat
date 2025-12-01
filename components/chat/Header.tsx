export default function Header({ title, onToggleSidebar }: { title: string; onToggleSidebar: () => void }) {
  return (
    <header className="bg-white/70 backdrop-blur-sm border-b border-teal-200/60 h-16 flex items-center px-6 
      shadow-sm rounded-b-none relative z-10"> {/* 加阴影+半透明边框，强化与MessageList分隔 */}
      {/* 汉堡按钮：优化hover/active效果，统一圆角 */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-full hover:bg-teal-500/10 active:scale-95 transition-all duration-200"
        title="切换侧边栏"
      >
        <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 标题：优化字体/间距，统一视觉层级 */}
      <h1 className="ml-4 text-lg font-semibold text-teal-800 tracking-wide">{title}</h1>

      {/* 微光指示点：优化样式，匹配整体 */}
      <div className="ml-auto w-2 h-2 rounded-full bg-teal-400/80 animate-pulse" />
    </header>
  );
}