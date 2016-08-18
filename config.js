module.exports = {
	target: {
		scheme: 'http',
		host: 'd.news.163.com',
		port: 80
	},
	targetHost: function() {
		return this.target.scheme + '://' + this.target.host + ':' + this.target.port;
	},
	port: 9999
}