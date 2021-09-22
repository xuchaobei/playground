import { createContext } from '../context';
import { parallel } from '../parallel';

describe('parallel runtime', () => {
  const foo = () => {
    return {foo: 'foo'};
  };

  test('basic usage', async () => {
    const bar = () => {
      return {bar: 'bar'}
    };

    const pl = parallel(foo);
    pl.add(bar);

    expect(await pl()).toEqual([{foo: 'foo'},{bar: 'bar'}]);
  });

  test('async stage', async () => {

    const bar = async () => {
      return await new Promise((resolve) => setTimeout(() => resolve({bar: 'bar'})));
    };

    const pl = parallel(foo, bar);

    expect(await pl()).toEqual([{foo: 'foo'},{bar: 'bar'}]);
  });

  test('with context', async () => {
    const context = createContext({count: 1});

    const bar = () => {
      const ctx = context.get();
      const updatedCtx =  {...ctx, bar: 'bar'}
      context.set(updatedCtx)
      return updatedCtx;
    };

    const pl = parallel(bar);

    expect(await pl()).toEqual([{count: 1, bar: 'bar'}]);

    pl.add(()=> {
      const ctx = context.get();
      expect(ctx).toEqual({count: 1, bar: 'bar'})
    })

    await pl();

  });
});
