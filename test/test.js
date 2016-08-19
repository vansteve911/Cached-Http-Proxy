'use strict';
const utils = require('../utils.js'),
	http = require('http'),
	logger = require('../logger.js');

// var writeFile = fs.createWriteStream('result.html', {encoding: 'utf-8'});

var req = http.request({
	hostname: 'd.news.163.com',
	port: 80,
	path: '/',
	method: 'GET'
}, (res) => {
	res.on('data', (chunk) => {
		logger.debug(chunk.toString());
	})
});

req.end();

// writeFile.on('end', ()=>{
// 	logger.debug('finished!');
// })

// readFile.pipe(writeFile)