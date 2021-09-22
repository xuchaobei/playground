import { runInContainer, createContainer } from './context.js';

export const parallel = (...s) => {
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

    return await Promise.all(
      stages.map((item) =>
        runInContainer(async () => await item(param), container),
      ),
    );
  };

  run.add = add;

  add(...s);

  return run;
};
