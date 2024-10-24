---
title: Docker
createTime: 2024/10/24 16:40:00
permalink: /article/bzkxkgag/
---
# Docker

[Docker官方文档](https://docs.docker.com/)

## Docker安装

旧版本Docker：`docker` 或 `docker-engine`

新版本Docker：`Docker-ce`

### 旧版本卸载

```shell
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```

### 新版本安装

1.  设置 yum 源

```shell
# 安装 yum-utils 软件包（提供了 `yum-config-manager` 程序）并设置稳定的 yum 源方便下载 Docker Engine。
sudo yum install -y yum-utils
# 设置 yum 源为阿里云方便下载 Docker Engine
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

1.  安装docker-ce、Docker Engine 和容器。

```bash
sudo yum -y install docker-ce docker-ce-cli containerd.io
```

> 1.  中国科学技术大学（LUG\@USTC）的开源镜像：<https://docker.mirrors.ustc.edu.cn>
>
> 2.  网易的开源镜像：<http://hub-mirror.c.163.com>
>
> 3.  阿里云镜像地址：<https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors>

```shell
    # 修改daemon配置文件/etc/docker/daemon.json来使用加速器
    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json <<-'EOF'
    {
      "registry-mirrors": ["https://6tbu8szy.mirror.aliyuncs.com","http://hub-mirror.c.163.com", "https://docker.mirrors.ustc.edu.cn"]
    }
    EOF
    # 重新加载某个服务的配置文件
    sudo systemctl daemon-reload
    # 重新启动 docker
    sudo systemctl restart docker
```

## Docker概念

### Docker名词解释

![](https://raw.gitmirror.com/jiuxi521/typora/master/202401052144368.png)

1.  Docker引擎（Docker daemon）
    1.  安装的Docker程序
2.  宿主机（Docker\_HOST）
    1.  一个物理或者虚拟的机器用于执行 Docker 守护进程和容器。
3.  客户端Client
    1.  Docker 是一个客户端-服务器（C/S）架构程序。Docker 客户端只需要向 Docker 服务器或者守护进程发出请求，服务器或者守护进程将完成所有工作并返回结果。Docker 提供了一个命令行工具 Docker 以及一整套 RESTful API。你可以在同一台宿主机上运行 Docker 守护进程和客户端，也可以从本地的 Docker 客户端连接到运行在另一台宿主机上的远程 Docker 守护进程。
4.  容器Containers
5.  镜像Images
6.  远程仓库Registry

### 镜像分层

1.  Docker 支持通过扩展现有镜像，创建新的镜像。实际上，Docker Hub 中 99% 的镜像都是通过在 base 镜像中安装和配置需要的软件构建出来的。

![](https://raw.gitmirror.com/jiuxi521/typora/master/202401052145274.png)

1.  从上图可以看到，新镜像是从 base 镜像一层一层叠加生成的。每安装一个软件，就在现有镜像的基础上增加一层。

    镜像分层最大的一个好处就是共享资源。比如说有多个镜像都从相同的 base 镜像构建而来，那么 Docker Host 只需在磁盘上保存一份 base 镜像；同时内存中也只需加载一份 base 镜像，就可以为所有容器服务了。而且镜像的每一层都可以被共享。

    　　如果多个容器共享一份基础镜像，当某个容器修改了基础镜像的内容，比如 /etc 下的文件，这时其他容器的 /etc 是不会被修改的，修改只会被限制在单个容器内。这就是容器 **<font color="red">Copy-on-Write</font>** 特性。

### 可写的容器层

　　当容器启动时，一个新的可写层被加载到镜像的顶部。这一层通常被称作“容器层”，“容器层”之下的都叫“镜像层”。

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211024165738.png)

　　

　　所有对容器的改动 - 无论添加、删除、还是修改文件都只会发生在容器层中。只有**容器层是可写的，容器层下面的所有镜像层都是只读的**。

　　镜像层数量可能会很多，所有镜像层会联合在一起组成一个统一的文件系统。如果不同层中有一个相同路径的文件，比如 /a，上层的 /a 会覆盖下层的 /a，也就是说用户只能访问到上层中的文件 /a。在容器层中，用户看到的是一个叠加之后的文件系统。

| 文件操作 |                                   说明                                  |
| :--: | :-------------------------------------------------------------------: |
| 添加文件 |                         在容器中创建文件时，新文件被添加到容器层中。                        |
| 读取文件 |    在容器中读取某个文件时，Docker 会从上往下依次在各镜像层中查找此文件。一旦找到，立即将其复制到容器层，然后打开并读入内存。   |
| 修改文件 |     在容器中修改已存在的文件时，Docker 会从上往下依次在各镜像层中查找此文件。一旦找到，立即将其复制到容器层，然后修改之。    |
| 删除文件 | 在容器中删除文件时，Docker 也是从上往下依次在镜像层中查找此文件。找到后，会在容器层中**记录下此删除操作**。（只是记录删除操作） |

　　只有当需要修改时才复制一份数据，这种特性被称作 Copy-on-Write。可见，容器层保存的是镜像变化的部分，不会对镜像本身进行任何修改。

> 总结下来就是：容器层记录对镜像的修改，所有镜像层都是只读的，不会被容器修改，所以镜像可以被多个容器共享。

### Volume 数据卷

1.  <font color="red">容器是可以删除的，那如果删除了，容器中的程序产生的需要持久化的数据怎么办呢？</font>容器运行的时候我们可以进容器去查看，容器一旦删除就什么都没有了。
2.  所以<font color="red">数据卷</font>就是来解决这个问题的，是用来将数据持久化到我们宿主机上，与容器间实现数据共享，简单的说就是<font color="red">将宿主机的目录映射到容器中的目录，应用程序在容器中的目录读写数据会同步到宿主机上</font>，这样容器产生的数据就可以持久化了，比如我们的数据库容器，就可以把数据存储到我们宿主机上的真实磁盘中。
3.  ![](https://raw.gitmirror.com/jiuxi521/typora/master/docker%20volume.png)

### Registry 注册中心

1.  Docker 用 Registry 来保存用户构建的镜像。Registry 分为公共和私有两种。Docker 公司运营公共的 Registry 叫做 Docker Hub。用户可以在 Docker Hub 注册账号，分享并保存自己的镜像。

2.  Docker 公司提供了公共的镜像仓库 [https://hub.docker.com](https://hub.docker.com/)（Docker 称之为 Repository）提供了庞大的镜像集合供使用。

3.  一个 Docker Registry 中可以包含多个仓库（Repository）；每个仓库可以包含多个标签（Tag）；每个标签对应一个镜像。

4.  通常，**一个仓库会包含同一个软件不同版本的镜像**，而标签对应该软件的各个版本。我们可以通过 **<仓库名>:<标签>** 的格式来指定具体是这个软件哪个版本的镜像。如果不给出标签，将以 **latest** 作为默认标签。

## Docker命令

### Docker镜像

#### 查看镜像命令

```bash
docker images		  		# 查询本地镜像，存储在 Docker 宿主机的 /var/lib/docker 目录
```

#### 拉取镜像命令

```bash
docker pull 镜像名:标签		#  拉取远程镜像，从中央仓库下载镜像到本地，不声明 tag 镜像标签信息则默认拉取 latest 版本
```

#### 搜索镜像命令

```bash
docker search 镜像名		 # 搜索镜像
```

#### 删除镜像命令

```bash
docker rmi 镜像名:标签		# 删除镜像
docker rmi 镜像ID 镜像ID	# 批量删除镜像
```

`docker images -q` 可以查询到所有镜像的 ID，通过组合命令可以实现删除所有镜像的操作。

```bash
docker rmi `docker images -q`
```

### Docker容器

#### 查看容器

```bash
docker ps		# 查看正在运行的容器
docker ps -a	# 查看全部容器
docker ps -f status=exited	# 查看停止运行的容器
docker ps -l	# 查看最后一次运行的容器
docker ps -n 5	# 列出最近创建的 n 个容器
```

#### 创建与启动容器

```bash
docker run [option] IMAGE:Tag [COMMAND][ARG...]
	-i：表示运行容器
	-t：容器创建并登录，分配一个伪终端
	-d：容器后台运行
	-e：环境变量
	--name：为容器命名
	-P：随机为容器和宿主机的可用端口进行映射
	-p：-p 80:80/tcp -p 80:80/udp 表示端口映射，前者是宿主机端口，后者是容器内的映射端口。可以使用多个 -p 做多个端口映射
	-v：表示目录映射关系（前者是宿主机目录，后者是映射到宿主机上的目录），可以使用多个 -v 做多个目录或文件映射。注意：最好做目录映射，在宿主机上做修改，然后共享到容器上；
	--rm：创建一次性容器，容器停止后自动删除该容器
```

##### 实例

```bash
# 方式一
docker run -it --name 容器名称 镜像名称:标签 /bin/bash	# 前台启动直接进入终端
# 方式二
docker run -id --name 容器名称 镜像名称:标签				# 后台方式启动
docker exec -it 容器名称|容器ID bash|sh					# 进入容器伪终端
```

##### &#x20;进入容器

```bash
docker exec -it 容器名称 bash | sh
# 执行exit 或 Ctrl + D 退出容器
```

#### 启动与停止容器

```bash
# 启动容器
docker start 容器名称|容器ID
# 停止容器
docker stop 容器名称|容器ID
```

#### 删除容器

```shell
# 删除指定容器
docker rm 容器名称|容器ID
# 删除多个容器
docker rm 容器名称|容器ID 容器名称|容器ID
```

#### &#x20;查看容器日志

```bash
docker logs 容器名称 -f

[-f]：滚动持续输出日志
```

#### 查看容器 IP 地址

```bash
    # 查看容器的元信息
    docker inspect 容器名称|容器ID 
    # 直接输出 IP 地址
    docker inspect --format='{{.NetworkSettings.IPAddress}}' 容器名称|容器ID
```

#### 容器中文件拷贝

```bash
docker cp 需要拷贝的文件或目录 容器名称:容器目录
docker cp 容器名称:容器目录 需要拷贝的文件或目录
```

### Docker数据卷

1.  目录挂载只能在创建容器时设置
    1.  宿主机目录需要用户自己创建，容器目录不存在由Docker创建
    2.  双向绑定：在创建容器的时候，将宿主机的目录与容器内的目录进行映射，这样我们就可以通过修改宿主机某个目录的文件从而去影响容器，而且这个操作是双向绑定的，也就是说容器内的操作也会影响到宿主机，实现备份功能
    3.  其他
        1.  目录挂载操作可能会出现权限不足的提示。这是因为 CentOS7 中的安全模块 SE Linux 把权限禁掉了，在 docker run 时通过 `--privileged=true` 给该容器加权限来解决挂载的目录没有权限的问题。
        2.  容器与宿主机之间的数据卷属于引用的关系，数据卷是从外界挂载到容器内部中的，所以可以脱离容器的生命周期而独立存在，正是由于数据卷的生命周期并不等同于容器的生命周期，在容器退出或者删除以后，数据卷仍然不会受到影响，数据卷的生命周期会一直持续到没有容器使用它为止。

#### 挂载数据卷

##### 具名挂载（不带`/` 、  `./`）

1. 具名挂载就是给数据卷起了个名字，容器外对应的目录会在 `/var/lib/docker/volume` 中生成。

    ```bash
    docker run -id -v 数据卷名:容器内目录 镜像名
    ```

##### 匿名挂载

###### 指定目录挂载（带`/` 或 带`./`）

1.  指定目录挂载，这种方式不会在 `/var/lib/docker/volume` 目录生成内容

    ```bash
    # 命令
    docker run -id --name 容器名称 -v /宿主机目录:/容器目录 镜像名称
    # 示例
    docker run -id -v /mydata/docker_centos/data:/usr/local/data --name centos7-01 centos:7
    ```

###### 匿名挂载

1.  匿名挂载只需要写容器目录即可，容器外对应的目录会在 `/var/lib/docker/volumes` 中生成

    ```bash
# 匿名挂载
docker run -id --name 容器名 -v 容器内目录 镜像名
docker run -id --name centos7 -v /data centos:7
    ```

##### 挂载目录只读/读写

```shell
# 只读。只能通过修改宿主机内容实现对容器的数据管理。
docker run -it -v /宿主机目录:/容器目录:ro 镜像名
# 读写，默认。宿主机和容器可以双向操作数据。
docker run -it -v /宿主机目录:/容器目录:rw 镜像名
```

#### 查看数据卷

##### 查看数据卷信息

```bash
docker volume ls # 查看 volume 数据卷信息
```

##### 查看目录挂载关系

　通过 `docker volume inspect 数据卷名称` 可以查看该数据卷对应宿主机的目录地址。

```shell
[root@localhost ~]# docker volume inspect docker_centos_data
[
    {
        "CreatedAt": "2020-08-13T20:19:51+08:00",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/docker_centos_data/_data",
        "Name": "docker_centos_data",
        "Options": null,
        "Scope": "local"
    }
]
```

　通过 `docker inspect 容器ID或名称` ，在返回的 JSON 节点中找到 `Mounts`，可以查看详细的数据挂载信息。

##### volumes-from（继承）

```bash
# 容器 centos7-01 指定目录挂载
docker run -di -v /mydata/docker_centos/data:/usr/local/data --name centos7-01 centos:7
# 容器 centos7-04 和 centos7-05 相当于继承 centos7-01 容器的挂载目录
docker run -di --volumes-from centos7-01:ro --name centos7-04 centos:7
docker run -di --volumes-from centos7-01:rw --name centos7-05 centos:7
```

## Docker镜像

### Docker镜像创建

Docker 支持自己构建镜像，还支持将自己构建的镜像上传至公共仓库，镜像构建可以通过以下两种方式来实现：

*   `docker commit`：从容器创建一个新的镜像；
*   `docker build`：配合 Dockerfile 文件创建镜像。

#### docker commit

<a id="dockerCommit"> docker Commit</a>

```bash
docker commit [选项] 容器名 镜像名:版本号
docker commit -a="作者信息" -m="镜像描述信息" mycentos7 mycentos:7
选项：
	-a：提交的镜像作者；
    -c：使用 Dockerfile 指令来创建镜像；
    -m：提交时的说明文字；
    -p：在 commit 时，将容器暂停。
```

![image-20211025093302030](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025093302.png)

> 镜像中的配置文件需要加载生效
>
> source 配置文件

#### docker build（Dockerfile文件构建）

[官方文档](https://docs.docker.com/engine/reference/builder/)

##### Dockerfile常用指令

> Dockfile文件必须以FROM指令开头 或 ARG指令指定FROM指令使用的参数时，可在FROM指令前方

###### FROM

语法：`FROM <image>:<tag>`

**指明基础镜像**，tag默认为latest

```bash
ARG CENTOS_VERSION=latest
FROM centos:${CENTOS_VERSION}
```

###### ARG

指定容器启动时的参数

```bash
ARG key=[<default value>]
```

###### WORKDIR

> <https://docs.docker.com/engine/reference/builder/#workdir>

语法：`WORKDIR /path/to/workdir`

为 WORKDIR指令后跟随的RUN、CMD、ENTRYPOINT、COPY 、 AND 设置工作目录。

```shell
WORKDIR /usr/local
# 输入相对路径时，指上一个绝对路径的相对路径地址
WORKDIR /a
WORKDIR b
WORKDIR c
RUN pwd # pwd = /a/b/c
```

###### ENV

语法：

1.  `ENV <key> <value>` 添加单个
2.  `ENV <key>=<value> ...` 添加多个。

```shell
# 设置容器内环境变量。
ENV JAVA_HOME /usr/local/java/jdk-11.0.6/
```

###### EXPOSE

语法：`EXPOSE <port> [<port>/<protocol>...]`

暴露容器运行时的监听端口给外部，可以指定端口是监听 TCP 还是 UDP，如果未指定协议，则默认为 TCP。

```shell
EXPOSE 80 443 8080/tcp
```

> 如果想使得容器与宿主机的端口有映射关系，必须在容器启动的时候加上 -P 参数。

###### RUN

语法：`RUN <command>`

构建镜像时<font color="red">运行的 Shell 命令</font>，比如构建的新镜像中我们想在 /usr/local 目录下创建一个 java 目录。

```shell
RUN mkdir -p /usr/local/java
```

###### ADD

语法：`ADD <src>... <dest>`

> \<src>的表达式匹配原则：Go's[filepath.Matchopen\_in\_new](https://golang.org/pkg/path/filepath#Match)
>
> \<dest>必须是 **一个绝对路径** 或 **相对于WORKDIR的路径**

拷贝文件或目录到镜像中。src 可以是一个本地文件或者是一个本地压缩文件，**压缩文件会自动解压**。还可以是一个 url，如果把 src 写成一个 url，那么 ADD 就类似于 wget 命令，然后自动下载和解压。

```shell
ADD jdk-11.0.6_linux-x64_bin.tar.gz /usr/local/java

# 添加以"hom"开头的所有文件
ADD hom* /mydir/

# 在下面的示例中，？被替换为任何单个字符，例如“home.txt”。
ADD hom?.txt /mydir/
```

###### COPY　　

语法：`COPY <src>... <dest>`

拷贝文件或目录到镜像中。用法同 ADD，只是不支持自动下载和解压。

```shell
COPY jdk-11.0.6_linux-x64_bin.tar.gz /usr/local/java
```

###### CMD

1.  指定容器启动时**默认执行的 Shell 命令**，可以被docker run 指定的命令取代。

  

    1.  有且只有最后一条 CMD 命令会生效
    2.  <font color="orange">如果创建容器的时候指定了命令，则 CMD 命令会被替代</font>。

        1.  假如镜像叫 `centos:7`，创建容器时命令是：`docker run -it --name centos7 centos:7 echo "helloworld"` 或者 `docker run -it --name centos7 centos:7 /bin/bash`，就不会输出 `$JAVA_HOME` 的环境变量信息了，因为 CMD 命令被 `echo "helloworld"`、`/bin/bash` 覆盖了。

语法：

1.  `CMD ["executable","param1","param2"]`，比如：`CMD ["/usr/local/tomcat/bin/catalina.sh", "run"]`
2.  `CMD ["param1","param2"] `，比如：`CMD [ "echo", "$JAVA_HOME" ]`
3.  `CMD command param1 param2`，比如：`CMD echo $JAVA_HOME`

```shell
CMD ehco $JAVA_HOME
```

###### ENTRYPOINT

1.  容器启动时执行的 Shell 命令，同 CMD 类似，但不会被 docker run 命令行指定的参数所覆盖

    1.  有且只有最后一条ENTRYPOINT命令会生效
    2.  如果在 Dockerfile 中同时写了 ENTRYPOINT 和 CMD，并且 CMD 指令不是一个完整的可执行命令，那么 CMD 指定的内容将会作为 ENTRYPOINT 的参数；
    3.  如果在 Dockerfile 中同时写了 ENTRYPOINT 和 CMD，并且 CMD 是一个完整的指令，那么它两会互相覆盖，**==谁在最后谁生效==**

语法：

1.  `ENTRYPOINT ["executable", "param1", "param2"]`，比如：`ENTRYPOINT ["/usr/local/tomcat/bin/catalina.sh", "run"]`
2.  `ENTRYPOINT command param1 param2`，比如：`ENTRYPOINT ehco $JAVA_HOME`

```shell
ENTRYPOINT ehco $JAVA_HOME
```

###### VOLUME

创建容器数据卷与宿主机或外部容器进行挂载。**一般的使用场景为需要持久化存储数据时**

```shell
# 容器的 /var/lib/mysql 目录会在运行时 通过docker run -v 具名挂载 或 匿名挂载（匿名卷在默认在宿主机的 /var/lib/docker/volumes 目录下）
VOLUME ["/var/lib/mysql","/var/lib/java"]

# 值可以是一个JSON Array 或 一个|多个字符串
VOLUME /var/lib/mysql /var/lib/java
```

###### LABEL(deprecated)

语法：`LABEL <key>=<value> <key>=<value> <key>=<value> …`

功能是为镜像指定标签。也可以使用 LABEL 来指定镜像作者。

```bash
LABEL maintainer="xxxx.com"
```

##### docker build 构建镜像指令

```bash
docker build [选项] 镜像构建上下文
	-f 目录路径：指定Dockerfile文件所在路径，不指定读取当前目录
	-t 镜像:标签 ：指定镜像的名字和标签，可以在一次构建中为一个镜像设置多个标签	
```

**镜像上下文的取值**

1.  取值一：`.`&#x20;
2.  取值二：源文件所在目录

​		当我们使用 `docker build` 命令来构建镜像时，这个构建过程其实是在 `Docker 引擎` 中完成的，而不是在本机环境。如果在 `Dockerfile` 中使用了一些 `ADD` 等指令来操作文件。需要由用户指定构建镜像时的上下文路径（即 `镜像构建上下文` ），而 `docker build` 会将这个路径下所有的文件都打包上传给 `Docker 引擎`，引擎内将这些内容展开后，就能获取到上下文中的文件了。

​		举个栗子：我的宿主机 jdk 文件在 /root 目录下，Dockerfile 文件在 /usr/local/dockerfile 目录下，文件内容如下：

```shell
ADD jdk-11.0.6_linux-x64_bin.tar.gz /usr/local/java
```

​		那么构建镜像时的命令就该这样写：

```shell
docker build -f /usr/local/dockerfile/Dockerfile -t mycentos:7 /root
```

​		再举个栗子：我的宿主机 jdk 文件和 Dockerfile 文件都在 /usr/local/dockerfile 目录下，文件内容如下：

```shell
ADD jdk-11.0.6_linux-x64_bin.tar.gz /usr/local/java
```

​		那么构建镜像时的命令则这样写：

```shell
docker build -f /usr/local/dockerfile/Dockerfile -t mycentos:7 .
```

##### Dockerfile 实践

　　接下来我们通过基础镜像 `centos:7`，在该镜像中安装 jdk 和 tomcat 以后将其制作为一个新的镜像 `mycentos:7`。

　　创建目录。

```shell
mkdir -p /usr/local/dockerfile
```

　　编写 Dockerfile 文件。

```shell
vi Dockerfile
```

　　Dockerfile 文件内容如下：

```shell
# 指明构建的新镜像是来自于 centos:7 基础镜像
FROM centos:7
# 通过镜像标签声明了作者信息
LABEL maintainer="xxxx.com"
# 设置工作目录
WORKDIR /usr/local
# 新镜像构建成功以后创建指定目录
RUN mkdir -p /usr/local/java && mkdir -p /usr/local/tomcat
# 拷贝文件到镜像中并解压
ADD jdk-11.0.7_linux-x64_bin.tar.gz /usr/local/java
ADD apache-tomcat-9.0.39.tar.gz /usr/local/tomcat
# 暴露容器运行时的 8080 监听端口给外部
EXPOSE 8080
# 设置容器内 JAVA_HOME 环境变量
ENV JAVA_HOME /usr/local/java/jdk-11.0.7/
ENV PATH $PATH:$JAVA_HOME/bin
# 启动容器时启动 tomcat
CMD ["/usr/local/tomcat/apache-tomcat-9.0.39/bin/catalina.sh", "run"]

```

构建镜像。

```shell
[root@localhost ~]# docker build -f /usr/local/dockerfile/Dockerfile -t mycentos:7 /root/
```

###### 镜像构建历史

```shell
docker history 镜像名称:标签|ID
docker history mycentos:7
```

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025134932.png)

###### 使用构建的镜像创建容器

```shell
# 创建容器
docker run -di --name mycentos7 -p 8080:8080 mycentos:7
# 进入容器
docker exec -it mycentos7 /bin/bash
# 测试 java 环境变量
[root@dcae87df010b /]# java -version
java version "11.0.6" 2020-01-1. LTS
Java(TM) SE Runtime Environment 18.9 (build 11.0.6+8-LTS)
Java HotSpot(TM) 64-Bit Server VM 18.9 (build 11.0.6+8-LTS, mixed mode)
# 访问 http://192.168.10.10:8080/ 看到页面说明环境 OK!
```

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025134928.png)

### Docker镜像备份与恢复

#### 镜像备份

使用 `docker save` 将指定镜像保存成 tar 归档文件。

```shell
docker save [OPTIONS] IMAGE [IMAGE...]
docker save -o /root/mycentos7.tar mycentos:7
	-o：镜像打包后的归档文件输出的目录。
```

#### 镜像恢复

使用 `docker load` 导入 docker save 命令导出的镜像归档文件。

```shell
docker load [OPTIONS]
docker load -i mycentos7.tar
	--input, -i：指定导入的文件；
	--quiet, -q：精简输出信息。
```

### Docker镜像仓库

> 镜像仓库名称：registry -p 5000

#### Docker镜像仓库指令

##### docker login

```bash
# 登录
docker login [ip:host]
```

##### docker commit

[docker commit](#dockerCommit)

##### docker tag

```bash
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]

