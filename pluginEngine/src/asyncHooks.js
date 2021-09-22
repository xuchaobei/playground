import NodeAsyncHooks from 'async_hooks';

const createAsyncHooks = () => {
  const store = new Map();

  const hooks = NodeAsyncHooks.createHook({
    init: (asyncId, _, triggerAsyncId) => {
      if (store.has(triggerAsyncId)) {
        const value = store.get(triggerAsyncId);
        if (value) {
          store.set(asyncId, value);
        }
      }
    },
    destroy: (asyncId) => {
      if (store.has(asyncId)) {
        store.delete(asyncId);
      }
    },
  });

  const set = (value) => {
    store.set(NodeAsyncHooks.executionAsyncId(), value);
  };

  const get = () => store.get(NodeAsyncHooks.executionAsyncId());

  const clear = () => {
    store.clear();
  };

  const enable = () => {
    hooks.enable();
  };

  const disable = () => {
    hooks.disable();
    store.clear();
  };

  return {
    enable,
    disable,
    set,
    get,
    clear,
  };
};

export const enable = () => {
  const hooks = createAsyncHooks();
  disable();
  asyncHooks = hooks;
  hooks.enable();
};

export const disable = () => {
  if (asyncHooks) {
    asyncHooks.disable();
  }
  asyncHooks = null;
};

export let asyncHooks;
