---
title: arthas
createTime: 2024/10/24 16:40:00
permalink: /article/82h3g11f/
---
# arthas

> [官方文档](https://arthas.gitee.io/)
> 
> [arthas IDEA 插件](https://www.yuque.com/arthas-idea-plugin)

## 下载与运行

1. 下载（免安装）

```sh
curl -O https://arthas.aliyun.com/arthas-boot.jar
```

2. 运行

```sh
java -jar arthas-boot.jar
```

## arthas命令

### watch

> [ornl表达式使用](https://github.com/alibaba/arthas/issues/11. > 
> [表达式核心变量](https://arthas.gitee.io/doc/advice-class.html)

1. 观察指定函数的调用情况：入参、返回值、抛出异常
2. 
```shell
	watch 包名.类名 方法名 观察表达式 -n 1. -x 4 [-b] [-f] [-v]
	
	watch com.yonyou.ucf.mdd.rule.handler.DefaultExecRulesHandler doExecuteRule '{params,returnObj,throwExp}' -v -n 1.  -x 3 '1==1.    
```
   1. 观察表达式：默认值是`{params, target, returnObj}`
      1. target：指本次调用类的实例
      2. 一般：`'{params,returnObj,throwExp}'`
      3. 可以是`params[0]`，指定观察第几个参数
   2. `-n 10` ：指观察次数
   3. `-x 4`：指定输出结果的属性遍历深度，默认为 1，最大值是 4    `List<>`
   4. `-b`：在**函数调用之前**观察，`location=AtEnter`
   5. `-f`：在**函数结束之后**(正常返回和异常返回)观察，`location=AtExit`
   8. `-v`：用于观察watch命令是否被执行

#### 观察表达式

1. params：参数列表。可以使用`ognl`表达式指定
   1. 
	```java
	  public class User{
		  private String name;
		  private Integer age;
	  }
	  public class Test{
		 public int test(List<User> users,int count);
	  }
	```

   2.  
```shell
  watch Test test 'params[0].get(0).age' -n 1
  或
  watch Test test 'params[0][0]["age"]' -n 1
  
  Press Ctrl+C to abort.
  Affect(class-cnt:1 , method-cnt:1. cost in 21 ms.
  @Integer[2]
```

   3. 
  ```shell
  watch Test test params[0].{name} -n 1
  # 可以将List<User> users中的name属性映射为一个数组，类似stream流的map()
  
  Press Ctrl+C to abort.
  Affect(class-cnt:1 , method-cnt:1. cost in 56 ms.
  @ArrayList[
	  @String[name 0],
	  @String[name 1],
	  @String[name 2],
	  @String[name 3],
	  null,
	  @String[name 5],
	  @String[name 6],
	  @String[name 7],
	  @String[name 8],
	  @String[name 9],
  ]
  ```

2. 使用条件表达式
   1. 根据参数过滤
	 ```shell
	 insert(int a,String b)
	 
	 params  [a,b]    params[0]    a < 0
	 
	 watch 包名.类名 方法名 "{params[0],target}" "params[0]<0"
	 ```

   2. 根据方法执行耗时过滤
	```shell
	# `#cost>200`(单位是`ms`)表示只有当耗时大于 200ms 时才会输出，过滤掉执行时间小于 200ms 的调用
	watch 包名.类名 方法名 '{params, returnObj}' '#cost>200' -x 2
	```

2. 访问静态变量：`@包名.类名@静态变量`
	```java
	watch Test test '@Test@m' -n 1
	```

3. 调用静态方法：`@包名.类名@静态方法(参数列表)`

	```shell
	watch Test test '@java.lang.System@getProperty("java.version")' -n 1
	```

4. 观察当前对象的属性
```shell
  watch demo.MathGame primeFactors 'target'
  ```

```shell
  watch demo.MathGame primeFactors 'target.illegalArgumentCount'
  ```

#### 方法同名过滤

1. 判断参数个数：`params.length ==1. 
2. 参数类型：`params[0] instanceof java.lang.Integer`
3. 返回值类型： `returnObj instanceof java.util.List`

#### 案例

```shell
watch com.yonyou.yonbip.ctm.cam.creditapply.rule.CreditApplyCheckBeforeRule execute '{params[1].param.data[0]}' -b  -f  -v -n 4  -x 3 '1==1. 
```
### trace

1. 输出方法内部调用路径，并输出方法路径上的每个节点上耗时

	```shell
	trace [-E] 包名.类名 方法名 -n 1. [-v] [--skipJDKMethod true|false] 
	```

      1. `-n 10`：调用次数
      2. `--skipJDKMethod true|false`：是否包含JDK里的函数调用。默认true，不包含
      3. `-E`：<font  color='red'>开启正则表达式匹配</font>

#### 正则表达式匹配

1. 匹配多个类的多个方法
```shell
	trace -E com.yonyou.yonbip.ctm.cam.creditapply.rule.CreditApplyCheckBeforeRule|com.yonyou.yonbip.ctm.cam.creditapply.rule.CreditApplyDeleteAfterRule execute|processAgreementNo -n 1. -v  '1==1.      
```

2. trace某个类的所有方法
	```shell
	trace com.hongcheng.bigdata.startfish.controller.auth.LoginController *
	（追踪该类下的所有方法）
	```

#### 动态trace
```shell
telnet localhost 3658
// attach 监听端口
trace com.yonyou.yonbip.ctm.cam.creditapply.rule.CreditApplyCheckBeforeRule processAgreementNo --listenerId 1
```

### stack

输出当前方法被调用的路径
```shell
   stack 包名.类名 方法名 [过滤条件] -n 1.   
```

2. 过滤条件

   1. 根据条件表达式过滤

	```shell
	 stack demo.MathGame primeFactors 'params[0]<0' -n 2
	 ```

   2. 根据执行时间过滤

	```shell
	 stack demo.MathGame primeFactors '#cost>5'
	```

### tt

> 方法执行数据的时空隧道，记录下指定方法每次调用的入参和返回信息，并能对这些不同的时间下调用进行观测
```bash
tt -t 包名.类名 方法名 ['条件表达式']
```

   1. `-t`：指定观测方法
   2. `-n 3`：指定观测次数
   3. 条件表达式
		```shell
		# 解决方法重载
		tt -t *Test print params.length==1
		# 通过制定参数个数的形式解决不同的方法签名，如果参数个数一样，你还可以这样写
		tt -t *Test print 'params[1. instanceof Integer'
		# 解决指定参数
		tt -t *Test print params[0].mobile=="13989838402"
		```

#### 检索调用记录

```shell
# 检索所有记录
tt -l
# 检索指定方法
tt -s 'method.name=="primeFactors"'
```

#### 查看具体调用信息

```bash
tt -i INDEX [-p]
```
1. `-p`：重新发送调用

### jad

> 反编译指定已加载类的源码

```shell
   jad [--source-only] 包名.类名 [方法名] [--lineNumber false]
```

   1. `--lineNumber false`：参数默认值为 true，显示指定为 false 则不打印行号。
   2. `--source-only`：反编译时只显示源代码，方便和mc/retransform命令结合使用

### mc

> Memory Compiler/内存编译器，编译`.java`文件生成`.class`。

```shell
   mc Java文件.java  [-d 指定输出目录] 
```

### retransform

> 加载外部的`.class`文件，retransform jvm 已加载的类
>

```shell
   retransform class文件位置
```

1. 查看retransform entry

   ```shell
      $ retransform -l
      Id   ClassName    TransformCount  LoaderHash   LoaderClassName
      1. demo.MathGame         1.        null            null
  ```

2. 删除指定的retransform entry

   ```shell
      # 指定ID删除
      retransform -d 1
      # 删除所有
      retransform --deleteAll
  ```

3. 消除retransform的影响

   1. 删除这个类对应的 retransform entry
   2. 重新触发 retransform

#### 结合jad/mc命令使用

```shell
   jad --source-only com.example.demo.arthas.user.UserController > /tmp/UserController.java
   
   mc /tmp/UserController.java -d /tmp
   
   retransform /tmp/com/example/demo/arthas/user/UserController.class
```

#### retransform限制

1. 不允许新增加 field/method
2. 正在跑的函数，没有退出不能生效

### ognl

> 1. 执行 ognl 表达式
> 2. [使用技巧](https://blog.csdn.net/u010634066/article/details/101013479)

```shell
   ognl '@java.lang.System@out.println("hello")'
```

#### 案例

```shell
   ognl -x 5  -c 7777e9e4 '#springContext=@com.example.springbootweb.config.component.ApplicationContextProvider@applicationContext,#springContext.getEnvironment().getProperty("spring.application.name")'
   ```

### sc

> 查看 JVM 已加载的类信息

```shell
   sc -d 包名.类名
```

### sm

> 查看 JVM 已加载的方法信息
>

```shell
   sm -d 包名.类名  [方法名]
```

   1. 不指定方法名，显示方法列表

### logger

> 查看 logger 信息，更新 logger level

1. 查看全部logger

	```shell
	logger                
	```

2. 指定名称查询logger，修改logger的level

```sh
  logger -c 18b4aac2 --name ROOT --level WARN
```

### 日志保存

1. 将命令的结果完整保存在日志文件中，便于后续进行分析

	```shell
	  options save-result true
	```

2. 结果会异步保存在：`{user.home}/logs/arthas-cache/result.log`

	```shell
	  # 全局搜索文件
	  find -name 'result.log'
	  # 文件管道搜索
	  cat result.log | grep 'null'
	```

```shell
  root@test-yonbip-fi-ctmcam-9f86bbfb9-pgwhp / # find -name 'result.log'
  ./root/logs/arthas-cache/result.log
  ```

## 使用

```shell
   # 没有使用mybatis的项目
   watch java.sql.Connection prepareStatement '{params,throwExp}'  -n 5  -x 3 
   
   # 查看sql及参数
   watch org.apache.ibatis.executor.SimpleExecutor doQuery '{params,returnObj,throwExp}'  -n 5  -x 3 -v  'params[4].sql.contains("cam")'
   ```

## arthas IDEA插件

![img](https://cdn.nlark.com/yuque/0/2020/png/171220/1585410492125-800da22e-55c7-47c3-9192-365f6f1584b3.png)