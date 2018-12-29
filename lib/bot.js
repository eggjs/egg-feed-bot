'use strict';

const Command = require('common-bin-plus');
const dayjs = require('dayjs');
const extend = require('extend2');
const octokit = require('@octokit/rest');

const config = require('./config');

const REGEX_NORMAL = /^(\d+\.\d+\.\d+)\s+\/\s+(\d{4}-\d{1,2}-\d{1,2})/;
const REGEX_RELEASE = /^##\s+(\d{4}-\d{1,2}-\d{1,2}).*?(\d+\.\d+\.\d+).*?(@\S+)/;

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

  initOptions() {
    return Object.assign(super.initOptions(), {
      'dry-run': {
        description: 'run but do not write to issue',
        type: 'boolean',
      },
    });
  }

  async run() {
    const { startDate, endDate, rangeName } = this.getRange(this.context.argv);
    let repositories = this.context.argv._;
    if (repositories.length === 0) repositories = this.config.repositories;

    // collect changelog from repositories
    const result = [];
    for (const repo of repositories) {
      // fetch changelog content
      const item = await this.fetch(repo);
      if (item) {
        // extract newest changelog list
        let changelogList = this.parse(item.content);
        changelogList = this.filter(changelogList, startDate, endDate);
        item.list = changelogList;

        if (changelogList.length) {
          const versions = changelogList.map(x => x.version);
          this.logger.info(`find ${changelogList.length} versions: ${versions}`);
          // convert to md
          item.output = this.render(item);
          result.push(item);
        }
      }
    }

    // write issue
    this.logger.info(`total list: ${result.length}`);
    if (result.length) {
      await this.writeIssue({
        title: `${this.config.title} ${rangeName}`,
        list: result,
        rangeName,
      });
    }
  }

  /**
   * get special range
   *
   * @param {String} args.cronType - `weekly`/`monthly` will return last week/month start and end date
   * @param {String} args.startDate - special startDate
   * @param {String} args.endDate - special endDate
   * @return {Object} return  { startDate, endDate, rangeName }
   */
  getRange({ startDate, endDate, cronType }) {
    let rangeName;
    cronType = cronType || this.config.cronType;
    const now = dayjs(startDate);

    switch (cronType) {
      case 'weekly':
        startDate = now.subtract(1, 'week').startOf('week');
        endDate = now.subtract(1, 'week').endOf('week');
        rangeName = `Weekly(${startDate.format('YYYY-MM-DD')} - ${endDate.format('YYYY-MM-DD')})`;
        break;

      case 'monthly':
        startDate = now.subtract(1, 'month').startOf('month');
        endDate = now.subtract(1, 'month').endOf('month');
        rangeName = `Monthly(${startDate.format('YYYY-MM')})`;
        break;

      default:
        startDate = dayjs(startDate);
        endDate = dayjs(endDate);
        rangeName = `(${startDate.format('YYYY-MM-DD')} - ${endDate.format('YYYY-MM-DD')})`;
        break;
    }

    startDate = startDate.format('YYYY-MM-DD');
    endDate = endDate.format('YYYY-MM-DD');

    this.logger.info(`check ${rangeName}`);

    return { startDate, endDate, rangeName };
  }

  /**
   * @typedef RepoInfo
   * @type {Object}
   * @property {String} repository - repo full name
   * @property {String} owner - repo owner
   * @property {String} repo - repo name
   * @property {String} content - changelog md content
   * @property {ChangeLogInfo[]} list - newest changelog list
   * @property {String} output - newest changelog output string
   */

  /**
   * fetch changelog content
   * @param {String} repository - repo full name
   * @return {RepoInfo} repo info
   */
  async fetch(repository) {
    this.logger.info(`fetch ${repository}`);
    const [ owner, repo ] = repository.split('/');
    try {
      const res = await this.github.repos.getContents({
        owner,
        repo,
        path: this.config.file,
        ref: 'master',
      });
      return {
        repository,
        owner,
        repo,
        content: Buffer.from(res.data.content, 'base64').toString(),
      };
    } catch (err) {
      this.logger.error(err);
    }
  }

  /**
   * @typedef ChangeLogInfo
   * @type {Object}
   * @property {String} type - `normal` / `release`
   * @property {Number} start - item body start line
   * @property {Number} end - item body end line
   * @property {String} title - item title
   * @property {String} version - version name
   * @property {String} date - publish date
   */

  /**
   * parse md to json
   * @param {String} md - changelog md
   * @return {ChangeLogInfo[]} changelog list
   */
  parse(md) {
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
  }

  /**
   * filter changelog list at special range
   *
   * @param {ChangeLogInfo[]} changeLogList - changelog list
   * @param {String} startDate - start range
   * @param {String} endDate - end range
   * @return {ChangeLogInfo[]} newest changelog list
   */
  filter(changeLogList, startDate, endDate) {
    return changeLogList.filter(item => {
      const target = dayjs(item.date);
      return !target.isBefore(startDate) && !target.isAfter(endDate);
    });
  }

  /**
   * convert repo item changelog to md
   *
   * @param {RepoInfo} item - repo item
   * @return {String} changelog md
   */
  render(item) {
    const result = [
      `# [${item.repository}](https://github.com/${item.repository})\n`,
    ];
    for (const x of item.list) {
      result.push(`## ${x.date}, Version ${x.version}`);
      result.push(...x.content);
      result.push('');
    }
    return result.join('\n');
  }

  /**
   * write to issue
   *
   * @param {String} args.title - issue title
   * @param {Array<RepoInfo>} args.list - repo item list
   * @param {String} args.rangeName - rangeName for label
   */
  async writeIssue({ title, list, rangeName }) {
    // prepare opts
    const body = list.map(x => x.output).join('\n');
    const labels = list.map(x => x.repo).concat(rangeName);

    const opts = {
      owner: this.config.github.owner,
      repo: this.config.github.repo,
      title,
      labels,
      body,
    };

    // find whether is exists
    const res = await this.github.issues.listForRepo({
      owner: this.config.github.owner,
      repo: this.config.github.repo,
      labels: [ rangeName ],
    });

    const issue = res.data[0];
    if (!issue) {
      this.logger.info(`creating issue',\n ${JSON.stringify(opts, null, 2)}`);

      if (!this.context.argv.dryRun) {
        const result = await this.github.issues.create(opts);
        this.logger.info(`created issue: \n ${JSON.stringify(result, null, 2)}`);
      }
    } else {
      opts.number = issue.number;
      this.logger.info(`updating issue',\n ${JSON.stringify(opts, null, 2)}`);

      if (!this.context.argv.dryRun) {
        const result = await this.github.issues.update(opts);
        this.logger.info(`updated issue: \n ${JSON.stringify(result, null, 2)}`);
      }
    }
  }
}

module.exports = Bot;