# [HOST[:PORT_NUMBER]/]PATH[:TAG]   [HOST:PORT_NUMBER]未指定，默认指registry-1.docker.io
# 例如：192.168.10.10:5000/jiuxi521/hello-world-new:latest
```

##### docker push

```bash
docker push [OPTIONS] NAME[:TAG]
选项：
-a ： 推送全部镜像

```

##### docker logout

```bash
docker logout [SERVER]
# 例如：docker logout localhost:8080
```

#### 公有镜像仓库（Docker Hub）

> 注册账号：<https://hub.docker.com/>

##### 登录账号

1.  通过 `docker login` 命令输入账号密码登录 DockerHub。
2.  ![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025135920.png)

##### 推送镜像

```bash
# 给镜像设置标签  xxxx指DockerBub用户名（例如：jiuxi521. docker tag hello-world:latest xxxx/test-hello-world:1.0.0
# 将镜像推送至仓库
docker push xxxx/test-hello-world:1.0.0
```

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025140050.png)

##### 拉取镜像

1.  通过 `docker pull xxxx/test-hello-world:1.0.0` 测试镜像是否可以拉取。

##### 退出账号

1. 通过 `docker logout` 命令退出 DockerHub。

```bash
[root@localhost ~]# docker logout
Removing login credentials for https://index.docker.io/v1/
```

#### 私服镜像仓库

##### 未加密仓库

###### 创建私有仓库

```bash
docker run -id --name registry -p 5000:5000 -v /root/mahao/docker_registry:/var/lib/registry registry
```

> 打开浏览器输入：<http://192.168.8.128:5000/v2/_catalog> 看到 `{"repositories":[]}` 表示私有仓库搭建成功并且内容为空。

###### 添加私有仓库到信任地址

```bash
# 修改 daemon.json 文件。
vi /etc/docker/daemon.json
# 添加以下内容，用于让 Docker 信任私有仓库地址，保存退出。
{
    "insecure-registries": ["192.168.8.128:5000"]
}
# 重新加载某个服务的配置文件
sudo systemctl daemon-reload
# 重新启动 docker
sudo systemctl restart docker
```

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025141120.png)

###### 推送镜像到私有仓库

```bash
docker tag hello-world:latest 192.168.8.128:5000/hw-mh
docker push  192.168.8.128:5000/hw-mh
```

> 1.  打开浏览器输入：<http://192.168.10.10:5000/v2/_catalog> 可以看到私有仓库中已上传的镜像。
> 2.  由于我们做了目录挂载，因此可以在宿主机 `/root/mahao/docker_registry/docker/registry/v2/repositories/` 目录下查看。

##### 配置私有仓库认证

私有仓库已经搭建好了，要确保私有仓库的安全性，还需要一个安全认证证书，防止发生意想不到的事情。所以需要在搭建私有仓库的 Docker 主机上先生成自签名证书。

###### 创建证书存储目录

```bash
mkdir -p /usr/local/registry/certs
```

###### 生成自签名证书

```bash
# 生成自签名证书命令
openssl req -newkey rsa:2048 -nodes -sha256 -keyout /usr/local/registry/certs/domain.key -x509 -days 365 -out /usr/local/registry/certs/domain.crt
选项：
- openssl req：创建证书签名请求等功能；
- -newkey：创建 CSR 证书签名文件和 RSA 私钥文件；
- rsa:2048：指定创建的 RSA 私钥长度为 2048；
- -nodes：对私钥不进行加密；
- -sha256：使用 SHA256 算法；
- -keyout：创建的私钥文件名称及位置；
- -x509：自签发证书格式；
- -days：证书有效期；
- -out：指定 CSR 输出文件名称及位置；
```

1.  指定Common Name
    1.  通过 openssl 先生成自签名证书，运行命令以后需要填写一些证书信息，里面最关键的部分是：`Common Name (eg, your name or your server's hostname) []:192.168.8.128`，这里填写的是私有仓库的地址。

	```bash
[root@localhost ~]# openssl req -newkey rsa:2048 -nodes -sha256 -keyout /usr/local/registry/certs/domain.key -x509 -days 365 -out /usr/local/registry/certs/domain.crt
Generating a 2048 bit RSA private key
.......................+++
.........................+++
writing new private key to '/usr/local/registry/certs/domain.key'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [XX]:CN
State or Province Name (full name) []:SH
Locality Name (eg, city) [Default City]:SH
Organization Name (eg, company) [Default Company Ltd]:mrhelloworld
Organizational Unit Name (eg, section) []:mrhelloworld
Common Name (eg, your name or your server's hostname) []:192.168.8.128
Email Address []:mrhelloworld@126.com
```

###### 生成鉴权密码文件

```shell
# 创建存储鉴权密码文件目录
mkdir -p /usr/local/registry/auth
# 如果没有 htpasswd 功能需要安装 httpd
yum install -y httpd
# 创建用户和密码
htpasswd -Bbn root 1234 > /usr/local/registry/auth/htpasswd
```

> htpasswd 是 apache http 的基本认证文件，使用 htpasswd 命令可以生成用户及密码文件。

###### 创建私有仓库容器

```shell
docker run -di --name registry -p 5000:5000 \
   -v /mydata/docker_registry:/var/lib/registry \
   -v /usr/local/registry/certs:/certs \
   -v /usr/local/registry/auth:/auth \
   -e "REGISTRY_AUTH=htpasswd" \
   -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
   -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
   -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt \
   -e REGISTRY_HTTP_TLS_KEY=/certs/domain.key \
   registry
```

###### 登录账号

通过 `docker login` 命令输入账号密码登录私有仓库。直接push报错：`no basic auth credentials`

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025141543.png)

