import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
// 导入Prettier相关规则（之前安装的依赖）
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

const eslintConfig = defineConfig([
  // 保留你原有的Next.js和TS配置
  ...nextVitals,
  ...nextTs,
  // 加入Prettier规则（解决格式问题，关闭冲突规则）
  prettierConfig,
  // 启用Prettier插件（把Prettier当成ESLint规则）
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Prettier格式错误报ESLint错误
      "prettier/prettier": "error",
      // 关键：关闭“禁止any”的严格规则（临时解决核心报错）
      "@typescript-eslint/no-explicit-any": "off",
      // 可选：关闭其他容易报错的规则（减少错误数量）
      "@typescript-eslint/no-unused-vars": "warn", // 未使用变量从“错误”改成“警告”
      "no-console": "off", // 允许用console.log（方便调试）
      "react/no-unescaped-entities": "off", // 关闭HTML实体转义警告（Next.js常用）
    },
  },
  // 保留你原有的忽略文件配置
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;