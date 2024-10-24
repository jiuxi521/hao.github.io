---
title: kafka
createTime: 2024/10/24 16:40:01
permalink: /article/j3oyzxqj/
---
![image.png|500](https://raw.gitmirror.com/jiuxi521/typora/master/202409011032743.png)
特性：高可靠、高可用、高吞吐、可伸缩
使用场景：
	1. 背景
		1. 线程间共享堆内存空间，可以直接交换数据；
		2. 但JVM进程之间，没有共享内存区域，可通过ServerSocket和Socket交互
	2. 问题：
		1. 线程之间的处理速率不同，会导致数据积压（占用内存或磁盘保存待处理数据）
	3. 解决问题
		1. 使用kafka作为缓存区（消息中间件）——JMS(Java Message Service)——MQ软件
	4. 模型
		1. P2P模型（点对点模型）：消息只能消费一次
			1. ![image.png|500](https://raw.gitmirror.com/jiuxi521/typora/master/202409011057793.png)
		2. PS模型（发布-订阅模型）：消息可以被每个订阅者消费
			1. 可根据Topic(主题)分组；不同分组订阅者相互隔离
			2. ![image.png|500](https://raw.gitmirror.com/jiuxi521/typora/master/202409011057731.png)
	5. 消息中间件模型
		1. ActiveMQ、RocketMQ、RabbitMQ、kafka
	6. cmd命令：JPS 查看进程
	7. ![image.png|500](https://raw.gitmirror.com/jiuxi521/typora/master/202409011116740.png)
	8. 横向扩展、纵向扩展：IO扩展
		1. 横向扩展：部署集群
			1. 根据主题Topic
		2. 纵向扩展：提升硬件：CPU、IO、磁盘等
	9. 消费者组
	10. 集群：Redis集群、Kafka集群、Dubble集群
	11. 概念
		1. Broker：服务节点（集群）
		2. Partition：分区（编号）
		3. 副本：Leader和Follower
		4. kafka没有备份的概念，称之为副本
			1. Broker Master做备份
		5. Zookeeper：持久节点和临时节点
		6. Broker选举Controller：谁先在ZK中创建成功controller目录，谁是Controller
	12. Broker在ZK注册流程
		1. 注册Broker节点
		2. 监听/controller节点
		3. 注册/controller节点
			1. 注册成功
				1. 监听/broker节点；
			2. 注册失败
				1. 通知controller节点，集群的变化
				2. controller节点向其他broker节点传输信息（分组、分区、controller等信息）
					1. (主题、分区都只有一类，多份么？)
	13. 通信
		1. Broker和ZooKeeper通信：使用ZKClient和ZooKeeper
		2. Controller和Broker通信：JDK1.4 NIO：Channel、Buffer、Selector、SelectionKey
		3. Producer、Consumer、Broker之间使用SocketServer通信
		4. 
		