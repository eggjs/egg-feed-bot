#!/usr/bin/env node

'use strict';

if (process.env.TRAVIS_EVENT_TYPE !== 'cron') {
  console.log('not run at travis-ci cron, exit');
  process.exit(0);
}

console.log('travis-ci cron trigger');

const Command = require('..');

new Command().start();
