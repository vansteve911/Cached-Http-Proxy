'use strict';
const utils = require('../utils.js'),
	logger = require('../logger.js');

let _map;

function MemStore(opt) {
	_map = new Map();
	opt = opt || {};
	this.validCookieKeys = opt.validCookieKeys || [];
}

MemStore.prototype.get = function(req) {
	let cacheKey = utils.getReqCacheKey(req, this.validCookieKeys);
	if (cacheKey) {
		return _map.get(cacheKey)
	};
}

MemStore.prototype.set = function(req, data) {
	if (req && data) {
		let cacheKey = utils.getReqCacheKey(req, this.validCookieKeys);
		if (cacheKey) {
			_map.set(cacheKey, data);
			logger.debug('put cached response data, cacheKey: ', cacheKey);
		}
	}
}

module.exports = MemStore;