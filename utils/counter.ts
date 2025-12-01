/**
 * 闭包实现计数器：count变量被保存，每次调用累加
 */
function createCounter(initialValue = 0) {
  let count = initialValue; // 闭包保存的计数变量（私有，外部无法直接修改）
  
  return {
    increment: () => count++, // 累加
    decrement: () => count--, // 递减
    getCount: () => count,    // 获取当前值
    reset: () => count = initialValue // 重置
  };
}

// 使用示例（组件中）
// const btnCounter = createCounter();
// btnCounter.increment(); // 1
// btnCounter.increment(); // 2
// console.log(btnCounter.getCount()); // 2（count被保存）
// btnCounter.reset(); // 0