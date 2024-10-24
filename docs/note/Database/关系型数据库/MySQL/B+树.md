---
title: B+树
createTime: 2024/10/24 16:40:01
permalink: /article/rqg47khb/
---
# 定义
在 B+ 树中
	1. 内部节点只保存子节点中索引的最大值和指向子节点的指针，而不存储实际的数据记录，所有的数据记录都存储在叶子节点中。
	2. 叶子节点通过指针连接成一个有序链表，方便范围查询和顺序扫描。
![image.png](https://raw.gitmirror.com/jiuxi521/typora/master/202403161345774.png)

## B+树的插入

# 资料
https://blog.csdn.net/weixin_52821814/article/details/131733045