---
title: redis
createTime: 2024/10/24 16:40:02
permalink: /article/3uif1w1v/
---
# Redis

> 解决功能性的问题：Java、Jsp、RDBMS、Tomcat、HTML、Linux、JDBC、SVN
> 
> 解决扩展性的问题：Struts、Spring、Spring MVC、Hibernate、Mybatis
> 
> 解决性能的问题：NoSQL、Java线程、Hadoop、Nginx、MQ、ElasticSearch

NoSQL数据库将频繁使用的数据保存在内存中，减少IO操作，提高了效率

NoSQL数据库不支持ACID；

Redis操作是原子性的 ；Redis + IO多路复用支持并发操作

## 什么要用Redis/缓存

1.  **提升用户体验**，应对更多的用户请求
2.  **高性能**：对于用户频繁访问的数据，将数据保存在内存中，请求访问速度快，用户体验好【对于数据库和缓存一致性的问题，只需在数据库中的数据发生改变后，同步缓存的数据即可】
3.  **高并发**：直接操作缓存能够承受的数据库请求数量是远远大于直接访问数据库的
    1.  将数据库的部分数据转移到缓存，这样用户的一部分请求会直接到缓存，而不用经过数据库

## Redis与IO多路复用

1.  Redis基于Reactor模式设计开发了自己的一套高效的事件处理模型——**文件事件处理器**（file event handler），这个文件事件处理器是单线程方式运行的，所以又称Redis是单线程模型

2.  **Redis怎么监听大量的客户端连接呢？**

3.  Redis通过IO多路复用程序监听来自客户端的大量连接，将读写事件注册到内核并监听事件的发生
    1.  IO多路复用程序：创建有限个线程，当一个线程执行完任务之后，再继续处理其他任务，而非新建线程处理新任务
        1.  优点：不需要额外创建多余的线程监听来自客户端的大量连接，减低资源的消耗

4.  文件事件处理器包括：多个套接字（Socket|客户端连接）、**IO多路复用程序**、文件事件分派器、事件处理器

## Redis的性能瓶颈

1.  **性能瓶颈不在CPU**

2.  单线程情形下，不存在线程上下文切换和线程阻塞等待问题
    1.  数据存放在内存中，无需进行IO操作

3.  **性能瓶颈主要在于及其<font color="red">内存大小</font>和<font color="red">网络带宽</font>**

    1.  内存大小关系到Redis能够直接存储的数据量的多少
        1.  内存问题可以通过增加内存条解决
    2.  网络带宽关系到指令执行的速度
    3.  网络带宽指单位时间内通过的数据量的多少
        1.  Redis客户端执行一条命令分为四个过程：发送命令，命令排队、命令执行、返回结果；发送命令+返回结果=往返时间；
        2.  Redis6.0开始引入多线程，充分的利用CPU并发的执行任务，提高CPU的利用率

## Redis安装

```bash
# 安装gcc
yum install gcc-c++ make make install
# 在redis的解压目录执行以下命令
# 编译代码
make
# 安装redis，该操作则将 src下的许多可执行文件复制到/usr/local/bin 目录下，这样做可以在任意目录执行redis的软件的命令（例如启动，停止，客户端连接服务器等）， make install 可以不用执行，看个人习惯。
make install
# redis被安装到/usr/local/bin目录下
# 	redis-server 服务器启动命令		redis-cli	 客户端启动命令
# 修改redis的redis.conf文件——daemonize yes 设置为后台启动

```

```bash
# gcc 版本过低导致make命令执行失败
yum -y install centos-release-scl
yum -y install devtoolset-9-gcc devtoolset-9-gcc-c++ devtoolset-9-binutils
[[临时修改gcc版本]]
scl enable devtoolset-9 bash
[[永久修改gcc版本]]
echo "source /opt/rh/devtoolset-9/enable" >>/etc/profile
```

## Redis基本命令

```bash
# redis服务启动：
    前台启动：在任意目录下执行redis-server
    后台启动：redis-server &
    启动redis服务时，指定配置文件：redis-server redis.conf
# 关闭redis服务：
    redis-cli [-h 主机ip地址 -p 端口号]  shutdown
# 客户端连接
    redis-cli [-h 主机ip地址 -p 端口号]
# 客户端关闭
    exit|quit
```

```bash
# 测试redis服务的性能
    redis-benchmark     
# 查看redis的信息
    info [信息段]
# 测试redis服务是否正常运行
    ping   如果正常————pong
# 切换数据库实例
    select index[0-15]
# 查看数据库实例中key的数量
    dbsize
# 查看当前数据库实例中所有key：
    key *
# 清空数据库实例
    flushdb
# 清空所有数据库实例
    flushall
# 查看全部配置信息
    config get *|[信息段]
```

## Redis配置

**Redis配置文件**

> windows环境下：配置文件redis.windows.conf
> 
> linux环境下：配置文件redis.conf

*   **Redis网络配置**
    *   bind：绑定IP地址，其它机器可以通过此IP访问Redis，默认绑定127.0.0.1，也可以修改为本机的IP地址。
        *   bind指令绑定本机网卡对应的IP地址，bind一经指定，只允许来自指定网卡的Redis请求。如果没有指定，就说明可以接受来自任意一个网卡的Redis请求。
        *   当绑定地址为127.0.0.1时，网卡lo的IP 127.0.0.1是一个回环地址，只允许本机访问
        *   当绑定地址为192.168.214.150时，网卡ens33的IP 192.168.214.150允许其他机器通过（IP地址+端口）访问
    *   port：配置Redis占用的端口，默认是6379。
    *   tcp-keepalive：TCP连接保活策略，可以通过tcp-keepalive配置项来进行设置，单位为秒，假如设置为60秒，则server端会每60秒向连接空闲的客户端发起一次ACK请求，以检查客户端是否已经挂掉，对于无响应的客户端则会关闭其连接。如果设置为0，则不会进行保活检测。
    *   daemonize：是否后台启动，默认为no，<font color="red">建议修改为yes，可以不占用控制台</font>
    *   protected-mode no：是否开启保护模式
        *   保护模式开启
            *   开启之后禁止公网访问redis，只能使用本地127.0.0.1访问redis服务
            *   保护模式启用要求 （1）没有使用`bind`指定IP地址 （2）没有设置访问密码
        *   保护模式关闭
            *   外部网络可以正常访问

