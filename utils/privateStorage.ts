/**
 * 闭包实现私有存储：data变量私有，外部无法直接修改
 */
function createPrivateStorage() {
  const data: Record<string, any> = {}; // 闭包保存的私有变量

  return {
    set: (key: string, value: any) => data[key] = value, // 存值
    get: (key: string) => data[key], // 取值
    remove: (key: string) => delete data[key] // 删值
  };
}

// 使用示例
// const storage = createPrivateStorage();
// storage.set('token', 'xxx123');
// console.log(storage.get('token')); // xxx123
// console.log(storage.data); // undefined（外部无法访问私有变量）