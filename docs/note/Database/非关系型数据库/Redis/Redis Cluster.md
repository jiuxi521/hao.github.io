---
title: Redis Cluster
createTime: 2024/10/24 16:40:02
permalink: /article/syqvs14y/
---
# Redis Cluster
## 单点Redis存在的问题

1. 数据丢失问题
    1. Redis持久化
2. 并发能力问题
    1. 主从集群，实现读写分离
3. 故障恢复问题
    1. Redis哨兵，实现健康检测和自动恢复
4. 存储能力问题
    1. Redis分片集群，利用插槽机制实现动态扩容

![image-20240121155446883](https://raw.gitmirror.com/jiuxi521/typora/master/202401211554568.png)

## 搭建Redis环境

> 下载地址：[redis.conf](https://redis.io/docs/management/config/)
> 
> 参考文档地址：[地址1](https://blog.csdn.net/yzf279533105/article/details/126706477) [地址2](https://www.cnblogs.com/itzhouq/p/redis4.html)

### redis.conf(version 6.2)

```conf
# 连接配置
# bind 127.0.0.1 -::1.  		# 注释代码，默认只能连接本地回环接口（127.0.0.1. daemonize no 					# 默认no，可修改为yes（redis以守护进程运行，该配置会与docker的 -id 选项冲突导致启动失败）
databases 1. 				# 指定redis库数
requirepass root			# 设置连接密码为"root"

bind 0.0.0.0 	# 允许所有地址的连接
protected-mode no	# 禁用保护模式

# 日志配置
loglevel notice					# 日志级别
logfile "/etc/redis/logs/redis.log"	 # 日志文件的位置

# 持久化配置
dir ./					 # 指定持久化文件位置
stop-writes-on-bgsave-error		# 当备份出错时，停止redis库的写操作
save 3600 1. # redis持久化频率（当3600秒内发生一次key改变事件，进行备份）
save ""				 # 由于RDB模式默认开启，可使用 save "" 关闭RDB备份模式

# 持久化配置-RDB
dbfilename dump.rdb								  # RDB文件名称
rdbcompression yes									# 开启备份文件压缩功能（开启压缩，节省磁盘空间，但占用CPU资源）
rdbchecksum yes										  # 检查备份文件的完整性

# 持久化配置-AOF
appendonly yes												# 设置是否打开AOF策略
appendfilename  "appendonly.aof"	# 设置AOF持久化文件名
appendfsync everysec 			# AOF的同步频率，always（每次写操作都主动同步）、everysec（每秒同步一次）、no（从不主动同步）

# 持久化配置-AOF-重写AOF文件配置
auto-aof-rewrite-percentage 100			# 触发备份阈值，当备份文件体积同比上次重写文件大小增加100%，触发重写
auto-aof-rewrite-min-size 64mb			# 触发备份阈值，当备份文件体积大于64mb时，触发重写
```

### linux 命令

```bash
# 映射redis持久化文件
mkdir -p /root/redis/data
# redis日志文件
mkdir -p /root/redis/logs
touch /root/redis/logs/redis.log
chmod 777 /root/redis/logs/redis.log
# redis配置文件
touch /root/boot/redis/redis.conf
```

### Docker 命令

```bash
# 启动容器
docker run -id --name redis -p 6379:6379 \
-v /root/redis/data:/data \
-v /root/redis:/etc/redis \
redis \
redis-server /etc/redis/redis.conf

# 连接控制台 [ -a root] 可选，使用密码连接
docker exec -it redis redis-cli [ -a root] 
# 或
docker exec -it redis bash
redsi-cli
```

## Redis持久化

### RDB

> (Redis Database Backup)：Redis数据库备份
> 
> linux读写物理内存数据是通过对操作系统分配的虚拟内存进行更新操作，虚拟内存在进程的体现形式就是“页表”

1. 默认开启，通过配置`save second time `设置备份频率，也可通过`save ""`关闭备份
2. Redis关闭时，默认执行RDB备份

#### 备份流程

![image-20240121191301366](https://raw.gitmirror.com/jiuxi521/typora/master/202401211929650.png)

1. `系统调用 fork() `创建了父进程的一个复制，以作为子进程，两者共享父进程中的内存数据。子进程读取共享内存数据并写入新的RDB文件，之后替换旧RDB文件
2. 当子进程备份时，对共享数据标记为**写时复制**，如果父进程有写入操作
    1. 父进程写入时，采用 **copy-on-write** 技术，拷贝一份写入数据（页面）的副本，对副本进行读写操作
        1. 假设父进程试图修改包含部分堆栈的共享页面，操作系统会创建这个页面的副本，将其映射到父进程的地址空间。
        2. 然后，父进程会修改复制的页面，而不是共享页面。
        3. 显然，当使用写时复制技术时，仅复制任何一进程修改的页面，所有未修改的页面可以由父进程和子进程共享。
        4. ![](https://raw.gitmirror.com/jiuxi521/typora/master/20211029224114.gif)

#### Redis.conf文件

#### RDB命令

```bash
save	# 备份保存，会进程阻塞；保存是阻塞主进程，客户端无法连接redis，等SAVE完成后，主进程才开始工作，客户端可以连接
bgsave	# 是fork一个save的子进程，在执行save过程中，不影响主进程，客户端可以正常链接redis，等子进程fork执行save完成后，通知主进程，子进程关闭。
```

#### 优缺点

##### RDB策略的优势

1. 恢复速度快：RDB的数据恢复速度比AOF快
2. 备份文件体积小：RDB的备份文件是紧凑型文件，相对AOF的备份文件，体积更小
3. 性能高：RDB的备份由父进程fork出的一个子进程进行IO操作，不影响父进程的执行

##### RDB策略的劣势

1. 备份间隔数据可能丢失：由于RDB是间隔时间备份机制，在两次备份之间可能存在服务宕机导致数据丢失
2. 占用CPU资源：全量备份耗时、fork子进程、压缩、写入备份文件耗时
3. 占用内存资源：极致情况下，存在备份过程中，所有数据均被修改导致物理内存占用翻倍

### AOF

> AOF(Append Only File)

1. AOF采用备份操作日志的方式，追加写指令日志到备份文件中
2. AOF和RDB同时开启，redis服务启动时，默认读取AOF的日志文件

#### 备份流程

1. 每次写入操作均向备份文件中追加操作指令
2. Redis启动时，默认读取操作指令记录，恢复数据
3. 当备份文件较大时，使用 `bgrewriteaof`执行文件重写操作
    1. 将指令日志文件进行压缩，完成指令合并、无效指令删除操作
        1. bgrewriteaof触发重写，判断是否当前有bgsave或 bgrewriteaof 在运行，如果有，则等待该命令结束后再继续执行。
        2. 主进程fork出子进程执行重写操作，保证主进程不会阻塞。
        3. 子进程遍历redis内存中数据到临时文件，客户端的写请求同时写入aof_buf缓冲区和aof_rewrite_buf重写缓冲区保证原AOF文件完整以及新AOF文件生成期间的新的数据修改动作不会丢失。
        4. 子进程写完新的AOF文件后，向主进程发信号，父进程更新统计信息。主进程把aof_rewrite_buf中的数据写入到新的AOF文件。
        5. 使用新的AOF文件覆盖旧的AOF文件，完成AOF重写。
    2. redis4.0版本后的重写，是 将RDB的快照 以二级制的形式附在新的aof头部，作为已有的历史数据，替换掉原来的流水操作

### 对比

![image-20240121190618837](https://raw.gitmirror.com/jiuxi521/typora/master/202401211906882.png)

## Redis主从复制

![image-20210725152037611](https://raw.gitmirror.com/jiuxi521/typora/master/202401221944372.png)

### 原理

![image-20210725152222497](https://raw.gitmirror.com/jiuxi521/typora/master/202401222020239.png)

1. slave启动后，向主机发起<font color='blue'>增量同步</font>请求
    1. master根据repid(Replication Id)判断从机是否是第一次同步
    2. 如果是第一次同步，执行全量同步流程，否则，执行增量同步流程
2. 全量同步：第一次同步时执行 或 `repl_baklog`被覆盖导致slave的offeset丢失
    1. master <font color='blue'>异步</font>执行`bgsave`生成RDB备份文件。同时，master记录RDB期间的所有指令`repl_baklog`
    2. master 将RDB备份文件+`repl_baklog`文件 一起发给slave
    3. slave 清空本地数据，加载RDB文件，之后执行`repl_baklog`中的指令
3. 增量同步：slave节点断开又恢复，并且在repl_baklog中能找到offset时
    1. slave发起备份请求，master对比`repl_baklog`文件中的主从的offset，判断是否需要进行同步

![image-20210725153201086](https://raw.gitmirror.com/jiuxi521/typora/master/202401222043527.png)

### 名词解释

- **Replication Id**：简称replid，是数据集的标记，id一致则说明是同一数据集。每一个master都有唯一的replid，slave则会继承master节点的replid
- **offset**：偏移量，随着记录在repl_baklog中的数据增多而逐渐增大。slave完成同步时也会记录当前同步的offset。如果slave的offset小于master的offset，说明slave数据落后于master，需要更新。
- **repl_backlog原理**： backlog文件以环形数组的格式保存日志信息，其中保存了master当前的offset和slave已拷贝的offset
    - <img src="https://raw.gitmirror.com/jiuxi521/typora/master/202401222110243.png" alt="image-20210725153715910" style="zoom:50%;" />
    - master执行写操作时，追加执行日志[offset = (offset + length)%length]，slave也不断的拷贝，追赶master的offset
    - master会一直写入数据，不会判断当前数据是否已同步slave。当slave长时间未进行拷贝时（**backlog大小有上限**），backlog文件会覆盖slave的offset导致slave无法完成增量同步。此时，只能执行全量同步

### 实践

#### 修改redis.conf文件

```bash
# 公共修改
# bind 127.0.0.1 -::1	# 禁用地址绑定
logfile "/etc/redis/logs/redis.log"		# 指定日志文件

# master修改
protected-mode no	# 关闭保护模式，支持其他客户端连接

# slave1、slave2修改
replicaof 192.168.8.129 6380	# 指定主机master地址
```

#### 创建容器

```bash
docker rm -f master slave1 slave2

docker run -id --name master -p 6380:6380  -v /root/master-slave/master/data:/data -v /root/master-slave/master:/etc/redis redis:6.2 redis-server /etc/redis/redis.conf
docker run -id --name slave1. -p 6381:6381 -v /root/master-slave/slave1/data:/data   -v /root/master-slave/slave1:/etc/redis redis:6.2 redis-server /etc/redis/redis.conf
docker run -id --name slave2  -p 6382:6382 -v /root/master-slave/slave2/data:/data   -v /root/master-slave/slave2:/etc/redis redis:6.2 redis-server /etc/redis/redis.conf
```

#### 进入redis客户端

```bash
docker exec -it master redis-cli -p 6380 [--raw ]
docker exec -it slave1 redis-cli  -p 6381 [--raw ]
docker exec -it slave2 redis-cli  -p 6382 [--raw ]

# 若slave未在redis.conf指定master信息，可执行replicateof临时建立连接
replicateof masterIP masterPORT		# 从机连接主机
```

### Redis命令

```bash
# 查看redis主从信息
info replication
# 查看服务器信息
info server
```

### 主从优化

#### 减少磁盘IO

1. 在redis.conf 配置`repl-diskless-sync yes` ，设置主从全量同步时不写入磁盘，减少磁盘IO
2. 减小Redis单节点的内存，减少全量同步时磁盘IO的时间
3. 增加repl_backlog文件的大小，发现slave故障时及时故障恢复，避免全量同步

#### 设置主-从-从链式结构

1. 限制一个master上的slave节点数量，采用主-从-从链式结构，减少master压力

![image-20210725154405899](https://raw.gitmirror.com/jiuxi521/typora/master/202401222126219.png)

2. 实现方案：
    1. 在slave机器上，执行`replicateof slave的IP slave的Port`，建立从机之间的复制

## Redis哨兵

> [哨兵文档](https://redis.io/docs/management/sentinel/)
> 
> [配置文件：sentinel.conf](http://download.redis.io/redis-stable/sentinel.conf)
> 
> [sentinel日志](https://redis.io/docs/management/sentinel/#pubsub-messages)

依托Redis集群搭建Redis哨兵集群。提升 <font color="blue">高可用</font>，确保即使发生主服务器故障，系统仍然能够继续工作。

### 哨兵功能

1. 监控
    1. 通过ping-pong心跳，判断主从服务器的健康状况
2. 故障发现与转移
    1. 主服务器故障时，<font color='red'>选举</font>一台从服务器替代主服务器，同时更新旧master的设备信息，使其恢复后自动成为slave
    2. 新master通知旧slave加入新master集群
    3. 通过仲裁（Quorum）决定是否执行选举（故障转移），Quorum 是指投票的节点数量，当 Sentinel 节点投票的数量达到 Quorum 时，决定执行故障转移。
3. 通知
    1. 主、从服务器下线，新master选举、sentinel下线会进行互相通知

### 实践

#### sentinel.conf文件

```bash
# 指定sentinel端口，默认26379
port 26379
# 指定监控master及选举数
sentinel monitor mymaster 192.168.8.129 6380 2
# 指定master失联时间
sentinel down-after-milliseconds mymaster 5000
# 指定切换主机的超时时间
sentinel failover-timeout mymaster 60000
# 故障转移期间同时指向新master的实例数量
sentinel parallel-syncs mymaster 1
```

#### docker容器

```bash
docker run -id --name sentinel1 -p 26379:26379 -v /root/master-slave/sentinel1:/etc  -v /root/master-slave/sentinel1/data:/tmp  redis:6.2  redis-sentinel /etc/sentinel.conf
docker run -id --name sentinel2 -p 26380:26380 -v /root/master-slave/sentinel2:/etc  -v /root/master-slave/sentinel2/data:/tmp  redis:6.2  redis-sentinel /etc/sentinel.conf
docker run -id --name sentinel3 -p 26381:26381 -v /root/master-slave/sentinel3:/etc  -v /root/master-slave/sentinel3/data:/tmp  redis:6.2  redis-sentinel /etc/sentinel.conf
```

#### Redis命令

```bash
# 查看mymaster集群的信息
sentinel master mymaster
# 查看mymaster集群的主机地址
sentinel get-master-addr-by-name mymaster
# 测试服务宕机
debug sleep 30
```

#### RedisTemplate（读写分离）

1. 引入依赖

    1. 
		```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        ```

2. 配置Redis地址

    1. 
		```yaml
        spring:
          redis:
            sentinel:
              master: mymaster
              nodes:
                - 192.168.8.129:26379
                - 192.168.8.129:26380
                - 192.168.8.129:26381
        ```

3. 配置读写分离

    1. 
		```java
        @Configuration
        public class LettuceClientConfigure {
        
            /**
             * lettuce配置
             * 1. 设置读写分离-优先从slave读取，次之读取master
             */
            @Bean
            public LettuceClientConfigurationBuilderCustomizer lettuceClientConfigurationBuilderCustomizer() {
                // 1. 设置读写分离
                //  - MASTER：从主节点读取
                //  - MASTER_PREFERRED：优先从master节点读取，master不可用才读取replica
                //  - REPLICA：从slave（replica）节点读取
                //  - REPLICA _PREFERRED：优先从slave（replica）节点读取，所有的slave都不可用才读取master
                return clientConfigurationBuilder -> clientConfigurationBuilder.readFrom(ReadFrom.REPLICA_PREFERRED);
            }
        
            @Bean
            // @ConditionalOnSingleCandidate(RedisConnectionFactory.class)
            public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        
                RedisTemplate<String, Object> stringObjectRedisTemplate = new RedisTemplate<>();
                stringObjectRedisTemplate.setConnectionFactory(redisConnectionFactory);
                stringObjectRedisTemplate.setKeySerializer(RedisSerializer.string());
                stringObjectRedisTemplate.setValueSerializer(RedisSerializer.string());
                return stringObjectRedisTemplate;
            }
        }
        ```

4. 配置测试类

    1. 
		```java
        @RestController
        @RequestMapping("/redis")
        @RequiredArgsConstructor
        public class RedisReadWriteSplitController {
            /**
             * Redis的泛型应设置正确，默认是RedisTemplate<Object, Object>，默认没有RedisTemplate<String, Object>
             */
            private final RedisTemplate<String, String> redisTemplate;
        
            @RequestMapping("set/{key}/{value}")
            public String set(@PathVariable String key, @PathVariable String value) {
                redisTemplate.opsForValue().set(key, value);
                return "true";
            }
        
            @RequestMapping("get/{key}")
            public String get(@PathVariable String key) {
                return redisTemplate.opsForValue().get(key) + "";
            }
        }
        ```

## Redis分片集群

> [redis集群](https://redis.io/docs/reference/cluster-spec/)
> 
> [redis集群实践](https://redis.io/docs/management/scaling/#create-and-use-a-redis-cluster)
> 
> Redis主从复制+哨兵机制，保证了<font color='blue'>读写分离+集群高可用</font>，当写入进程较多时，可能导致master无法正常工作；

### 集群特点

1. Redis集群实现了<font color='red'>主从复制+多master协作</font>，保证了多master+多slave+状态监听+故障转移
    1. 解决了 海量数据存储 + 高并发 写问题
2. cluster特点
    1. 多master之间通过心跳机制（ping+pong）检测彼此健康状态
    2. 多master分别对应不同的散列插槽，保存不同的数据
    3. 每个master都可以有多个slave节点
    4. 客户端请求可以访问集群任意节点，最终都会被转发到正确节点
3. ![image-20210725155747294](https://raw.gitmirror.com/jiuxi521/typora/master/202401281320370.png)

### 集群知识

1. Redis Cluster需要开启两个端口：一个TCP Port作为服务器端口，供客户端连接、一个作为集群总线端口（Redis Bus Port），用于集群节点之间的通信（eg: 数据复制、心跳监测）
2. Redis集群支持多个键值操作，只要一个命令（或者整个事务，或者Lua脚本）中的所有键值都<font color="blue">属于同一个哈希槽</font>
3. 集群的主从复制模式，保证了集群中的部分插槽不会因mster宕机不能访问
    1. 主节点和从节点点不能在一台机器上，避免同时宕机

#### 集群存在的问题

1. 集群默认采用异步通信，没有实现数据强一致性：master A 收到客户端的写入请求后，没有等待slave的确认，当未同步给salve时A发生宕机，会导致数据丢失
    1. 可以执行`wait`命令修改为同步，但效率会降低，性能与一致性需要进行权衡（trade-off）
2. 当集群采用同步通信时，也可能存在数据丢失
    1. 三主（A、B、C）三从（A1、B1、C1）一个客户端（Z1）——>one side（A、C、A1、B1、C1. another side（B、Z1.     2. 当B与集群内的节点连接超时时，会导致A、C认为B已下线，将B1提升为master，此时Z1对B的写入会丢失
        1. Z1可以向B发送的写入量有一个最大窗口（ maximum window）：如果分区的多数侧已经过了<font color="blue">足够的时间（超时时间）</font>来选择副本作为主节点，则少数侧的每个主节点都将停止接受写入。

### 散列插槽

1. Redis 集群共16384个插槽（hash slot）集群创建后，会将（0-16383）分别映射到集群中的master实例中，进行自动分片（automatically sharded）
2. redis 对<font color="blue">key的有效部分（hash tag）</font>计算插槽值（slot）
    1. 算法：通过 CRC1. 算法得到一个hash值，然后对16384取余，得到的结果就是slot值
    2. key的有效部分
        1. key中包含“{}”，且“{}”中至少包含一个字符，“{}”中的字符即为有效Key
        2. key中不含“{}”，“整个key”即为有效Key
3. 如何确保一类key都在同一个插槽
    1. 确保这一类key具有相同的有效部分。例如：皆以{TypeId}作为前缀

### 集群伸缩

> [redis集群伸缩](https://redis.io/docs/management/scaling/)
> 
> [Linear Scaling with Redis Enterprise](https://redis.com/redis-enterprise/technology/linear-scaling-redis-enterprise/)

1. 向已存在的集群中添加新的 master 或 slaver

    1. 
	```bash
	docker exec -it DD redis-cli -c -p 7040 --cluster add-node 192.168.8.129:7040 192.168.8.129:701.        
	 ```

2. 重新发配插槽

    1. 
	```bash
	docker exec -it DD redis-cli -c -p 7040 --cluster  reshard 192.168.8.129:7040
	```

#### Redis命令

```bash
# 查看集群信息
cluster nodes
# 访问集群
redis-cli -c -p 701. # 查看指令帮助信息
redis-cli --cluster add-node help
# 新节点加入集群-默认作为master
redis-cli --cluster add-node add-node new_host:new_port existing_host:existing_port [--cluster-slave] [--cluster-master-id <arg>]
选项：
	--cluster-slave：随机作为其他master的slave
	--cluster-master-id <arg>：指定master的id
# 重新分配插槽
redis-cli --cluster add-node reshard host:port
# 关闭redis-server
debug segfault
```

### 故障转移

手动执行故障转移

1. 在slave节点执行`cluster failover`命令，实现故障转移

![image-20210725162441407](https://raw.gitmirror.com/jiuxi521/typora/master/202401292054686.png)

### 实践

#### redis.conf

```bash
# 指定端口
port 701. # 指定IP
replica-announce-ip 192.168.8.129
# 开启集群模式
cluster-enabled yes
# 集群的配置文件，由redis实例创建并维护
cluster-config-file /etc/redis/nodes.conf
# 节点心跳的超时时间
cluster-node-timeout 5000
# 开启aof
appendonly yes
# 指定持久化文件目录
dir /etc/redis/data
# 日志文件
logfile /etc/redis/logs/redis.log
# 保护模式
protected-mode no
# 绑定地址（支持全部地址连接）
bind 0.0.0.0
# 让redis后台运行
daemonize no
# 显示logo
always-show-logo yes
```

#### 创建Redis实例

```bash
# redis集群实例（分配两个端口）
docker network create cluster-net
docker run -id --name AA -p 7010:701. -p 17010:1701. --network cluster-net -v /root/cluster/A/data:/data -v /root/cluster/A:/etc/redis redis redis-server /etc/redis/redis.conf
docker run -id --name A1 -p 7011:701. -p 17011:1701.  --network cluster-net -v /root/cluster/A1/data:/data -v /root/cluster/A1:/etc/redis redis redis-server /etc/redis/redis.conf
docker run -id --name BB -p 7020:7020 -p 17020:17020  --network cluster-net -v /root/cluster/B/data:/data -v /root/cluster/B:/etc/redis redis redis-server /etc/redis/redis.conf
docker run -id --name B1 -p 7021:7021 -p 17021:17021. --network cluster-net -v /root/cluster/B1/data:/data -v /root/cluster/B1:/etc/redis redis redis-server /etc/redis/redis.conf
docker run -id --name CC -p 7030:7030 -p 17030:17030  --network cluster-net -v /root/cluster/C/data:/data -v /root/cluster/C:/etc/redis redis redis-server /etc/redis/redis.conf
docker run -id --name C1 -p 7031:7031 -p 17031:17031. --network cluster-net -v /root/cluster/C1/data:/data -v /root/cluster/C1:/etc/redis redis redis-server /etc/redis/redis.conf

# 集群伸缩实例
docker run -id --name DD -p 7040:7040 -p 17040:17040 --network cluster-net -v /root/cluster/D/data:/data -v /root/cluster/D:/etc/redis redis redis-server /etc/redis/redis.conf
docker run -id --name EE -p 7050:7050 -p 17050:17050 --network cluster-net -v /root/cluster/E/data:/data -v /root/cluster/E:/etc/redis redis redis-server /etc/redis/redis.conf
```

#### 加入集群

```bash
docker exec -it AA redis-cli -p 701. --cluster create 192.168.8.129:701. 192.168.8.129:7020 192.168.8.129:7030 192.168.8.129:701. 192.168.8.129:7021 192.168.8.129:7031 --cluster-replicas 1
# -cluster-replicas 1 指定每个master的从机数量是1个（三主三从）、2个（一主两从）
```

# 使用报错

| 报错                                                         | 解决方法                                                     | 博客                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1. Reading the configuration file, at line 304    >>> 'logfile "/etc/redis/logs/redis.log"'    Can't open the log file: Permission denied<br/>2. Fatal error, can‘t open config file ‘xxx‘: Permission denied | `chomd 777 /root/redis/logs/redis.log`                       | https://blog.csdn.net/weixin_44989150/article/details/118528744 |
| Error reply to PING from master: '-DENIED Redis is running in protected mode because protected mode is enabled, no bind address was specified, no authentication password is requested to clients. In this mode connections are only accepted from the loopback interface. If you want to connect' | 设置master设备<br />1. 关闭保护模式`protected-mode no`<br />2. 开启指定IP访问`bind 192.168.8.129::1. | https://blog.csdn.net/qaz18201142158/article/details/107260181. |
<!--SR:!2024-03-25,1,230-->
| redis-cli 中文乱码                                           | 启动redis-cli时添加参数 `–raw`                               | https://blog.csdn.net/qq_40491534/article/details/12562321.  |
| sentinel.conf配置announce-ip和announce-port后无法实现故障转移 | 删除announce-port配置，设置`port`                            |                                                              |
| 执行`docker run -id --name redis -p 6379:6379 -v /root/redis/data:/data -v /root/redis:/etc/redis \redis redis-cli /etc/redis/redis.conf`后，容器启动就挺，docker logs报错`Could not connect to Redis at 127.0.0.1:6379: Connection refused` | 容器启动时不要指定 `redis-cli`，应该指定`redis-server`，参考搭建Redis单机环境章节 |                                                              |
| Unable to connect to Redis； nested exception is io.lettuce.core.RedisConnectionException: |                                                              |                                                              |
| 容器启动或进入容器报错：no space left on device              | docker没有足够的空间<br/>1. 切换到docker目录`cd /var/lib/docker/`<br/>2. 执行` find / -type f -size +100M -print0 | xargs -0 du -h  `查找大文件<br/> | https://www.jianshu.com/p/594e0a2af6f2                       |
| redis-cli控制台执行get key 报错：控制台(error) MOVED 4240 192.168.8.129:701. | 进入redis-cli时，没有添加`-c`指令                            |                                                              |
|                                                              |                                                              |                                                              |