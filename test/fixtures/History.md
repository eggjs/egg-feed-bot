## 2018-11-24, Version 2.14.1 @atian25

### Notable changes

* **fixes**
  * remove timeout log msg

* **others**
  * use circular-json-for-egg to remove deprecate message

### Commits

  * [[`0fb5a96c0`](http://github.com/eggjs/egg/commit/0fb5a96c023e916cb9c14c5960df62547ed391d8)] - fix: remove timeout log msg (#3229) (TZ | 天猪 <<atian25@qq.com>>)
  * [[`de81caef1`](http://github.com/eggjs/egg/commit/de81caef1d91c229effadd25ddf752297c2a08f5)] - deps: use circular-json-for-egg to remove deprecate message (#3211) (Yiyu He <<dead_horse@qq.com>>)

## 2018-11-17, Version 2.14.0 @dead-horse

### Notable changes

* **features**
  * add create anonymous context to agent
  * support server timeout

* **fixes**
  * curl: allow request timeout bigger than agent timeout
  * triggerServerDidReady should be triggered only once

### Commits

  * [[`db999d3f7`](http://github.com/eggjs/egg/commit/db999d3f7afa210c855f3f1a4518e83f7d8c1dc6)] - docs: add serverTimeout to d.ts (#3200) (TZ | 天猪 <<atian25@qq.com>>)
  * [[`a43fef4e1`](http://github.com/eggjs/egg/commit/a43fef4e1828937d3d84469989582df273de1493)] - docs(index.d.ts): curl 增加泛型 (#3197) (The Rock <<simonzhong0924@gmail.com>>)
  * [[`d40124a25`](http://github.com/eggjs/egg/commit/d40124a25fcd1b52ab862ee297139a022458b81d)] - feat: add create anonymous context to agent (#3193) (Hongcai Deng <<admin@dhchouse.com>>)


3.21.0 / 2018-12-27
===================

  **features**
    * [[`93f8009`](https://github.com/eggjs/egg-mock/commit/93f8009c2f4c7d7f24b361f4713e035a2f993134)] - feat: cluster mock support result (#92) (TZ <<atian25@qq.com>>)
    * [[`be3d146`](https://github.com/eggjs/egg-mock/commit/be3d1466bf438a379b85429c40c510d6be7ecc26)] - feat: bootstrap support run on jest env (#93) (fengmk2 <<fengmk2@gmail.com>>)

0.0.7 / 2016-10-25
==================

  * feat: should close agent when app close (#12)

3.20.1 / 2018-09-17
==================

**fixes**
  * [[`4b5dbb5`](http://github.com/eggjs/egg-mock/commit/4b5dbb512bf8f598d5ea5361c58ae9d40d528ff8)] - fix: add app.mockLog() to improve app.expectLog() more stable (#87) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`a64db33`](http://github.com/eggjs/egg-mock/commit/a64db33d2ee68a76f7c41303e79e37099f33b373)] - deps: add egg-logger dependency (#88) (fengmk2 <<fengmk2@gmail.com>>)

0.0.6 / 2016-10-24
==================

  * feat: cluster should wait process exit (#11)
  * docs:update readme (#9)
  * docs: update readme
