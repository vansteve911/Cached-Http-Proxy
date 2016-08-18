'use strict';
const httpProxy = require('http-proxy'),
	config = require('./config.js'),
	logger = require('./logger.js'),
	MemStore = require('./storage/memStore.js');

let proxy = httpProxy.createProxyServer({
	target: config.targetHost()
})

let memStore = new MemStore({
	validCookieKeys: new Set(['_ntes_nnid'])
});

proxy.on('proxyReq', (proxyReq, req, res, options) => {
	// must reset request host
	proxyReq.setHeader('host', config.target.host);
	// logger.debug('req cookie: ', req.headers.cookie)
	// logger.debug('req url: ', req.url)

	let cachedRes = memStore.get(req);
	if (cachedRes) {
		logger.debug('found cached response!', cachedRes)
		logger.debug('res is: ', res)
		
		res.writeHead(cachedRes.statusCode, cachedRes.headers);
		res.end(cachedRes.__data);

		proxyReq.finished = true;
	}

});

proxy.on('proxyRes', (proxyRes, req, res) => {
	logger.debug('put res into cache: ', res._headers);

	// let resData = {
	// 	headers: res._headers,
	// 	data: res.__data
	// };
  res._originalWrite = res.write; // Store reference to the original write method
  
  // res.__readable = new require('stream').Readable;
  // res.__readable.setEncoding('utf8');

  res.__data = '';

  // TODO: retrieve server response buffer data????
  res.write = function(chunk, encoding, callback) {
    res.__data += chunk;
    res._originalWrite.call(res, chunk, encoding, callback);
  }
	// memStore.set(req, resData);

	memStore.set(req, res);
});

proxy.on('error', (err, req, res) => {
	logger.error(err);
	res.writeHead(500, {
		'Content-Type': 'text/plain'
	});
	res.end('Something went wrong. And we are reporting a custom error message.');
});

proxy.listen(config.port);

logger.debug('proxy server running on port: ' + config.port);