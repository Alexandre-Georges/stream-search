const { Worker } = require('worker_threads');

const WORKER_PATH = './worker/index.js';

let TIMEOUT = 60000;
let WORKER_NUMBER = 10;

// Processing of the options
for (let i = 1; i < process.argv.length; i++) {
  const splitted = process.argv[i].split('=');
  const optionName = splitted[0];
  const optionValue = splitted[1];

  if (optionName === '--timeout') {
    TIMEOUT = parseInt(optionValue);
  } else if (optionName === '--workers') {
    WORKER_NUMBER = parseInt(optionValue);
  }
}

// Creates and run a worker
const runWorker = (path, callback) => {
  const worker = new Worker(path);
  worker.on('message', message => callback(message));
  worker.on('error', error => callback(null, error));
  return worker;
};

// Tracking of workers and their data
let workersRunning = 0;
const workers = [];
const workersData = [];

// Definition of the timeout
const timeoutID = setTimeout(() => {
  for (let i = 0; i < WORKER_NUMBER; i++) {
    const worker = workers[i];

    // If we have a worker it means the worker has not finished and needs to be killed
    if (worker) {
      worker.terminate();
      workersData[i] = { id: i, status: 'TIMEOUT', elapsedTime: null, result: null, error: null };
    }
  }
  printReport(workersData);
}, TIMEOUT);

// Creation of the workers
for (let i = 0; i < WORKER_NUMBER; i++) {
  const worker = runWorker(WORKER_PATH, (response, error) => {
    // This is the callback when we receive a message from the worker (success or error)
    let data = { id: i, status: 'SUCCESS', elapsedTime: response.elapsedTime, result: response.result, error: null };
    if (error) {
      data = { id: i, status: 'FAILURE', elapsedTime: response.elapsedTime, result: null, error };
    } else if (response.error) {
      data = { id: i, status: 'FAILURE', elapsedTime: response.elapsedTime, result: null, error: response.error };
    }

    // We update the data of the worker for the report
    workersData[i] = data;
    workers[i] = undefined;
    workersRunning--;

    // We keep track of how many workers are still running and if they are all done it means the work is done
    if (workersRunning === 0) {
      clearTimeout(timeoutID);
      printReport(workersData);
    }
  });

  // Same thing here
  workers[i] = worker;
  workersRunning++;
}

// This processes and print the results of each worker.
const printReport = workersData => {
  const successes = workersData.filter(workerData => workerData.status === 'SUCCESS');
  const orderedSuccesses = successes.sort((a, b) => a.elapsedTime - b.elapsedTime);
  let totalTime = 0;
  let totalByteRead = 0;
  for (const success of orderedSuccesses) {
    totalTime += success.elapsedTime;
    totalByteRead += success.result.position;
    console.log(`SUCCESS worker ${success.id}, elapsed time: ${success.elapsedTime} ms, bytes read: ${success.result.position}`)
  }
  const failures = workersData.filter(workerData => workerData.status === 'FAILURE');
  for (const failure of failures) {
    console.error(`FAILURE worker ${failure.id}, error: ${failure.error}`)
  }
  const timeouts = workersData.filter(workerData => workerData.status === 'TIMEOUT');
  for (const timeout of timeouts) {
    console.error(`TIMEOUT worker ${timeout.id}`)
  }
  console.log(`Average bytes read per millisecond: ${totalTime === 0 ? 0 : totalByteRead / totalTime}`);
};
