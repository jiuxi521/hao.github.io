---
title: MVCC
createTime: 2024/10/24 16:40:02
permalink: /article/svo77ncx/
---
# MVCC
> [MVCC](https://blog.csdn.net/qq_41361506/article/details/108538702)

## 定义

1. 一种在 **隔离级别(读已提交和可重复读)** 下工作的 **无锁并发访问的** <span style="background:#9254de">事务隔离机制</span>
2. MVCC是多版本并发控制（Multi-Version Concurrency Control）的缩写。它是数据库管理系统中一种用于提供数据并发访问同时确保一致性的并发控制方法。

## 原理
1. MVCC在每行数据上添加隐藏列`DATA_TRX_ID`和`DATA_ROLL_PTR`;没有主键时，添加隐藏主键列`DB_RAW_ID`
	1. `DATA_TRX_ID`：标识最后一次修改该行的事务
	2. `DATA_ROLL_PTR`：指向用于实现 MVCC 的旧版本
	3. `DB_RAW_ID`：隐藏主键列
	4. ![image.png|500](https://raw.gitmirror.com/jiuxi521/typora/master/202410231004049.png)
2. 为每个事务基于数据行维护一份<font color="#245bdb">读取视图</font>（[[Read View]]）
3. 为每个未提交的事务维护一个版本、所有未提交的版本组成[[活跃事务表]]

## 功能

1. [[活跃事务表]]+[[Read View]] 解决 [[脏读]]、[[不可重复读]]
	1. 活跃事务表跟踪未提交事务的状态，Read View模型可根据事务Id与活跃事务表，避免脏读和不可重复读
2. 允许多事务并发，不阻塞的读取数据
3. [[快照读]]的实现方案
	1. MVCC保证了快照读场景的数据一致性


## 问题
1. 存在幻读
	1. 一个事务中的<font color="#ff0000">纯</font>[[快照读]]是基于快照(MVCC)进行**查询**，不会出现幻读；
	3. 一个事务中同时出现快照读+当前读(DML)，会导致[[幻读]]
		1. 当前读中的增、删、改操作，读取的是最新的数据，可能读取到其他事务已提交的数据，造成幻读