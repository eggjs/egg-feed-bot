'use strict';

const coffee = require('coffee');

describe('test/cli.test.js', () => {

  it('should work', async () => {
    return coffee.fork('./bin/cli', [
      '--dry-run',
      '--cronType=special',
      '--startDate=2018-11-07',
      '--endDate=2018-11-24',
    ])
      .debug()
      .expect('stdout', /# \[eggjs\/egg\]\(https:\/\/github.com\/eggjs\/egg\)/)
      .expect('stdout', /fetch eggjs\/egg/)
      .expect('stdout', /find 3 versions: 2.14.1,2.14.0,2.13.0/)
      .expect('stdout', /fetch eggjs\/egg-core/)
      .expect('stdout', /## 2018-11-24, Version 2.14.1\\n\\n### Notable changes/)
      .expect('stdout', /## 2018-11-07, Version 2.13.0/)
      .notExpect('stdout', /2018-10-08/)
      .notExpect('stdout', /2018-12-20/)
      .end();
  });

  it('should work with special repo', async () => {
    return coffee.fork('./bin/cli', [
      '--dry-run',
      '--cronType=special',
      '--startDate=2018-11-07',
      '--endDate=2018-11-24',
      'eggjs/egg',
    ])
      // .debug()
      .expect('stdout', /# \[eggjs\/egg\]\(https:\/\/github.com\/eggjs\/egg\)/)
      .expect('stdout', /find 3 versions: 2.14.1,2.14.0,2.13.0/)
      .expect('stdout', /## 2018-11-24, Version 2.14.1\\n\\n### Notable changes/)
      .expect('stdout', /## 2018-11-07, Version 2.13.0/)
      .notExpect('stdout', /2018-10-08/)
      .notExpect('stdout', /2018-12-20/)
      .end();
  });

  it('should work when not found', async () => {
    return coffee.fork('./bin/cli', [
      '--dry-run',
      'eggjs/no-exist',
    ])
      // .debug()
      .expect('stdout', /total list: 0/)
      .expect('stderr', /HttpError: Not Found/)
      .end();
  });

  it('should work when not changelog', async () => {
    return coffee.fork('./bin/cli', [
      '--dry-run',
      '--cronType=special',
      '--startDate=2018-11-01',
      '--endDate=2018-11-01',
      'eggjs/egg',
    ])
      // .debug()
      .expect('stdout', /total list: 0/)
      .end();
  });
});
