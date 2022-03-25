import { createHook, executionAsyncId } from 'async_hooks';
import { stdout } from 'process';
import net from 'net';
import fs from 'fs';

createHook({
  init(asyncId, type, triggerAsyncId) {
    const eid = executionAsyncId();
    fs.writeSync(
      stdout.fd,
      `${type}(${asyncId}): trigger: ${triggerAsyncId} execution: ${eid}\n`);
  }
}).enable();

console.log(11)

// net.createServer((conn) => {}).listen(8080);
