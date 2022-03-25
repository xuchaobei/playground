import{createHook, executionAsyncId} from 'async_hooks';

function stackTrace() {
  const obj = {}
  Error.captureStackTrace(obj, stackTrace)
  return obj.stack
}

const asyncResourceMap = new Map();
const hook = createHook({
  init(asyncId, type, triggerAsyncId) {
    asyncResourceMap.set(asyncId, {
      asyncId,
      type,
      triggerAsyncId,
      stack: stackTrace()
    })
  },
  destroy(asyncId) {
    asyncResourceMap.delete(asyncId)
  },
}).enable();

function main() {
  setTimeout(() => {
    throw Error(1)
  }, 0)
}

main()

function getTrace(asyncId) {
  if (!asyncResourceMap.get(asyncId)) {
    return '';
  }
  const resource = asyncResourceMap.get(asyncId);
  if (resource?.triggerAsyncId) {
    getTrace(resource?.triggerAsyncId);
  }
  console.log(`${resource?.type}(${resource?.asyncId})\n${resource.stack}`)
}

process.on('uncaughtException', (err) => {
  console.log(getTrace(executionAsyncId()))
})


hook.disable();