###### 推送镜像至私有仓库

```bash
# 给镜像设置标签 
docker tag hello-world:latest 192.168.8.128:5000/hw
# 将镜像推送至私有仓库 
docker push 192.168.8.128:5000/hw
```

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025140603.png)

###### 退出账号

通过 `docker logout` 命令退出账号。

```shell
[root@localhost ~]# docker logout 192.168.8.128:5000
Removing login credentials 192.168.8.128:5000
```

###### 网页查看

访问<https://192.168.8.128:5000/v2/_catalog，使用> `用户名：root 密码：1234` 登录

## Docker网络

### 默认网络

　安装 Docker 以后，会默认创建三种网络，可以通过 `docker network ls` 查看。

```shell
[root@localhost ~]# docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
688d1970f72e        bridge              bridge              local
885da101da7d        host                host                local
f4f1b3cf1b7f        none                null                local
```

|    网络模式   |                                     简介                                     |
| :-------: | :------------------------------------------------------------------------: |
|   bridge  | 为每一个容器分配、设置 IP 等，并将容器连接到一个 `docker0` 虚拟网桥，<font color="red">默认为该模式。</font> |
|    host   |                  容器将不会虚拟出自己的网卡，配置自己的 IP 等，而是使用宿主机的 IP 和端口。                 |
|    none   |      容器有独立的 Network namespace，但并没有对其进行任何网络设置，如分配 veth pair 和网桥连接，IP 等。     |
| container |               新创建的容器不会创建自己的网卡和配置自己的 IP，而是和一个指定的容器共享 IP、端口范围等。              |

