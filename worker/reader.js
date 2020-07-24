const stream = require('../utils/stream');

// We read the stream until we have enough data, then we call the callback with that data
const read = (chunkSize, callback) => {
  let byteCount = 0;
  let currentString = '';
  const currentStream = stream.getStream();

  currentStream.on('data', chunk => {
    currentString += chunk;
    byteCount += chunk.length;
    if (currentString.length >= chunkSize) {
      callback({ byteCount, chunk: currentString });
      currentString = '';
    }
  });
  currentStream.on('end', () => {
    if (currentString !== '') {
      callback({ byteCount, chunk: currentString });
    }
  });
  currentStream.on('error', error => {
    callback(null, error);
  });
};

/*
  This needs some explanations: `read` uses an accumulator and when the accumulator is considered as "full", it calls the callback.
  However the pattern that we are looking for might be split between 2 callback calls. For instance: the callback could be called with "123Lpf" and then with "n456".
  That makes the search for the pattern more difficult.

  Here I use a rollover, meaning that I will copy a few characters from the previously received chunks in order to always make sure that the pattern will appear entirely,
  either in the current string or in the next string.

  Same example as above with a rollover of 3 to copy the last 3 characters of the previous chunk: the callback will be called with "123Lpf" and then with "Lpfn456".
  The pattern search becomes then trivial.
*/
const readWithRollover = (rolloverSize, callback) => {
  let nextChunk = '';
  read(rolloverSize * 10, (result, error) => {
    if (error) {
      callback(null, error);
      return;
    }

    callback({ byteCount : result.byteCount, chunk: nextChunk + result.chunk }, error);
    nextChunk = result.chunk.slice(result.chunk.length - rolloverSize, result.chunk.length);
  });
};

// We look for a match in the chunk and return it with the byte count
const match = (pattern, byteCount, chunk) => {
  const match = chunk.match(pattern);
  if (match) {
    return { match: match[0], position: byteCount - chunk.length + match.index  };
  }
  return null;
}

module.exports = {
  readWithRollover,
  match,
};