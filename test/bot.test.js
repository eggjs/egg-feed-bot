'use strict';

const Bot = require('../lib/bot');
const path = require('path');
const { fs } = require('mz');
const assert = require('assert');

describe('test/bot.test.js', () => {
  let bot;
  let md;

  before(async () => {
    md = await fs.readFileSync(path.join(__dirname, 'fixtures/History.md'), 'utf-8');
    bot = new Bot();
  });

  it('should parse', () => {
    const list = bot.parse(md);
    // console.log(list);

    assert(list.length === 6);
    assert(list[0].version === '2.14.1');
    assert(list[0].date === '2018-11-24');
    assert(list[0].content.join('\n').includes('remove timeout log msg'));

    assert(list[1].version === '2.14.0');
    assert(list[1].date === '2018-11-17');

    assert(list[4].version === '3.20.1');
    assert(list[4].date === '2018-09-17');
    assert(list[4].content.join('\n').includes('others'));

    assert(list[5].version === '0.0.6');
    assert(list[5].date === '2016-10-24');
    assert(list[5].content.join('\n').includes('docs:update readme (#9)'));
  });

  it('should filter', () => {
    const list = bot.parse(md);
    const result = bot.filter(list, '2018-11-17');
    assert(result.length === 3);
  });

  it('should monthly', () => {
    const { startDate, endDate, rangeName } = bot.getRange({ startDate: '2018-12-12', cronType: 'monthly' });
    assert(startDate === '2018-11-01');
    assert(endDate === '2018-11-30');
    assert(rangeName === 'Monthly(2018-11)');
  });

  it('should weekly', () => {
    const { startDate, endDate, rangeName } = bot.getRange({ startDate: '2019-01-06', cronType: 'weekly' });
    assert(startDate === '2018-12-30');
    assert(endDate === '2019-01-05');
    assert(rangeName === 'Weekly(2018-12-30 - 2019-01-05)');
  });
});