#### bridge 网络模式

> 在宿主机创建一个虚拟以太网桥`docker0`，新建的容器会自动桥接到`docker0网桥`，附加在其上的任意容器之间都能互相通信。
>
> Bridge 桥接模式的实现步骤主要如下：
>
> 1.  Docker Daemon 利用 `veth pair` 技术，在宿主机与容器之间创建一对对等的虚拟网络接口设备，保证容器和宿主机之间可以通信。并且，容器之间也可以以宿主机作为中转站通信
> 2.  Docker Daemon 将 `veth0` 附加到 Docker Daemon 创建的 `docker0`网桥上。保证宿主机的网络报文可以发往 `veth0`；
> 3.  Docker Daemon 将 `veth0` 添加到 Docker 容器所属的 namespace 下，并被`改名为 eth0`。如此一来，宿主机的网络报文若发往 veth0，则立即会被 容器的 eth0 接收，实现宿主机到 Docker 容器之间网络的联通性；同时，也保证 Docker Container 单独使用 eth0，实现容器网络环境的隔离性。

![](https://raw.gitmirror.com/jiuxi521/typora/master/20240101195515.png)

1.  守护进程会创建一对虚拟设备接口 `veth pair`：容器的 `eth0` 接口（容器的网卡）与 宿主机的 `vethxxx` 接口相对应；

    ```bash
    # 指定容器启动加入docker0网桥；[-network bridge]可以省略，默认为该配置
    docker run -d --name bb10 [-network bridge] busybox
    ```

    ```bash
    # 创建容器1
    docker run -it --name bb-bridge01 busybox
    # 创建容器2
    docker run -it --name bb-bridge02 busybox
    # 查看宿主机网络信息
    ip addr | tail -n 8
    # 查看容器网络信息
    ip addr
    ```

    ![image-20240101201249800](https://raw.gitmirror.com/jiuxi521/typora/master/20240101201514.png)

2.  可以安装 `yum install -y bridge-utils` ，通过 `brctl show` 命令查看网桥信息

    ![image-20240101202041986](https://raw.gitmirror.com/jiuxi521/typora/master/20240101202042.png)

#### host 网络模式

> 容器共享宿主机网络栈

*   host 网络模式需要在创建容器时通过参数 `--net host` 或者 `--network host` 指定；
*   采用 host 网络模式的 Docker Container，可以直接使用宿主机的 IP 地址与外界进行通信，若宿主机的 eth0 是一个公有 IP，那么容器也拥有这个公有 IP。同时容器内服务的端口也可以使用宿主机的端口，无需额外进行 NAT 转换；
*   host 网络模式可以让**容器共享宿主机网络栈**，这样的好处是外部主机与容器直接通信，但是容器的网络缺少隔离性。

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025142744.png)

```bash
 # 构建host模式的容器
 docker run -it --name bb-host --network host  busybox
 # 容器中执行ifconfig 的结果与宿主机执行ifconfig的结果一致
```

#### none 网络模式

> 只开启本地环回接口localhost，禁用网络功能

*   none 网络模式是指禁用网络功能，只有 lo 接口 local 的简写，代表 127.0.0.1，即 localhost 本地环回接口。在创建容器时通过参数 `--net none` 或者 `--network none` 指定；
*   none 网络模式即不为 Docker Container 创建任何的网络环境，容器内部就只能使用 loopback 网络设备，不会再有其他的网络资源。可以说 none 模式为 Docke Container 做了极少的网络设定，但是俗话说得好“少即是多”，在没有网络配置的情况下，作为 Docker 开发者，才能在这基础做其他无限多可能的网络定制开发。这也恰巧体现了 Docker 设计理念的开放。

```bash
 # 构建 none 模式的容器
 docker run -it --name bb-none --network none  busybox
```

![image-20240101191436226](https://raw.gitmirror.com/jiuxi521/typora/master/20240101191436.png)

#### container 网络模式

> 当前容器加入已运行容器的网络中
>
> 新创建的容器不会创建自己的网卡和创建 IP，而是共享指定容器的 IP、端口范围

```bash
docker run --network container:已运行的容器名称|ID
```

*   处于这个模式下的 Docker 容器会共享一个网络栈，这样两个容器之间可以使用 localhost 高效快速通信。

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025142815.png)

　　比如我基于容器 `bbox01` 创建了 `container` 网络模式的容器 `bbox04`，查看 `ip addr`：

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025142823.png)

　　容器 `bbox01` 的 `ip addr` 信息如下：

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025142825.png)

