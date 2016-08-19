'use strict';
const utils = require('../utils'),
	logger = require('../logger'),
	redis = require('redis');

const KEY_PREFIX = 'chp_';

let _opt;

function RedisStore(opt){
	_opt = Object.assign({
    redis: {},
    validCookieKeys: new Set()
  }, opt);
}

RedisStore.prototype.get = function(req) {
	return new Promise((resolve,reject)=>{
		let cacheKey = utils.getReqCacheKey(req, _opt.validCookieKeys);
		if(cacheKey){
      logger.debug('redis key: ', KEY_PREFIX + cacheKey);
			redisGet(KEY_PREFIX + cacheKey)
			.then(resolve)
			.catch(reject);
		} else {
			reject(new Error('failed to get req cache key: ', req))
		}
	});
}

RedisStore.prototype.set = function(req, data) {
	return new Promise((resolve, reject)=>{
		if (req && data) {
			resolve();
			let cacheKey = utils.getReqCacheKey(req, _opt.validCookieKeys);
			if (cacheKey) {
				redisSet(cacheKey, data)
				.then(()=>{
					logger.debug('put cached response data, cacheKey: ', cacheKey);
				})
				.catch(logger.error);
			}
		}	else if(!req){
			logger.warn('empty req!');
		} else {
			logger.warn('empty data!');
		}
	});
}

function activateClient() {
  let self = this;
  return new Promise((resolve, reject) => {
    try {
      let client = redis.createClient(_opt.redis);
      client.on('error', function(err) {
        logger.error('redis client error!', err.stack);
      });
      client.on('end', function() {
        logger.debug('redis client quit');
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
      activateClient().then((client) => {
        client.get(key, function(err, res) {
          if (err) {
            logger.error('failed to get key: ' + key, err.message, err.stack);
            reject(err);
          } else {
            resolve(res);
          }
          client.quit();
        }).catch((err) => {
          reject(err);
        });
      })
      .then(parseObjectResult)
    } else {
      reject(new Error('empty key: ' + key));
    }
  });
}

function redisSet(key, value) {
  return new Promise(function(resolve, reject) {
    if (key && value) {
      activateClient()
        .then((client) => {
          client.set(key, value, (err, res) => {
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
    } else {
      reject(new Error('empty key or value: ' + key, value));
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