*   **Redis日志配置**
    *   **loglevel：配置日志级别；**
        *   debug：调试信息输出
        *   notice：一般问题输出
        *   waring：输出报错信息

    *   **logfile**：配置日志文件；默认情况下会输出到控制台；配置logfile后，会输出到指定文件中

    *   **databases**：设置默认数据库实例的个数；默认为1. 
*   **Redis的安全配置**
    *   requirepass：配置Redis的访问密码。默认不配置密码，即访问不需要密码验证。此配置项需要在protected-mode=yes时起作用。使用密码登录客户端：`redis-cli -h ip -p port -a pwd`

## Redis数据结构

*   **字符串类型String**

*
    *   以键值对形式保存，能存储任意类型数据；最大为512M；key和value都是字符串
    *   形式：\<key：value>

*   **列表类型list**

*
    *   一个key对应多个value；value有序可重复，底层是双向链表结构
    *   形式：<key:value1,value2,...>
    *   元素索引包括正数【0,length-1】和负数【-(length-1),-1. 
*   **集合类型set**

*
    *   一个key对应多个value；value无序不可重复
    *   形式：\<key\:value1 value2 value3 ...>

*   **哈希类型hash**

*
    *   一个key对应多个键值对；
    *   形式：\<key:[field1\:value1](field1\:value1)[field2\:value2](field2\:value2)...>

*   **有序集合类型zset（sorted set）**

