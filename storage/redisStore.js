'use strict';
const utils = require('../utils.js'),
	logger = require('../logger.js'),
	redis = require('redis');

const KEY_PREFIX = 'chp_';

let _opt = {};

function RedisStore(opt){
	_opt = Object.assign({}, opt) 
}

RedisStore.prototype.get = function(req) {
	let cacheKey = utils.getReqCacheKey(req, this.validCookieKeys);
	if(cacheKey)
	return redisGet(cacheKey);
}

RedisStore.prototype.set = function(req, data) {
	if (req && data) {
		let cacheKey = utils.getReqCacheKey(req, this.validCookieKeys);
		if (cacheKey) {
			redisSet(cacheKey, data)
			.then(()=>{
				logger.debug('put cached response data, cacheKey: ', cacheKey);
			})
			.catch(logger.error);
		}
	}
}

function activateClient() {
  let self = this;
  return new Promise((resolve, reject) => {
    try {
      let client = redis.createClient(config.redis);
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

function redisGet = function(key) {
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

function redisSet = function(key, value) {
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