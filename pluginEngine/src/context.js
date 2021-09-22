import { createRuntime } from './runtime.js';

const {
  runInContainer,
  container: { use: useContainer },
} = createRuntime();

export { runInContainer, useContainer };

const ContainerSymbol = Symbol('ContainerSymbol');

export const createContainer = (store) => {
  const read = (context) => {
    const ctx = store.get(context.id);
    return ctx ? ctx[ContextValueSymbol] : context[ContextValueSymbol];
  };

  const write = (context, val) => {
    store.set(context.id, context.create(val));
  };

  const container = Object.freeze({
    read,
    write,
    [ContainerSymbol]: true,
  });

  return container;
};

const ContextValueSymbol = Symbol('ContextValue');

export const createContext = (val) => {
  const id = Symbol('ContextId');

  const create = (val) => {
    const get = () => {
      const container = useContainer();
      return container.read(context);
    };

    const set = (newVal) => {
      const container = useContainer();
      container.write(context, newVal);
    };

    const context = {
      id,
      [ContextValueSymbol]: val,
      get,
      set,
      create,
    };

    return context;
  };

  return create(val);
};
