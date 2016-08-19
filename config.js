module.exports = {
  target: 'http://d.news.163.com:80',
  // store: {
  // 	type: 'mem',
  //   validCookieKeys: []
  // },
  store: {
    type: 'redis',
    validCookieKeys: [],
    redisConfig: {
      host: '127.0.0.1',
      port: 6379,
      idleTimeout: 3000, // custom config
      retry_strategy: function(options) {
        if (options.error.code === 'ECONNREFUSED') {
          return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Retry time exhausted');
        }
        if (options.times_connected > 10) {
          return undefined;
        }
        return Math.max(options.attempt * 100, 3000);
      }
    }
  },
  port: 9999
}