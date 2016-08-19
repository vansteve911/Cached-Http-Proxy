'use strict';
const utils = require('../utils.js'),
	http = require('http'),
	logger = require('../logger.js');

// var writeFile = fs.createWriteStream('result.html', {encoding: 'utf-8'});

var opt = { port: '80',
  host: 'd.news.163.com:80',
  hostname: 'd.news.163.com',
  // socketPath: undefined,
  // pfx: undefined,
  // key: undefined,
  // passphrase: undefined,
  // cert: undefined,
  // ca: undefined,
  // ciphers: undefined,
  // secureProtocol: undefined,
  method: 'GET',
  headers:
   { cookie: '_ntes_nnid=7bda5b23a933ef4f62a06d397fbe053d,1443498601325; _ntes_nuid=7bda5b23a933ef4f62a06d397fbe053d; usertrack=ZUcIhVYV5x9GrSNYPoQkAg==; vjuids=9656ccad2.150942d9e55.0.dce187e4; __gads=ID=701b6daed743d9b7:T=1445595037:S=ALNI_MZDkNMmZDt5ty4WotECQdrfkLTxhg; e163guided=1; date=2016018; __utma=187553192.878549688.1445595038.1464056850.1464937629.2; __utmz=187553192.1464937629.2.2.utmcsr=163.com|utmccn=(referral)|utmcmd=referral|utmcct=/; NTES_REPLY_NICKNAME=wxt911genius%40163.com%7Cwxt911genius%7C4378458107678384207%7C88850635%7Chttp%3A%2F%2Fmimg.126.net%2Fp%2Fbutter%2F1008031648%2Fimg%2Fface_big.gif%7CC8ncIg1lmB_WeZC9TqGhYkKBa61NUKX77VZW_1Grq5LpJYRBJ0rMWQA270tf7SFqcH2zOSb8WIXNncwTB6mW5WMtw_noersRDlRw1EWsdE6pf%7C-1%7C2; _jzqa=1.2277064483149741000.1467615221.1467615221.1467615221.1; _jzqx=1.1467615221.1467615221.1.jzqsr=nej%2Enetease%2Ecom|jzqct=/case/index%2Ehtml.-; NTES_CMT_USER_INFO=16772798%7Cwxt911genius%7Chttp%3A%2F%2Fmimg.126.net%2Fp%2Fbutter%2F1008031648%2Fimg%2Fface_big.gif%7Cfalse%7Cd3h0OTExZ2VuaXVzQDE2My5jb20%3D; P_INFO=wxt911genius@163.com|1470968544|1|kaola|11&17|bej&1470968356&caldav#bej&null#10#0#0|&0|blog&dada&dada_check|wxt911genius@163.com; NTES_PASSPORT=gOt.LiuGnaqG_cJ0JWCP2H121ZA4gPte1P75sBZCHlMuj0mKjiCG5_aLtiU8tfdHVeLoIfr95NObDVR2K4T5l5GURsD6QCcmFpmRB.5cS.4u8; _ga=GA1.2.878549688.1445595038; Province=010; City=010; vjlast=1445595029.1471506772.11; nteslogger_exit_time=1471510727844; ne_analysis_trace_id=1471594745450; vinfo_n_f_l_n3=a2a9e3f76b5ef9ea.1.1095.1445595029295.1471591706362.1471594749064; s_n_f_l_n3=a2a9e3f76b5ef9ea1471592018868',
     'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
     'accept-encoding': 'gzip, deflate, sdch',
     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
     'upgrade-insecure-requests': '1',
     'cache-control': 'no-cache',
     pragma: 'no-cache',
     host: 'd.news.163.com:80',
     connection: 'close' 
   },

  agent: false,
  localAddress: undefined,
  path: '/',
  'upgrade-insecure-requests': '0' 
}

// var opt = {
// 	hostname: 'd.news.163.com',
// 	port: 80,
// 	path: '/',
// 	method: 'GET'
// }

var req = http.request(opt, (res) => {
	res.on('data', (chunk) => {
		logger.debug(chunk.toString('base64'));
	})
});

req.end();

// writeFile.on('end', ()=>{
// 	logger.debug('finished!');
// })

// readFile.pipe(writeFile)