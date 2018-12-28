'use strict';

const Command = require('common-bin-plus');
const dayjs = require('dayjs');
const extend = require('extend2');
const httpclient = require('urllib');
const octokit = require('@octokit/rest');

const utils = require('./utils');
const config = require('./config');

class Bot extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.cliName = 'FeedBot';
    this.config = extend(true, config);
    this.github = new octokit();
    this.github.authenticate({
      type: 'token',
      token: this.config.github.token,
    });
  }

  async run() {
    const endDate = dayjs(this.context.argv.startDate).format('YYYY-MM-DD');
    const startDate = dayjs(endDate).add(this.config.day * -1, 'day').format('YYYY-MM-DD');
    this.logger.info(`check ${startDate} to ${endDate}`);

    // collect md
    const result = [];
    for (const repo of this.config.repositories) {
      const item = await this.fetch({ repo });
      if (item) {
        let list = utils.parse(item.content);
        list = utils.filter(list, startDate, endDate);
        if (list.length) {
          const versions = list.map(x => x.version);
          this.logger.info(`find ${list.length} versions: ${versions}`);
          item.output = await this.process({ item, list });
          result.push(item);
        }
      }
    }
    // write issue
    if (result.length) {
      await this.writeIssue({ list: result, startDate, endDate });
    }
  }

  async fetch({ repo }) {
    try {
      const url = `https://raw.githubusercontent.com/${repo}/master/History.md`;
      this.logger.info(`fetch ${repo}`);

      const result = await httpclient.request(url, { dataType: 'text' });

      return {
        repo,
        url,
        content: result.data,
      };
    } catch (err) {
      this.logger.error(`fetch ${repo} got error`, err);
    }
  }

  async process({ item, list }) {
    const result = [
      `# [${item.repo}](https://github.com/${item.repo})`,
    ];
    for (const item of list) {
      result.push(`## ${item.date}, Version ${item.version}`);
      result.push(...item.content);
      result.push('');
    }
    return result.join('\n');
  }

  async writeIssue({ list, endDate }) {
    const title = `${this.config.title} ${endDate}`;
    const body = list.map(x => x.output).join('\n');
    const labels = list.map(x => x.repo);

    const opts = {
      owner: this.config.github.owner,
      repo: this.config.github.repo,
      title,
      labels,
      body,
    };

    this.logger.info(`creating issue',\n ${JSON.stringify(opts, null, 2)}`);
    const result = await this.github.issues.create(opts);
    this.logger.info(`created issue: \n ${JSON.stringify(result, null, 2)}`);
  }
}

module.exports = Bot;
