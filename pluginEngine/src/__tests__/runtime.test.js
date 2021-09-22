import { jest } from '@jest/globals';
import { createRuntime } from '../runtime';
import { createContainer } from '../context';
import { disable, enable } from '../asyncHooks';

// mock es6 module not working !
// jest.mock('../context.js', () =>({
//   __esModule: true,
//   createContainer: jest.fn(() => {})
// }))


describe('runtime', () => {

  test('basic usage', () => {
    const foo = () => {
      return 'foo';
    };

    const { container, runInContainer } = createRuntime();

    expect(() => container.use()).toThrow();

    const result = runInContainer(foo, createContainer(new Map()));

    expect(result).toBe('foo');

  });

  test('nested run in container', () => {
    const { container, runInContainer } = createRuntime();

    const foo = () => {
      const barResult = runInContainer(bar, container.use())
      return 'foo' + barResult;
    }

    const bar = () => {
      return 'bar';
    }

    const result = runInContainer(foo, createContainer(new Map()));

    expect(result).toBe('foobar');

  })

  test('async run in container', async () => {
    const { container, runInContainer } = createRuntime();

    const foo = async () => {
      try {
        const barResult = await new Promise((resolve, reject) => {
          setTimeout(()=> {
            try {
              const data = runInContainer(bar, container.use());
              resolve(data);
            } catch (error) {
              reject(error)
            }
          })
        });
        return 'foo' + barResult;
      } catch (error) {
        expect(error.message).toMatch(/can't use container out of scope/);
      }
    }

    const bar = () => {
      return 'bar';
    }

    let result = await runInContainer(foo, createContainer(new Map()))
    expect(result).toBeUndefined();

    enable();
    result = await runInContainer(foo, createContainer(new Map()));
    expect(result).toBe("foobar");
    disable();
  })
});
