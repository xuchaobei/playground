import { createContext } from '../context';
import { pipeline } from '../pipeline';

describe('pipeline runtime', () => {
  const foo = (param) => {
    return param;
  };

  test('basic usage', async () => {
    const bar = (param) => {
      return param + 1;
    };

    const pl = pipeline(foo);
    pl.add(bar);

    expect(await pl(1)).toBe(2);
  });

  test('async stage', async () => {

    const bar = async (param) => {
      return await new Promise((resolve) => setTimeout(() => resolve(param + 1)));
    };

    const pl = pipeline(foo, bar);

    expect(await pl(1)).toBe(2);
  });

  test('with context', async () => {
    const context = createContext(2);

    const bar = (param) => {
      return param + context.get();
    };

    const pl = pipeline(foo, bar);

    expect(await pl(1)).toBe(3);
  });
});
