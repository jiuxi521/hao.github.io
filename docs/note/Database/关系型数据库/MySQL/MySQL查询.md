---
title: MySQL查询
createTime: 2024/10/24 16:40:02
permalink: /article/i8x2n0dq/
---
# 常用知识
1. select语句执行顺序：from——>where——>group by——>having——>select(over窗口函数)——>order by——>`limit[offset pagesize]`
2. <font color="#ff0000">只要有null出现的运算，运算结果一定为null</font>
3. 比较运算符：<font color="#ff0000">and的优先级大于or</font>
4. between...and...  ：数值比较是左右闭区间；字符比较是<font color="#ff0000">左闭右开</font>
5. 模糊查询like：`\x`表示对x进行转义
6. 单行处理函数：
	1. concat(a,b) 
	2. ifnull(test,default)
7. 多行处理函数 = 分组函数 = 聚合函数
	1. 分组函数自动忽略 null 项，不进行统计或计算求值
		1. eg:求平均值时，值为null的数据行，不进行统计（【balance= {500,500,null}】,avg(balance) = 500）
	2. `count(*)、count(1)` 统计记录总条数；`count(字段)`统计字段不为null的记录总条数
		1. count(字段)效率较低，需要逐行校验是否为空
	3. <font color="#ff0000">分组函数不能出现在where子句中</font>
	4. 存在group by的select语句，select后面只能是分组函数或者参与分组的的字段
8. 表连接
	1. 内连接：连接的两张表都是主表，只要能匹配的数据都会查询
	2. 外连接：连接的两张表一主一副，以主表为主，主表的数据全部显示，副表的数据存在则查询出来，不存在使用NULL填充
	3. 小表驱动大表 #todo
		1. <font color="#ff0000">Nest Loop Join</font>【嵌套循环连接】，通过驱动表结果集中的数据作为循环基础数据，然后依次遍历每一条数据作为下一个表的过滤条件，然后合并结果
		2. 驱动表：指定连接条件时，满足查询条件的表记录少的为驱动表；未指定连接条件时，表记录少的表为驱动表
9. union联合
	1. 要求：每个SELECT语句必须具有相同数量的列，且相应的列的数据类型必须兼容（不兼容会发生隐式转换导致精度或范围损失）
	2. `UNION`不去重、`UNION ALL`去重
10. date类型判空应使用 `is not null`，不能使用`!=''`
11. 使用not exists、exists求两个查询的交集、并集
> 先执行主查询(SELECT country FROM testwindow) a；之后遍历a的结果集，依次判断 WHERE NOT EXISTS 子查询b，子查询b只需返回true or false；
```sql
# 存在于a，不存在于b的国家
SELECT *  
FROM (SELECT country FROM testwindow) a  
WHERE NOT EXISTS (SELECT 1[|true|id] FROM (SELECT * FROM testwindow WHERE product = 'Calculator') b WHERE a.country = b.country)
```
12. bit类型列如果创建索引，只能使用 1 或 b'1'判断，不能使用'1'判断（会导致查不出数据）[bit类型导致查询数据为空](https://www.jb51.net/database/323084tr6.htm)
13. in和exists的区别
	1. in用于判断某一个值是否存在集合中；exists用于判断某行数据是否存在集合中，可判断多列

# 基础知识
1. 语句执行顺序
```sql
 -- 代码编写顺序             实际执行顺序              代码执行顺序 
	select.........................5....................from
	from.......................... 1....................where
	where..........................2....................group by
	group by.......................3....................having
	having.........................4....................select
	order by.......................6....................order by
	limit..........................7....................limit
```
2. and的优先级大于or，可以加小括号改变优先级
```sql
select * from test_copy where id = 1 and a = 35 or id  = 2 and a = 2;
-- 等价于
select * from test_copy where (id = 1 and a = 35) or (id  = 2 and a = 2);
```
1. between...and...   
	1. 用于数值比较-->左右都是闭区间
	2. 用于字符比较-->左闭右开，字典排序
```sql
	select ename from emp where ename between 'A' and 'B';//字典序包括A开始，不包括B结束
```
1. 模糊查询like    
	1. % 表示任意个字符； _ 表示单个字符
	2. `\x` 表示对字符转移x进行转义 ( `\%` 、 `\_`)
2. order by
	1. order by 字段名 asc【默认】
	2. order by 字段名 desc
3. 去重distinct
```sql
	-- distinct 只能出现在所有字段的最前方，出现表示后面的所有字段的组合结果进行去重
	select distinct job from emp;
	select distinct deptno,job from emp;
	-- distinct 可以放在分组函数里面
	SELECT SUM(DISTINCT salary),SUM(salary) FROM  employees;
	SELECT COUNT(DISTINCT salary),COUNT(salary) FROM  employees;
```
1. having子句
	1. having子句尽量少用，不得已再用
	2. 当查询结果使用分组函数时，必须使用having子句
	```sql
	-- 找出每个部门的最高薪资，要求显示薪资大于2900的数据
	-- 方法一：结果正确，但是分组之后求最大工资已经花费时间，但是having子句直接将分组求max后的结果抛弃，效率低
	select deptno,max(sal) from emp group by deptno having max(sal)>2900;
	-- 方法二：先获得工资大于2900的数据，再分组
	select deptno,max(sal) from emp where sal > 2900 group by deptno;
	```
	 3. 有时having字句必须用
```sql
	-- 找出每个部门的平均薪资，要求显示薪资大于2000的数据。
	-- 直接报错，where后不能跟分组函数
	select deptno,avg(sal) from emp where avg(sal) > 2000 group by deptno;
	-- 正确方法
	select deptno,avg(sal) from emp group by deptno having avg(sal) > 2000;
```
