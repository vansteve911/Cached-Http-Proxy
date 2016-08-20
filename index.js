'use strict';
const httpProxy = require('http-proxy-promisify'),
	config = require('./config'),
	logger = require('./logger'),
	MemStore = require('./storage/memStore'),
	RedisStore = require('./storage/redisStore'),
	utils = require('./utils');

const _proxy = Symbol['proxy'],
	_store = Symbol['store'],
	_opt = Symbol['opt'];

function CachedProxyServer(opt) {
	opt = opt || {};
	opt.store = Object.assign({
		type: 'mem',
		validCookieKeys: opt.validCookieKeys
	}, opt.store);
	opt.proxy = Object.assign({
		target: 'http://127.0.0.1:6666',
		changeOrigin: true
	}, opt.proxy);
	opt.port = opt.port || 9999;

	let proxy = httpProxy.createProxyServer(opt.proxy),
		store;

	if (opt.store.type === 'redis') {
		store = new RedisStore(opt.store);
	} else {
		store = new MemStore(opt.store);
	}

	this._proxy = proxy;
	this._store = store;
	this._opt = opt;

	let interceptor = function reqInterceptor(args) {
		let hitCache = false,
			req = args.req,
			res = args.res,
			reqInfo = utils.getReqInfo(req);
		return store.get(req)
			.then((cachedRes) => {
				return new Promise((resolve, reject) => {
					try {
						if (cachedRes) {
							hitCache = true;
							cachedRes.headers['cache-hit'] = 1;
							res.writeHead(cachedRes.statusCode, cachedRes.headers);
							var buffer = new Buffer(cachedRes.body, 'base64');
							res.end(buffer);
							reject();
						} else {
							resolve();
						}
					} catch (err) {
						reject(err);
					}
					logger.info('REQ: ' + reqInfo + ' HIT_CACHE: ' + hitCache);
				})
			})
	};
	interceptor.isPromisified = true;
	proxy.before('web', 'deleteLength', interceptor);

	proxy.on('proxyRes', (proxyRes, req, res) => {
		let buffers = [];
		proxyRes.on('data', (chunk) => {
			buffers.push(chunk);
		});
		proxyRes.on('end', () => {
			let headers = proxyRes.headers,
				encodedBody = Buffer.concat(buffers).toString('base64');
			headers.via = (headers.via || '') + ', cached-http-proxy';
			store.set(req, {
					statusCode: proxyRes.statusCode,
					headers: headers,
					body: encodedBody
				})
				.catch(logger.error);
		});
	});

	proxy.on('error', (err, req, res) => {
		logger.error(err, 2333);
		res.writeHead(500, {
			'Content-Type': 'text/plain'
		});
		res.end('Something went wrong. And we are reporting a custom error message.');
	});
}

CachedProxyServer.prototype.start = function() {
	this._proxy.listen(this._opt.port);
	logger.debug('proxy server running on port: ' + this._opt.port);
}

let proxyServer = new CachedProxyServer({
	proxy: {
		target: config.target,
	},
	validCookieKeys: config.validCookieKeys,
	store: config.store,
	port: config.port
});

proxyServer.start();