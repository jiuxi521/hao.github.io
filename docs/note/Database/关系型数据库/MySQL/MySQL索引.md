---
title: MySQL索引
createTime: 2024/10/24 16:40:02
permalink: /article/ojdro2zd/
---
# 索引基础知识
1. 索引是一组有序数据，可以避免二次排序和全表扫描，方便快速定位
2. 覆盖索引
	1. 在索引数据结构中，通过索引值可以直接找到要查询字段的值，而不需要通过主键值[[回表]]查询，那么就叫覆盖索引
	2. 查询的字段被使用到的索引树全部覆盖到


# 索引分类
## 聚簇索引和非聚簇索引

### 聚簇索引

1. 只能给采用InnoDB存储引擎表的数据添加聚簇索引；myisam只支持非聚簇索引
2. 聚簇索引添加规则
	1. MySQL自动采用InnoDB存储引擎中给主键建立索引，该索引属于聚簇索引
	2. 如果表中无主键，会选择一个添加唯一性约束+非空约束的字段作为聚簇索引
	3. 如果当前表中既没有主键字段，也没有添加唯一性约束的字段，InnoDB会创建一个隐藏RowID作为聚簇索引项
	4. 在采用InnoDB存储引擎的表文件中，必须有且仅能有一个聚簇索引
3. 为什么只能有一个聚簇索引？
	1. 因为聚簇索引表示的是数据的实际排序方式，例如：我们让一个班的学生排队时，不能有两种排序规则
	2. 在表文件的其他字段上建立的索引都是非聚簇索引

### 非聚簇索引
1. 非聚簇索引=二级索引
2. 由开发人员自行创建
3. 对于采用了InnoDB存储引擎表，除了一个聚簇索引外，其他字段上创建的索引都是非聚簇索引
4. 在采用MyISAM引擎的表中，创建的所有索引都是非聚簇索引

### 聚簇索引和非聚簇索引区别
1. 聚簇索引（clustered index）
	1. 索引节点存储【聚簇索引标识-主键(ID)、标识对应的数据行数据】
	2. 由于查询数据时，查到数据节点即可获取【具体数据】，无需查询磁盘上的表文件，故速度较快
	3. <font color="#ff0000">聚簇索引保存了主键及该行所有数据</font>
2. 非聚簇索引（secondary index）
	1. 索引节点存储的只是【索引列的值，聚簇索引标识-主键(ID)】
	2. 查询数据时，查到的数据节点保存的是【数据在磁盘表中的具体行数】，获取【具体数据】需要使用IO流读取磁盘文件，故速度较慢
	3. <font color="#ff0000">非聚簇索引只保存了索引列及主键Id</font>

## 主键索引和唯一性索引

> 主键和具有unique约束的字段自动会添加索引

1. 主键索引
	1. 如果当前表文件中字段添加了主键约束，MySQL会主动将当前字段上的数据进行排序，其生成的索引称为主键索引
2. 唯一性索引
	1. 如果当前表文件中字段添加了唯一性约束，MySQL主动将会当前字段上的数据进行排序，其生成的索引称为唯一性索引
	2. 唯一性索引数据不包括NULL
3. 普通索引
	1. 如果当前表文件中的字段没有添加任何约束，此时，该字段上创建的索引称为普通索引
4. 执行效率
	1. 主键索引 > 唯一性索引 > 普通索引

## 单一索引和复合索引

### 单一索引【给一个字段添加索引】

```sql
create index index_name on table_name(列名);
```

### 复合索引（联合）
```sql
create index index_name on table_name(列名1，列名2......);
```
- 给多个字段添加索引
- 建一个联合索引(col1,col2,col3)，实际相当于建了(col1)，(col1,col2)，(col1,col2,col3)三个索引
- 当sql语句用到了联合索引中最左边的索引，那么这条sql语句就可以利用这个联合索引进行匹配；当遇到范围查询（>,<,between,like）时，索引不再匹配【因为第一个因子最先查询，若未查到，无法使用索引】
- 注意事项
	- 设置复合索引时，将区分度高的放到前面
	- 复合索引中无法对列值为null的数据进行排序

