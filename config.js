module.exports = {
  /* target backend server address */
  target: 'http://d.news.163.com:80',
  /* valid cookies for session  */
  validCookieKeys: [],
  /* 
   * store config
   * 
   * default store: node process memory
   */
  // store: {
  //   type: 'mem',
  // },
  /*
   * a sample config for redis store
   */
  store: {
    type: 'redis',
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
  /* proxy server port */
  port: 9999
}