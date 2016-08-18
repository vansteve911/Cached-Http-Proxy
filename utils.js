'use strict';
const crypto = require('crypto'),
	logger = require('./logger.js');

function digest(input) {
	if (input) {
		return crypto.createHash('MD5').update(input).digest('hex');
	}
}

function parseCookie(cookie, watchKeys) {
	if (cookie && typeof cookie === 'string') {
		let kvs = {},
			kv;
		cookie.split(';').forEach((str) => {
			if (str) {
				str = str.trim();
				if ((kv = str.split('=')) && kv.length === 2) {
					if (!watchKeys || watchKeys.has(kv[0])) {
						kvs[kv[0]] = kv[1];
					}
				}
			}
		});
		if (kvs) {
			let ret = {};
			Object.keys(kvs).sort().forEach((k) => {
				ret[k] = kvs[k]
			});
			return ret;
		}
	}
}

module.exports.getReqCacheKey = (req, watchKeys) => {
	logger.debug('type of request: ', typeof req);
	let headers, path;
	if (req && (headers = req.headers || req._headers) && headers && headers.cookie) {
		// logger.debug('req: ', req)
		let keyObj = {
			url: headers.host + req.path,
			cookie: parseCookie(headers.cookie, watchKeys)
		};
		logger.debug('in getReqCacheKey: parseCookie: ', keyObj.cookie)
		try {
			return digest(JSON.stringify(keyObj));
		} catch (err) {
			logger.error(err);
		}
	}
}