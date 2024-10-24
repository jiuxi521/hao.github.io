---
title: SELinux
createTime: 2024/10/24 16:40:00
permalink: /article/3662n2gi/
---
安全增强型 Linux（Security-Enhanced Linux）简称 SELinux，它是一个 Linux 内核模块，也是 Linux 的一个安全子系统。

SELinux 主要作用就是最大限度地减小系统中服务进程可访问的资源（最小权限原则）。

**直接关掉**  
确认 SELinux 的运行状态

```java
sestatus
```

临时关闭 SELinux：

```java
setenforce 0
```

临时启动 SELinux：

```java
setenforce 1
```

永久关闭/启动：

```java
修改/etc/sysconfig/selinux文件
SELINUX=disabled 后重启系统
```