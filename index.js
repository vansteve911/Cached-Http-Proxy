'use strict';
const httpProxy = require('http-proxy'),
	config = require('./config.js'),
	logger = require('./logger.js'),
	MemStore = require('./storage/memStore.js'),
  fs = require('fs');

let proxy = httpProxy.createProxyServer({
	target: config.targetHost(),
	changeOrigin: true
})

let memStore = new MemStore({
	validCookieKeys: new Set(['_ntes_nnid'])
});

proxy.on('proxyReq', (proxyReq, req, res, options) => {
	// must reset request host
	
	// proxyReq.setHeader('host', config.target.host);

	// logger.debug('req cookie: ', req.headers.cookie)
	// logger.debug('req url: ', req.url)

	let cachedRes = memStore.get(req);
	if (cachedRes) {
		logger.debug('found cached response!', cachedRes)
		logger.debug('res is: ', res)		
		// res.writeHead(cachedRes.statusCode, cachedRes.headers);
		// res.end(cachedRes.__data);
		proxyReq.finished = true;
	}

});

var resultFile = fs.createWriteStream('result.html', {encoding: 'utf-8'});

var buffers = [];

proxy.on('proxyRes', (proxyRes, req, res) => {
  
  
  logger.debug('proxyRes emitted! ');

  proxyRes.on('data', (chunk)=>{
  	console.log('got %d bytes of data', chunk.length);
  	buffers.push(chunk);
  });

  proxyRes.on('end', ()=>{
  	logger.debug('end! buffers: ', buffers);
  	var bodyBuffer = Buffer.concat(buffers);
  	logger.debug(bodyBuffer.length);
  	buffers = [];

  	// logger.debug('body: ', body);
  });
	
	// memStore.set(req, res);
});

proxy.on('end', (req, res, proxyRes)=>{
	// logger.debug('end emitted! ', res);
	// memStore.set(req, res);
	// 
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