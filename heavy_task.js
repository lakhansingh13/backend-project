const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {

  console.log("Main Thread Started");

  // Create worker
  const worker = new Worker(__filename, { workerData: 40 });

  // Receive result from worker
  worker.on('message', (result) => {
    console.log(`Calculation Finished: ${result}`);
  });

  console.log("Main Thread is free to handle other requests!");

} else {

  // Worker thread (heavy computation - Fibonacci)
  function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }

  const result = fibonacci(workerData);

  // Send result back
  parentPort.postMessage(result);
}