---
title: Nginx
createTime: 2024/10/24 16:40:00
permalink: /article/fjnvqpqk/
---
# Nginx

## nginx作用
1. 反向代理
2. 负载均衡
3. 动静分离
## nginx命令
```shell
nginx.exe # 启动nginx
nginx -t  # 检查nginx配置文件是否符合规范
nginx -s stop # 停止
nginx -s quit # 安全退出
nginx -s reload # 重启并加载配置文件
```

## nginx配置文件
```conf

```

## 正向代理和反向代理
正向代理是代理客户端；反向代理是代理服务器端
VPN翻墙访问是VPN工具代理客户端发送请求到国外网站，并返回响应结果给客户端
![image.png|500](https://raw.gitmirror.com/jiuxi521/typora/master/202403301635785.png)
![image.png|500](https://raw.gitmirror.com/jiuxi521/typora/master/202403301643252.png)

# 问题
### nginx请求修改
```conf
# 指定反向代理的服务器及权重
upstream cluster{
	server localhost:8081;
	server localhost:8082;
}
http{
	location /api {
		# Rewrite请求，将/api路径去除
		rewrite ^/api(.*)$ $1 break;
		# 配置反向代理
		proxy_pass http://cluster/;
	}
}
```


# 问题

| 问题                                                                                      | 解决                                                                                                                                                                                                                                                                                                                   | 博客                                                                                                          |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| connect() to 127.0.0.1:8082 failed (13: Permission denied) while connecting to upstream | SELinux基于最小权限原则默认拦截了 Nginx 的请求，SELinux 是 Linux 的安全子系统<br><br>1. 关闭SELinux：**解决方法，要么是直接关掉它，要么执行下方指令开启 HTTP 访问**  <br>**开启 HTTP 访问：**`setsebool -P httpd_can_network_connect 1`<br><br>**关闭SElinux**：<br>1. 临时关闭：`setenforce 0`    临时开启：`setenforce 1`<br>2. 永久关闭\|启动：`/etc/sysconfig/selinux   SELINUX=disabled `<br> | [博客](https://blog.csdn.net/m0_50176078/article/details/128097715)<br><br>[SELinux](../计算机网络/SELinux.md)<br> |
|                                                                                         |                                                                                                                                                                                                                                                                                                                      |                                                                                                             |
|                                                                                         |                                                                                                                                                                                                                                                                                                                      |                                                                                                             |

``
