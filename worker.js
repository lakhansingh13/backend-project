const { parentPort, workerData } = require('worker_threads');

// Simulate heavy computation
let result = 0;

for (let i = 0; i < workerData.iterations; i++) {
  result += i;
}

// Send result back
parentPort.postMessage(result); 