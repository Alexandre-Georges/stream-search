const { parentPort } = require('worker_threads');
const reader = require('./reader');

// This could go in the parent
const PATTERN = 'Lpfn';
const getElapsedTime = startTime => Date.now() - startTime;

(() => {
  const startTime = Date.now();
  try {
    // We simply read the stream and check if we have a match for each chunk of data
    reader.readWithRollover(PATTERN.length - 1, (result, error) => {
      // If we have an error it means something went wrong, we can then abort and kill the worker
      if (error) {
        parentPort.postMessage({ elapsedTime: getElapsedTime(startTime), result: null, error: error.stack });
        process.exit(1);
      }
      // If we get a chunk of data we can match against the pattern
      const match = reader.match(PATTERN, result.byteCount, result.chunk);
      if (match) {
        // If we have a match we can send the good news to the parent and kill the worker
        parentPort.postMessage({ elapsedTime: getElapsedTime(startTime), result: { match: match.match, position: match.position }, error: null });
        process.exit(0);
      }
    });
  } catch (error) {
    // This should not be necessary but let's cover all our bases in case there is an unexpected error
    parentPort.postMessage({ elapsedTime: getElapsedTime(startTime), result: null, error: error.stack });
    process.exit(1);
  }
})();