# 面试
## 索引结构采用B+ Tree，而不是Hash、二叉树、红黑树？

- 选用[[B+树]]（Balance+ Tree）
	- B+ 树的所有非叶子节点不包含数据，只存放数据的范围；只有叶子节点存放指向数据的指针，<font color="#ff0000">单次IO查询可以读入的内容越多，IO次数越少。</font>
	- B+树的所有叶子节点通过指针串联，方便范围查找
- [[哈希表]]
	- 优点：
		- 适合等值查询；
	- 缺点：
		- 不支持范围查询
		- 存在大量键值重复时，会存在[[哈希表#哈希碰撞|哈希碰撞]]
		- 无法利用索引进行排序；
		- 不支持多列联合索引的最左匹配原则
- [[二叉树]]
	- 优点：
		- 可以快速进行查找、插入、删除操作【O(log<sub>2</sub>N)】
	- 缺点：
		- 主键自增时，新数据插入到二叉树的末尾，会导致二叉树层次较高。退化为链表【O(N)】
- [[红黑树]]
	- 优点：
		- 可以快速进行查找、插入、删除操作【O(logN)】
	- 缺点：
		- 会出现随着数据量增大导致树高不可控

```sql
SELECT * FROM table WHERE a = 1 and b = 2 and c = 3; 
# 如何建立索引：可以建立(a,b,c)(b,c,a)(c,a,b)三者的次序只要根据区分度进行【排序区分度高的放前面，低的放后面【性别、状态等区分度较低】 
SELECT * FROM table WHERE a > 1 and b = 2; 
# 如何建立索引：建立(b,a)索引，mysql会优化语句 
SELECT * FROM `table` WHERE a > 1 and b = 2 and c > 3; 
# 建立(b,a)或(b,c)索引 
SELECT * FROM `table` WHERE a = 1 and b = 2 and c > 3; 
# 建立(a,b,c)索引 
SELECT * FROM `table` WHERE a = 1 ORDER BY b; 
# 建立(a,b)索引 
SELECT * FROM `table` WHERE a > 1 ORDER BY b; 
# 只需要对a建立索引，a是范围查询，b在范围查询内无序 
SELECT * FROM `table` WHERE a IN (1,2,3) and b > 1; 
# 建立(a,b,c)索引，in不会中止索引匹配
```

## 索引创建的注意点
- 综合考虑字段长度和区分度建立索引
- InnoDB引擎默认的页大小是16K，数据项越小，每页容纳的数据量越多，递归层次越小
### 不建议创建索引的情况
- 表字段的数据较少 or 表数据频繁被更新
- 表中数据重复且分布平均【A表中只有两种值】
- 主字段索引值记录条数过多【一个主索引字段对应无数条记录】
- 查询结果返回表中很大比例的数据
### 创建索引建议
- 给不经常执行DML的字段添加索引
- 给频繁出现在where、order by子句后的字段添加索引
- 尽量给不包含null值的字段添加复合索引
	- 列值为null时，无法查询 ，并且无法排序
- 建议使用主键自增的数据作为索引
	- 自增主键是连续的，在插入新数据时能够**减少页分裂，减少数据的移动**
- **不能对索引列进行计算**
	- 在select、order by、group by后面的字段使用函数或计算，索引不会失效
	- 对常量表达式运用公式不会使索引失效
	```sql
	select * from t where c - 1 = 1000;    # 不会使用索引
	select * from t where c = 1000 + 1;    # 会使用索引
	```
### 索引失效的场景
1. 对索引列进行运算
2. 索引列存在NULL值 或 使用(is null、is not null)导致索引失效
3. 联合索引没有满足最左匹配原则
4. 字符串模糊查询使用%放在左侧
5. 存在隐式类型转换
6. or运算符连接的条件中存在非索引字段
7. 使用(!=、<>、not in)导致索引失效