　　宿主机的 `ip addr` 信息如下：

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025142826.png)

　　通过以上测试可以发现，Docker 守护进程只创建了一对对等虚拟设备接口用于连接 bbox01 容器和宿主机，而 bbox04 容器则直接使用了 bbox01 容器的网卡信息。

　　这个时候如果将 bbox01 容器停止，会发现 bbox04 容器就只剩下 lo 接口了。

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025143008.png)

　　然后 bbox01 容器重启以后，bbox04 容器也重启一下，就又可以获取到网卡信息了。

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025143006.png)

#### ~~link网络模式~~

　　`docker run --link` 可以用来连接两个容器，使得源容器（被链接的容器）和接收容器（主动去链接的容器）之间可以互相通信，并且接收容器可以获取源容器的一些数据，如源容器的环境变量。

　　这种方式**官方已不推荐使用**，并且在未来版本可能会被移除，所以这里不作为重点讲解，感兴趣可自行了解。

　　官网警告信息：<https://docs.docker.com/network/links/>

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025143003.png)

### 自定义网络

> 自定义网络支持容器名称到IP地址的自动DNS解析；**默认的bridge网络不支持DNS解析**

#### 创建网络

```bash
docker network create [-d 网络模式] 网络名称 
# docker network create -d bridge mh-net

选项
-d：指定网络模式，默认为bridge
```