*
    *   一个key对应多个value；value有序不可重复；每个value会关联一个分数（分数可以重复），通过分数给集合中的成员进行排序
    *   形式：\<key\:value1\[score1. value2\[score2] ...>

## Redis操作命令

### 通用操作命令

*   **keys**

```bash
# 查看数据库中的key：keys pattern 
# *  ：匹配零个或一个字符 
# ?  ：匹配单个字符 
# [] ：表示选择[]内的任意一个字符
```

*   **exists**

```bash
判断key是否存在：exists key[key...] 
# 存在key返回1，不存在返回0，使用多个key时，返回存在的key的数量
```

*   **move**

```bash
# 移动key到指定库，原库删除对应的key：move key db 
# 移动成功返回1，失败返回0
```

*   **ttl**

```bash
# 查看key的剩余存活时间（ttl：time to live），以秒为单位 
# 返回值： 
#     -1：未设置生存时间，key不会过期 
#     -2：key不存在
```

*   **expire**

```bash
# 设置key的生存时间：expire key second 
# 设置成功返回1，失败返回0
```

*   **type**

```bash
# 查看key对应的类型：type key 
# none (key不存在)、string (字符串)、list (列表) 
# set (集合)、zset (有序集)、hash (哈希表)
```

*   **rename**

```bash
# 将oldkey改为名newkey：rename oldkey newkey 
# 当 key 和 newkey 相同，或者 key 不存在时，返回一个错误。
# 当 newkey 已经存在时， RENAME 命令将覆盖旧值。
```

*   **del**

```bash
# 删除存在的key：del key[key...] 
# 返回值为数字，表示删除的key的数量
```

### 字符串类型string

*   **设值：** set key value

*
    *   EX seconds – 设置键key的过期时间，单位时秒
    *   PX milliseconds – 设置键key的过期时间，单位时毫秒
    *   NX – 只有键key不存在的时候才会设置key的值
    *   XX – 只有键key存在的时候才会设置key的值
    *   KEEPTTL -- 获取 key 的过期时间
    *   GET -- 返回 key 存储的值，如果 key 不存在返回空

*   **获取值：** get key

*   **字符串追加：** append key value【返回追加后的字符串总长度】

*   **字符串value求长度：** strlen key

*   **字符串数值自增：** incr key 【返回运算后的value】

*   **字符串数值自减：** decr key

*
    *   返回运算后的value；
    *   key不存在，则会创建key=0，然后进行运算】
    *   非数值型value，直接报错

*   **加法运算：** incrby key incr\_value

*   **减法运算：** decrby key dexr\_value

*   **截取子字符串：** getrange key start\_index end\_inex

*
    *   从左到右：下标从0开始，最后一个字符为strlen-1
    *   从右到左：下标从-1开始，最后一个字符为-strlen+1
    *   闭区间截取【左右都闭区间】

*   **用下标为startIndex开始的子字符串覆盖value** ：setrange key start\_index value

*   **设置字符串数据的同时，设置有效时间【set expire】：** setex key second value

*   **设置字符串数据的同时，key必须不存在，否则失败【set not exists】：** setnx key value

*   **批量设置键值对：** mset k1 v1 k2 v2 ...

*   **批量获取value：** mget k1 k2 k3 ...

*   **批量设置字符串键值对：** msetnx key1 value1

*
    *   所有key都不存在时成功，只要有一个key存在，全部失败

### 列表类型list

*   **在表头依次插入元素：** lpush key v1 v2 v3

*   **在表尾依次插入元素：** rpush

*   **获取指定下标区间的元素：** lrange key start\_index end\_inedx

*
    *   支持负数【全表显示：lrange key 0 -1. 
*   **在表头删除元素并返回：** lpop key

*   **在表尾删除元素并返回：** rpop key

*   **获取指定下标的元素：** lindex key index

*   **获取指定列表的长度：** llen key

*   **根据参数count值，移出列表中与value相等的元素：** lrem key count value

*
    *   count >0 ，从列表的左侧向右开始移除；
    *   count < 0 从列表的尾部开始移除；
    *   count = 0移除表中所有与 value 相等的值。

*   **截取key的指定下标区间的元素并覆盖key的值：** ltrim key startIndex endInex

*   **将列表中指定下标的元素设置为value：** lset key index value

*   **将值value插入到值为pivot的之前或之后的位置：** linsert key before|after pivot value

### 集合类型set

*   **给集合中添加一个或多个元素：** sadd key member1 \[member2...]

*   **获取全部元素：** smembers key

*   **判断member是否是集合元素：** sismember key member

*   **获取集合中的元素个数：** scard key

*   **删除集合中的一个或多个元素：** srem key member1 \[member2 member3 ...]

*   **随机获取指定集合中的元素：** srandmember key \[count]

*
    *   count不指定，返回一个元素
    *   count>0，随机返回count个元素，一定不重复
    *   count<0，随机返回count绝对值个元素，会出现重复
    *   使用：抽奖环境

*   **从指定集合中随机移除一个或多个元素：** spop key \[count]

*
    *   返回被删除的元素

*   **将指定集合中的指定元素移动到另一个集合：** smove smove 集合src 集合dest member

*   \*\*集合运算【交集】：返回第一个集合中有，其他集合都没有的元素组成的新集合：\*\*sdiff key1 key2 ...

*   **集合运算【交集】：获取所有集合中都有的元素的新集合：** sinter key1 key2 ...

*   **获取所有指定集合的并集：** sunion key1 key2 ...

### 哈希类型hash

*   **设置key对应的属性值：** hset key field1 value1 field2  value2...
*   **获取指定key中对应的field的属性值：** hget key field
*   **批量设置key中的属性值：** hmset key field1 value1 field2 value2
*   **批量获取指定key中filed的值：** hmget key field1 field2 \[field3]...
*   **获取指定key所有的field和value值：** hgetall key
*   **从指定哈希表中删除一个或多个field：** hdel key field1 \[field2...]
*   **从指定哈希表中获取所有field的个数：** hlen key
*   **判断指定field在指定key中是否存在：** hexists key field
*   **获取指定key中的所有属性：** hkeys key
*   **获取指定key中的所有属性值：** hvals key
*   **给指定属性值做整数加法：** hincrby key field add\_value
*   **给指定属性值做浮点数加法：** hincrfloat key field add\_float\_value
*   **将哈希表 key 中的域 field 的值设置为 value ，当且仅当域 field 不存在的时候才设置，否则不设置：** hsetnx key field value

### 有序集合类型zset

*   **将一个或多个member及其score值加入有序集合：** zadd key score member \[score1 member1....]

*
    *   如果元素已经存在，则覆盖member的score值

*   **获取有序集合中指定下边区间的元素：** zrange key start\_index end\_index

*
    *   默认按照score升序排序

*   **获取指定有序集合中的指定分数区间的元素：** zrangebyscore key score\_min score\_max

*   **移除指定有序集合中的一个或多个元素：** zrem key member \[member1 member2 ...]

*   **获取集合中元素的个数：** zcard key

*   **获取指定有序集合中分数在指定区间范围内元素的个数：** zcount key score\_min score\_max

*   **查看指定集合中的指定元素的次序：** zrank key member

*   **获取指定有序集合中指定元素的分数：** zscore key member

*   **获取指定有序集合中指定元素的排名【逆排序】：** zrevrank key member

*   **查询有序集合，指定区间内的元素。集合成员按score值从大到小来排序：** zrevrange  key score\_min score\_max

*   **所有 score 值介于 max 和 min 之间（包括max和min）的成员，有序成员是按递减（从大到小）排序：** zrevrangebyscore key min\_score max\_score

## Redis的缓存数据过期机制

*   **实现**

*
    *   字符串特有的setex命令，其他几种类型都是使用expire设置过期时间

*   **作用**

*
    *   缓解内存消耗
    *   适用于一些有效期设置情形：如验证码，登录时效

*   **如何判断失效**

*
    *   Redis底层使用过期字典（一个hash表）来保存过期时间，过期字典的键指向Reids数据库中的键，值是一个long long类型的数值

*   **过期数据的删除策略**

*
    *   惰性删除：只有当取出key时才对数据进行过期检查；对CPU友好
    *   定期删除：每隔一段时间抽取一批key执行删除过期key的操作；对内存友好
    *   综合删除：采用惰性+定期删除

*   **问题：综合删除这种策略仍然又可能造成内存溢出**

*
    *   解决：Redis内存淘汰机制

    *
        *   allkeys-LRU（least recently used）：当内存不足以容纳新写入数据时，移出最近最少未使用的key
        *   allkeys-Random：随机淘汰
        *   volatile-LRU：在已设置过期时间的数据集中挑选最近最少未使用
        *   volatile-ttl：在已过期的数据集中挑选最近最少未使用的
        *   volatile-random：在已过期时间的数据集中随机挑选
        *   allkeys-lfu(least frequently used):移除最不经常使用的
        *   volatile-lfu：在已过期的数据集中挑选超级少使用的

## Redis事务

### Redis事务的特点（不保证ACID）

*   **单独的隔离操作：**

*
    *   允许把一组redis命令放在一起，将命令序列化【即压入一个队列】，然后统一顺序执行\*\*。\*\*事务在执行过程中，不会被其它客户端发来的命令请求所打断，除非使用watch命令监控某些键【并且这些键发生改变，则事务一定取消执行】。

*   **保证部分原子性**：

*
    *   当事务队列中的命令发生轻微错误时【执行队列中的命令时】，会忽略错误发生，继续执行其他命令，此时不保证原子性
    *   当事务队列中的命令发生严重错误时【压入队列过程中发生错误】，命令都不会执行，可以保证原子性

*   **redis的事务没有回滚：**

*
    *   Redis已经在系统内部进行功能简化，这样可以确保更快的运行速度，因为Redis不需要事务回滚的能力。

### Redis事务的命令

*   **multi**：开启事务，返回OK表示开启成功

*
    *   在multi命令执行之后，可以输入事务中的命令，返回QUEUED表示加入队列成功

*   **exec**：执行之前加入事务队列的全部命令

*   **discard**：放弃事务执行，并清空之前加入事务队列中的命令

*
    *   如果使用watch监控了一个事务队列中的键key，则该键的监控会被取消

*   **watch key**：监控一个键，当事务执行过程中，若键的值发生改变【即被其他用户的操作改变】，则当前事务放弃执行，事务队列中的命令清空

*
    *   相当于设置了一个用于版本控制的变量version，事务执行之前先读取该变量的值，当要执行事务命令时，再次读取该变量的值。如果变量version发生改变，则关闭事务；如果没有发生改变，则执行事务；类似于乐观锁的原理

*   **unwatch**：放弃监控所有的键；如果需要继续监控部分键，需要重新设置

**Redis事务执行失败的场景**

1.  组队中某个命令出现了报告错误，执行时整个的所有队列都会被取消。
    1.  ![img](https://raw.githubusercontent.com/jiuxi521/typora/master/20211031112547.png)
    2.  ![img](https://raw.githubusercontent.com/jiuxi521/typora/master/20211031112554.png)

2.  执行阶段某个命令报出了错误，则只有报错的命令不会被执行，而其他的命令都会执行，不会回滚。
    1.  ![img](https://raw.githubusercontent.com/jiuxi521/typora/master/20211031112617.png)
    2.  ![img](https://raw.githubusercontent.com/jiuxi521/typora/master/20211031112624.png)

## Redis持久化策略

​	Redis支持持久化策略。在适当的时机用适当的方式将数据持久化到内存，开机后再次读到内存中使用

### RDB策略

#### RDB策略（Redis DataBase）

1.  在指定的时间间隔内，redis服务执行指定次数的写操作，将数据写入磁盘一次
2.  RDB策略被<font color="red">Redis默认采用</font>，可通过修改配置文件改变策略方案

#### 执行方式

1.  Redis会单独创建（fork）一个子进程来进行持久化，会先将数据写入到 一个临时文件中，待持久化过程都结束了，再用这个临时文件替换上次持久化好的文件。<font color="red"> 整个过程中，主进程是不进行任何IO操作的，这就确保了极高的性能 。</font>
2.  Fork的作用是复制一个与当前进程一样的进程。新进程的所有数据（变量、环境变量、程序计数器等） 数值都和原进程一致，但是是一个全新的进程，并作为原进程的子进程

> <font color="red">写时复制技术：</font>
> 
> 系统调用 fork() 创建了父进程的一个复制，以作为子进程。传统上，fork() 为子进程创建一个父进程地址空间的副本，复制属于父进程的页面。然而，考虑到许多子进程在创建之后立即调用系统调用 exec()，父进程地址空间的复制可能没有必要。
> 
> 因此，可以采用一种称为写时复制的技术，它通过允许父进程和子进程最初共享相同的页面来工作。这些共享页面标记为写时复制，这意味着如果任何一个进程写入共享页面，那么就创建共享页面的副本。
> 
> 例如，假设子进程试图修改包含部分堆栈的页面，并且设置为写时复制。操作系统会创建这个页面的副本，将其映射到子进程的地址空间。然后，子进程会修改复制的页面，而不是属于父进程的页面。显然，当使用写时复制技术时，仅复制任何一进程修改的页面，所有未修改的页面可以由父进程和子进程共享。
> 
> ![进程1修改页面C前后](https://raw.githubusercontent.com/jiuxi521/typora/master/20211029224114.gif)

#### Redis的RDB配置（redis.conf文件）

1.  `save <seconds> <changes>`：配置持久化策略；即Redis 在seconds秒内key改变changes次，Redis把快照内的数据保存到磁盘中一次。
2.  dbfilename：配置redis RDB持久化数据存储的文件名
3.  dir：配置redis RDB持久化数据存储的文件目录
4.  stop-writes-on-bgsave-error：当备份出错时，停止redis库的写操作
5.  rdbcompression ：备份文件是否进行压缩
6.  rdbchecksum ：备份文件是否检查完整性

#### RDB命令

```bash
save	# 备份保存，会进程阻塞；保存是阻塞主进程，客户端无法连接redis，等SAVE完成后，主进程才开始工作，客户端可以连接
BGSAVE	# 是fork一个save的子进程，在执行save过程中，不影响主进程，客户端可以正常链接redis，等子进程fork执行save完成后，通知主进程，子进程关闭。
```

#### RDB策略的优势

1.  恢复速度快：RDB的数据恢复速度比AOF快
2.  体积小：RDB的备份文件是紧凑型文件，相对AOF的备份文件，体积更小
3.  性能高：RDB的备份由父进程fork出的一个子进程进行IO操作，不影响父进程的执行

#### RDB策略的劣势

1.  由于RDB是间隔时间备份机制，在两次备份之间可能存在服务宕机导致数据丢失
2.  RDB是全量备份，当数据量过大，会导致CPU时间紧张，服务存在几率暂停提供服务

### AOF策略

#### AOF策略（Append Only File）

1.  采用操作日志记录每一次写操作，每次redis服务启动时，都会重新执行一遍操作日志中的写操作。
2.  以日志的形式来记录每个写操作（增量保存），将Redis执行过的所有写指令记录下来(读操作不记录)， 只许追加文件但不可以改写文件，redis启动之初会读取该文件重新构建数据，
3.  AOF策略是对RDB策略的持久化功能进行补全。效率低下，Redis默认不会开启AOF策略
4.  <font color="red">AOF和RDB同时开启，redis服务启动时，默认读取AOF的日志文件</font>

#### Redis的AOF配置（redis.conf文件）

1.  appendonly：配置是否打开AOF策略
2.  appendfilename：配置操作日志文件
3.  当AOF文件损坏时，可以使用`redis-check-aof --fix appendonly.aof`命令修复文件

#### AOF流程

1.  客户端的请求写命令会被append追加到AOF缓冲区内；
2.  AOF缓冲区根据AOF持久化策略\[always,everysec,no]将操作sync同步到磁盘的AOF文件中；
3.  AOF文件大小超过重写策略或手动重写时，会对AOF文件rewrite重写，压缩AOF文件容量；
4.  Redis服务重启时，会重新load加载AOF文件中的写操作达到数据恢复的目的；

#### AOF的同步频率

```properties
appendfsync always	# 始终同步，每次Redis的写入都会立刻记入日志；性能较差但数据完整性比较好
appendfsync everysec # 每秒同步，每秒记入日志一次，如果宕机，本秒的数据可能丢失。
appendfsync no # redis不主动进行同步，把同步时机交给操作系统。
```

#### AOF的Rewrite压缩

1.  AOF采用文件追加的方式，文件会越来越大。故增加了重写压缩机制，当AOF文件的大小超过所设定的阈值时，Redis就会启动AOF文件的内容压缩， 只保留可以恢复数据的最小指令集.可以使用命令	`bgrewriteaof`
2.  AOF文件持续增长而过大时，会fork出一条新进程来将文件重写(也是先写临时文件最后再rename)，redis4.0版本后的重写，是指上就是把rdb 的快照，以二级制的形式附在新的aof头部，作为已有的历史数据，替换掉原来的流水操作。
3.  Redis会记录上次重写时的AOF大小，默认配置是当AOF文件大小是上次rewrite后大小的一倍且文件大于64M时触发
4.  重写流程
    1.  bgrewriteaof触发重写，判断是否当前有bgsave或bgrewriteaof在运行，如果有，则等待该命令结束后再继续执行。
    2.  主进程fork出子进程执行重写操作，保证主进程不会阻塞。
    3.  子进程遍历redis内存中数据到临时文件，客户端的写请求同时写入aof\_buf缓冲区和aof\_rewrite\_buf重写缓冲区保证原AOF文件完整以及新AOF文件生成期间的新的数据修改动作不会丢失。
    4.  子进程写完新的AOF文件后，向主进程发信号，父进程更新统计信息。主进程把aof\_rewrite\_buf中的数据写入到新的AOF文件。
    5.  使用新的AOF文件覆盖旧的AOF文件，完成AOF重写。

#### AOF的优势

1.  降低数据丢失的概率
2.  AOF将操作备份，可以处理误操作

#### AOF的缺点

1.  相比RDB占用空间更大，且备份恢复的速度相对较慢

## Redis消息的发布与订阅

*   **原理：**

*
    *   redis客户端订阅频道，消息的发布者向指定频道上发布消息，所有订阅此频道的客户端都能够接受到消息。

*   **命令：**

*
    *   **subscribe：订阅一个或者多个频道的消息**

    *
        *   `subscribe ch1 ch2 ch3`

    *   **publish：将消息发布到指定频道**

    *
        *   `publish ch1 hello`

    *   **psubcribe：订阅一个或者多个频道的消息，频道名支持通配符**

    *
        *   `psubscribe news.*`

## Java连接Redis服务

### Jedis普通操作

1.  添加Jedis依赖

    ```xml
    <dependency>
        <groupId>redis.clients</groupId>
        <artifactId>jedis</artifactId>
        <version>2.9.0</version>
    </dependency>
    ```

2.  打开redis服务

    ```bash
    redis-server  -p 6379
    ```

3.  获取jedis对象

    ```java
    //默认本机ip地址localhost|127.0.0.1
    //默认端口号：6379
    Jedis jedis = new Jedis();
    //连接其他的redis服务器
    Jedis jedis = new Jedis("host","post");
    jedis.set("key","value");
    ```

4.  Redis事务操作

    ```java
    //transaction 对象类似于jedis 对象，具有相同操作
    Transaction transaction = jedis.multi();
    transaction.exec();
    transaction.discard();
    transaction.watch("k1");
    ```

5.  watch监控操作

    ```java
    public class Jedis2 {
        public static void main(String[] args) throws Exception {
            isSuccessed();
        }
        public static void isSuccessed() throws Exception {
            try (Jedis jedis = new Jedis("192.168.214.150", 6379)) {
                String key = "balance";
                //开启监听key
                jedis.watch(key);
                //增加事务
                Transaction multi = jedis.multi();
                // 改变key的值
                multi.decr(key);
                // 执行队列
                List<Object> list = multi.exec();
                // list存储返回结果
                if (list == null || list.size() == 0) {
                    throw new Exception("执行失败，");
                }
                System.out.println("success");
            } catch (Exception e) {
                System.out.println(Arrays.toString(e.getStackTrace()));
            }
        }
    }
    ```

## SpringBoot集成Redis

1.  **添加集成依赖**

    1.         ```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-redis</artifactId>
            <version>1.3.3.RELEASE</version>
        </dependency>
        ```

2.  **核心配置文件中配置port和host**

    1.         ```properties
        spring.redis.host=127.0.0.1
        spring.redis.port=6379
        ```

3.  **Spring Boot 将自动配置 RedisTemplate，在需要操作 redis 的类中注入 redisTemplate 即可操作【Spring Boot 帮我们注入 RedisTemplate 类，泛型里面只能写 \<String, String>、\<Object, Object>或者什么都不写】**

    1.         ```java
        @Service
        public class StudentSerice{
            @Autowired
            private RedisTemplate<Object,Object> redisTemplate;

            @Override
            public void setCount(int count) {
                //redisTemplate.opsForValue()获取操作String类型的对象
                redisTemplate.opsForValue().set("count",count);
                //redisTemplate.opsForHash()获取操哈希类型的对象
            }
        }
        ```

## Redis主从复制

1.  主机数据更新后根据配置和策略， 自动同步到备机的master/slaver机制，Master以写为主，Slave以读为主
2.  ![image-20211030011036432](https://raw.githubusercontent.com/jiuxi521/typora/master/20211030011051.png)

### 主从复制作用

1.  读写分离，性能扩展
2.  容灾快速回复

### 主从复制原理

#### 全量复制

1.  slave启动成功连接到master后会发送一个sync命令
2.  master接到命令启动后台的存盘进程，同时收集所有接收到的用于修改数据集命令，
3.  在后台进程执行完毕之后，master将传送整个数据文件到slave,以完成一次完全同步
4.  而slave服务在接收到数据库文件数据后，将其存盘并加载到内存中。

#### 增量复制

1.  master继续将新的所有收集到的修改命令依次传给slave，完成同步。

> 注意：只要是重新连接master，回自动执行一次完全同步（全量复制）

### 主从复制配置

1.  创建Redis集群配置文件

```bash
# 拷贝redis.conf文件
mkdir /redis
cp /usr/local/redis/redis/redis.conf /redis/redis.conf
cd /redis

# 创建新文件
#	1. 将核心配置文件包括进来
#	2. 设置线程文件
#	3. 设置端口号
# 	4. 设置RDB模式的备份文件名称
vi redis_6379.conf
# begin redis_6379.conf
include /redis/redis.conf
pidfile /var/run/redis_6379.pid	
port 6379
dbfilename dump6379.rdb
# end

cp redis.conf redis_6379.conf
cp redis.conf redis_6380.conf
cp redis.conf redis_6381.conf
# 修改redis_6380.conf、redis_6381.conf文件
```

1.  启动服务

    ```bash
    redis-server redis_6379.conf
    redis-server redis_6380.conf
    redis-server redis_6381.conf
    ```

2.  连接服务

    ```bash
    redis-cli -p 6379
    redis-cli -p 6380
    redis-cli -p 6381
    ```

3.  查询节点信息

    ```bash
    info replication		# 打印主从复制的相关信息
    ```

4.  配置从机

    ```bash
    slaveof 127.0.0.1 6379
    ```

### 场景分析

#### 一主二从

1.  Slave机只能读数据，不能写数据
2.  Slave挂掉，Slave重启之后重新执行 `slaveof`命令 ，会自动同步主服务器的数据
3.  Master挂掉，Slave不会重新选举，会等待Master重新连接
4.  ![image-20211030015251562](https://raw.githubusercontent.com/jiuxi521/typora/master/20211030015251.png)

#### 薪火相传

1.  上一台Slave作为下一台机器的Master，降低master的写压力

2.  Slave更换所属的Master。会清除之前的数据，重新拷贝最新的数据
    1.  在从机命令行执行`slaveof 新主机IP 新主机端口`

        ```bash
        slaveof 新主机IP 新主机端口
        ```

3.  ![image-20211030102918289](https://raw.githubusercontent.com/jiuxi521/typora/master/20211030102918.png)

#### 反客为主

1.  当主机中宕机了，那么我们可以手动的停止从机与主机的同步，将从机转成主机。再将其他的从机与当前这台新主机同步数据，另成一个体系。

2.  优势：可以有效减轻master的写压力，去中心化降低风险。

3.  在其中一台从机执行命令`slaveof no one`

    ```bash
    slaveof no one
    ```

#### 哨兵模式

1.  哨兵模式是反客为主的自动版，能够后台监控主机是否故障，如果主机宕机，哨兵根据投票数将其中一台从机转换为主机master

2.  实现方式

    1.  修改redis.conf配置文件

        ```bash
        slave-priority  num # 设置优先级
        ```

    2.  配置文件sentinel.conf

        ```bash
        vi sentinel.conf
        # start sentinel.conf
        sentinel monitor mymaster 127.0.0.1 6379 1
        # end sentinel.conf
            mymaster：哨兵名称
            127.0.0.1 6379：主机的IP和端口
            1 ：至少有多少个哨兵同意，可以结束master选举
        ```

    3.  启动哨兵

        ```bash
        redis-sentinel sentinel.conf
        ```

3.  存在的问题

    1.  <font color="red">复制延时</font>：由于所有的写操作都是先在Master上操作，然后同步更新到Slave上，所以从Master同步到Slave机器有一定的延迟，当系统很繁忙的时候，延迟问题会更加严重，Slave 机器数量的增加也会使这个问题更加严重。0

4.  故障恢复

    ![image-20211030112634070](https://raw.githubusercontent.com/jiuxi521/typora/master/20211030112634.png)

    1.  <font color="red">优先级</font>：在redis.conf中默认：slave-priority 100，值越小优先级越高
    2.  <font color="red">偏移量</font>：指与原master主机的数据同步程度最高的
    3.  <font color="red">runid</font>：每个redis实例启动后都会随机生成一个40位的runid

## Redis集群

### Redis集群

1.  Redis 集群是<font color="red">一个分布式（distributed）、容错（fault-tolerant）的 Redis 实现</font>， 集群可以使用的功能是普通单机 Redis 所能使用的功能的一个子集（subset）。
    1.  \*\*容错：\*\*Redis 集群提供了一种运行 Redis 的方式，其中数据在多个 Redis 节点间自动分区。<font color="red">Redis 集群还在分区期间提供一定程度的可用性，即在实际情况下能够在某些节点发生故障或无法通信时继续运行。</font>但是，如果发生较大故障（例如，大多数主站不可用时），集群会停止运行。

2.  Redis 集群中不存在中心（central）节点或者代理（proxy）节点， <font color="red">集群的其中一个主要设计目标是达到线性可扩展性（linear scalability）。</font>
    1.  \*\*代理主机配置：\*\*请求经代理主机转发给处理业务的主机，使用代理主机来分发请求
    2.  \*\*无中心化集群配置：\*\*所有主机皆可获取请求，主机可以直接处理请求，也可将请求转发给其他机器去处理

3.  Redis 集群实现了对Redis的水平扩容，即启动N个redis节点，将整个数据库分布存储在这N个节点中，每个节点存储总数据的1/N。（<font color="red">Slot插槽</font>平均划分）
    1.  Redis集群一共由16384个插槽，每个Redis主机划分一部分插槽。每个key都属于这16384个插槽中的一个。
    2.  集群使用公式 `CRC16(key)%16384`来计算键key属于哪个槽，其中 `CRC16(key)`语句用于计算键key的CRC16校验和。
        集群中的每个节点负责处理一部分插槽。

4.
                        <img src="https://raw.githubusercontent.com/jiuxi521/typora/master/20211030173418.png" alt="img" style />

5.  客户端与节点直连，不需要中间 Proxy 层。客户端不需要连接集群所有节点，连接集群中任何一个可用节点即可。

6.  所有的节点通过服务通道直接相连，各个节点之间通过二进制协议优化传输的速度和带宽。

7.  尽管这些节点彼此相连，功能相同，但是仍然分为两种节点：master 和 slave。

### Redis集群搭建

1.  配置文件

    ```bash
    include /redis/redis.conf
    pidfile "/var/run/redis_6379.pid"
    # 指定端口
    port 6379
    # 指定备份文件的位置
    dbfilename "dump6379.rdb"
    # 指定日志文件位置，需要手动创建文件夹
    logfile "/redis/redis_cluster/redis_err_6379.log"
    # 开启Redis集群模式
    cluster-enabled yes
    # 指定一个Redis Cluster节点在每次发生更改时自动持久化集群配置的文件，以便能够在启动时重新读取它。该文件列出了集群中的其他节点、它们的状态、持久变量等等
    cluster-config-file nodes-6379.conf
    # Redis集群节点不可访问时的等待时间。如果主节点在超过指定的时间段内无法访问，则其副本将对其进行故障转移。此参数控制 Redis 集群中的其他重要事项。
    cluster-node-timeout 15000
    # bind指令绑定本机网卡对应的IP地址，bind一经指定，只允许来自指定网卡的Redis请求。如果没有指定，就说明可以接受来自任意一个网卡的Redis请求。 
    # 当绑定地址为127.0.0.1时，网卡lo的IP 127.0.0.1是一个回环地址，只允许本机访问
    # 当绑定地址为192.168.214.150时，网卡ens33的IP 192.168.214.150允许其他机器通过（IP地址+端口）访问
    bind 192.168.214.150
    # 指定redis服务是否以守护模式启动
    daemonize yes
    ```

    ```bash
    %s/6379/6380 	# 将文件中的6379替换为6380
    ```

2.  启动Redis服务

    ```bash
    redis-server redis_6379.comf
    ```

3.  执行启动命令

    ```bash
    # --cluster-replicas 1 表示我们希望为集群中的每个主节点创建一个从节点。
    # 分配原则尽量保证每个主数据库运行在不同的IP地址，每个从库和主库不在一个IP地址上。
    redis-cli --cluster create --cluster-replicas 1 192.168.214.150:6379 192.168.214.150:6380 192.168.214.150:6381 192.168.214.150:6389 192.168.214.150:6390 192.168.214.150:6391
    ```

4.  连接Redis集群

    ```bash
    redis-cli -c -h 192.168.214.150 -p 6379
    # 查看集群信息
    cluster nodes
    ```

### Redis集群的故障恢复

1.  当主节点宕机，从节点升级为主节点；当之前的主节点恢复后，成为新主机的从机
2.  当一段插槽的主从节点都宕机，redis服务根据`redis.conf中的参数  cluster-require-full-coverage`判断是否继续提供服务。
    1.  值为yes，整个集群都挂掉
    2.  值为no，集群继续提供服务，但是该插槽段无法存储数据

### Redis集群的优势与不足

#### 优势

1.  实现扩容
2.  分摊压力
3.  无中心配置相对简单那

#### 不足

1.  不支持多键操作
2.  多建的Redis事务不支持，Lua脚本不支持

## Redis应用问题

### 缓存穿透

#### 问题描述

1.  服务器的访问压力突然增大；
2.  大量请求的命中率降低，即大量请求在缓存中拿不到数据，直接访问数据库——>数据库压力增大，压垮数据库

#### 案例

1.  查询某个不存在的关键字或某个不存在的用户，被黑客恶意攻击

#### 解决方案

1.  对从数据库查询返回为空的数据（空结果null）进行缓存，设置较短的过期时间
    1.  存在的问题：过期时间不好控制，黑客攻击与过期时间不会总能匹配上
2.  控制可以访问的白名单，设置用户访问权限。例如：使用bitmap存储用户信息
    1.  存在的问题：频繁查询bitmap，效率较低
3.  使用布隆过滤器
    1.  布隆过滤器原理：将元素加入布隆过滤器时，使用哈希表映射，将位数组中对应下标值置为1；查询时也是通过哈希函数获得哈希值，之后查询位数组。
    2.  误判原因：存在键不同，但哈希值相同的情况
    3.  改进：扩大位数组或改进哈希函数
4.  实时监控：
    1.  当发现Redis的命中率开始急速降低，需要排查访问对象和访问的数据，和运维人员配合，可以设置黑名单限制服务

### 缓存击穿

#### 问题描述

1.  数据库访问压力瞬间增加——>最终数据库崩溃
2.  Redis中没有出现大量key过期，Redis正常运行
3.  Redis中的某个key过期了，但是在某一时间点被超高并发访问，

#### 案例

1.  热点数据瞬间高并发访问

#### 解决方案

1.  预先设置热门数据：提前设置热门数据，同时增加有效期
2.  实时监控
3.  使用锁
    1.  就是在缓存失效的时候（判断拿出来的值为空），不是立即去load db。
    2.  先使用缓存工具的某些带成功操作返回值的操作（比如Redis的SETNX）去set一个mutex key
    3.  当操作返回成功时，再进行load db的操作，并回设缓存,最后删除mutex key；
    4.  当操作返回失败，证明有线程在load db，当前线程睡眠一段时间再重试整个get缓存的方法。

### 缓存雪崩

#### 问题描述

1.  数据库压力变大——>最终数据库崩溃
2.  在极少时间段之内，出现大量key集过期的情况
3.  缓存雪崩与缓存击穿的区别在于这里针对很多key缓存，前者则是某一个key

#### 案例

1.  秒杀商品设置的有效时间过短，导致大批访问到数据库

#### 解决方案

1.  构建多级缓存架构：nginx缓存+Redis缓存+ 其他缓存
2.  使用锁或队列
    1.  用加锁或者队列的方式保证来保证不会有大量的线程对数据库一次性进行读写，从而避免失效时大量的并发请求落到底层存储系统上。不适用高并发情况
3.  设置某些key的过期标志，更新缓存
    1.  记录缓存数据是否过期（设置提前量），如果过期会触发通知另外的线程在后台去更新实际key的缓存。
4.  设置不同的失效时间：在原有的失效时间基础上增加一个随机值，比如1-5分钟随机，这样每一个缓存的过期时间的重复率就会降低，就很难引发集体失效的事件。
5.  限流，避免同时处理大批量请求

## 分布式锁

### 分布式锁

1.  分布式锁：指一种共享锁，可以同时被多台机器感知，锁被访问和获取。
    1.  单体单机系统时代：可以通过Java的并发控制锁策略进行设置；
    2.  分布式系统时代：由于分布式系统的多线程、多进程并且分布在不同的机器上，需要<font color="red">一种跨JVM的互斥机制来控制共享资源的访问</font>，这就是分布式锁需要解决的问题

三种主流的实现方案：

1.  基于数据库实现分布式锁：行锁、表锁
2.  基于缓存（Redis等）
3.  基于Zookeeper

### Redis锁

1.  使用`set key value EX TIME NX`指令设置对某个key进行加锁以及设置有效期

    ```bash
    SET key value EX TIME NX
    	# EX TIME	设置key的有效期，单位：秒
    	# NX		设置当key存在时不能进行设值
    	# PX TIME	设置key的有效期，单位  ：毫秒
    ```

2.  java代码实现Redis锁

    1.  进程坏死，锁无法释放：设置key=“lock”的有效期可以防止锁长时间不被释放

        ```java
        public class RedisLock {
            RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
            public void testLock() {
                //1获取锁，`setnx key value NE EX 10`
                Boolean lock = redisTemplate.opsForValue().setIfAbsent("lock", "lock", 10, TimeUnit.SECONDS);
                //2获取锁成功、查询num的值
                if (Boolean.TRUE.equals(lock)) {
                    Object value = redisTemplate.opsForValue().get("num");
                    //2.1判断num为空return
                    if (StringUtils.isEmpty(value)) {
                        return;
                    }
                    //2.2 有值就转成成int
                    int num = Integer.parseInt(value + "");
                    //2.3 把redis的num加1
                    redisTemplate.opsForValue().set("num", ++num);
                    //2.4 释放锁，del
                    redisTemplate.delete("lock");
                } else {
                    //3获取锁失败、每隔0.1秒再获取
                    try {
                        Thread.sleep(100);
                        testLock();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
        ```

    2.  锁被误删：A线程获取锁“lock”之后，线程异常挂起，之后A线程的锁“lock”自动释放。B线程立即获取锁并开始进行操作，此时A线程恢复执行，执行释放锁的操作，会“误删”B线程上的锁“lock”。

        1.  解决：为每个线程赋予一个唯一的lock值，当释放锁时，判断当前要释放的锁是否是本线程添加的锁，即对比lock的值，如果值一致，再进行释放锁操作
        2.  ![image-20211030221126562](https://raw.githubusercontent.com/jiuxi521/typora/master/20211030221127.png)

    3.  锁被误删：当A线程准备删除锁，但是还未执行删除语句时，锁过期了。B线程获取锁，执行操作。此时，A线程执行删除语句，会删除B线程的锁。（4.1操作不具有原子性，锁被误删）

        1.  解决：LUA脚本保证原子性操作

### 分布式锁实现原理

1.  锁只能被一个线程独占
    1.  在任意时刻，只有一个客户端能持有锁。
2.  不能发生死锁
    1.  即使有一个客户端在持有锁的期间崩溃而没有主动解锁，也能保证后续其他客户端能加锁。
3.  加锁和解锁必须是同一个客户端
    1.  加锁和解锁必须是同一个客户端，客户端自己不能把别人加的锁给解了。
4.  加锁和解锁必须具有原子性

## Redis 6.0 新特性

### ACL

1.  Redis ACL是Access Control List（访问控制列表）的缩写，该功能允许根据可以执行的命令和可以访问的键来限制某些连接。

2.  Redis 6 提供ACL的功能对用户进行更细粒度的权限控制 ：

    1.  接入权限:用户名和密码
    2.  可以执行的命令
    3.  可以操作的 KEY

    ```bash
    # 查询用户列表
    ACL LIST 
    ```

### 多线程

#### Redis为什么不引入？

单线程的好处

1.  Redis的执行命令无须引入多线程
2.  单线程环境编程简单，方便维护，**可维护性好**
3.  Redis的**性能瓶颈不在CPU，而在于内存和网络带宽**
4.  多线程环境频繁切换上下文环境以及线程发生阻塞，反而影响效率
5.  Redis在单线程情形下，可以通过IO多路复用程序实现**并发机制，同时连接多台客户端并等待客户端的请求**。

多线程的弊端

1.  多线程模型虽然在某些方面表现优异，但是它却引入了程序执行顺序的不确定性，带来了并发读写的一系列问题，增加了系统复杂度、同时可能存在线程切换、甚至加锁解锁、死锁造成的性能损耗。

#### 为什么又引入了？

1.  <font color="red">Redis引入多线程</font>指<font color="red">**客户端交互部分的网络IO交互处理模块多线程**</font>，而非执行命令多线程。多线程技术能够充分的利用CPU并发的执行任务，提高CPU的利用率
2.  <del>多线程的引用只是针对部分命令，大多数执行命令仍然是单线程顺序执行。 在删除占存较大的超大键值对时，Redis会在释放内存空间上消耗较多的时间，影响性能。故引入多线程环境，交给后台线程处理可提高Redis的执行效率</del>

