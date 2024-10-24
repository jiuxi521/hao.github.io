---
title: Next-Key锁
createTime: 2024/10/24 16:40:02
permalink: /article/i1yykrlc/
---
# Next-Key锁
## 定义
1. <font color="#ff0000">一种事务隔离的加锁机制</font>
2. MySQL InnoDB引擎的一种行级锁，在<font color="#ff0000">索引范围内的索引记录和索引之间的间隙</font>同时加锁。
3. 是一种组合锁（[[行锁#记录锁（ 记录锁 Record Lock ）|记录锁]] + [[行锁#间隙锁（ 间隙锁 Gap Lock ）|间隙锁]]）
4. **Next-Key锁** 主要用于实现 **可重复读（Repeatable Read, RR）** 隔离级别，而在 **读已提交（Read Committed, RC）** 隔离级别下则并不生效。

## 功能
1. 用于处理多事务并发的[[幻读]]问题；
	1. 在RR级别下，使用Next-key Lock锁可以避免幻读