import { createContext, createContainer } from '../context';

import { pipeline } from '../pipeline';

describe('context', () => {
  test('basic usage', () => {
    const context0 = createContext({
      count: 0,
    });

    const context1 = createContext({
      text: 'test',
    });

    const container = createContainer(new Map());

    expect(container.read(context0)).toEqual({
      count: 0,
    });

    expect(container.read(context1)).toEqual({
      text: 'test',
    });

    container.write(context0, { count: 1 });

    expect(container.read(context0)).toEqual({
      count: 1,
    });

    expect(() => context0.get()).toThrow();
  });

  test('use in pipeline', async () => {
    const context0 = createContext({
      count: 1,
    });

    const sum = (a) => {
      return a;
    };

    const add = (param) => {
      const cVal = context0.get();
      return cVal.count + param;
    };

    const pl = pipeline(sum, add);

    expect(await pl(1)).toBe(2);

    expect(() => context0.set({ count: 2 })).toThrow();

    // expect(await pl(1)).toBe(3);
  });


});
