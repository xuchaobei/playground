import { runInContainer, createContainer } from './context.js';

export const pipeline = (...s) => {
  const stages = [];

  const currentContainer = createContainer(new Map());

  const add = (...s) => {
    for (const each of s) {
      if (typeof each === 'function') {
        stages.push(each);
      }
    }
  };

  const run = async (param, options = {}) => {
    const container = options.container || currentContainer;
    return await stages.reduce(async (pre, cur) => {
      const input = await pre;
      return runInContainer(() => cur(input), container);
    }, param);
  };

  run.add = add;

  add(...s);

  return run;
};
