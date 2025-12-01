import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// 正确模拟 __filename 和 __dirname（已包含完整盘符路径）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // 结果：D:\AI-Chat\ai-chat（无重复盘符）

// 异步写文件（修复路径拼接）
async function writeFileAsync() {
  try {
    // 正确拼接路径：__dirname（完整目录） + 文件名（无需加盘符）
    const filePath = path.join(__dirname, 'test-file.txt'); 
    console.log('最终文件路径：', filePath); // 输出：D:\AI-Chat\ai-chat\test-file.txt（正确路径）

    // 写文件（文件不存在会自动创建，存在会覆盖内容）
    await fs.writeFile(filePath, '这是测试内容', 'utf8'); 
    console.log('文件写入成功！');

    // 可选：验证写入内容（读取刚写入的文件）
    const content = await fs.readFile(filePath, 'utf8');
    console.log('文件内容：', content);
  } catch (err) {
    console.error('错误：', err);
  }
}

// 执行函数
writeFileAsync();