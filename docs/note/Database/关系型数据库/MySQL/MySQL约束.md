---
title: MySQL约束
createTime: 2024/10/24 16:40:02
permalink: /article/5arfbful/
---
# 约束种类
1. 主键约束(primary key)：约束的字段既不能为NULL，也不能重复（简称PK）
2. 外键约束(foreign key)：...（简称FK）
3. 非空约束(not null)：约束的字段不能为NULL
4. 唯一性约束(unique)：约束的字段不能重复
5. 检查约束(check)：注意Oracle数据库有check约束，在MySQL 8.0.16版本之前的CHECK约束，能被解析但是被忽略掉了，就是写了也没用。而在这个版本上，支持CHECK约束。
## 唯一性约束
表级约束
```sql
create table t_user(
    id int,
    name varchar(255),
    age int,
    phone char(11),
    unique (name,phone)//多个字段联合起来添加1个约束unique【表级约束】
);
```

## 非空约束
（not null）,只有列级约束。没有表级约束。

## 主键约束（主键自增）
```sql
create table t_user1(
    id int primary key auto_increment,
    name varchar(255),
    age int,
    phone char(11),
    -- primary key(id)   //表级约束，不建议大于一个字段定义为主键
);
-- Oracle当中也提供了一个自增机制，叫做：序列（sequence）对象。
```

## 外键约束
- 外键值可以为null
- 外键字段引用其他表的某个字段的时候，被引用的字段不一定是主键，但至少具有unique约束。
```sql
create table t_studet(
    id int primary key,
    classno char(10),
    foreign key (classno) references t_class(cno)
);
```

## [数据库设计三范式](MySQL名词解释.md#数据库设计三范式)
