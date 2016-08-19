'use strict';
const crypto = require('crypto'),
	logger = require('./logger');

function digest(input) {
	if (input) {
		return crypto.createHash('MD5').update(input).digest('hex');
	}
}

function parseCookie(cookie, watchCookieKeys) {
	if (cookie && typeof cookie === 'string') {
		let kvs = {},
			kv;
		cookie.split(';').forEach((str) => {
			if (str) {
				str = str.trim();
				if ((kv = str.split('=')) && kv.length === 2) {
					if (watchCookieKeys && watchCookieKeys.has(kv[0])) {
						kvs[kv[0]] = kv[1];
					}
				}
			}
		});
		if (Object.keys(kvs).length) {
			let ret = {};
			Object.keys(kvs).sort().forEach((k) => {
				ret[k] = kvs[k]
			});
			return ret;
		}
	}
	return null;
}

module.exports.getReqCacheKey = (req, watchCookieKeys) => {
	let headers, path, cookieStr;
	if (req && (headers = req.headers || req._headers)) {
		try{
			cookieStr = JSON.stringify(parseCookie(headers.cookie, watchCookieKeys));
			return digest(headers.host + req.url + '_' + cookieStr);
		} catch(err){
			logger.warn('parse cookie str failed');
			logger.warn(err);
			return null;
		}
		
	}
}

module.exports.getReqInfo = (req) => {
	if (req && req.headers) {
		let host = req.headers.host;
		return `${req.method} ${host}${req.url} ; hasCookie:${!!req.headers.cookie}`;
	}
}