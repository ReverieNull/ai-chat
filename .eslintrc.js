module.exports = {
  extends: [
    "next/core-web-vitals", // Next.js默认ESLint规则
    "prettier", // 关闭ESLint和Prettier冲突的规则
    "plugin:prettier/recommended" // 把Prettier当成ESLint规则来用
  ],
  rules: {
    "prettier/prettier": "error" // Prettier格式错误会报错（可选，也可以设为"warn"）
  }
};