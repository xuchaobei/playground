// import { createServer } from 'http';
import {
  executionAsyncId,
  executionAsyncResource,
  createHook
} from 'async_hooks';
// const sym = Symbol('state'); // Private symbol to avoid pollution

// createHook({
//   init(asyncId, type, triggerAsyncId, resource) {
//     const cr = executionAsyncResource();
//     if (cr) {
//       resource[sym] = cr[sym];
//     }
//   }
// }).enable();

// const server = createServer((req, res) => {
//   executionAsyncResource()[sym] = { state: req.url };
//   setTimeout(function() {
//     res.end(JSON.stringify(executionAsyncResource()[sym]));
//   }, 100);
// }).listen(3000);


import fs from 'fs'
// const async_hooks = require('async_hooks');
import {stdout}  from 'process';

const fd = stdout.fd;

let indent = 0;
// createHook({
//   init(asyncId, type, triggerAsyncId) {
//     const eid = executionAsyncId();
//     const indentStr = ' '.repeat(indent);
//     fs.writeSync(
//       fd,
//       `${indentStr}${type}(${asyncId}):` +
//       ` trigger: ${triggerAsyncId} execution: ${eid} \n`);
//   },
//   before(asyncId) {
//     const indentStr = ' '.repeat(indent);
//     fs.writeSync(fd, `${indentStr}before:  ${asyncId}\n`);
//     // indent += 2;
//   },
//   after(asyncId) {
//     // indent -= 2;
//     const indentStr = ' '.repeat(indent);
//     fs.writeSync(fd, `${indentStr}after:  ${asyncId}\n`);
//   },
//   destroy(asyncId) {
//     const indentStr = ' '.repeat(indent);
//     fs.writeSync(fd, `${indentStr}destroy:  ${asyncId}\n`);
//   },
// }).enable();

function callback(err, data) {
    console.log('callback', data)
}

// fs.readFile("a.txt", callback)
// console.log('after a')
// fs.readFile("b.txt", callback)
// console.log('after b')
