'use strict';
const httpProxy = require('http-proxy'),
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
		type: 'mem'
	}, opt.store);
	opt.proxy = Object.assign({
		target: 'http://127.0.0.1:6666',
		changeOrigin: true
	}, opt.proxy);
	opt.port = opt.port || 9999;

	let proxy = httpProxy.createProxyServer(opt.proxy),
		store = opt.store.type === 'redis' ? 
			new RedisStore(config.store)
		 : new MemStore({
			validCookieKeys: new Set(['_ntes_nnid'])
		});

	this._proxy = proxy;
	this._store = store;
	this._opt = opt;

	proxy.on('proxyReq', (proxyReq, req, res, options) => {
		let reqInfo = utils.getReqInfo(req),
			hitCache = false;
		store.get(req)
			.then((cachedRes) => {
				if (cachedRes) {
					hitCache = true;
					res.writeHead(cachedRes.statusCode, cachedRes.headers);
					var buffer = new Buffer(cachedRes.body, 'base64');
					res.end(buffer);
					// remove default event listener to prevent proxy response
					proxyReq.removeAllListeners('response');
					// reset response event: when proxy response arrives, directly respond the client
					proxyReq.on('response', (proxyRes) => {
						proxyReq.finished = true;
						res.end();
					});
				}
				logger.debug('REQ: ' + reqInfo + ' HIT_CACHE: ' + hitCache);
			}).catch(logger.error);
	});

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
			.then()
			.catch(logger.error);
		});
	});

	proxy.on('error', (err, req, res) => {
		logger.error(err);
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
	// store: config.store,
	port: config.port
});
proxyServer.start();