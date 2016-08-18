'use strict';
const utils = require('../utils.js'),
	logger = require('../logger.js'),
	Readable = require('stream').Readable;

let _map;

class MemStore {
	constructor(opt) {
		_map = new Map();
		opt = opt || {};
		this.validCookieKeys = opt.validCookieKeys || [];
	}

	set(req, res) {
		if(req && res){
			let cacheKey = utils.getReqCacheKey(req, this.validCookieKeys);
			logger.debug('in set: cacheKey:', cacheKey);
			if (cacheKey) {
				_map.set(cacheKey, res);
				logger.debug('put cached res!', res._headers);
			}
		}
	}

	get(req) {
		let cacheKey = utils.getReqCacheKey(req, this.validCookieKeys);
		logger.debug('in get, cacheKey:', cacheKey);
		return _map.get(cacheKey);
	}
}

module.exports = MemStore;