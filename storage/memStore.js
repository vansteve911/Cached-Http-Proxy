'use strict';
const utils = require('../utils.js'),
	logger = require('../logger.js');

let _map, _opt;

function MemStore(opt) {
	_map = new Map();
	_opt = opt;
	_opt.validCookieKeys = new Set(opt.validCookieKeys);
}

MemStore.prototype.get = function(req) {
	return new Promise((resolve, reject) => {
		let cacheKey = utils.getReqCacheKey(req, _opt.validCookieKeys);
		logger.debug('into get: ', cacheKey);
		if (cacheKey) {
			logger.debug(cacheKey);
			resolve(_map.get(cacheKey));
		} else {
			reject(new Error('failed to get req cache key: ', req))
		}
	});
}

MemStore.prototype.set = function(req, data) {
	return new Promise((resolve, reject) => {
		resolve();
		if (req && data) {
			let cacheKey = utils.getReqCacheKey(req, _opt.validCookieKeys);
			if (cacheKey) {
				_map.set(cacheKey, data);
				logger.debug('put cached response data, cacheKey: ', cacheKey);
			}
		} else if (!req) {
			logger.warn('empty req!');
		} else {
			logger.warn('empty data!');
		}
	});
}

module.exports = MemStore;