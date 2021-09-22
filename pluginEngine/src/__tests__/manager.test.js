import { createContext } from '../context';
import { pipeline } from '../pipeline';
import { parallel } from '../parallel';
import { createManager, useRunner } from '../manager';
import { disable, enable } from '../asyncHooks';

describe('manager', () => {
  const context0 = createContext(0);
  const context1 = createContext({ count: 1 });

  const foo = {
    calc: (param) => {
      return param + context0.get();
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

  test('basic usage', async () => {
    const manager = createManager({ calc: pipeline(), config: parallel() });

    manager.usePlugin(foo, bar);

    const runner = manager.init();

    const calcResult = await runner.calc(1);
    expect(calcResult).toBe(2);

    await runner.config();

    expect(() => context1.get()).toThrow();
    manager.run(() => {
      expect(context1.get()).toEqual({
        count: 1,
        foo: 'foo',
        bar: 'bar',
      });
    });
  });

  test('useRunner', async () => {
    const baz = {
      drive: async () => {
        await useRunner().config();
      },
    };

    const manager = createManager({
      calc: pipeline(),
      config: parallel(),
      drive: pipeline(),
    });
    manager.usePlugin(foo, bar, baz);
    const runner = manager.init();
    await runner.drive();

    manager.run(() => {
      expect(context1.get()).toEqual({
        count: 1,
        foo: 'foo',
        bar: 'bar',
      });
    });
  });

  test('use context in async flow', async () => {
    enable();

    const baz = {
      a: async () => {
        const p = await new Promise((resolve) => {
          resolve(1);
        });
        const c0 = context0.get();
        return p + c0;
      },
    };

    const manager = createManager({ a: pipeline() });
    manager.usePlugin(baz);

    const runner = manager.init();

    const result = await runner.a();
    expect(result).toBe(1);

    disable();
  });

  test('use context in different managers', async () => {
    const manager1 = createManager({ calc: pipeline(), config: parallel() });
    const manager2 = createManager({ calc: pipeline(), config: parallel() });

    manager1.usePlugin(foo, bar);
    manager2.usePlugin(foo, bar);

    const runner1 = manager1.init();
    const runner2 = manager2.init();

    manager1.run(() => {
      context0.set(1);
      context1.set({
        count: 2,
      });
    });

    const r1 = await runner1.calc(1);
    await runner1.config();
    expect(r1).toBe(4);
    manager1.run(() => {
      expect(context1.get()).toEqual({
        count: 2,
        foo: 'foo',
        bar: 'bar',
      });
    });

    const r2 = await runner2.calc(1);
    await runner2.config();
    expect(r2).toBe(2);
    manager2.run(() => {
      expect(context1.get()).toEqual({
        count: 1,
        foo: 'foo',
        bar: 'bar',
      });
    });
  });
});
