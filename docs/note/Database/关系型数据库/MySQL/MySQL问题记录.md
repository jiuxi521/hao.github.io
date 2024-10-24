---
title: MySQL问题记录
createTime: 2024/10/24 16:40:02
permalink: /article/qmwyb1ff/
---

| 问题                                | 解决                                                                                                                                                  | 博客                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| docker部署的mysql，sysdate()比系统时间慢8小时 | docker exec -it mysql bash # 进入容器  <br>cp /usr/share/zoneinfo/Hongkong /etc/localtime  # 重要修改时区  <br>exit # 退出  <br>docker restart mysql # 重启Docker | https://www.cnblogs.com/ahmed/p/15356145.html |
