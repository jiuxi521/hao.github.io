---
title: linux
createTime: 2024/10/24 16:40:00
permalink: /article/u6y37378/
---
# linux基本资料

## Centos的安装

1.  客户机版本选择<font color="red">Red Hat Enterprise Linux 7 64位</font>
2.  安装时网络选择<font color="red">NAT模式</font>
    1.  [网络介绍](#NAT模式)

3.  系统分区时选择手动分区（选择手动分区后点确认，然后添加挂载点）一般分为三个区
    1.  /boot引导分区：磁盘大小1G；标准分区；ext4
    2.  /swap交换分区：磁盘大小为运行内存大小；标准分区；swap
    3.  /根分区：磁盘大小为 磁盘的剩余空间；标准分区；ext4
4.  KDUMP：不用启动
5.  网络和主机名：可以修改主机名
6.  **虚拟机快照**
7.  **虚拟机克隆**
8.  **虚拟机迁移与删除**
9.  **vmtools**

## linux命令行工具

### XShell

下载地址：<https://www.netsarang.com/en/free-for-home-school/>

<img src="https://raw.githubusercontent.com/jiuxi521/typora/master/image-20210726162919765.png" alt="image-20210726162919765" style />

### Xftp6

文件上传与下载

<img src="https://raw.githubusercontent.com/jiuxi521/typora/master/image-20210726163155521.png" alt="image-20210726163155521. style />

## linux文本编辑器

1.  vi编辑器
2.  vim编辑器：vi的增强版本，是vi的克隆，基于GUN软件；vim存放在/usr/bin/vim；
3.  多数的Linux系统中vi命令是vim的别名

### Vi编辑器

#### 三种工作模式

1.  普通（命令）模式
2.  编辑（插入）模式
3.  末行（命令行）模式

##### Vi的普通（命令）模式

1.  在shell中输入vi启动编辑器时，即进入该模式。
2.  无论在任何模式，只要按下Esc建，都会进入命令模式

##### Vi的编辑（插入）模式

1.  在命令模式下输入插入命令 i、附加命令 a 、 打开命令 o、修改命令 c、取代命令 r 、替换命令 s 等都可以进入插入模式
2.  在文本输入过程中，若想回到普通模式下，按 Esc 键即可

##### Vi的末行（命令行）模式

1.  在命令模式下，用户按冒号`“:”`，即可进入末行模 式
2.  末行模式中所有的命令都必须按 `<回车>`键后执行， 命令执行完后，vi自动回到命令模式。
3.  若在末行模式下输入命令过程中改变了主意，可 按 `<Esc键>`或用`<退格键>`将输入的命令全部删除之后， 再按一下`<退格键>`，即可使 vi 回到命令模式下。

#### 操作命令

##### 打开Vi编辑器

```shell
vi						# 直接进入
vi filename				# 打开或新建文件filename，并将光标置于第一行首
vi +n filename			# 打开文件filename，并将光标置于第n行首
vi + filename			# 打开文件filename，并将光标置于最后一行行首
vi +/pattern filename	# 打开文件filename，并将光标置于第一个与pattern匹配的串处		
vi -r filename			# 打开上次用vi编辑时发生系统崩溃，恢复filename
```

##### 普通（命令）模式下的基本操作

```shell
G 			# 用于直接跳转到文件尾
gg			# 用于直接跳转到文件头
x 			# 删除光标所在的字符
r 			# 替换光标所在的字符
~ 			# 切换光标所在字母的大小写
/			# 用于查找字符串
?		    # 用于查找字符串
dd 			# 剪切一行文本
5dd			# 剪切 5 行文本
yy 			# 复制一行文本
5yy 		# 复制 5 行文本
p     		# 粘贴一行文本
u 			# 取消上一次编辑操作（undo）
. 			# 重复上一次编辑操作（redo）
ZZ 			# 用于存盘退出Vi
ZQ 			# 用于不存盘退出Vi
:set nu		# 设置显示行号
:setnonu	# 设置取消显示行号
10+shift+g	# 快速定位到第10行
```

##### 末行（命令行）模式下的基本操作

```shell
:w 		# 保存当前编辑文件，但并不退出
:w 		# newfile 存为另外一个名为 “newfile” 的文件
:wq 	# 用于存盘退出Vi
:q!		# 用于不存盘退出Vi
:q 		# 用于直接退出Vi（未做修改）
```

<img src="https://raw.githubusercontent.com/jiuxi521/typora/master/vi-vim-cheat-sheet-cn.png" alt="img" />

## linux目录结构

1.  /bin：是Binary的缩写，这个目录<font color="red">存放着经常使用的命令</font>。
2.  /sbin：s就是Super User的意思，这里<font color="red">存放的是系统管理员使用的系统管理程序</font>。
3.  /home：存放<font color="red">普通用户的主目录</font>，在Linux中每个用户都有一个自己的目录，一般该目录名是以用户的账号命名的。
4.  /root：该目录为系统管理员，也称作<font color="red">超级权限者的用户主目录</font>。
5.  /lib：系统开机所需要最基本的动态连接共享库，其作用类似于Windows里的DLL文件。几乎所有的应用程序都需要用到这些共享库。
6.  /etc：所有的系统管理所需要的<font color="red">配置文件</font>和子目录<font color="red">my.conf</font>。
7.  /usr：这是一个非常重要的目录，<font color="red">用户的很多应用程序和文件</font>都放在这个目录下，类似与windows下的program files目录。
8.  /boot：存放的是<font color="red">启动Linux时使用的一些核心文件</font>，包括一些连接文件以及镜像文件。
9.  /tmp：这个目录是用来<font color="red">存放一些临时文件</font>的。
10. /dev：类似windows的设备管理器，把<font color="red">所有的硬件用文件的形式存储</font>。
11. /mnt：系统提供该目录是为了<font color="red">让用户临时挂载别的文件系统的</font>，我们可以将外部的存储挂载在/mnt/上，然后进入该目录就可以查看里面的内容了。
12. /usr/local：这是另一个<font color="red">给主机额外安装软件所安装的目录，一般是通过编译源码的方式安装的程序</font>。
13. /var：这个目录中存放着在不断扩充着的东西，习惯<font color="red">将经常被修改的目录放在这个目录下</font>，包括各种日志文件。
14. /media：linux系统会自动识别一些设备，例如U盘光驱等等，当识别后，linux会把识别的设备挂载到这个目录下。
15. /sys：这是linux2.6内核的一个很大的变化。该目录下安装了2.6内核中新出现的一个文件系统sysfs。
16. /proc：这个目录是一个虚拟的目录，它是系统内存的映射，访问这个目录来获取系统信息。
17. /srv：service的缩写，该目录存放一些服务启动之后需要提供的数据。
18. /opt：这是给主机额外安装软件所摆放的目录，如安装ORACLE数据库就可放到该目录下。默认为空。
19. /selinux：SELinux是一种安全子系统，它能控制程序只能访问特定文件。
20. /lost+found：这个目录一般情况下是空的，当系统非法关机后，这里就存放了一些文件。

## linux文件类型

1.  普通文件 `-`
2.  目录文件 `d`：目录文件指目录项的集合
3.  字符设备文件 `c`：键盘
4.  块文件 `b`:磁盘
5.  套接字 `s`
6.  命名管道 `p`

# linux基本命令

> 1.  选项和参数之间用空格分开
> 2.  多个命令可出现在一行，用“`;`”将两个命令隔开
> 3.  命令严格区分大小写

```bash
cmd [options] <argument1. <argument2>...
选项：
	cmd:命令
	options：选项
	arguemnts：参数
```

## linux查找命令

### 查找文件

#### find指令

> 支持通配符，*：匹配多个字符，?：匹配单个字符

1. 从指定目录向下递归地遍历其各个子目录

```bash
find [搜索范围] [选项]
搜索范围：
	/ : 根目录开始的所有文件
选项：
	-name "*.txt"：查找txt类型的文件
	-name "file*": 查找file开头的文件
    -name "*file*": 查找文件名包含file的文件
	-type f：查找文件
	-type d：查找目录
	find /etc -type f ! -name "*.conf"：查找 /etc 目录下所有文件，并排除以 .conf 结尾的文件
	-user 用户名：查找指定用户的文件
	-size +1M：搜索大于 1MB 的文件
```

![image-20211020084456673](https://raw.githubusercontent.com/jiuxi521/typora/master/image-20211020084456673.png)

#### locate指令和updatedb指令

```bash
# 安装updatedb工具
yum install mlocate.x86_64
# 刷新数据库依赖，创建/var/lib/mlocate/mlocate.db数据库
updatedb
locate "通配符"
```

### 查找指令

#### which指令

查看某个指令在哪个目录下

```bash
which 指令名称
```

## linux日期命令

### date指令

1.  date （功能描述：显示当前时间）

2.  date +%Y（功能描述：显示当前年份）

3.  date +%m（功能描述：显示当前月份）

4.  date +%d （功能描述：显示当前是哪一天）

5.  date "+%Y-%m-%d %H:%M:%S"（功能描述：显示年月日时分秒）

### cal指令

cal \[选项] （功能描述：不加选项，显示本月日历）

cal 1999  （功能描述：显示1999的日历）

## linux压缩命令

### tar类型、tar.gz类型

> tar指令——打包指令，打包后的文件格式为`.tar.gz`
>

1. 基本语法

    ```shell
    tar [选项] xxx.tar.gz 打包的内容
    选项：
        -z	 # 使用 gzip 进行压缩，生成***.gz文件或解压***.gz文件
        -x   # 解压.tar文件（extract）
        -v   # 显示详细信息（verbose）
        -f   # 指定压缩后的文件名（file）
        -c   # 生成.tar打包文件（create）
    ```

2. 实例

    1. 压缩命令

        ```shell
        # *.tar文件
        tar -cvf xxx.tar file1 file2 ....  	# 压缩多个文件
        tar -cvf xxx.tar /home/			   # 压缩整个/home目录
        
        # *.tar.gz文件
        tar -zcvf xxx.tar.gz file1 file2 ....  	# 压缩多个文件
        tar -zcvf xxx.tar.gz /home/			   # 压缩整个/home目录
        ```

    2. 解压命令

        ```shell
        # *.tar文件
        tar -xvf xxx.tar [-C] 指定目录		   # 解压文件到指定目录
        
        # *.tar.gz文件
        tar -zxvf xxx.tar.gz [-C] 指定目录		# 解压文件到指定目录
        ```

### zip类型

1. 压缩命令

    ```shell
    zip [-r] xxx.zip 待压缩目录或文件
    选项：
    	-r：递归目录
    
    zip -r myhome.zip * 		# 指当前目录下的所有文件
    zip -r myhome.zip /home/	# 将/home下的所有文件（包括home目录）
    ```

2. 解压文件

    ```bash
    unzip xxx.zip [-d 指定目录]
    选项：
    	-d：指定解压目录
    ```

### gz类型

gzip用于压缩<font color='red'>单一文件</font>，后缀`.gz`

1.  压缩指令

    ```shell
    gzip file
    ```

2.  解压指令

    ```shell
    gunzip xxx.gz
    ```

## linux目录命令

### cd指令

```shell
cd [目录]
目录：
    ~：		     切换到用户主目录cd
    /home/xxx：    切换到xxx用户的主目录
    /:   		  根目录
    ./： 		 当前目录
    ../：		 当前目录的父目录
```

### mkdir指令

```shell
mkdir [选项] 要创建的目录
选项：
    -p：递归创建多级目录
```

### rmdir指令

```shell
rmdir [选项] 要删除的空目录
选项：
	-p：删除目录及其空父目录
```

### rm指令

```shell
rm [选项] 文件或目录
选项：
    -r：递归删除	
    -f：强制删除不提示
```

## Linux文件指令

### grep指令

文本匹配查询

```bash
grep [选项] "匹配表达式" 查找文件
选项：
	-n：显示行号
	-i：忽略字母大小写
	-r：递归搜索文件夹
```

### > 和 >>指令

1.  `>`是输出重定向命令，表示覆盖写
2.  `>>`是追加命令，表示文件追加
3.  `|`是管道符，将一个命令的输出传递给另一个命令作为输入

### mv指令

文件移动和重命名

```bash
mv [选项] 源文件或目录 目标文件或目录
```

### tail指令

1.  tail 用于输出文件中尾部的内容，默认情况下 tail 指令显示文件的前 1. 行内容。

    ```shell
    tail [选项] 文件
    选项：
    	-n 5：   # 查看文件尾 5 行内容，5 可以是任意行数
    	-f：  # 实时追踪该文档的所有更新
    ```

### head指令

```shell
head [选项] 文件名
选项：
	-n 5：查看前5行内容。（默认是前10行）
```

### echo指令

```bash
echo [选项] 内容
选项：
	-n：不输出结尾的换行符。（默认echo命令会输出一个换行符）
	-e：支持解释转义字符。如：解释\n为换行符
```

### touch指令

```bash
touch [选项] 文件名
选项：
	-c： 不创建任何文件
```

### cp指令

1. 文件拷贝的方法

```shell
cp [选项] source desc	
    -r：递归复制
```

### \cp指令

1. 强制覆盖不提示的方法

```bash

cp [选项] source desc	
    -r：递归复制
```

### cat指令

```shell
cat [选项] 文件
选项：
	-n：显示行号
```

### less指令

```bash
less 文件名  	 # 在终端中分页显示文本
```

<img src="https://raw.githubusercontent.com/jiuxi521/typora/master/image-20211019203044755.png" alt="image-20211019203044755" style />

### more指令

```bash
more 文件名	 # 在终端中分页显示文本
```

 <img src="https://raw.githubusercontent.com/jiuxi521/typora/master/image-20211019203210651.png" alt="image-20211019203210651. style />

## Linux硬件挂载

### 挂载命令mount

*   前提：root权限；/mnt挂载目录存在
*   格式：#mount \[选项] <挂载设备名称> <挂载点>
*   选项：
    *   \-t 挂载的文件系统
        *   \#mount -t ext4 /dev/hda8 /mnt/linuxext
        *   \#mount -t iso3660 /dev/cdrom /mnt/cdrom
        *   \#mount -t vfat /dev/sda1 /mnt/usb
    *   \-o\[参数=值]
        *   \#mount -o iocharset=cp936 /dev/sda1 /mnt/usb
        *   \#mount -o ro /dev/hda3 /mnt/usr
*   参数：
    *   文件系统类型
        *   vfat---FAT32（Win98文件系统）
        *   nfts---NTFS（NTFS文件系统）
        *   ext4   （Linux文件系统）
        *   iso9660（CD-ROM文件系统）
    *   挂载设备名称（xxYN）
        *   类型
            *   /dev 保存所有设备文件的目录
            *   xx:设备类型
                *   IDE硬盘为hd
                *   SCSI硬盘和usb硬盘为sd
                *   软盘为fd
            *   Y:同种设备的顺序号：第一个硬盘为a
            *   N：同一设备编号：硬盘的第一个分区为1，硬盘1-4为前面四个主分区，5开始为逻辑分区
        *   常用设备名称
            *   /dev/console：系统控制台
            *   /dev/hd：IDE磁盘
            *   /dev/fd：软驱
            *   /dev/cdrom：光盘
            *   /dev/sd：SCSI磁盘（USB盘）
            *   /dev/tty：虚拟控制台
            *   /dev/ttyS：串口
    *   挂载点目录（/mnt）
        *   mount执行前提：挂载点目录存在

### 卸载命令umount

*   格式：#umount  <设备名称>或<挂载点>
*   例：
    *   umount  /mnt/usb（挂载点）
    *   umount  /dev/sda1（设备名称）

## linux网络指令

### ip addr

```bash
ip addr
```

### nmtui

图形化界面配置网络（NetworkManager Text User Interface）

```bash
nmtui
```

### netstat

```shell
netstat [选项]		
选项：
    -a：显示所有选项，默认不显示LISTEN相关	
    -n：拒绝显示别名，能显示数字的全部转化成数字	
    -p：显示建立相关链接的程序名
    -t：仅显示tcp相关选项
    -u：仅显示udp相关选项	
```

```bash
netstat -anp | grep 端口号
netstat -anp | grep 服务
```

### ping

```bash
ping ip
```

## linux进程指令

### ps

进程查看命令

```shell
ps	[选项] 
选项：
	-a：显示当前终端的所有进程信息
	-u：以用户的格式显示进程信息
	-x：显示后台进程运行的参数
	-e：显示所有进程
	-f： 全格式形式显示
	-p pid：显示指定进程号的进程名称
```

示例：

```bash
# 显示当前系统中所有进程的命令
ps -aux | grep xxx	
ps -ef | grep xxx	

# 查看指定进程的进程信息
ps -p pid
```

查询结果描述：

| 关键字  | 描述                                                         |
| ------- | :----------------------------------------------------------- |
| USER    | 进程执行用户                                                 |
| PID     | 进程号                                                       |
| %CPU    | CPU占用                                                      |
| %MEM    | 物理内存占用                                                 |
| TTY     | 关联的                                                       |
| STAT    | 进程的运行状态。S：Sleep休眠；s：该进程是会话的先导进程；R：Run运行;N：表示进程拥有比普通进程更低的优先级；D：短期等待；Z：僵死进程（占用内存未释放）；T：被跟踪或被停止 |
| TIME    | 进程占用CPU时间                                              |
| COMMAND | 进程名称                                                     |

### kill

根据PID终止进程

```bash
kill  [选项]  PID
选项：
	-9：强制停止
```

### killall

根据进程名称（COMMAND）终止进程

```bash
killall [选项] process_name
选项：
	-u username：关闭指定用户的进程
	-q：以安静模式终止进程
```

### pstree

1. 以树状形式显示进程

```shell
pstree	[选项]
选项：
	-u：显示进程所属用户
 	-p：显示进程的进程号
```

### top

动态监控指令命令

```shell
top [选项]
选项：	
    -d 秒数   # 设置每隔几秒更新，默认3秒	
    -i		  # 不显示闲置进程或僵死进程	
    -p	      # 通过指定监控进程ID监控进程的状态
```

**交互说明**

1.  P：以CPU使用率排序，默认就是此项
2.  M：以内存的使用率排序
3.  N：以PID排序
4.  q：退出top
5.  u：之后输入指定用户名，监测指定用户
6.  k：之后输入进程号，结束指定进程

## linux其他指令

### linux 命令alias

```bash
# 编辑根目录下的.bashrc文件
vi ~/.bashrc
# 添加别名配置
alias dis='docker images'
# 文件生效
source ~/.bashrc
```

### linux关机&重启指令

```shell
reboot				# 重启
shutdown -h now 	# 表示立即关机
shutdown -h 1. # 表示1分钟后关机
shutdown -r now		# 立即重启
halt				# 直接使用，关机
sync				# 把内存的数据同步到磁盘上，当我们关机或者重启时，都应该先执行一下sync，防止数据丢失
```

### linux帮助指令

获得 shell 内置命令的帮助信息

```shell
man 指令

指令 --help

history 1. # 查看最近执行的10条指令
```

# linux软件管理

## rpm管理

> RPM：RedHat Package Manager

rpm包格式：firefox-78.12.0-1.el7.centos.x86\_64

1.  名称：firefox
2.  版本号：78.12.0
3.  适用操作系统：1.el7.centos
4.  x86\_64指64位操作系统；i386指32位操作系统；noarch指通用版本

```shell
# rpm包安装查询
rpm -qa 		# 查询所安装的所有rpm包
rpm -qa | more ：
rpm -qa | grep xxx	
rpm -qa | grep firefox  # 	
rpm -q 软件包名 # 查询软件是否安装
rpm -qi 软件包名 # 查询软件包信息
rpm -ql 软件包名 # 查询软件包中的文件
rpm -qf 文件全路径名 # 查询文件所属的软件包	
rpm -qf  /etc/passwd 
```

```shell
# 卸载rpm软件包
erase 消除
rpm -e RPM包名称  # 卸载rpm软件包，如果软件包存在依赖，会报错
rpm -e --nodeps RPM包名称 # 强制卸载
```

```shell
# rpm包安装
rpm -ivh RPM 包全路径名称	
    -i  # install安装	
    -v # verbose 提示	
    -h # hash进度条
```

## yum管理

```shell
yum search keyword  	# 查找指令所在的包

yum install XXX 		# 安装rpm包

yum list | grep XXX   	 # 查询指定服务器是否有某个rpm包
```

# linux用户管理

## 用户管理

```bash
useradd 用户名   # (当创建用户成功后，会自动的创建和用户同名的家目录)

useradd -d 指定目录 用户名	# （指定主目录）

useradd -g 用户组 用户名	# （指定组）

passwd 用户名	# （给用户指定密码）

userdel 用户名	# （删除用户，保留用户主目录）

userdel -r 用户名	# （删除用户，移除用户主目录）

usermod -g 新用户组 用户名	# （移动用户到新组）
```

## 组管理

```bash
groupadd 组名

groupdel 组名
```

## 文件权限管理

当某个用户创建了一个文件后，这个文件的所在组就是该用户所在的组(默认)。

```bash
chown [选项] newowner 文件名/目录 		 	（修改文件所有者）

chgrp [选项] newgroup 文件名/目录				（修改文件所在组）

chown [选项] newowner\:newgroup 文件/目录 	（改变所有者和所在组）

选项：
	-R：递归地更改目录及其子目录
```

# linux权限管理

```bash
-rw-r--r--. 1 haozi testgroup 3366 12月 1. 13:1. test
```

1.  第 1-3 位确定**所有者**（该文件的所有者）拥有该文件的权限。---User
2.  第 4-6 位确定**所属组**（同用户组的）拥有该文件的权限，---Group
3.  第 7-9 位确定**其他用户**拥有该文件的权限 ---Other
4.  1：文件：硬连接数 或 目录：子目录数
5.  haozi ：用户名
6.  testgroup ：组名
7.  3366 ：文件大小
8.  12月 1. 13:1.   ： 最后修改日期
9.  test：文件名

## 权限修改命令

**方法一：**

u:所有者 g:所有组 o:其他人 a:所有人(u、g、o 的总和)

1.  chmod u=rwx,g=rx,o=x 文件/目录名

2.  chmod o+w 文件/目录名

3.  chmod a-x 文件/目录名

**方法二：**

r=4 w=2 x=1 rwx=4+2+1=7

`chmod u=rwx,g=rx,o=x 文件目录名` 相当于 `chmod 751 文件/目录名`

# linux服务管理

1.  linux服务==等价于==后台程序==等价于==守护进程
2.  sshd.service是远程登陆服务，端口号为22

## service指令

1.  基本格式

    ```shell
    service 服务名 start| stop | restart | reload | status
    ```

2.  可以管理的服务

    1.  `/etc/init.d/`目录下绿色的服务表示可以用service指令管理
    2.  `setup`指令中`SysV initscripts`下的服务可以使用service指令管理

## setup命令

**setup显示系统全部服务**

1.  SysV initscripts：可以使用service指令管理的
2.  systemd services：可以使用systemctl指令管理的

<img src="https://raw.githubusercontent.com/jiuxi521/typora/master/image-20211019104040116.png" alt="image-20211019104040116" style />

## 服务的运行级别

1.  Linux系统有7种运行级别(runlevel):常用的是级别3和5

    1.  运行级别0:系统停机状态，系统默认运行级别不能设为0，否则不能正常启动
    2.  运行级别1:单用户工作状态，root权限，用于系统维护，禁止远程登陆
    3.  运行级别2:多用户状态(没有NFS)，不支持网络
    4.  运行级别3:完全的多用户状态(有NFS)，无界面，登陆后进入控制台命令行模式
    5.  运行级别4:系统未使用，保留
    6.  运行级别5\:X11控制台，登陆后进入图形GUI模式
    7.  运行级别6:系统正常关闭并重启，默认运行级别不能设为6，否则不能正常启动

2.  cetos7开始在/etc/initab中进行简化，

    1.  简化说明

	```shell
multi-user.target：analogous to runlevel 3
graphical.target：  analogous to runlevel 5
	```

    2.  查看当前的运行级别

	```shell
systemctl get-default
	```

    3.  设置运行级别

	```shell
systemctl set-default graphical.target | multi-user.target
	```

    4.  设置运行级别

	```shell
init 0-6	# 设置运行级别
	```

### chkconfig

1.  `chkconfig`用于给服务的各个运行级别设置自 <font color="red">启动|关闭</font>
2.  `chkconfig`管理的服务可以在 `/etc/init.d` 查看
3.  `chkconfig`设置服务自启动或关闭后，需要`reboot`生效

```shell
chkconfig --list  [| grep XXX]		# 查看服务的自启用状态
chkconfig --level 3 network off|on	# 设置3级别的network服务自启动或关闭
```

## systemctl指令

1.  基本语法：`systemctl [start| stop |restart | status] 服务名`

2.  `systemctl`指令管理的服务在`/usr/lib/systemd/system`中查看

3.  **设置服务的自启动状态**(永久设置)

    ```shell
systemctl list-unit-files [| grep 服务名]	 # 查看服务开机启动状态 
systemctl enable 服务名			         	 # 开启服务开机自启动（默认3和5级别）
systemctl disable 服务名			     	 # 关闭服务开机自启动（默认3和5级别）
    ```

4.  **检测端口是否启动**

    ```shell
telnet IP 端口
telnet 域名 端口
    ```

5.  **设置服务临时状态**

    ```shell
systemctl [start| stop |restart | status] 服务名 
    ```

6.  **打开或关闭指定端口**

    ```shell
firewall-cmd --permanent --add-port=端口号/协议号		# 打开端口
firewall-cmd --permanent --remove-port=端口号/协议号	    # 关闭端口
firewall-cmd --reload		                            # 重载端口，生效
firewall-cmd --query-port=端口号/协议号		            # 查看端口是否开放
firewall-cmd --list-ports	                            # 查看开放的端口
    ```

## linux防火墙管理命令

```shell
# 防火墙安装
yum install firewalld
# 防火墙的基本使用
systemctl start firewalld	# 启动防火墙
systemctl stop firewalld	# 关闭防火墙
systemctl status firewalld	# 查看状态
systemctl disable firewalld	# 开机禁用防火墙
systemctl enable firewalld	# 开机启用防火墙
firewall-cmd --list-ports	# 查看开放的端口
firewall-cmd --permanent --add-port=8080/tcp# 开放端口（permanent永久开放）
```

# linux网络配置

## 基础知识

1. 网卡：计算机硬件设备（Win10的网络适配器），提供**计算机和网络之间的物理连接**。负责将计算机内部的数据和网络传输的数据进行转换，以便进行通信
    1. 作用
        1. 接口标准**：** 网卡可以基于不同的网络接口标准工作。不同接口标准如以太网（有线局域网连接）、Wi-Fi（无线连接）、蓝牙等。
        2. MAC 地址： <font color='red'>每个网卡都有一个唯一的物理地址</font>，称为 MAC 地址（Media Access Control Address）。MAC 地址由制造商分配，用于在网络中唯一标识该网卡。
        3. 数据链路层： 网卡工作在 OSI 模型的<font color='red'>数据链路层</font>，负责处理数据帧（Frame）的构建和解析，以及在物理媒体上的数据传输。
2. 网关：网关是一个相对通用的术语，指的是连接不同网络的设备（例如：路由器）。局域网内部通信不经过网关，跨网段通信才经过网关。
    1. 作用：
        1. **双网口路由器：** 网关是一台双网口路由器，其中一块网卡（通常称为 WAN 接口）连接到公网，另一块网卡（通常称为 LAN 接口）连接到局域网。
        2. **NAT 地址转换：** 当局域网内的设备向公网发起请求时，网关会执行NAT地址转换。私有IP地址和端口会映射到网关的公网IP地址和新的端口上，从而隐藏了局域网内部设备的真实IP地址。
        3. **路由和数据包转发：** 网关根据路由表的配置，将收到的数据包从一个接口（例如局域网接口）转发到另一个接口（例如公网接口），实现局域网与公网之间的通信。这也意味着网关负责决定数据包的传输路径。
        4. **DHCP服务：** 网关可能提供DHCP服务，为局域网内的设备动态分配IP地址、子网掩码、网关地址等网络配置信息。
        5. **防火墙和安全性：** 作为网关，它可能包含防火墙功能，控制从局域网到公网的流量，阻止不需要的流量并确保网络的安全性。
        6. **连接管理：** 网关通常还管理连接到局域网的设备，处理地址冲突、连接状态等问题。

1. 集线器（Hub）：物理层设备。设备通过网线连接在集线器的端口，进行局域网内部通信。
    1. 作用：
        1. 局域网内部通信、提供上行端口，可以连接到交换机或路由器。
        2.  集线器是一个广播设备，它会将接收到的数据包广播到所有连接的设备上。
        3. 经提供数据转发，不支持数据过滤、学习等能力
2. 网桥：数据链路层设备。连接不同的局域网，并在这些局域网之间传递数据帧
    1. <font color="green">连接两个局域网</font>的一种存储/转发设备，它能将一个大的LAN分割为多个网段，或将两个以上的LAN互联为一个逻辑LAN，使LAN上的所有用户都可访问服务器
3. 交换机（Switch）：数据链路层设备。支持局域网内部通信
    1. 作用：根据目标地址选择性地将数据包转发到特定的端口，而不是广播到所有端口
4. ARP协议（Address Resolution Protocol）：<font color='blue'>地址解析协议</font>。相同网段数据转发通过ARP协议
    1. 作用：
        1. 将网络层地址（如：IP地址）映射到数据链路层地址（MAC地址）。
        2. 解决了在一个局域网中，当知道目标IP地址时，如何找到对应的MAC地址的问题。
    2. 工作原理
        1. 局域网内A主机与B主机通信时，A主机先检查本地ARP缓存，有就直接使用
        2. 如果没有B主机的MAC地址，A主机发送一个**ARP请求广播**到局域网的所有主机，询问具有特定 IP 地址的主机的 MAC 地址
    3. ARP请求与响应
        1. ARP 请求是一个广播消息，其中包含了发起请求主机的 IP 和 MAC 地址、目标 IP 地址以及预期获取的目标 MAC 地址。这个广播消息被发送到局域网上的所有主机。
        2. 收到 ARP 请求的主机，如果 IP 地址与请求匹配，则向发起请求的主机发送 ARP 响应，其中包含了自己的 IP 和 MAC 地址。
        3. 发起 ARP 请求的主机接收到响应后，将目标 IP 地址与对应的 MAC 地址映射保存到 ARP 缓存中，以便将来使用。

1. 路由器（Router）：<font color='red'>网络层设备</font>。不同网段数据转发，路由动态选择
    1. 作用：
        1. 支持NAT网络地址转换
        2. 进行网络安全控制。支持防火墙和访问控制列表（ACL）
        3. 连接局域网和公网，维护**路由表**。
    2. 路由表
        1. 包含了网络地址和下一跳的映射关系。
        2. 告诉路由器如何将数据包从源网络传递到目标网络。
        3. 路由表的构建可以通过静态配置或使用路由协议（如 RIP、OSPF、BGP）来动态学习。
2. NAT协议（Network Address Translation）：<font color='blue'>地址转换协议</font>。局域网内部设备访问外部网络时，<font color='red'>将局域网IP地址转换为公网IP地址</font>。
    1. 作用：
        1. 隐藏内部网络结构，访问外部网络使用统一的公网IP
        2. 节约IPV4地址
    2. 工作原理
        1. 在数据包离开内部网络时，NAT 将源 IP 地址替换为 NAT 设备的公共 IP 地址。
        2. 在数据包进入内部网络时，NAT 将目标 IP 地址替换为内部网络中的某个设备的私有 IP 地址。
    3. NAT映射表
        1. 记录了内部网络设备的私有 IP 地址、NAT 设备的公共 IP 地址、内部设备的端口与 NAT 设备的端口之间的映射	

## 网络配置

### 桥接模式

1. 虚拟系统可以和外部系统<font color="red">直接双向通讯</font>，但容易造成IP地址冲突（此模式虚拟机使用（宿主机）局域网下的同一网段IP）
2. Linux的桥接模式
    1. **网络桥接设备**： 在桥接模式下，虚拟机连接到一个虚拟网络桥接设备，这个<font  color="green">**虚拟桥接设备（类似直插一根网线）**通过物理网络接口与宿主机所在的物理网络连接</font>。
    2. **IP 地址分配**：虚拟机在桥接模式下<font color="green">分配到一个与物理网络相同子网的 IP 地址</font>，它在物理网络中就像是一个普通的计算机。虚拟机与其他设备一样，可以拥有自己的唯一 IP 地址，并能够通过 DHCP 自动获取 IP 地址，或者手动配置一个静态 IP 地址。
    3. **与宿主机通信：** 虚拟机还可以与宿主机进行通信，因为它们都可以连接到同一个**虚拟桥接设备**。这使得虚拟机可以通过桥接模式与宿主机进行直接通信，而不需要经过网络地址转换（NAT）等机制。
3. Docker的桥接模式
    1. 在虚拟机内部虚拟一块eth0网卡，与宿主机的vethxxx网卡进行关联
    2. Docker 会为每个容器创建一个虚拟网桥，并为容器分配<font color='blue'>一个局域网内的独立 IP 地址</font>。

### 主机模式

独立的系统，不与外部发生联系

### NAT模式

网络地址转换模式，虚拟系统可以和外部系统通讯，不会造成IP冲突。（此模式虚拟机可以与其他主机单向通信，虚拟机可以ping通外部，外部不能ping通虚拟机）

![image-20211015143540253](https://raw.gitmirror.com/jiuxi521/typora/master/20240103145653.png)

1.  Linux虚拟机和vmnet8在同一网段，可以进行通讯
2.  vmnet8访问公网的请求 经 无线网卡代理请求转发给百度
3.  查看网络IP和网关

![image-20211015143946219](https://raw.githubusercontent.com/jiuxi521/typora/master/image-20211015143946219.png)

## 获取网络配置

### 查看&修改网络配置

```bash
# 查看网络地址
ip addr
# 编辑ens33网卡配置文件
vi /etc/sysconfig/network-scripts/ifcfg-ens33
# 重启网络服务命令
service network restart
# 重启机器命令：
reboot
```

### ifcfg文件配置

> key必须大写、value可小写

```properties
TYPE="Ethernet" # 表明这是一个以太网接口

DEVICE="ens33" # 设备名称
NAME="ens33"   # 网卡

BOOTPROTO="dhcp"  # 连接方式（static|dhcp）

ONBOOT="yes"	#  是否开机启动

IPADDR=192.168.214.128			#  修改IP地址
NETMASK=255.255.255.0			#  修改子网掩码
PREFIX=24					   #  子网掩码NETMASK的替代配置项

GATEWAY=192.168.214.2			#  修改网关

DNS1=8.8.8.8			    	#  修改域名解析器，谷歌、腾讯的域名解析器
DNS3=8.8.4.4

IPV6INIT="yes"				# 是否启用 IPv6
IPV6_AUTOCONF="yes"			# 是否允许接口使用 Stateless Address Autoconfiguration（SLAAC）方式获取IPv6地址。
IPV6_DEFROUTE="yes" 		# 是否为 IPv6 设置默认路由。
IPV6_FAILURE_FATAL="no" 			# 在 IPv6 配置失败时，是否导致接口禁用。
IPV6_ADDR_GEN_MODE="stable-privacy"		# 设置 IPv6 地址生成模式为 stable privacy 模式。
```

### dhcp

> 动态主机配置协议（DHCP，Dynamic Host Configuration Protocol）：基于UDP的、用于 自动管理<font color='red'>局域网</font>内主机的 IP 地址、子网掩码、网关地址及 DNS 地址等参数，可以有效地提 升 IP 地址的利用率

1.  每次重启网络后的的IP地址都会重新分配，限定在同一个网段

```properties
TYPE="Ethernet"
PROXY_METHOD="none"
BROWSER_ONLY="no"
BOOTPROTO="dhcp"  # 网卡协议为dhcp
DEFROUTE="yes"
IPV4_FAILURE_FATAL="no"
IPV6INIT="yes"
IPV6_AUTOCONF="yes"
IPV6_DEFROUTE="yes"
IPV6_FAILURE_FATAL="no"
IPV6_ADDR_GEN_MODE="stable-privacy"
NAME="ens33"
UUID="d9d594f1-f1ad-455a-83ac-a3456892353c"
DEVICE="ens33"
ONBOOT="yes"	#  修改为yes，开机启动
```

### static

> 1. IP地址&子网掩码 = 网络地址
>     1. IP地址（Internet Protocol Address）是在网络中唯一标识设备的地址
>     2. 子网掩码（Subnet Mask）用于指定哪些部分是网络地址，哪些部分是主机地址
>     3. 192.168.1.100（IP地址） & 255.255.255.0（IP地址） = 192.168.1.0（网络地址）
>         1. 前24位（前三个八位组）用于网络地址，标识一个特定的网络段
>         2. 最后的8位（最后一个八位组）用于主机地址，用于区分具体的设备。

> 1. 静态网络地址
>     1. 要求VMWare的虚拟网络编辑器的 子网IP  与 ens33网卡 的 IPADDR 属性 在同一个网段。
>     2. GATEWAY属性与 VMWare的虚拟网络编辑器的 网关保持一致

```properties
TYPE="Ethernet"
PROXY_METHOD="none"
BROWSER_ONLY="no"
BOOTPROTO="static"  			# 修改为static
DEFROUTE="yes"
IPV4_FAILURE_FATAL="no"
IPV6INIT="yes"
IPV6_AUTOCONF="yes"
IPV6_DEFROUTE="yes"
IPV6_FAILURE_FATAL="no"
IPV6_ADDR_GEN_MODE="stable-privacy"
NAME="ens33"
UUID="d9d594f1-f1ad-455a-83ac-a3456892353c"
DEVICE="ens33"
ONBOOT="yes"	 				#  修改为yes，开机启动
IPADDR=192.168.214.128			#  修改IP地址
NETMASK=255.255.255.0			#  修改子网掩码
PREFIX=24					   # 子网掩码的位数，NETMASK的·替代配置
GATEWAY=192.168.214.2			#  修改网关
DNS1=8.8.8.8			    	#  修改域名解析器，谷歌、腾讯的域名解析器
DNS2=8.8.4.4
```

## 设置主机名和hosts映射

### 设置主机名

1.  `vi /etc/hostname`修改主机名，需要重启机器
2.  `nmtui`打开图形化界面，修改主机名。无需重启机器

### 设置hosts文件映射

1.  linux： `vi /etc/hosts`
2.  windows：`C:\Windows\System32\drivers\etc`

通过在linux的hosts文件设置windows电脑的主机名与ip地址的映射，可以通过windows主机名 `ping` windows

![image-20211015150854416](https://raw.githubusercontent.com/jiuxi521/typora/master/image-20211015150854416.png)

# shell编程

## shell脚本

1.  脚本格式要求

    1.  脚本要以 `#!/bin.bash`开头
    2.  可执行权限

2.  脚本的执行方式

    1.  方式一：赋予helloworld.sh 脚本的`+x`运行权限（绝对路径或相对路径 ）

        ```shell
        chmod u+x hello.sh	# 给当前用户添加执行权限
        ./xxx.sh # 相对路径
        /home/mahao/xxx.sh	# 绝对路径
        ```

    2.  方式二：使用命令`sh + 脚本`执行，无需赋权

        ```shell
        sh xxx.sh	# 直接执行，无需赋权
        ```

## shell变量

1.  **变量定义（<font color="red">局部变量 and 静态变量</font>）**
    1. 
	```shell
	变量名=变量值         # 定义变量
	$变量名		        # 使用变量
	unset 变量名	        # 删除变量
	readonly 静态变量名	# 定义静态变量，不允许被删除	
	```
    2.  变量名要求
        1.  变量名称由字母、数字、下划线组成，不能由数字开头
        2.  等号两侧不能有空格
        3.  变量名称一般习惯大写
	```shell
变量名=`可执行命令`	# 反引号，运行引号中的命令，并将结果返回给C
变量名=$(可执行命令)	# 等价于反引号
	```

2.  **设置环境变量（<font color="red">全局变量</font>）**

```shell
export 变量名=变量值	# 将shell变量输出为环境变量
source 配置文件			# 使得修改后的配置信息立即生效
echo $变量名			# 查询环境变量的值
```

```shell
vi /etc/profile		# 打开环境变量配置文件

export TOMCAT_HOME=/opt/tomcat	# 配置环境变量（全局变量）TOMCAT_HOME

export JAVA_HOME=/root/dev/java/jdk1.8.0_401
# export JAVA_HOME=/root/dev/java/jdk-17.0.10/
export PATH=$JAVA_HOME/bin:$PATH   # 使用:分割配置，使用$变量名引用配置

source /etc/profile	# 使得配置文件立即生效
vi .bashrc			# 配置用户变量
```

1.  **shell注释**
    1.  单行注释：`# 文本内容`
    2.  多行注释：`:<<!文本内容 !`


2.  **位置参数变量**

    指shell脚本执行时，在脚本文件后紧跟的参数（可以获取参数值和参数个数）`.shell.sh 100 200`

    1.  基本语法
        1.  `$n`:n表示数字，\`\```$0`代表命令本身，`$``1-``$9`代表第一到第九个参数，十以上的参数使用大括号包含。如：`$``{10}\`
        2.  `$*`:获取命令行的全部参数（看作一个整体）
        3.  `$@`:获取命令行的全部参数（参数作为一个整体，但是分开看待）
        4.  `$#`:获取参数行的所有参数的个数
    2.  ![代码截图](https://raw.githubusercontent.com/jiuxi521/typora/master/image-20211018142421314.png)

3.  **预定义变量**

    指shell设计者预先定义好的变量

    1.  基本语法
        1.  `$$`：当前进程的进程号（PID）
        2.  `$!`：后台运行的最后一个进程的进程号（PID）
        3.  `$?`：最后一次执行命令的返回状态（为0：证明上一个命令正确执行；非0：证明上一个命令执行不正确）

## shell运算符

1.  基本语法

    1. 
	```shell
    $((表达式))	 # 表达式求值
    $[表达式]		# 表达式求值
    expr 变量A + 变量B	# 变量之间的运算符要有空格	# + 加、- 减、\*乘 、/ 除、% 取余 
    C=`expr 变量A + 变量B` # 将expr表达式的值赋予C
	```

    2.<img src="https://raw.githubusercontent.com/jiuxi521/typora/master/image-20211018145125895.png" alt="image-20211018145125895" style />

## shell条件判断

1.  基本语法

    1. 
        ```shell
        [ condition ]	
          # condition前后要有空格
              [ 变量名 ]	    # 返回true
              [   ]			# 返回false
        ```

    2.  字符串比较

        ```shell
        = # 字符串判断相等
        ```

    3.  整数的比较

        ```shell
        -lt -le		# 小于 小于等于
        -eq -ne		# 等于 不等于
        -gt -ge		# 大于 大于等于
        ```

    4.  文件权限的比较

        ```shell
        -r		# 有读权限
        -w		# 有写权限
        -x		# 有运行权限
        ```

    5.  按照文件类型进行判断

        ```shell
        -f		# 文件存在且是一个常规的文件
        -e		# 文件存在
        -d		# 文件存在且是一个目录
        ```

## shell流程控制

1.  单分支

    ```shell
    # 单分支
    if [ condition]
    then	
         代码
    fi
    ```

2.  多分支

    ```shell
    # 多分支
    if [ condition ]
    then	
         代码
     elif [ condition ]
     then	
         代码
     fi
    ```

3.  case 语句
    1.  基础语法

    ```shell
    # case语句
    case $A in 
     "表达式一")	
         代码;;
     "表达式二")	
         代码;;
     *)	
         代码;;
     esac
    ```
![图片|500](https://raw.githubusercontent.com/jiuxi521/typora/master/image-20211018155739091.png)

4.  for循环语句

```shell
for i in 值1 值2 值3
do	
    代码
done
```

```shell
for (( 初始值;循环控制条件;变量变化 ))
do	
    代码
done
```

<img src="https://raw.githubusercontent.com/jiuxi521/typora/master/image-20211018161942686.png" alt="image-20211018161942686" style />

1.  while循环语句

    1.  基本语法

        ```shell
        # while和[ 之间有空格，[ 和 ]之间有空格
        while [ 条件表达式 ]
        do	
          程序
        done
        ```

## shell控制台输入

1.  基本语法

    ```shell
    read [选项] [参数]
    选项：	
        -p：指定提示语
        -t：指定等待输入时间，超时不再等待参数：	指定读取的变量名
    ```

    ```shell
    read -p "提示语" 变量名
    read -p "提示语" -t 100 变量名
    echo 变量名
    ```

## shell函数

1.  系统函数

    ```bash
    basename 文件绝对路径 [后缀]	# 返回文件名，如果命令带后缀，结果可以去除后缀
    dirname 文件绝对路径 		# 返回目录路径除文件名
    ```

2.  自定义函数

    ```shell
    # 函数定义
    [ function ] funcname(){	
         代码;	
         [return int;]
    }
    # 函数调用
    funcname [value]
    ```

    1.  案例

        ```shell
        function getSum(){	
            SUM=$[$n1 + $n2];   # 注意 + 号之间的空格	
            echo "和=$SUM";
        }
        n1=$1.         n2=$2;
        getSum $n1 $n2
        ```

# 使用
### 开启虚拟机和宿主机端口映射
1. 支持宿主机通过localhost:8081直接访问虚拟机
![image.png|500](https://raw.gitmirror.com/jiuxi521/typora/master/202404081536179.png)
