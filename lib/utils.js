'use strict';

const dayjs = require('dayjs');
const REGEX_NORMAL = /^(\d+\.\d+\.\d+)\s+\/\s+(\d{4}-\d{1,2}-\d{1,2})/;
const REGEX_RELEASE = /^##\s+(\d{4}-\d{1,2}-\d{1,2}).*?(\d+\.\d+\.\d+).*?(@\S+)/;

exports.parse = md => {
  const result = [];
  const lines = md.split(/\n/);

  let item;

  for (const [ index, line ] of lines.entries()) {
    if (REGEX_NORMAL.test(line)) {
      if (item) item.end = index - 1;
      item = {
        type: 'normal',
        start: index + 2,
        end: lines.length,
        version: RegExp.$1,
        date: RegExp.$2,
        title: line,
      };
      result.push(item);
    } else if (REGEX_RELEASE.test(line)) {
      if (item) item.end = index;
      item = {
        type: 'release',
        start: index + 1,
        end: lines.length - 1,
        version: RegExp.$2,
        date: RegExp.$1,
        title: line,
      };
      result.push(item);
    }
  }

  result.forEach(item => {
    item.content = lines.slice(item.start, item.end);
  });

  return result;
};

exports.filter = (input, startDate, endDate) => {
  return input.filter(item => {
    const target = dayjs(item.date);
    return !target.isBefore(startDate) && !target.isAfter(endDate);
  });
};
