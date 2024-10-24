---
title: MySQL日志
createTime: 2024/10/24 16:40:02
permalink: /article/knu6g2ch/
---
# MySQL日志
- 错误日志 ：服务运行过程中发生的严重错误日志。当我们的数据库无法启动时，就可以来这里看看具体不能启动的原因是什么
- 二进制文件：它有另外一个名字你应该熟悉，叫Binlog，其记录了对数据库所有的更改。
- 查询日志 ：记录了来自客户端的所有语句
- 慢查询日志：  这里记录了所有响应时间超过阈值的SQL语句，这个阈值我们可以自己设置，参数为long_query_time，其默认值为10s，且默认是关闭的状态，需要手动的打开。
# Binlog日志
## 定义
1. 记录数据库操作的日志，<font color="#ff0000">由MySQL的Server层实现</font>，保存对数据库更改的所有操作（<span style="background:rgba(255, 183, 139, 0.55)">保存已提交事务对数据行的操作</span>）
2. 是一个归档日志
## 作用
1. 实现<font color="#ff0000">数据库持久化</font>和数据恢复，支持数据库的复制和主从同步功能

## 格式
### Statement格式
1. 记录对数据修改的SQL语句。
2. 节省内存空间，但不能保证一致性

### Row格式
1. 记录被修改行的具体值，每条修改操作都会生成一条日志。
2. 确保一致性，但`alter table`等语句会导致日志文件快速增长

### Mixed格式
1. Mixed 格式是 Statement 和 Row 格式的结合。对于一些简单的数据修改操作，如 INSERT、UPDATE、DELETE 等，采用 Row 格式记录；而对于一些复杂的操作，如 ALTER TABLE 等，采用 Statement 格式记录。
2. 节省空间的同时保证了一致性，但实现较为复杂

## 对自增主键的影响
基于 MySQL 默认 Binlog 格式从 Statement 到 Row 的变更，InnoDB 也将其自增锁的默认实现从连续模式，更换到了效率更高的交叉模式。
> 1. 如果你的 DB 有主从同步，并且 Binlog 存储格式为 Statement，那么不要将 InnoDB 自增锁模式设置为交叉模式
> 	1. 如果 MySQL 采用的格式为 Statement ，那么 MySQL 的主从同步实际上同步的就是一条一条的 SQL 语句。如果此时我们采用了交叉模式，那么并发情况下 INSERT 语句的执行顺序就无法得到保障。INSERT 同时交叉执行，并且 AUTO_INCREMENT 交叉分配将会直接<font color="#ff0000">导致主从之间同行的数据主键 ID 不同</font>。而这对主从同步来说是灾难性的。
> 	2. MySQL 将日志存储格式从 Statement 变成了 Row，这样一来，主从之间同步的就是真实的行数据了，而且 主键ID 在同步到从库之前已经确定了，就对同步语句的顺序并不敏感，就规避了上面 Statement 的问题。

# InnoDB日志
> Undo Log 记录了此次事务「开始前」的数据状态，记录的是更新之「前」的值
> Redo Log 记录了此次事务「完成后」的数据状态，记录的是更新之「后」的值
![image.png](https://raw.gitmirror.com/jiuxi521/typora/master/202403161724088.png)
## Redo Log日志
### 定义
1. 记录数据库操作的日志，<font color="#ff0000">由MySQL的InnoDB存储引擎实现</font>，保存对数据库更改的所有操作（<span style="background:rgba(255, 183, 139, 0.55)">保存事务提交后对数据行的修改</span>）
### 作用
1. 实现<font color="#ff0000">数据库持久化</font>和数据恢复，支持数据库的复制和主从同步功能

## Undo Log日志
### 定义
1. 记录数据库操作的日志，<font color="#ff0000">由MySQL的InnoDB存储引擎实现</font>，保存对数据库更改的所有操作（<span style="background:rgba(255, 183, 139, 0.55)">保存了未提交事务对数据行的修改操作</span>）
### 作用
1. 保存未提交事务对数据行的修改操作

## Redo Log 和 Undo Log不一致的场景
1. MySQL宕机之后，重启MySQL会加载Redo Log 日志，恢复宕机前的状态；此时存在Redo Log日志与Binlog日志数据不一致的场景，需要通过[[两阶段提交协议]]（2PC）来保证

## 日志记录流程
【Redo Log采用分阶段提交，先写 Redo Log 日志进入prepare状态，写完 Binlog 后，然后再提交 Redo Log 就会防止出现上述的问题，从而保证了数据的一致性。】
`update tb_student A set A.age='19' where A.name='张三';`
1. 先查询到张三这一条数据，如果有缓存，也是会用到缓存。
2. 然后拿到查询的结果，把 age 改为 19，记录Undo Log然后调用引擎 API 接口，写入这一行数据，InnoDB 引擎把数据保存在内存中，同时记录 Redo Log，此时 Redo Log 进入 prepare 状态，然后告诉执行器，执行完成了，随时可以提交。
3. 执行器收到通知后记录 Binlog，然后调用引擎接口，提交 Redo Log 为提交状态。
4. 更新完成。




