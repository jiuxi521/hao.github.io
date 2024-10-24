---
title: MySQL名词解释
createTime: 2024/10/24 16:40:02
permalink: /article/08ep5m26/
---
## 英文简写
- DB：数据库
- DBS：数据库系统
- DBMS：数据库管理系统
- SQL：结构化查询语言

## 数据库设计三范式
- 第一范式：要求每个字段不可再分，每个字段具有原子性
	- 例如：地址字段可包括省、市、区
- 第二范式：要求必须有主键，非主键字段完全依赖主键，不能产生部分依赖。【<font color="#ff0000">第二范式解决多对多关系</font>】
	- 例如：学号、姓名、课程号、课程名、分数
		- 学号+课程号确定一门成绩，此时，需要创建三张表；不能创建一张表包含等所有字段；因为姓名不依赖于课程号；课程名不依赖于学号
		- 应设计为 表（学生ID、学生姓名）、表（课程ID、课程名、课程号）、表（学生ID、课程ID、分数）
- 第三范式：要求所有非主键字段必须直接依赖主键，不能产生传递依赖【<font color="#ff0000">第三范式解决一对多关系</font>】
	- 例如：学院主任、学院号、学院名；
		- 学院主任依赖学院名，学院名依赖学院号；产生传递依赖   
		- 应设计为 表（主任Id + 主任名+学院Id）、表（学院Id+学院号+学院名）
## 字符集和校对规则
- 字符集（charset=utf8mb4）：一种从二进制编码到某类字符符号的映射，定义mysql中存储字符串的方式
- 校对规则（COLLATE utf8_general_ci ）：在字符集内用于字符比较和排序的一套规则，
- 字符集和校对规则是一对多的关系；字符集一般有自己默认的校对规则

## SQL语句分类
- DQL：select
- DML：insert、delete、update
- DDL：create、drop、alter
- TCL：commit、rollback
- DCL ：grant、revoke

## 大小写规范
1. MySQL 在 Linux 的环境下，数据库名、表名、变量名是严格区分大小写的，而字段名是忽略大小写的。
2. MySQL 在 Windows 的环境下全部不区分大小写。

## 数据类型
```sql
int        整数型(java中的int)
bigint    长整型(java中的long)
float    浮点型(java中的float double)
char    定长字符串(String)【日期一般定义char(10)】
varchar    可变长字符串(StringBuffer/StringBuilder)
text    大容量文本类型
date    日期类型 （对应Java中的java.sql.Date类型）
timestamp   时间戳
BLOB    二进制大对象（存储图片、视频等流媒体信息） Binary Large OBject （对应java中的Object）
CLOB    字符大对象（存储较大文本，比如，可以存储4G的字符串。） Character Large OBject（对应java中的Object）
```

## 基础命令
```sql
mysql -u root -p password；//cmd执行登录mysql
show databases;//显示数据库
create database dbname;//创建数据库
use dbname;//切换数据库
show tables;//显示表
source sourcepath;//导入sql文件
drop database dbname;//删除数据库
desc tablename;//查看表数据
select version();//查询版本
\c;//终止一条正在编写的语句
\q 或 quit 或 exit 或 Ctrl+c;//退出mysql
show create table tablename;//查看创建表的语句
drop table if exists tablename;//删除表
start transaction; //关闭自动提交,开启事务【mysql是执行一句，提交一次】
commit;//提交
rollback;//回滚
savepoint pointname;//设置保存点
rollback pointname;//回滚到指定保存点
SHOW ENGINES;   // 查看数据库引擎
set autocommit =0; //关闭自动提交
set autocommit =1; //开启自动提交
set global transaction isolation level read uncommitted;//设置事务隔离级别为读未提交
set global transaction isolation level read committed;//设置事务隔离级别为读已提交
set global transaction isolation level repeatable read;//设置事务隔离级别为可重复读
set global transaction isolation level serializable;//设置事务隔离级别为序列化读
SELECT @@GLOBAL.tx_isolation, @@tx_isolation;  -- 适用于旧版本
SELECT @@GLOBAL.transaction_isolation, @@transaction_isolation;  -- 适用于新版本
SELECT * FROM information_schema.INNODB_TRX;   -- 查询活跃事务表
```

