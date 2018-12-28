'use strict';

const utils = require('../lib/utils');
const path = require('path');
const  { fs } = require('mz');
const assert = require('assert');

describe('test/parser.test.js', () => {
  let md;

  before(async () => {
    md = await fs.readFileSync(path.join(__dirname, 'fixtures/History.md'), 'utf-8');
  });

  it('should parse', () => {
    const list = utils.parse(md);
    // console.log(list);

    assert(list.length === 6);
    assert(list[0].version === '2.14.1');
    assert(list[0].date === '2018-11-24')
    assert(list[0].content.join('\n').includes('remove timeout log msg'));

    assert(list[1].version === '2.14.0');
    assert(list[1].date === '2018-11-17');

    assert(list[3].version === '3.20.1');
    assert(list[3].date === '2018-09-17');
    assert(list[3].content.join('\n').includes('others'));

    assert(list[5].version === '0.0.6');
    assert(list[5].date === '2016-10-24');
    assert(list[5].content.join('\n').includes('docs:update readme (#9)'));
  });

  it('should filter', () => {
    const list = utils.parse(md);
    const result = utils.filter(list, '2018-11-17');
    assert(result.length === 3);
  });

  it('should format', () => {
    const list = utils.parse(md);
    const output = utils.format(list);
    console.log(output);
    assert(output.includes('## 2018-11'));
  });
});
