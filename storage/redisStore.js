'use strict';
const utils = require('../utils'),
  logger = require('../logger'),
  redis = require('redis');

const KEY_PREFIX = 'chp_';

let _opt;

function RedisStore(opt) {
  _opt = opt;
  _opt.validCookieKeys = new Set(_opt.validCookieKeys);
}

RedisStore.prototype.get = function(req) {
  return new Promise((resolve, reject) => {
      let cacheKey = utils.getReqCacheKey(req, _opt.validCookieKeys);
      if (cacheKey) {
        resolve(KEY_PREFIX + cacheKey);
      } else {
        reject(new Error('failed to get req cache key: ', req))
      }
    })
    .then(redisGet)
    .then(parseObjectResult);
}

RedisStore.prototype.set = function(req, data) {
  return new Promise((resolve, reject) => {
    if (req && data) {
      let dataStr;
      try {
        dataStr = JSON.stringify(data);
      } catch (err) {
        logger.warn(err);
        return reject(err);
      }
      let cacheKey = utils.getReqCacheKey(req, _opt.validCookieKeys);
      if (cacheKey) {
        let redisKey = KEY_PREFIX + cacheKey;
        redisSet(redisKey, dataStr)
          .then(resolve)
          .catch(reject);
      }
    } else if (!req) {
      logger.warn('empty req!');
      resolve(null);
    } else {
      logger.warn('empty data!');
      resolve(null);
    }
  });
}

function activateClient() {
  let self = this;
  return new Promise((resolve, reject) => {
    try {
      let client = redis.createClient(_opt.redisConfig);
      client.on('error', function(err) {
        logger.error('redis client error!', err.stack);
      });
      client.on('end', function() {
        logger.trace('redis client quit');
      });
      resolve(client);
    } catch (err) {
      reject(err);
    }
  })
}

function redisGet(key) {
  return new Promise((resolve, reject) => {
    if (key) {
      logger.trace('in redisGet, key: ', key);
      activateClient()
        .then((client) => {
          client.get(key, function(err, res) {
            if (err) {
              logger.error('failed to get key: ' + key, err.message, err.stack);
              reject(err);
            } else {
              resolve(res);
            }
            client.quit();
          })
        })
        .catch(reject);
    } else {
      reject(new Error('empty key: ' + key));
    }
  });
}

function redisSet(key, value) {
  return new Promise((resolve, reject) => {
    if (key && value) {
      logger.trace('in redisSet, key: ', key);
      activateClient()
        .then((client) => {
          client.set(key, value, function(err, res) {
            if (err) {
              logger.error('failed to set, key: ' + key + ', value: ' + value, err.message, err.stack);
              reject(err);
            } else {
              resolve(res === 'OK');
            }
          });
          client.quit();
        }).catch((err) => {
          reject(err);
        });
    } else if (!key) {
      reject(new Error('empty key!'));
    } else {
      reject(new Error('empty value!'));
    }
  });
}

function parseObjectResult(result) {
  return new Promise((resolve, reject) => {
    if (result) {
      try {
        resolve(JSON.parse(result));
      } catch (err) {
        logger.error('parseObjectResult err: ', err);
        reject(err);
      }
    } else {
      resolve(null);
    }
  });
}

module.exports = RedisStore;