### 建表SQL
```sql
-- 创建数据库
create database 'dev';
-- 删除表
drop table if exists 'student'; 
-- 创建表
create table t_user3(
	id int not null auto_increment comment '主键',
	name varchar(255),
	age int(11),
	phone char(11),
	createTime TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP COMMENT '创建时间',
	primary key(`id`),
	unique key `32` (`name`,`phone`)
)ENGINE=INNODB auto_increment=2 default charset=utf8 COLLATE utf8_general_ci row_format=dynamic comment='表测试2'; 
```
1. 在定义表字段时，数据类型中 int(11) 代表整数类型，显示长度为 11 位，括号中的参数 11 代表的是最大有效显示长度，与类型包含的数值范围大小无关。
2. 创建数据表时，字段名称与表名称都加上\` \`，避免与MySQL保留字相同
3. `DEFAULT CURRENT_TIMESTAMP` ：表示当插入数据的时候，该字段默认值为当前时间
4. `ON UPDATE CURRENT_TIMESTAMP` ：表示每次更新这条数据的时候，该字段都会更新成当前时间
5. `ENGINE=INNODB` ：引擎
6. `AUTO_INCREMENT=2` : 从2开始自增
7. `DEFAULT CHARSET=utf-8` ：默认字符集
8. `COLLATE utf8_general_ci` ：数据校对规则；
	1. ci：case insensitive，大小写不敏感；
	2. cs：case sensitive，大小写敏感；
	3. utf8_bin：将字符串中的每一个字符用二进制数据存储，区分大小写。
10. `ROW_FORMAT=DYNAMIC` ：指定为动态表；
	1. 静态表：在mysql中， 若一张表里面不存在varchar、text以及其变形、blob以及其变形的字段的话，那么张这个表其实也叫静态表，即该表的row_format是Fixed；
	2. 动态表：若一张表里面存在varchar、text以及其变形、blob以及其变形的字段的话，那么张这个表其实也叫动态表，即该表的row_format是Dynamic，就是说每条记录所占用的字节是动态的

### 查询语句
INSERT INTO
```sql
-- 单条插入
insert into tablename(name,age,birth) values ('zhangsan',22,'2021-01-17');
-- 批量插入
insert into tablename(name,age,birth) values ('zhangsan',22,'2021-01-17'),('lisi',22,'2021-01-17');
-- 如果您的数据在其他表中已经存在，可以通过INSERT SELECT FROM将数据复制到另外一张表。
-- 列顺序与类型必须一致
INSERT INTO table_name [( column_name [, …] )]  select [( column_name1 [, …] )] from table_name1 ;
-- 数据存在，则更新，数据不存在，执行插入
-- 待写入行不存在，则执行INSERT来插入新行，受影响的行数为1。
-- 待写入行存在，则执行UPDATE来更新现有行，受影响的行数也为1。
INSERT INTO table_name[(column_name[, …])] [VALUES] [(value_list[, …])] ON DUPLICATE KEY UPDATE c1 = v1,  c2 = v2, ...;
```
REPLACE INTO
```sql
-- 要求必须有主键列或唯一索引列，否则会直接进行插入；
-- replace into 首先尝试插入数据到表中。 1.如果发现表中已经有此行数据（根据主键或者唯一索引判断），则删除旧数据，然后插入新的数据。 2. 如果不存在，直接插入新数据。
REPLACE INTO tbl_name(col_name, ...) VALUES(...)
-- 用于将其他表中的数据实时覆盖写入目标表中。写入数据时，根据主键判断待写入的数据是否已经存在于表中，如果已经存在，则先删除该行数据，然后插入新的数据；如果不存在，则直接插入新数据。
-- column_name：列名，如果需要将源表中的部分列数据插入到目标表中，SELECT子句中的列必须与REPLACE子句中列的顺序、数据类型一致。
REPLACE INTO tbl_name(col_name, ...) SELECT ...
```

### 删除大数据表
```sql
truncate table emp1;//表被截断，不可回滚，永远丢失
```

### 表的复制
```sql
create table emp1 
as 
select * from emp;//将查询结果填充新表
```




