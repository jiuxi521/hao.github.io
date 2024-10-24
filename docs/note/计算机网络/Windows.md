---
title: Windows
createTime: 2024/10/24 16:40:00
permalink: /article/ryhhj6ru/
---
```bash
# 指定名称关闭进程 
taskkill /F /IM nginx.exe
# 指定进程号关闭进程 
taskkill /F /PID 23045
# 指定进程号关闭进程 及子进程
taskkill /F /PID 23045 /T


# 启动进程
start nginx


# 查看占用端口号及进程ID
netstat /ano | findstr 8081
# 查看帮助指令
netstat /help

# 注册myslqd为服务
mysqld install MySQL
# 删除服务
sc delete MySQL
# 启动服务
net start MySQL
# 停止服务
net stop MySQL
```
