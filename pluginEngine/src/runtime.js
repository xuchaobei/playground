import { asyncHooks } from './asyncHooks.js';

export const createRuntime = () => {

  let currentContainer;
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



