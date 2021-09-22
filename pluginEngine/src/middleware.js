export const middlewareService = (base, ...m) => {

  const middlewares = []

  const add = (...m) => {
    middlewares.push(...m)
  }

  const run = async(...args) => {
    const chain = await middlewares.reduceRight(async (pre, cur) => {
      return cur(await pre)
    }, base)

    return chain(...args)
  }

  add(...m);

  run.add = add;

  return run;
}

async function test() {
  const base = (param) => {
    return param + 1
  }

  const logger = next => async params => {
    console.log('start:' + params)
    const result = await next(params);
    console.log('finish:'+ result)
    return result;
  }

  const fnHandler = next => async params => {
    if(typeof params === 'function'){
      return next(params.call());
    }
    console.log('fnHandler start')
    const result = await next(params);
    console.log('fnHandler end', result);
    return result;
  }

  const service = middlewareService(base, logger, fnHandler);

  const minus1 = next => async (param) => {
    const data = await new Promise((resolve) => {
      setTimeout(()=> {
        const rs = param - 1;
        resolve(rs);
      }, 500)
    })

    return next(data);
  }

  service.add(minus1)

  const result = await service(1)
  console.log(result)
}

// test();
