# Cached Http Proxy

## 简介

具有缓存功能的简单代理服务器，用于后端服务器变动较大或经常不可用的开发环境。收到客户端的请求后进行缓存，之后即使后端服务器不可用也可保证接口可访问。基于[http-proxy](https://github.com/nodejitsu/node-http-proxy)库实现。

- 支持会话缓存：通过指定的cookie字段区分不同client的会话
- 缓存方式可选：node进程内存或redis (基于[node-redis](https://github.com/NodeRedis/node_redis))

## 需要
- node 0.12.15+
- [redis] (http://redis.io/)(如果使用redis缓存的话) 

## 用法
1. 修改hosts文件，添加这样一条域名解析：  
	`{代理服务器IP} {前缀}.{后端服务器域名}`

	***如***：`127.0.0.1 dev.d.news.163.com`
	
	其中前缀可以自定义，其作用是，让客户端访问代理服务器时能够带上后端服务器的cookie。
2.  
	```
	git clone {repo-url} ./
	cd ./cached-http-proxy
	npm install
	```
3. 修改配置文件`config.js`，详见注释。
4. ```
	npm start
	```
	
