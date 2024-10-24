---
title: MyISAM引擎
createTime: 2024/10/24 16:40:02
permalink: /article/hfpkig24/
---
## 缺点

1. 不支持行级锁、事务、外键、MVCC
2. MyISAM引擎支持哈希索引

### 适用场景

1. 不需要事务、不要求数据一致性的业务
2. 适用于读请求较多、写请求较少的业务
3. 适用于数据修改较少的业务