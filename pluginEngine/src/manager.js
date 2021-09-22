import { pipeline } from './pipeline.js';
import { parallel } from './parallel.js';
import { createContainer, runInContainer, createContext } from './context.js';
import { disable, enable } from './asyncHooks.js';

export const createManager = (processes) => {
  const plugins = [];

  const currentContainer = createContainer(new Map());

  const usePlugin = (...p) => {
    plugins.push(...p);
  };

  // manager 内部执行逻辑，如设置context
  const run = (cb, options) => {
    const container = (options && options.container) || currentContainer;
    runInContainer(cb, container);
  };

  const init = (options = {}) => {
    const container = (options && options.container) || currentContainer;

    const runner = {};
    for (let hook in processes) {
      for (let p of plugins) {
        if (typeof p[hook] === 'function') {
          processes[hook].add(p[hook]);
        }
      }
      runner[hook] = (param, options) =>
        processes[hook](param, { container, ...options });
    }

    container.write(RunnerContext, runner);

    return runner; // 驱动插件hook 函数执行的方法
  };

  return { run, init, usePlugin };
};

export const RunnerContext = createContext(null);

export const useRunner = () => {
  const runner = RunnerContext.get();
  if (!runner) {
    throw Error("can't call useRunner out of scope");
  }
  return runner;
};

async function test() {
  // const foo = {
  //   add: (param) => {
  //     return param + 1;
  //   },
  //   multiply: (param) => {
  //     return param * 2;
  //   },
  // };

  // const bar = {
  //   add: (param) => {
  //     return param + 2;
  //   },
  //   multiply: (param) => {
  //     return param * 4;
  //   },
  // };

  enable();

  const context0 = createContext(0);
  const context1 = createContext({ count: 1 });

  const foo = {
    add: async (param) => {
      const runner = useRunner();
      await runner.print('from add hook');

      const addNumber = context0.get();
      const sum = param + addNumber;
      context0.set(param + addNumber);
      return sum;
    },
    multiply: (param) => {
      const multiplyObj = context1.get();
      return param * multiplyObj.count;
    },
    print: async (param) => {
      console.log('foo', param);
    },
  };

  const bar = {
    add: (param) => {
      const addNumber = context0.get();
      return param + addNumber + 2;
    },
    multiply: (param) => {
      const multiplyObj = context1.get();
      return param * multiplyObj.count;
    },
    print: (param) => {
      console.log('bar', param);
    },
  };

  const manager1 = createManager({
    add: pipeline(),
    multiply: pipeline(),
    print: parallel(),
  });
  const manager2 = createManager({
    add: pipeline(),
    multiply: pipeline(),
    print: parallel(),
  });

  manager1.usePlugin(foo, bar);
  manager2.usePlugin(foo, bar);

  const runner1 = manager1.init();
  const runner2 = manager2.init();

  let r1 = await runner1.add(1);
  let r2 = await runner1.multiply(2);

  console.log(r1, r2);

  manager1.run(() => {
    // context0.set(1)
    context1.set({
      count: 2,
    });
  });

  r1 = await runner1.add(1);
  r2 = await runner1.multiply(2);

  console.log(r1, r2);

  let r3 = await runner2.add(1);
  let r4 = await runner2.multiply(2);

  console.log(r3, r4);

  disable();
}

function test2() {
  const context0 = createContext(0);
  const context1 = createContext({ count: 1 });

  const foo = {
    calc: (param) => {
      const rs = param + context0.get();
      console.log(rs);
      return rs;
    },
    config: () => {
      const curConfig = context1.get();
      context1.set({ ...curConfig, foo: 'foo' });
    },
  };

  const bar = {
    calc: (param) => {
      return param * 2;
    },
    config: () => {
      const curConfig = context1.get();
      context1.set({ ...curConfig, bar: 'bar' });
    },
  };

  const manager = createManager({ calc: pipeline(), config: parallel() });

  manager.usePlugin(foo, bar);

  const runner = manager.init();

  const calcResult = runner.calc(1);
  console.log(calcResult);
}

// test();
// test2();
