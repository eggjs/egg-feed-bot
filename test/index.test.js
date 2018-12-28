'use strict';

const coffee = require('coffee');

describe('test/bot.test.js', () => {

  it.only('should work', async () => {
    return coffee.fork('./bin/cli', [ '--startDate1=2018-11-11' ])
      .debug()
      .end();
  });
});
