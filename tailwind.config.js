// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 告诉 Tailwind 扫描哪些文件中的类名（必须配置，否则自定义类可能不生效）
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",  // 你的页面和组件路径
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 在这里添加像素字体配置
      fontFamily: {
        'pixel-game': ['"Press Start 2P"', 'cursive', 'sans-serif'],
        'pixel-sans': ['"Pixelify Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'), // 启用滚动条插件
    ]
}