```bash
# 查看网络列表
docker network ls 	
# 容器创建时指定网络 --network 网络名称
docker run -it --name bb01 --network mh-net busybox
# 查看容器网络信息，在 NetworkSettings 节点中可以看到详细信息
docker inspect 容器名称|ID
```

![image-20240101175407730](https://raw.gitmirror.com/jiuxi521/typora/master/20240101175407.png)

#### 连接网络

```bash
docker network connect 网络名称 容器名称
# 示例：
docker run -id --name bb02 busybox # 创建新容器
docker network connect mh-net bb02
```

![image-20240101180354022](https://raw.gitmirror.com/jiuxi521/typora/master/20240101180354.png)

#### 断开网络

```shell
docker network disconnect 网络名称 容器名称
# 示例：
docker network disconnect mh-net bb02 # 通过 docker inspect 容器名称|ID 再次查看容器的网络信息，发现只剩下默认的 bridge。
```

![image-20240101180602706](https://raw.gitmirror.com/jiuxi521/typora/master/20240101180602.png)

#### 移除网络

网络模式移除成功会返回网络模式名称。

```shell
docker network rm 网络名称
# 示例：
docker network create mh-net01
docker network ls
docker network rm mh-net01
```

> 注意：如果通过某个自定义网络模式创建了容器，则该网络模式无法删除。

### 容器间网络通信

> 容器之间要互相通信，必须要有属于同一个网络的网卡。

```shell
docker network create mh_net1
docker run -it --name bb03 --net mh_net1 busybox
docker run -it --name bb04 --net mh_net1 busybox
```

通过 `ping 容器名`表明，容器间可以通过容器名访问

![image-20240101182942811](https://raw.gitmirror.com/jiuxi521/typora/master/20240101182942.png)

通过 `docker network inspect mh_net 1` 查看两容器的具体 IP 信息。

![image-20240101183125440](https://raw.gitmirror.com/jiuxi521/typora/master/20240101183207.png)

希望 `bridge` 网络下的容器可以和 `mh_net1` 网络下的容器通信。让 `bridge` 网络下的容器连接至新的 `mh_net1` 网络即可。

```bash
docker network connect mh_net1 bb05
```

## Docker集群搭建

### Docker Compose

在日常工作中，经常会碰到需要多个容器相互配合来完成某项任务的情况，例如开发一个 Web 应用，除了 Web 服务容器本身，还需要数据库服务容器、缓存容器，甚至还包括负载均衡容器等等。

　　Docker Compose 恰好满足了这样的需求，它是用于**定义和运行多容器 Docker 应用程序**的工具。通过 Compose，您可以使用 `YAML` 文件来配置应用程序所需要的服务。然后使用一个命令，就可以通过 `YAML` 配置文件创建并启动所有服务。

​		Docker Compose 项目是 Docker 官方的开源项目，来源于之前的 Fig 项目，使用 Python 语言编写。负责实现对 Docker 容器集群的快速编排。项目地址为：<https://github.com/docker/compose/releases>

Docker Compose 的使用步骤：

1.  使用 `Dockerfile` 文件定义应用程序的环境；
2.  使用 `docker-compose.yml` 文件定义构成应用程序的服务，这样它们可以在隔离环境中一起运行；
3.  最后，执行 `docker-compose up` 命令来创建并启动所有服务。

#### Compose 安装

官方文档：<https://docs.docker.com/compose/install/>

```bash
# 拉取安装文件
sudo curl -L https://get.daocloud.io/docker/compose/releases/download/1.26.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
# 文件授权
sudo chmod +x /usr/local/bin/docker-compose
# 验证安装
docker-compose --version
# 卸载，即删除二进制文件
sudo rm /usr/local/bin/docker-compose
```

#### docker-compose.yml文件

官方文档：<https://docs.docker.com/compose/compose-file/>

Docker Compose 允许用户通过 `docker-compose.yml` 文件（YAML 格式）来定义一组相关联的容器为一个工程`（project）`。一个工程包含多个服务`（service）`，每个服务中定义了创建容器时所需的镜像、参数、依赖等。

> 工程名若无特殊指定，即为 `docker-compose.yml` 文件所在目录的名称。

*   `version`：描述 Compose 文件的版本信息，当前最新版本为 `3.8`，对应的 Docker 版本为 `19.03.0+`；
*   `services`：定义服务，可以多个，每个服务中定义了创建容器时所需的镜像、参数、依赖等；
*   `networks`：定义网络，可以多个，根据 DNS server 让相同网络中的容器可以直接通过容器名称进行通信；
*   `volumes`：数据卷，用于实现目录挂载。

### Docker Swarm

　　Docker Swarm 是 Docker 官方推出的容器集群管理工具，基于 Go 语言实现。代码开源在：<https://github.com/docker/swarm> <font color="red">使用它可以将多个 Docker 主机封装为单个大型的虚拟 Docker 主机，快速打造一套容器云平台。</font>

　　Docker Swarm 是生产环境中运行 Docker 应用程序最简单的方法。作为容器集群管理器，Swarm 最大的优势之一就是 100% 支持标准的 Docker API。各种基于标准 API 的工具比如 Compose、docker-py、各种管理软件，甚至 Docker 本身等都可以很容易的与 Swarm 进行集成。大大<font color="red">方便了用户将原先基于单节点的系统移植到 Swarm 上，同时 Swarm 内置了对 Docker 网络插件的支持，用户可以很容易地部署跨主机的容器集群服务。</font>

　　Docker Swarm 和 Docker Compose 一样，都是 Docker 官方容器编排工具，但不同的是，

1.  **Docker Compose** 是一个在**单个服务器或主机上创建多个容器的工具**
2.  **Docker Swarm** 则可以在**多个服务器或主机上创建容器集群服务**，对于微服务的部署，显然 Docker Swarm 会更加适合。

## Docker容器

### Java

```bash
docker run -id \
--name hmall \
-p 8080:8080 \
-v /root/hmall/java:/usr/local/bin \
--network hm-net \
	openjdk:11 
# 进入容器
docker exec -it hmall bash
# 验证启动成功
java -version
# 启动jar包
java -jar /usr/local/bin/hmall-service.jar
```

### Tomcat

```shell
# 拉取镜像&创建容器
docker run -id --name tomcat -p 8080:8080 -v /root/tomcat/webapps:/usr/local/tomcat/webapps tomcat
# 进入容器
docker exec -it tomcat bash
# 如果只查看tomcat主页面，可以将webapps.dist的内容拷贝至webapps（新版本的ROOT目录放在了webapps.dist目录下）
cd /usr/local/tomcat
cp webapps.dist webapps -r
# 访问http://192.168.8.131:8080/

# 拷贝静态资源至容器
docker cp /root/server.xml tomcat:/usr/local/tomcat/webapps/hhh/
# 访问http://192.168.8.131:8080/hhh/server.xml
```

### Nginx

```shell
# 需提前将index.html页面拷贝至宿主机的/root/nginx/html目录下

# 拉取镜像 & 创建容器
docker run -id --name nginx -p 80:80 -v /root/hmall/nginx/html:/usr/share/nginx/html -e hm-net nginx
# 进入容器
docker exec -it nginx bash
# 查看index.html页面
cd /usr/share/nginx/html/
# 访问页面
http://192.168.8.128:80/
```

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025092315.png)

### MySQL

> MySQL镜像官方文档：[link](https://hub.docker.com/_/mysql)
>
> 1.  Initializing a fresh instance：指定初始化文件
>
> 2.  Using a custom MySQL configuration file：指定MySQL的配置文件，指定编码和字符集

```shell
mkdir -p /root/boot/mysql/init
mkdir -p /root/boot/mysql/data
mkdir -p /root/boot/mysql/conf
```

```bash
docker run \
-id \
--name mysql \
-p 3306:3306 \
-e MYSQL_ROOT_PASSWORD=rootroot \
--network hm-net \
-v /root/boot/mysql/data:/var/lib/mysql \
-v /root/boot/mysql/conf:/etc/mysql/conf.d \
-v /root/boot/mysql/init:/docker-entrypoint-initdb.d \
  mysql:8.0.21
```

```bash
# 进入容器
docker exec -it mysql8 /bin/bash
# 使用 MySQL 命令打开客户端
mysql -uroot -p1234 --default-character-set=utf8
```

### Redis

> 下载地址：[redis.conf](https://redis.io/docs/management/config/)
>
> 参考文档地址：[地址1](https://blog.csdn.net/yzf279533105/article/details/126706477) [地址2](https://www.cnblogs.com/itzhouq/p/redis4.html)

```bash
# 映射redis持久化文件
mkdir -p /root/boot/redis/data
# redis日志文件
mkdir -p /root/boot/redis/logs 
touch /root/boot/redis/logs/redis.log
chmod 777 /root/boot/redis/logs/redis.log
# redis配置文件
touch /root/boot/redis/redis.conf
```

```bash
# docker version 6.2
# bind 127.0.0.1 -::1   # 注释代码，默认只能连接本地
daemonize no 			# 默认no，可修改为yes（redis以守护进程运行，该(yes)配置会与docker的-id冲突导致启动失败）
loglevel notice			# 日志级别，
logfile "/etc/redis/logs/redis.log"	 # 日志文件的位置
databases 10			# 指定redis库数
dir ./					# 指定持久化文件位置
requirepass root		# 设置连接密码为"root"
appendonly yes			# 设置是否持久化
appendfilename "appendonly.aof"	# 设置持久化文件名
save 3600 1 			# redis持久化频率（当3600秒内发生一次值改变事件，进行备份）
rdbcompression yes		# 开启备份文件压缩功能（开启压缩，节省磁盘空间，但占用CPU资源）
```

```bash
# 启动容器
docker run -id --name redis -p 6379:6379 \
-v /root/boot/redis/data:/data \
-v /root/boot/redis:/etc/redis \
--network hm-net \
redis redis-server /etc/redis/redis.conf

# 连接控制台 
docker exec -it redis redis-cli -a root
```

### MongoDB

```shell
docker run -di --name mongo -p 27017:27017 mongo
```

### Elasticsearch

　　拉取镜像。

```shell
docker pull elasticsearch:7.8.1
```

　　创建容器，为了方便演示，修改 ES 启动占用内存大小。

```shell
docker run -e ES_JAVA_OPTS="-Xms256m -Xmx512m" -e "discovery.type=single-node" -di --name es -p 9200:9200 -p 9300:9300 -p 5601:5601 -v /mydata/docker_es/plugins:/usr/share/elasticsearch/plugins elasticsearch:7.8.1
```

　　安装中文分词器。

```shell
# 进入容器
docker exec -it es /bin/bash
# 安装中文分词器
elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.8.1/elasticsearch-analysis-ik-7.8.1.zip
# 重启 es
docker restart es
```

　　访问：<http://192.168.10.10:9200/> 结果如下：

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025092258.png)


安装达梦数据库
```sh
docker run -d -p 52361:5236 --restart=always --name dm8 --privileged=true -e PAGE_SIZE=16 -e LD_LIBRARY_PATH=/opt/dmdbms/bin -e  EXTENT_SIZE=32 -e BLANK_PAD_MODE=1 -e LOG_SIZE=1024 -e UNICODE_FLAG=1 -e LENGTH_IN_CHAR=1 -e INSTANCE_NAME=dm8_test -v /root/boot/dmsql/dm8:/opt/dmdbms/data dm8_single:dm8_20240715_rev232765_x86_rh6_64
```

### 安装 head 插件

　　拉取镜像。

```shell
docker pull mobz/elasticsearch-head:5
```

　　创建容器。

```shell
docker run -di --name es-head -p 9100:9100 mobz/elasticsearch-head:5
```

　　在浏览器中打开 elasticsearch-head 页面，填入 Elasticsearch 地址。

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025092254.png)

　　这里会出现跨域拒绝访问的问题，进入 elasticsearch 容器内部，修改配置文件 `elasticsearch.yml`。

```shell
# 进入容器
docker exec -it 容器ID或名称 /bin/bash
# 修改配置文件
vi config/elasticsearch.yml
```

　　在 `elasticsearch.yml` 中添加如下内容。

```shell
# 跨域请求配置（为了让类似 head 的第三方插件可以请求 es）
http.cors.enabled: true
http.cors.allow-origin: "*"
```

　　重启容器。

```shell
docker restart es
```

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025092500.png)

### Solr

```shell
docker run -di --name=solr -p 8983:8983 solr
```

　　访问：<http://192.168.10.10:8983/solr/#/> 结果如下：

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025092455.png)

### RabbitMQ

　　拉取镜像。

```shell
docker pull rabbitmq
```

　　创建容器。

```shell
docker run -di --name rabbitmq -p 4369:4369 -p 5671:5671 -p 5672:5672 -p 15671:15671 -p 15672:15672 -p 25672:25672 rabbitmq
```

　　进入容器并开启管理功能。

```shell
# 进入容器
docker exec -it rabbitmq /bin/bash
# 开启 RabbitMQ 管理功能
rabbitmq-plugins enable rabbitmq_management
```

　　访问：<http://192.168.10.10:15672/> 使用 `guest` 登录账号密码，结果如下：

![](https://raw.githubusercontent.com/jiuxi521/typora/master/20211025092243.png)

### seata

```bash
docker run -it \
--name seata \
-p 8099:8099 \
-p 7099:7099 \
-e SEATA_IP=192.168.8.128 \
-v /root/hmall/seata/resources:/seata-server/resources \
--privileged=true \
--network hm-net \
seataio/seata-server:1.5.2
```

# 黑马商城实战

> 资料地址：<https://gitee.com/ma-hao-chinese/docker-hmall.git>
>
> 课程地址：<https://www.bilibili.com/video/BV1HP4118797?p=12&vd_source=d2dd9aee73e915f6da9a7baa2e037620>

创建网络

```bash
# 创建桥接模式的自定义网络，容器间可以通过容器名
docker network create hmall-net 
```

启动MySQL

```bash
docker run \
-id \
--name mysql \
-p 3306:3306 \
-e MYSQL_ROOT_PASSWORD=123 \
--network hmall-net \
-v /root/hmall/mysql/data:/var/lib/mysql \
-v /root/hmall/mysql/conf:/etc/mysql/conf.d \
-v /root/hmall/mysql/init:/docker-entrypoint-initdb.d \
  mysql

# 挂载了MySQL的数据目录、配置目录、初始化目录
```

启动后端

```bash
docker run -id \
--name hmall \
-p 8080:8080 \
-v /root/hmall/java:/usr/local/bin \
--network hmall-net \
	openjdk:11 
# 进入容器
docker exec -it hmall bash
# 验证启动成功
java -version
# 启动jar包
java -jar /usr/local/bin/hmall-service.jar
```

启动Nginx

```bash
docker run -id \
--name nginx \
--network hmall-net \
-p 18080:18080 \
-p 18081:18081 \
-v /root/hmall/nginx/nginx.conf:/etc/nginx/nginx.conf \
-v /root/hmall/nginx/html:/usr/share/nginx/html \
nginx
# 挂载nginx配置文件和静态资源文件目录
```

***

# 使用报错

| 报错                                                                        | 解决思路                      | 博客  |
| :------------------------------------------------------------------------ | :------------------------ | :-- |
| docker build 报错：ERROR: failed to solve: no build stage in current context | Dockerfile文件的第一行不是FROM 指令 |     |
|                                                                           |                           |     |
|                                                                           |                           |     |
|                                                                           |                           |     |
|                                                                           |                           |     |
|                                                                           |                           |     |
|                                                                           |                           |     |

