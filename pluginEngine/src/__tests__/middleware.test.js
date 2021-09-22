import { jest } from '@jest/globals';
import { middlewareService } from '../middleware';

describe('middleware runtime', () => {
  console.log = jest.fn();

  const base = (param) => {
    return param + 1;
  };

  const logger = (next) => async (params) => {
    console.log('start:' + params);
    const result = await next(params);
    console.log('finish:' + result);
    return result;
  };

  const fnHandler = (next) => async (params) => {
    if (typeof params === 'function') {
      return await next(params.call());
    }
    return await next(params);
  };

  const service = middlewareService(base, logger, fnHandler);

  test('middleware', async () => {
    expect(await service(1)).toBe(2);
    expect(console.log).toHaveBeenCalledTimes(2);
    expect(console.log.mock.results[0].type).toBe('return');
  });

  test('fn params', async () => {
    const fn = () => 2;

    expect(await service(fn)).toBe(3);
  });

  test('add middleware: add1', async () => {
    const add1 = (next) => async (param) => {
      return await next(param + 1);
    };
    service.add(add1);

    expect(await service(0)).toBe(2);
  });

  test('add async middleware', async () => {
    const minus1 = (next) => async (param) => {
      const data = await new Promise((resolve) => {
        setTimeout(() => {
          const rs = param - 1;
          resolve(rs);
        }, 500);
      });

      return await next(data);
    };

    service.add(minus1);

    expect(await service(1)).toBe(2);
  });
});
