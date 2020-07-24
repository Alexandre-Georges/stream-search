const stream = require('stream');
const random = require('./random');

// In this file we generate streams of random characters, this defines which characters are allowed
const ALLOWED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
// const ALLOWED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzLpfn';

const randomChar = () => ALLOWED_CHARS[random.getRandomInt(0, ALLOWED_CHARS.length)];
const randomChars = numberToProduce => {
  let chars = '';
  for (let i = 0; i < numberToProduce; i++) {
    chars += randomChar();
  }
  return chars;
};

// Finally a good use case for a generator
async function * generateChars() {
  while (true) {
    // asd.c();
    const charNumberToRead = random.getRandomInt(1, 50);
    yield randomChars(charNumberToRead);
  }
}

// Creation of the nodeJS stream
const createStream = () => stream.Readable.from(generateChars());

module.exports = {
  getStream: createStream,
};
