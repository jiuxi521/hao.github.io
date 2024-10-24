---
title: CDN
createTime: 2024/10/24 16:40:00
permalink: /article/hjw3o19c/
---
# CDN
Content Delivery Network（内容分发网络）
## 分发内容
![image.png](https://raw.gitmirror.com/jiuxi521/typora/master/202403301456932.png)

## 域名
1. 域名最多可以有四级（A.B.C.D）；
2. 最右边的域（D）的级别最高。  
![DNS服务器之间的查询操作|500](https://raw.gitmirror.com/jiuxi521/typora/master/202404011925116.png)



## 加速域名
经CDN加速的域名；

## CDN访问原理
CDN缓存动静态资源，加快访问速度；
1. 传统网站访问流程：
	1. 客户端访问域名，经域名解析器（[s](CDN.md#DNS))解析为IP地址并返回给客户端，客户端通过IP地址请求Web服务器，请求资源
2. CDN加速的访问流程：
	1. 在DNS中配置了<font color="#ff0000">(域名—>CDN域名)</font>的映射，客户端访问域名时，DNS将其解析为CDN域名并返回，客户端实际访问的是CDN服务器



## DNS
1. 域名解析器(Domain Name System)，提供将域名转为IP地址的服务。
2. 配置资源记录（Resource Record）定义了 域名—>IP的映射 或 域名—>域名的映射
	1. A记录(ADDRESS)： 域名—>IP的映射的映射
	2. CNAME记录(Canonical Name)：域名—>域名的映射，实现多域名指向同一个IP地址
	3. NS记录(Name Server)：记录域名—>DNS服务器的映射，指定域名由哪台DNS服务器解析
	4. MX记录(Mail Exchanger)：记录电子邮件地址—>邮件服务器的映射，指定电子邮件发往何处
![image.png|500](https://raw.gitmirror.com/jiuxi521/typora/master/202404011731019.png)



















