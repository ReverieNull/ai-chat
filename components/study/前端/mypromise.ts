class MyPromise {
  // 核心状态（不可逆）
  private status: 'pending' | 'fulfilled' | 'rejected' = 'pending';
  // 成功结果/失败原因
  private value?: any;
  private reason?: any;
  // 回调队列（存储 then 注册的回调）
  private onFulfilledCallbacks: ((value: any) => any)[] = [];
  private onRejectedCallbacks: ((reason: any) => any)[] = [];

  constructor(executor: (resolve: (value: any) => void, reject: (reason: any) => void) => void) {
    // 1. resolve：修改状态为成功，保存结果，执行成功回调
    const resolve = (value: any) => {
      if (this.status === 'pending') {
        this.status = 'fulfilled';
        this.value = value;
        // 执行队列中的成功回调
        this.onFulfilledCallbacks.forEach(cb => cb(value));
      }
    };

    // 2. reject：修改状态为失败，保存原因，执行失败回调
    const reject = (reason: any) => {
      if (this.status === 'pending') {
        this.status = 'rejected';
        this.reason = reason;
        // 执行队列中的失败回调
        this.onRejectedCallbacks.forEach(cb => cb(reason));
      }
    };

    // 3. 执行 executor，捕获同步异常
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  // 4. then 方法：链式调用核心（返回新 Promise）
  then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
    // 值穿透：未传回调时透传值/错误
    onFulfilled = onFulfilled || (value => value);
    onRejected = onRejected || (reason => { throw reason; });

    // 返回新 Promise，实现链式调用
    return new MyPromise((resolve, reject) => {
      // 处理成功状态
      const handleFulfilled = () => {
        // 异步执行：模拟微任务（面试说明：真实 Promise 是微任务，这里用 setTimeout 简化）
        setTimeout(() => {
          try {
            // 执行回调，获取返回值
            const result = onFulfilled!(this.value);
            // 回调返回值作为新 Promise 的 resolve 值
            resolve(result);
          } catch (err) {
            // 回调报错，新 Promise 直接 reject
            reject(err);
          }
        }, 0);
      };

      // 处理失败状态
      const handleRejected = () => {
        setTimeout(() => {
          try {
            const result = onRejected!(this.reason);
            // onRejected 执行成功，新 Promise resolve（错误已捕获）
            resolve(result);
          } catch (err) {
            reject(err);
          }
        }, 0);
      };

      // 根据当前状态执行对应逻辑
      switch (this.status) {
        case 'fulfilled':
          handleFulfilled();
          break;
        case 'rejected':
          handleRejected();
          break;
        case 'pending':
          // 状态未变，存入回调队列
          this.onFulfilledCallbacks.push(handleFulfilled);
          this.onRejectedCallbacks.push(handleRejected);
          break;
      }
    });
  }

  // 可选：catch 方法（面试加分项，then 的语法糖）
  catch(onRejected?: (reason: any) => any) {
    return this.then(undefined, onRejected);
  }
}