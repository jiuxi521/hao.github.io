---
title: InnoDB引擎
createTime: 2024/10/24 16:40:02
permalink: /article/v3ut7uqv/
---
1. InnoDB引擎使用[[B+树]]存储
2. 不支持哈希索引
## 特点

1. 数据存放分为共享表空间和独立表空间
2. 支持B+树索引、聚簇索引、（Full-text search）全文索引
3. 支持主从复制、分区支持（分库分表）

## 重点

1. 支持主从复制、分库分表（分区支持）
2. 支持聚簇索引在底层存储数据，提升对主键查询的IO性能
3. 支持行锁（ACID）和多版本并发控制（MVCC）

## 原理
![](https://raw.gitmirror.com/jiuxi521/typora/master/202403241752324.png)