---
title: MySQL的特殊SQL语句
createTime: 2024/10/24 16:40:02
permalink: /article/j4as2cfc/
---
# 查看数据库的锁情况
```sql
SELECT
	row_number() OVER () 行号,
	t.THREAD_ID '锁线程(THREAD_ID)',
	t.OBJECT_NAME '锁的表(OBJECT_NAME)',
	t.INDEX_NAME '锁的索引(INDEX_NAME)',
	t.LOCK_TYPE '锁粒度(LOCK_TYPE)',
	t.LOCK_MODE '锁类型(LOCK_MODE)',
	t.LOCK_STATUS '锁状态(LOCK_STATUS)',
	t.LOCK_DATA '锁的数据(LOCK_DATA)' 
FROM
	PERFORMANCE_SCHEMA.data_locks t;
```

# 查看表对应的Schema
```sql
SELECT
	table_schema 
FROM
	information_schema.TABLES 
WHERE
	table_name = 'ucg_baseapi_api_info';
```

# 查看表索引
```sql
SHOW INDEX FROM accounts;
```

# 查看表
```sql
SHOW TABLE STATUS;
```
