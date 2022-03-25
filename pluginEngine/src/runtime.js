import { asyncHooks } from './asyncHooks.js';

// 精简版，asyncHooks 必须先 enable
export const createRuntime2 = () => {

  const container = {
    use: () => {
      const currentContainer = (asyncHooks && asyncHooks.get());
      if(currentContainer){
        return currentContainer;
      }

      throw Error("can't use container out of scope")
    }
  }

  const run = (f, _container) => {
    try {
      asyncHooks && asyncHooks.set(_container);
      return f();
    } finally {

    }
  }

  return {runInContainer: run, container}
}

// 当钩子函数都是同步函数时，可以不用 enable asyncHooks，提升程序运行性能。
export const createRuntime = () => {

  let currentContainer; //当钩子函数都是同步函数时，如果没有enable asyncHooks， container 就需要直接从currentContainer获取
  const container = {
    use: () => {
      currentContainer = currentContainer || (asyncHooks && asyncHooks.get());
      if(currentContainer){
        return currentContainer;
      }

      throw Error("can't use container out of scope")
    }
  }

  const run = (f, _container) => {
    const preContainer = currentContainer;
    try {
      currentContainer = _container;
      asyncHooks && asyncHooks.set(currentContainer);
      return f();
    } finally {
      currentContainer = preContainer;
    }
  }

  return {runInContainer: run, container}
}



