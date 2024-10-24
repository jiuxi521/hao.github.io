---
title: Read View
createTime: 2024/10/24 16:40:02
permalink: /article/9e0stlop/
---
# Read View
## 定义
1. 读取视图是每个事务独有的，<font color="#ff0000">用于决定事务能够读取哪些数据版本</font>。读取视图基于事务启动时的时间戳或事务ID。
	1. 具体来说，读取视图包括一个最大的已提交事务ID（或时间戳），表示在事务启动之前已经提交的所有事务。<font color="#ff0000">这个视图保证了事务只能看到在它启动之前已经提交的数据</font>，解决了[不可重复读](note/Database/关系型数据库/MySQL/不可重复读.md)的问题。
2. 不同隔离级别，Read View的生成时机不同
	1. RU、串型化读不支持MVCC，不支持Read View
	2. RC：每次select都重新生成一个行记录快照，读取最新的数据
	3. RR：第一次select就会生成一个行记录快照；事务内保证重复读取
## 原理
1. Read View 模型
	1. ![image.png](https://raw.gitmirror.com/jiuxi521/typora/master/202403131742166.png)
	2. 如果当前行记录版本是 trx_id < 活跃的最小事务 ID (up_limit_id)，说明行记录在这些活跃的事务创建前就已经提交，这个行记录对当前事务是可见的。
	3. 如果当前行记录事务版本 trx_id > 活跃的最大事务 ID (low_limit_id) 说明，这个行记录是在事务后创建的，这个行记录对当前事务不可见。
	4. 如果 up_limit_id < trx_id < low_limit_id，则有如下情况：
		1. 若 row trx_id 在数组 trx_ids（[[活跃事务表]]） 中，表示这个版本是由还没提交的事务生成的，**不可见**。
		2. 若 row trx_id 不在数组 trx_ids（[[活跃事务表]]） 中，表示这个版本是已经提交了的事务生成的，**可见**。
2. 行记录快照模型（Undo Log日志）
	1. 数据表中的一行数据会对应多个版本，每个版本都会对应一个事务Id（row_trx_id），读取某个版本的数据时，是通过版本Id + Undo log中存储的快照链表获取指定的版本数据
	2. 行记录快照是保存在 Undo Log 中，并且行记录快照是通过链表串联起来，每个快照都保存了 trx_id (事务 ID)，如果要找到历史快照，只需要遍历回滚指针进行查找。
	3. ![Undo Log](https://raw.gitmirror.com/jiuxi521/typora/master/202403131746913.png)
