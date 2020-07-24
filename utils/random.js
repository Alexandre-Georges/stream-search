const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
};

module.exports = {
  getRandomInt,
};