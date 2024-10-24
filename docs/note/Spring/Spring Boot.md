---
banner_icon: ♨️
banner_x: 1
title: Spring Boot
createTime: 2024/10/24 16:40:01
permalink: /article/hbko13xg/
---
# Spring Boot

## 依赖管理

1.  父项目进行依赖管理控制

	```xml
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-dependencies</artifactId>
		<version>2.7.1</version>
	</parent>
	```

2.  自动版本仲裁

    1.  子项目引用父工程引入的依赖，可以不用指定版本号（父工程的依赖在dependencyManagement中指定）

		```xml
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
		</dependency>
		```

3. 版本允许修改

    1.  当前项目添加\<properties>属性

        ```xml
        <properties>
            <java.version>17</java.version>
            <lombok.version>1.18.24</lombok.version>
        </properties>
        ```

4.  `spring-boot-xxx-starter`场景启动器：都引入了`spring-boot-starter`依赖

    1.  [Spring Boot Starter](https://docs.spring.io/spring-boot/docs/2.7.5/reference/htmlsingle/#using.build-systems.starters)

        ```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
            <version>2.7.1</version>
            <scope>compile</scope>
        </dependency>
        ```

## 自动配置

[自动配置](https://docs.spring.io/spring-boot/docs/2.7.5/reference/htmlsingle/#using.auto-configuration)

1.  自动配置的jar包：`spring-boot-autoconfigure`

	```xml
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-autoconfigure</artifactId>
			<version>2.5.14</version>
		</dependency>
	```

2.  取消某个类的自动配置

	```java
	// 使用@SpringBootApplication的`exclude`属性
	@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
	
	// 使用 excludeName，标识全限定类名
	@SpringBootApplication(excludeName = "org.springframework.web.filter.CharacterEncodingFilter")
	
	// 使用spring.autoconfigure.exclude属性
	spring.autoconfigure.exclude=cn.hutool.extra.spring.SpringUtil
	```

### 注解

#### @ConfigurationProperties

1.  配置属性绑定，将`application.properties`中的key与bean的属性对应，值映射

	```xml
	<!--属性解析依赖：处理配置类（@ConfigurationProperties 注解）的注解处理器-->
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-configuration-processor</artifactId>
		<optional>true</optional>
	</dependency>
	```

	```properties
	# application.properties 属性值
	student.user.name=Ma Hao
	student.name=test
	```

2.  `@Component`+ `@ConfigurationProperties`

	```java
	@Component("school02")   // 与组件名无关
	@ConfigurationProperties(prefix = "student")
	@Setter（必须有set方法，才能注入）
	public class Student{
		String name;
		User user;
	}

	public class User{
		String name;
	}
	```

3.  `@EnableConfigurationProperties` + `@ConfigurationProperties`

    1.  `@EnableConfigurationProperties`一般标注在配置类上

	```java
	@Setter
	@ToString
	@ConfigurationProperties(prefix = "school")
	public class School {
		Student student;
		String name;
	}
	
	@Data
	@ToString
	@NoArgsConstructor
	@AllArgsConstructor
	@EnableConfigurationProperties(School.class)    // 开启属性绑定，并将School.class的bean注入容器中，被注入的bean需要有@ConfigurationProperties注解
	public class Student {
		String name;
	}
	```

#### @Conditional

1.  满足指定条件，将标注的bean加入容器

2.  可以标注在类上、方法上

3.  类上的是大开关，大开关打开，才判断方法上的注解是否生效

	```java
	 @Component
	 @ConditionalOnBean(Test1.class)   // 当容器中有Test1.class的bean时，才会加载Test.class的bean    ；   2. 注解的条件不会匹配配置文件的bean
	 public class Test{}
	```

	```java
	// 是否是原生的Servlet项目
	@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
	// 是否导入CharacterEncodingFilter包
	@ConditionalOnClass(CharacterEncodingFilter.class)
	// 属性值server.servlet.encoding是否为enabled，如果没配置，默认配置了该属性
	@ConditionalOnProperty(prefix="server.servlet.encoding" value="enabled" matchIfMissing=true)
	// 容器中是否已存在 User类型的bean
	@ConditionalOnMissingBean
	public User user01(){
		return new User();
	}
	```

### 自动配置原理

> 1.  官方建议：您应该只添加一个@SpringBootApplication 或@EnableAutoConfiguration 注释。我们通常建议您只在主@Configuration 类中添加一个或另一个。

#### 源码解析

1.  @SpringBootApplication构成
> @SpringBootApplication
> 1.  @SpringBootConfiguration
>     1.  @Configuration：核心配置类
> 2.  @ComponentScan：开启组件扫描
> 3.  @EnableAutoConfiguration
>     1.  @AutoConfigurationPackage：自动配置包
>         1.  @Import(**AutoConfigurationPackages.Registrar.class**)
>             1.  registerBeanDefinitions(AnnotationMetadata metadata, BeanDefinitionRegistry registry)：批量注册组件
>     2.  @Import(AutoConfigurationImportSelector.class)：选择一些类导入容器
>         1.  AutoConfigurationImportSelector#selectImports(AnnotationMetadata annotationMetadata)
>             1.  getAutoConfigurationEntry(AnnotationMetadata annotationMetadata)：获取批量注册的组件
>                 1.  getCandidateConfigurations(AnnotationMetadata metadata, AnnotationAttributes attributes)：获取所有需导入容器的组件
>                     1.  SpringFactoriesLoader.loadFactoryNames()：加载META-INF/spring.factories文件下的，key=AutoConfiguration的值
>                         1.  ImportCandidates.load()：加载META-INFO/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports，共144个

2.  批量注册组件

	```java
	@Override
	public void registerBeanDefinitions(AnnotationMetadata metadata, BeanDefinitionRegistry registry) {
		register(registry, new PackageImports(metadata).getPackageNames().toArray(new String[0]));
	}
	// metadata：启动类信息，@AutoConfigurationPackage标注在启动类上
	// new PackageImports(metadata).getPackageNames()：启动类所在包
	```

3.  加载默认指定的配置类

	```java
	public static List<String> loadFactoryNames(Class<?> factoryType, @Nullable ClassLoader classLoader) {
		...
		// 根据工厂类型，获取对应spring.factories文件中的配置类信息
		return (List)loadSpringFactories(classLoaderToUse).getOrDefault(factoryTypeName, Collections.emptyList());
	}

	// 扫描项目中的所有META-INF/spring.factories文件
	private static Map<String, List<String>> loadSpringFactories(ClassLoader classLoader) {
		...
		Enumeration<URL> urls = classLoader.getResources("META-INF/spring.factories");
		...
	}

	org.springframework.boot.autoconfigure.EnableAutoConfiguration=cn.hutool.extra.spring.SpringUtil
	```

	```java
	public static ImportCandidates load(Class<?> annotation, ClassLoader classLoader) {
		...
		String location = String.format("META-INF/spring/%s.imports", annotation.getName());
		...
	}

	...
	org.springframework.boot.autoconfigure.admin.SpringApplicationAdminJmxAutoConfiguration
	org.springframework.boot.autoconfigure.aop.AopAutoConfiguration
	org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration
	org.springframework.boot.autoconfigure.batch.BatchAutoConfiguration
	...
	```

4.  bean的复制+重命名

	```java
	@Bean
	@ConditionalOnBean(MultipartResolver.class)
	@ConditionalOnMissingBean(name = DispatcherServlet.MULTIPART_RESOLVER_BEAN_NAME)
	// resolver的赋值会在容器中找MultipartResolver类型的bean，自动赋值
	public MultipartResolver multipartResolver(MultipartResolver resolver) {
		// 检测用户是否创建了MultipartResolver，但命名不正确，对bean重命名
		return resolver;
	}
	
	@Bean
	public MultipartResolver multipartResolver1() {
		return new CommonsMultipartResolver();
	}
	/*
		容器中的实例bean：[multipartResolver1. multipartResolver]
	*/
	```

#### 定制化配置

1.  使用`@Bean`注解，替换默认组件实现
2.  修改`application.properties`中的配置，修改默认组件配置
    1.  **xxxxxAutoConfiguration ---> 组件  --->** **xxxxProperties里面拿值  ----> application.properties**

#### 最佳实践

1.  引入场景依赖：[场景启动包](https://docs.spring.io/spring-boot/docs/current/reference/html/using-spring-boot.html#using-boot-starter)
2.  调试：在`application.properties`中添加debug=true
3.  配置属性：[默认属性文档](https://docs.spring.io/spring-boot/docs/current/reference/html/appendix-application-properties.html#common-application-properties)
4.  配置自定义器：xxxCustomize

#### 依赖注入

> 官方建议：我们通常建议使用构造函数注入来连接依赖项，使用@ComponentScan 来查找 bean。
> 
> 官方建议：注意，使用构造函数注入，需要将 riskAssessor 字段标记为 final，表明不能随后更改该字段。

```java
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class MyAccountService implements AccountService {
	private final RiskAssessor riskAssessor;
}
```

2\.

> 官方建议：如果一个 bean 有多个构造函数，那么你需要使用`@Autowired` 中标记你希望 Spring 使用的构造函数

```java
import java.io.PrintStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MyAccountService implements AccountService {
	private final RiskAssessor riskAssessor;
	private final PrintStream out;
	@Autowired
	public MyAccountService(RiskAssessor riskAssessor) {
		this.riskAssessor = riskAssessor;
		this.out = System.out;
	}
	public MyAccountService(RiskAssessor riskAssessor, PrintStream out) {
		this.riskAssessor = riskAssessor;
		this.out = out;
	}
}
```

#### 修改默认扫描的基础包

```java
@ComponentScan("com.bjpowernode")
或
@SpringBootApplication(scanBasePackages = "com.bjpowernode")
```

## 配置文件

### yaml

#### 基本语法

1.  key和value之间有一个空格；`key: value`
2.  缩进不允许使用Tab，IDEA底层处理Tab，可以使用
3.  key不允许是中文
4.  key和value，冒号`:`后，必须有空格
5.  单引号：将`\n`作为字符串输出（进行了转义），双引号会将`\n`作为换行符输出（不进行转义）
6.  文件后缀一般为`yml`

#### 实例

```yaml
person:
  userName: 张三
  boss: true
#  默认格式：yyyy/MM/dd HH:mm:ss
#  birth: 2022/01/30 11:22:22
  birth: 2022-01-30 11:22:22 32
  age: 20
  pet:
    name: 李四
    weight: 1.   interests: [ 游泳,健身 ]
  animal:
    - 小猫
    - 小狗
  score:
    english: 200
    math: 200
  salaries: [ 100.65,458.36 ]
  all-pets:
    cat: [ { name: 小猫,weight: 25}]
    dog: [ { name: 小狗,weight: 25}]
```

```java
@Data
@Component
@ToString
@ConfigurationProperties(prefix = "person")
public class Person {
    private String userName;
    private Boolean boss;
    // 主要解决后台从数据库中取出时间类型赋予java对象的Date属性值的问题
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    // 该注解主要解决前端时间控件传值到后台接收准确的Date类属性的问题
    // 解决application.yml中映射Java实体的Date类属性的问题
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss SSS")
    private Date birth;
    private Integer age;
    private Pet pet;
    private String[] interests;
    private List<String> animal;
    private Map<String, Integer> score;
    private Set<Double> salaries;
    private Map<String, List<Pet>> allPets;
}
@Data
class Pet {
    private String name;
    private Double weight;
}
```

## Web开发

> 1.  格式化：org.springframework.format.support.**FormattingConversionService**
> 2.  类型转换：org.springframework.core.convert.support.**GenericConversionService**

### Spring MVC

#### MVC定制化配置

> 1.  将@EnableWebMvc添加到@Configuration类，将从WebMvcConfigurationSupport导入Spring MVC配置
> 2.  只有一个@Configuration类可以有@EnableWebMvc注解来导入Spring Web MVC配置。但是，为了自定义所提供的配置，可以有多个@Configuration类实现WebMvcConfigurer。
>     1.  org.springframework.web.servlet.config.annotation.WebMvcConfigurerComposite#addWebMvcConfigurers将实现类加入配置类集合

> 1.  实现WebMvcConfigurer.java，并重写方法
> 2.  继承WebMvcConfigurationSupport 或 继承DelegatingWebMvcConfiguration
>     1.  需要将@Configuration添加到子类，并将@Bean添加到重写的@Bean方法。
> 3.  添加WebConfigure的Bean

#### Spring MVC自动配置特点

1.  引入内容协商和视图解析器：Inclusion of `ContentNegotiatingViewResolver` and `BeanNameViewResolver` beans
2.  支持静态资源以及WebJars的访问：Support for serving s`tatic resources`, including support for `WebJars`
3.  引入转换器Converter、格式化器Formatter：Automatic registration of `Converter`, `GenericConverter`, and `Formatter` beans.
4.  支持静态首页index.html：Static `index.html` support.
5.  用于Spring应用程序上下文中的声明性配置：Automatic use of a `ConfigurableWebBindingInitializer` bean

#### 静态资源访问

##### 修改默认配置

```properties
# 指定静态资源的访问路径前缀，默认/**，指
spring.mvc.static-path-pattern=/res/**
# 指定静态资源文件的root路径，可以通过数组指定，默认"classpath:/META-INF/resources/","classpath:/resources/", "classpath:/static/", "classpath:/public/"
spring.resources.static-location=[classpath:/niu,classpath:/resources]
```

##### webjars项目资源访问

1.  WebJars 提供了一种将前端资源(HTML、CSS、JavaScript)打包到 JAR 文件中，并通过 Maven、Gradle 或其他构建工具来管理和引入这些资源的方法。这使得你可以像管理其他 Java 依赖一样，管理和引入前端库的版本。

```xml
<dependency>
	<groupId>org.webjars</groupId>
	<artifactId>jquery</artifactId>
	<version>3.6.1</version>
</dependency>
```

```http
GET http://localhost:8080/webjars/jquery/3.6.1/jquery.js
```

##### favicon图标设置

1.  在资源文件root路径下，添加`favicon.ico`文件，会默认加载作为网站图标
2.  浏览器默认加载资源路径下的`favicon.ico`文件
    1.  修改`spring.resources.static-locations`后，浏览器无法加载
    2.  修改默认的`spring.mvc.static-path-pattern`会影响favicon的访问

##### 欢迎页设置

1.  在资源文件root路径下，添加`index.html`文件，会默认加载作为网站首页
2.  修改`spring.mvc.static-path-pattern`，欢迎页无法加载。
    1.  要求静态资源访问路径默认为`/**`

#### 源码

##### 静态资源 && webJars

```java
// WebMvcAutoConfiguration.java 
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
	if (!this.resourceProperties.isAddMappings()) {
		logger.debug("Default resource handling disabled");
		return;
	}
	Duration cachePeriod = this.resourceProperties.getCache().getPeriod();
	CacheControl cacheControl =this.resourceProperties.getCache().getCachecontrol().toHttpCacheControl();
	// 对应webjars项目，资源路径classpath:/META-INF/resources/webjars/与请求路径/webjars/**对应
	if (!registry.hasMappingForPattern("/webjars/**")) {
		customizeResourceHandlerRegistration(registry
				  .addResourceHandler("/webjars/**")
				  .addResourceLocations("classpath:/META-INF/resources/webjars/")
				  .setCachePeriod(getSeconds(cachePeriod)).setCacheControl(cacheControl));
	}
	
	String staticPathPattern = this.mvcProperties.getStaticPathPattern();
	if (!registry.hasMappingForPattern(staticPathPattern)) {
		customizeResourceHandlerRegistration(registry
			  // spring.mvc.static-path-pattern=/res/**
			 .addResourceHandler(staticPathPattern)
			  // spring.resources.static-locations=[classpath:/niu]
			.addResourceLocations(getResourceLocations(this.resourceProperties.getStaticLocations()))
			.setCachePeriod(getSeconds(cachePeriod)).setCacheControl(cacheControl));
	}
}
```

##### 欢迎页资源映射

```java
@Bean
public WelcomePageHandlerMapping welcomePageHandlerMapping(ApplicationContext applicationContext,
								 FormattingConversionService mvcConversionService, ResourceUrlProvider mvcResourceUrlProvider) {
	WelcomePageHandlerMapping welcomePageHandlerMapping = new WelcomePageHandlerMapping(
		new TemplateAvailabilityProviders(applicationContext), applicationContext, getWelcomePage(),
		// spring.mvc.static-path-pattern=/res/**
		this.mvcProperties.getStaticPathPattern());
	welcomePageHandlerMapping.setInterceptors(getInterceptors(mvcConversionService, mvcResourceUrlProvider));
	welcomePageHandlerMapping.setCorsConfigurations(getCorsConfigurations());
	return welcomePageHandlerMapping;
}
```

```java
WelcomePageHandlerMapping(TemplateAvailabilityProviders templateAvailabilityProviders,
   ApplicationContext applicationContext, Optional<Resource> welcomePage, String staticPathPattern) {
	// 欢迎页存在 && 静态资源访问路径为/**，设置访问页面，默认index.html
	if (welcomePage.isPresent() && "/**".equals(staticPathPattern)) {
		logger.info("Adding welcome page: " + welcomePage.get());
		setRootViewName("forward:index.html");
	}
	// 从其他视图解析器获取欢迎页。例如：引入thymeleaf依赖，并创建/template/index.html文件，可作为首页访问
	else if (welcomeTemplateExists(templateAvailabilityProviders, applicationContext)) {
		logger.info("Adding welcome page template: index");
		setRootViewName("index");
	}
}
```

### 请求映射

> 1.  HandlerExecutionChain：处理器执行链，封装了处理器Handler和拦截器HandlerInterceptor
> 2.  HandlerMapping：处理器映射器，定义请求和处理器之间的映射，getHandler()方法返回HandlerExecutionChain实例

#### 请求处理流程图

![](https://raw.gitmirror.com/jiuxi521/typora/master/20240105152052.svg)

#### 源码

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
    // 获取处理器
    mappedHandler = getHandler(processedRequest);

    // 获取处理器适配器
    HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

    // 拦截器前置处理
    if (!mappedHandler.applyPreHandle(processedRequest, response)) {
        return;
    }

    // 实际调用处理器，处理器上标注有@ResponseBody注解，mv为null
    mv = ha.handle(processedRequest, response, mappedHandler.getHandler());
    
    // 设置默认的视图名
    applyDefaultViewName(processedRequest, mv);
    
    // 拦截器后置处理
    mappedHandler.applyPostHandle(processedRequest, response, mv);
    
    // 渲染响应封装的ModelAndView:mv
    processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
}
```

1.  获取处理器，遍历所有处理器映射：`getHandler`

	```java
	@Nullable
	protected HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
		if (this.handlerMappings != null) {
			// 获取处理器，遍历所有处理器映射
			for (HandlerMapping mapping : this.handlerMappings) {
				// getHandler调用getHandlerInternal
				HandlerExecutionChain handler = mapping.getHandler(request);
				if (handler != null) {
					return handler;
				}
			}
		}
		return null;
	}
	```

	2. ![HandlerMapping集合](https://raw.gitmirror.com/jiuxi521/typora/master/20240105152742.jpg)
    
        2.  org.springframework.web.servlet.mvc.method.**RequestMappingInfoHandlerMapping**#`getHandlerInternal`**——>继承org.springframework.web.servlet.handler.AbstractHandlerMethodMapping**

			```java
			protected HandlerMethod getHandlerInternal(HttpServletRequest request) throws Exception {
				request.removeAttribute(PRODUCIBLE_MEDIA_TYPES_ATTRIBUTE);
				// 调用父类AbstractHandlerMethodMapping的getHandlerInternal处理
				return super.getHandlerInternal(request);
			}
			```

        ![getHandlerInternal](https://raw.gitmirror.com/jiuxi521/typora/master/20240105152554.jpg)
    
    2.  org.springframework.web.servlet.handler.**AbstractHandlerMethodMapping**#`lookupHandlerMethod`

		```java
		@Nullable
		protected HandlerMethod lookupHandlerMethod(String lookupPath, HttpServletRequest request) throws Exception {
			List<Match> matches = new ArrayList<>();
			// 根据请求资源路径匹配
			// lookupPath：映射的资源路径
			List<T> directPathMatches = this.mappingRegistry.getMappingsByUrl(lookupPath);
			// 根据请求方式匹配
			if (directPathMatches != null) {
				addMatchingMappings(directPathMatches, matches, request);
			}
			if (matches.isEmpty()) {
				// 检查所有映射
				addMatchingMappings(this.mappingRegistry.getMappings().keySet(), matches, request);
			}
			if (!matches.isEmpty()) {
				Match bestMatch = matches.get(0);
				if (matches.size() > 1. {
					// 映射处理器存在完全相同的多个时，报错
					throw new IllegalStateException(
						"Ambiguous handler methods mapped for '" + uri + "': {" + m1 + ", " + m2 + "}");
				}
				request.setAttribute(BEST_MATCHING_HANDLER_ATTRIBUTE, bestMatch.handlerMethod);
				handleMatch(bestMatch.mapping, lookupPath, request);
				return bestMatch.handlerMethod;
			}
			else {
				return handleNoMatch(this.mappingRegistry.getMappings().keySet(), lookupPath, request);
			}
		}
		```

2.  获取处理器适配器集合：`getHandlerAdapter`
	```java
	// org.springframework.web.servlet.DispatcherServlet#getHandlerAdapter
	protected HandlerAdapter getHandlerAdapter(Object handler) throws ServletException {
		if (this.handlerAdapters != null) {
			for (HandlerAdapter adapter : this.handlerAdapters) {
				if (adapter.supports(handler)) {
					return adapter;
				}
			}
		}
		throw new ServletException("No adapter for handler [" + handler +
								"]: The DispatcherServlet configuration needs to include a HandlerAdapter that supports this handler");
	}
	```
    ![处理器适配器集合](https://raw.gitmirror.com/jiuxi521/typora/master/20240105152457.png)

### 请求参数处理

#### Rest风格

1.  **Rest风格支持**（使用HTTP请求方式动词来表示对资源的操作）
    1.  以前：/getUser   获取用户     /deleteUser 删除用户    /editUser  修改用户       /saveUser 保存用户
    2.  现在： /user    GET-获取用户    DELETE-删除用户     PUT-修改用户      POST-保存用户

2.  使用`@GetMapping`、`@PostMapping`、`@PutMapping`、`@DeleteMapping`控制访问method

3.  核心Filter：`HiddenHttpMethodFilter`

    1.  表单模式
        1.  `method=post` && 隐藏参数`_method=put`
        2.  开启配置：`spring.mvc.hiddenmethod.filter.enabled=true`
    2.  Postman发请求可以直接使用PUT、DELETE方法

##### 源码分析

```java
public class WebMvcAutoConfiguration{
	@Bean
	// 1. 注册HiddenHttpMethodFilter
	@ConditionalOnMissingBean(HiddenHttpMethodFilter.class)
	// 2. 过滤bean注入容器
	@ConditionalOnProperty(prefix = "spring.mvc.hiddenmethod.filter", name = "enabled", matchIfMissing = false)
	public OrderedHiddenHttpMethodFilter hiddenHttpMethodFilter() {
		return new OrderedHiddenHttpMethodFilter();
	}
}
```

```java
public class HiddenHttpMethodFilter{
		protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)throws ServletException, IOException {
		HttpServletRequest requestToUse = request;
			// 3. post请求方式 && 包含参数WebUtils.ERROR_EXCEPTION_ATTRIBUTE("_method")
		if ("POST".equals(request.getMethod()) && request.getAttribute(WebUtils.ERROR_EXCEPTION_ATTRIBUTE) == null) {
			// 获取实际请求方式(_method的值)
			String paramValue = request.getParameter(this.methodParam);
			if (StringUtils.hasLength(paramValue)) {
				String method = paramValue.toUpperCase(Locale.ENGLISH);
				if (ALLOWED_METHODS.contains(method)) {
					  // 包装器模式
					requestToUse = new HttpMethodRequestWrapper(request, method);
				}
			}
		}
		filterChain.doFilter(requestToUse, response);
	}
}
```

```java
// 3. 自定义隐藏参数key
@Configuration(proxyBeanMethods=true)
public class Config{
	public HiddenHttpMethodFilter hiddenHttpMethodFilter(){
		HiddenHttpMethodFilter hiddenHttpMethodFilter = new OrderedHiddenHttpMethodFilter();
		hiddenHttpMethodFilter.setMethodParam("_m");
		return hiddenHttpMethodFilter;
	}
}
```

#### 请求参数与注解

##### 注解：参数绑定

###### @PathVariables、@RequestParam、@RequestHeader

1.  @PathVariables：获取请求URL中的变量，即路径变量，请求满足Restful风格请求

    1.  使用指定Key
    2.  使用Map\<String, String> 或 MultiValueMap\<String, String>

2.  @RequestParam：获取请求参数中的变量

    1.  使用指定Key
    2.  使用Map\<String, String> 或 MultiValueMap\<String, String>

3.  @RequestHeader：获取请求头中的变量

    1.  使用HttpHeaders
    2.  使用Map\<String, String> 或 MultiValueMap\<String, String>

	```java
	// GET http://localhost:8080/c1/m2/3/test?sex=man&&hobbies=1,2,3
	@GetMapping("/m2/{id}/{name}")
	public Object m2(@PathVariable Integer id, @PathVariable String name, 
					 @PathVariable Map<String, String> pathVariables,
					 @RequestParam("sex") String sex, @RequestParam List<String> hobbies, 
					 @RequestParam MultiValueMap<String, String> requestParams,
					 @RequestHeader HttpHeaders httpHeaders, 
					 @RequestHeader Map<String, String> requestHeader, 
					 @RequestHeader MultiValueMap<String, String> requestHeaders,) {
		System.out.println(id);
		HashMap<Object, Object> map = new HashMap<>();
		map.put("id", id);
		map.put("name", name);
		map.put("pathVariables", pathVariables);
		map.put("sex", sex);
		map.put("hobbies", hobbies);
		map.put("requestParams", requestParams);
		map.put("httpHeaders", httpHeaders);
		map.put("requestHeader", requestHeader);
		map.put("requestHeaders", requestHeaders);
		return map;
	}
	```

###### @RequestBody、@CookieValue

1.  @RequestBody：获取请求体中的变量

    1.  请求体使用LinkedHashMap\<String,Object>接收
    2.  required：请求是否必须包含请求体，默认为true，请求体为空时，报错；

2.  @CookieValue：获取请求携带的Cookie

    1.  使用Cookie接收
    2.  required：请求是否必须包含Cookie，默认为true，请求体为空时，报错；

    ```java
    @PostMapping("/m3")
    public Object m3(@RequestBody(required = true) Map<String,Object>  requestBodies,
                     @CookieValue Cookie cookie) {
        HashMap<Object, Object> map = new HashMap<>();
        map.put("requestBodies", requestBodies);
        map.put("cookie", cookie);
        return map;
    }
    ```

###### @RequestAttribute

1.  @RequestAttribute：获取请求中的属性

    1.  请求中的Attribute在客户端没有set方法，只能在Web容器内部set，用于业务的传值
    2.  使用指定的类型 + Key 映射变量

    ```java
    @Controller
    @RequestMapping("/c2")
    public class Controller2 {
        @RequestMapping("/m1")
        public String m1(HttpServletRequest request) {
            request.setAttribute("code", "200");
            request.setAttribute("messages", "success");
            return "forward:/c2/m2";
        }
    
        @ResponseBody
        @RequestMapping("/m2")
        public Object m2(@RequestAttribute("code") String newCode, @RequestAttribute String messages,
                         HttpServletRequest request) {
            HashMap<Object, Object> map = new HashMap<>();
            map.put("requestAttributes", newCode);
            map.put("messages", messages);
            map.put("requestAttributes1", request.getAttribute("code"));
            map.put("messages1", request.getAttribute("messages"));
            return map;
        }
    }
    ```

###### @MatrixVariable

1.  @MatrixVariable：获取矩阵变量

    ```java
    /**
      * 1、语法：
      *      请求路径：/cars/sell;low=34;brand=byd,audi,yd
      * 2、SpringBoot默认是禁用了矩阵变量的功能
      *      手动开启：原理。对于路径的处理。UrlPathHelper进行解析。
      *      removeSemicolonContent（移除分号内容）支持矩阵变量的
      * 3、矩阵变量必须有url路径变量才能被解析
      */
    @GetMapping("/cars/{path}")
    public Object carsSell(@MatrixVariable("low") Integer low, 
                           @MatrixVariable("brand") List<String> brand, @PathVariable("path") String path) {
        Map<String, Object> map = new HashMap<>();
        map.put("low", low);
        map.put("brand", brand);
        map.put("path", path);
        return map;
    }
    
    // /boss/1;age=20/2;age=1.     @GetMapping("/boss/{bossId}/{empId}")
    public Object boss(@MatrixVariable(value = "age",pathVar = "bossId") Integer bossAge,
                       @MatrixVariable(value = "age",pathVar = "empId") Integer empAge){
        Map<String,Object> map = new HashMap<>();
    
        map.put("bossAge",bossAge);
        map.put("empAge",empAge);
        return map;
    }
    ```

#### 注解：源码解析

org.springframework.web.servlet.**DispatcherServlet**#`doDispatch`

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
    // 获取处理器
    mappedHandler = getHandler(processedRequest);

    // 获取拦截器适配器
    HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

    // 执行拦截器
    if (!mappedHandler.applyPreHandle(processedRequest, response)) {
        return;
    }

    // 实际调用处理器
    mv = ha.handle(processedRequest, response, mappedHandler.getHandler());

    applyDefaultViewName(processedRequest, mv);
    // 执行拦截器
    mappedHandler.applyPostHandle(processedRequest, response, mv);
    processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
}
```

实际调用处理器

1.  调用处理器：`ha.handler()`

    1.  org.springframework.web.servlet.mvc.method.**AbstractHandlerMethodAdapter**#`handle`**——>实现HandlerAdapter.java**

    2.  org.springframework.web.servlet.mvc.method.**AbstractHandlerMethodAdapter**#`handleInternal`

        ```java
        protected ModelAndView handleInternal(HttpServletRequest request, HttpServletResponse response, HandlerMethod handlerMethod) throws Exception {
            // 调用处理器对应的方法
            return invokeHandlerMethod(request, response, handlerMethod);
        }
        ```

    3.  org.springframework.web.servlet.mvc.method.annotation.**RequestMappingHandlerAdapter**#`invokeHandlerMethod`**——>继承AbstractHandlerMethodAdapter——>实现HandlerAdapter**

        ```java
        @Nullable
        protected ModelAndView invokeHandlerMethod(HttpServletRequest request, HttpServletResponse response, HandlerMethod handlerMethod) throws Exception {
            ServletInvocableHandlerMethod invocableMethod = createInvocableHandlerMethod(handlerMethod);
            // 设置参数解析器
            invocableMethod.setHandlerMethodArgumentResolvers(this.argumentResolvers);
            // 设置返回值处理器
            invocableMethod.setHandlerMethodReturnValueHandlers(this.returnValueHandlers);
            // 参数名称映射器：用于发现方法和构造函数的参数名的接口。
            invocableMethod.setParameterNameDiscoverer(this.parameterNameDiscoverer);
            // ★ 调用处理器执行 
            invocableMethod.invokeAndHandle(webRequest, mavContainer);
            
            return getModelAndView(mavContainer, modelFactory, webRequest);
        }
        ```

    4.  org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod#`invokeAndHandle`**——>继承InvocableHandlerMethod——>实现HandlerMethod**

		```java
		public void invokeAndHandle(ServletWebRequest webRequest, ModelAndViewContainer mavContainer, Object... providedArgs) throws Exception {
			// ★ 调用处理器之前
			Object returnValue = invokeForRequest(webRequest, mavContainer, providedArgs);
			// 调用处理器之后,设置处理结果状态
			setResponseStatus(webRequest);
			// 处理返回值
			this.returnValueHandlers.handleReturnValue(returnValue, getReturnValueType(returnValue), mavContainer, webRequest);
		}
		```

    5.  org.springframework.web.method.support.**InvocableHandlerMethod**#`invokeForRequest`

		```java
		@Nullable
		public Object invokeForRequest(NativeWebRequest request, @Nullable ModelAndViewContainer mavContainer,Object... providedArgs) throws Exception {
			// ★ 获取参数值
			Object[] args = getMethodArgumentValues(request, mavContainer, providedArgs);
			// 调用处理器方法
			return doInvoke(args);
		}
		```

##### 处理器参数解析

1.  org.springframework.web.method.support.**InvocableHandlerMethod**#`getMethodArgumentValues`

	```java
	protected Object[] getMethodArgumentValues(NativeWebRequest request, @Nullable ModelAndViewContainer mavContainer, 
											   Object... providedArgs) throws Exception {
		// 获取处理器方法的参数列表
		MethodParameter[] parameters = getMethodParameters();
		// 创建空的参数值列表
		Object[] args = new Object[parameters.length];
		// 依次解析参数列表
		for (int i = 0; i < parameters.length; i++) {
			MethodParameter parameter = parameters[i];
			// ★ 参数解析器列表是否支持该类型解析  
			if (!this.resolvers.supportsParameter(parameter)) {
				throw new IllegalStateException(formatArgumentError(parameter, "No suitable resolver"));
			}
			// ★ 使用解析器解析请求
			args[i] = this.resolvers.resolveArgument(parameter, mavContainer, request, this.dataBinderFactory);
		}
		return args;
	}
	```

    2.  方法参数解析器：`HandlerMethodArgumentResolver`
		```java
		public interface HandlerMethodArgumentResolver {
			// 是否支持参数解析该类型的参数
			boolean supportsParameter(MethodParameter parameter);
			// 解析参数
			Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,
					NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception;
		
		}
		```

        2.  参数解析器`this.resolvers`：
            ![](https://raw.gitmirror.com/jiuxi521/typora/master/20240105152425.png)

##### 注解标记的参数绑定

1.  参数解析器列表是否支持该类型解析

    1.  org.springframework.web.method.support.**HandlerMethodArgumentResolverComposite**#`supportsParameter`**——>实现HandlerMethodArgumentResolver**

		```java
		public boolean supportsParameter(MethodParameter parameter) {
			// ★ 获取参数解析器
			return getArgumentResolver(parameter) != null;
		}
		```

    2.  org.springframework.web.method.support.**HandlerMethodArgumentResolverComposite**#`getArgumentResolver`

		```java
		private HandlerMethodArgumentResolver getArgumentResolver(MethodParameter parameter) {
			// 从缓存中获取
		   HandlerMethodArgumentResolver result = this.argumentResolverCache.get(parameter);
		   if (result == null) {
			  for (HandlerMethodArgumentResolver resolver : this.argumentResolvers) {
				  // 根据参数解析器逐一判断
				 if (resolver.supportsParameter(parameter)) {
					result = resolver;
					this.argumentResolverCache.put(parameter, result);
					break;
				 }
			  }
		   }
			// 返回支持的解析器
		   return result;
		}
		```

2.  使用解析器解析请求

    1.  org.springframework.web.method.support.**HandlerMethodArgumentResolverComposite**#`resolveArgument`

		```java
		public Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,
									  NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {
			HandlerMethodArgumentResolver resolver = getArgumentResolver(parameter);
			if (resolver == null) {
				throw new IllegalArgumentException("Unsupported parameter type [" +
						   parameter.getParameterType().getName() + "]. supportsParameter should be called first.");
			}
			// 调用参数解析器解析参数
			return resolver.resolveArgument(parameter, mavContainer, webRequest, binderFactory);
		}
		```

##### Model、Map参数绑定

> 1.  Map类参数解析（org.springframework.web.method.annotation.MapMethodProcessor）
> 
> 2.  Model类参数解析（org.springframework.web.method.annotation.ModelMethodProcessor）

1.  Map（`MapMethodProcessor`）、Model（`ModelMethodProcessor`）、**RedirectAttributes（ 重定向携带数据）**、**ServletResponse（response）**

    1.  Map和Model参数绑定的值都相同，是同一个Model

		```java
		@RequestMapping("/m3")
		@ResponseBody
		public Object m3(Map<Object,Object> map1. Model model){
			Map<String, Object> map = new HashMap<>();
			map.put("map1", map1);
			map1.put("key","v1");
			map.put("model", model);
			System.out.println(map);
			return map;
		}
		// {"map1":{"key":"v1"},"model":{"key":"v1"}}
		```

2.  Map和Model中的键值对都会赋值给request的请求域，同样是调用`request.setAttribute()`方法

##### POJO参数绑定

> 1.  POJO类的解析器（`ServletModelAttributeMethodProcessor`）
> 2.  org.springframework.web.method.annotation.**ModelAttributeMethodProcessor**#`resolveArgument`**——>ServletModelAttributeMethodProcessor的父类**

```java
public final Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer, NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {

	// 获取参数名称
	String name = ModelFactory.getNameForParameter(parameter);
	
	// 使用默认值实例化参数（Person(userName=null,age=null,birth=null,pet=null)）
	Object attribute = createAttribute(name, parameter, binderFactory, webRequest);

	// ★ 创建Bean属性绑定器
	WebDataBinder binder = binderFactory.createBinder(webRequest, attribute, name);

	// ★ 参数与参数值绑定
	bindRequestParameters(binder, webRequest);

	return attribute;
}
```

###### 创建Bean属性绑定器

1.  **`（org.springframework.validation.DataBinder）`**

2.  DataBinder执行从**servlet请求参数（获取RequestParam中的值）到**JavaBeans的数据绑定，包括对文件上传的支持。

3.  绑定器中包含类型转换器

    1.  参数名称、参数的初始默认值、类型转换器
        ![WebDataBinder](https://raw.gitmirror.com/jiuxi521/typora/master/20240105152331.png)

4.  DataBinder示例

	```java
	@RequestMapping("/m7")
	@ResponseBody
	public Person m7(Person person,ServletRequest request) {
		Person myBean = new Person();
		// apply binder to custom target object
		ServletRequestDataBinder binder = new ServletRequestDataBinder(myBean);
		// trigger actual binding of request parameters
		binder.bind(request);
		System.out.println(myBean);
		return person;
	}
	```

	```shell
		http://localhost:8080/c2/m7?age=43
	```

###### 参数与参数值绑定

1.  org.springframework.web.servlet.mvc.method.annotation.**ServletModelAttributeMethodProcessor**#`bindRequestParameters`

	```java
	protected void bindRequestParameters(WebDataBinder binder, NativeWebRequest request) {
		// 获取原生的请求request
		ServletRequest servletRequest = request.getNativeRequest(ServletRequest.class);
		// 绑定器
		ServletRequestDataBinder servletBinder = (ServletRequestDataBinder) binder;
		// ★ 请求参数与 JavaBeans 进行绑定
		servletBinder.bind(servletRequest);
	}
	```

2.  org.springframework.web.bind.**ServletRequestDataBinder**#`bind`
    ```java
        public void bind(ServletRequest request) {
            // ★ 构造方法获取请求中的键值对
            MutablePropertyValues mpvs = new ServletRequestParameterPropertyValues(request);
            MultipartRequest multipartRequest = WebUtils.getNativeRequest(request, MultipartRequest.class);
            if (multipartRequest != null) {
                bindMultipart(multipartRequest.getMultiFileMap(), mpvs);
            }
            addBindValues(mpvs, request);
            // ★ 执行绑定操作
            doBind(mpvs);
        }
    ```

    2.  构造方法获取请求中的键值对：org.springframework.beans.**MutablePropertyValues**#`MutablePropertyValues`(java.util.Map\<?,?>)
	    1. 
            ```java
            // original包含请求参数中的键值对
            public MutablePropertyValues(@Nullable Map<?, ?> original) {
                if (original != null) {
                    this.propertyValueList = new ArrayList<>(original.size());
                    original.forEach((attrName, attrValue) -> this.propertyValueList.add(
                        new PropertyValue(attrName.toString(), attrValue)));
                }
                else {
                    this.propertyValueList = new ArrayList<>(0);
                }
            }
            ```

    3.  执行绑定操作：org.springframework.web.bind.**WebDataBinder**#`doBind`**——>实现DataBinder**

        1.  org.springframework.validation.**DataBinder**#`applyPropertyValues`

			```java
			// getPropertyAccessor()：获取Bean的封装org.springframework.beans.BeanWrapperImpl。
			// 属性conversionService=>转换器集合
			protected void applyPropertyValues(MutablePropertyValues mpvs) {
				// ★ 请求参数依次绑定到处理器参数中
				getPropertyAccessor().setPropertyValues(mpvs, isIgnoreUnknownFields(), isIgnoreInvalidFields());
			}
			```

    4.  请求参数依次绑定到处理器参数中：org.springframework.beans.**AbstractPropertyAccessor**#`setPropertyValues`(org.springframework.beans.PropertyValues, boolean, boolean)
		```java
		public void setPropertyValues(PropertyValues pvs, boolean ignoreUnknown, boolean ignoreInvalid) throws BeansException {
			for (PropertyValue pv : propertyValues) {
				// ★ 请求参数依次绑定到处理器参数中
				setPropertyValue(pv);
			}
		}
		```

3.  请求参数依次绑定到处理器参数中

    1.  org.springframework.beans.**AbstractNestablePropertyAccessor**#`setPropertyValue`(org.springframework.beans.PropertyValue)
	    1. 
            ```java
            public void setPropertyValue(PropertyValue pv) throws BeansException {
                // 处理器参数的属性名称
                AbstractNestablePropertyAccessor.PropertyTokenHolder tokens = (AbstractNestablePropertyAccessor.PropertyTokenHolder) pv.resolvedTokens;
                if (tokens == null) {
                    // 获取请求参数的属性名称
                    String propertyName = pv.getName();
                    
                    // ★ 嵌套调用，返回最底层嵌套的属性访问器 
                    // eg:person.pet，返回pet的属性访问器，person的pet属性会进行默认值初始化
                    AbstractNestablePropertyAccessor nestedPa = getPropertyAccessorForPropertyPath(propertyName);
                    
                    tokens = getPropertyNameTokens(getFinalPath(nestedPa, propertyName));
                    
                    // 不存在嵌套属性时，nestedPa == this
                    if (nestedPa == this) {
                        pv.getOriginalPropertyValue().resolvedTokens = tokens;
                    }
                    
                    // ★ 设置属性值
                    nestedPa.setPropertyValue(tokens, pv);
                } else {
                    setPropertyValue(tokens, pv);
                }
            }
            ```

4.  嵌套调用，返回嵌套底层属性的属性访问器

    1.  org.springframework.beans.**AbstractNestablePropertyAccessor**#`getPropertyAccessorForPropertyPath`
		```java
		protected AbstractNestablePropertyAccessor getPropertyAccessorForPropertyPath(String propertyPath) {
			// 获取第一个分词符出现的位置 eg: propertyPath="pet.name.nickName"，返回3
			int pos = PropertyAccessorUtils.getFirstNestedPropertySeparatorIndex(propertyPath);
			// 递归的处理嵌套属性
			if (pos > -1. {
				// 返回pet
				String nestedProperty = propertyPath.substring(0, pos);
				// 返回name.nickName
				String nestedPath = propertyPath.substring(pos + 1);
				// 获取pet的属性访问器{1. 对pet属性赋初始默认值 2. 返回当前属性pet的属性访问器 }
				AbstractNestablePropertyAccessor nestedPa = getNestedPropertyAccessor(nestedProperty);
				// ★ 递归调用，获取属性访问器
				return nestedPa.getPropertyAccessorForPropertyPath(nestedPath);
			}
			else {
				return this;
			}
		}
		```

        2.  org.springframework.beans.**AbstractNestablePropertyAccessor**#`getNestedPropertyAccessor`

			```java
			private AbstractNestablePropertyAccessor getNestedPropertyAccessor(String nestedProperty) {
				// Get value of bean property.
				AbstractNestablePropertyAccessor.PropertyTokenHolder tokens = getPropertyNameTokens(nestedProperty);
				String canonicalName = tokens.canonicalName;
				// ★ 获取bean的属性值  eg：若pet.age已解析，当解析pet.name时，还会调用getNestedPropertyAccessor(pet)，
				// 此时，可以获取已填充age属性的Pet对象   pet{age=12,name=null},
				Object value = getPropertyValue(tokens);
				if (value == null || (value instanceof Optional && !((Optional<?>) value).isPresent())) {
					if (isAutoGrowNestedPaths()) {
						// 如果bean为null，初始化实例，设置默认值  pet{age=null,name=null}
						value = setDefaultValue(tokens);
					} else {
						throw new NullValueInNestedPathException(getRootClass(), this.nestedPath + canonicalName);
					}
				}
		    
				// 返回子属性的属性访问器，不存在就创建
				AbstractNestablePropertyAccessor nestedPa = this.nestedPropertyAccessors.get(canonicalName);
				if (nestedPa == null || nestedPa.getWrappedInstance() != ObjectUtils.unwrapOptional(value)) {
					// ★ 创建属性访问器
					nestedPa = newNestedPropertyAccessor(value, this.nestedPath + canonicalName + NESTED_PROPERTY_SEPARATOR);
					// 加入缓存
					this.nestedPropertyAccessors.put(canonicalName, nestedPa);
				}
				return nestedPa;
			}
            ```

    2.  设置属性值org.springframework.beans.**AbstractNestablePropertyAccessor**#`setPropertyValue`(org.springframework.beans.AbstractNestablePropertyAccessor.PropertyTokenHolder, org.springframework.beans.PropertyValue)
		```java
		protected void setPropertyValue(PropertyTokenHolder tokens, PropertyValue pv) throws BeansException {
			if (tokens.keys != null) {
				// 处理Array..类型
				processKeyedProperty(tokens, pv);
			}
			else {
				// ★ 处理一般POJO、基本类型
				processLocalProperty(tokens, pv);
			}
		}
		```

        2.  处理一般POJO、基本类型

            1.  org.springframework.beans.**AbstractNestablePropertyAccessor**#`processLocalProperty`**——>继承AbstractPropertyAccessor**

                ```java
                private void processLocalProperty(AbstractNestablePropertyAccessor.PropertyTokenHolder tokens, PropertyValue pv) {
                    Object oldValue = null;
                    // 调用getValue()方法
                    Object originalValue = pv.getValue();
                    valueToApply = originalValue;
                    // ★ 属性值转换
                    valueToApply = convertForProperty(tokens.canonicalName, oldValue, originalValue, ph.toTypeDescriptor());
                    // 是否需要转换的标志
                    pv.getOriginalPropertyValue().conversionNecessary = (valueToApply != originalValue);
                    // ★ 设置属性值，调用setValue()方法
                    ph.setValue(valueToApply);
                }
                ```

###### 代理调用setXXX()和getXXX()

1.  org.springframework.beans.BeanWrapperImpl.**BeanPropertyHandler**#`getValue`
	1. 
        ```java
        public Object getValue() throws Exception {
            Method readMethod = this.pd.getReadMethod();
            ReflectionUtils.makeAccessible(readMethod);
            // 反射调用
            return readMethod.invoke(getWrappedInstance(), (Object[]) null);
        }
        ```

2.  org.springframework.beans.BeanWrapperImpl.**BeanPropertyHandler**#`setValue`
	1. 
        ```java
        public void setValue(@Nullable Object value) throws Exception {
            Method writeMethod = (this.pd instanceof GenericTypeAwarePropertyDescriptor ?
                                  ((GenericTypeAwarePropertyDescriptor) this.pd).getWriteMethodForActualAccess() :
                                  this.pd.getWriteMethod());
            ReflectionUtils.makeAccessible(writeMethod);
            // 反射调用
            writeMethod.invoke(getWrappedInstance(), value);
        }
        ```

###### 类型转换器Converter

1.  org.springframework.beans.**AbstractNestablePropertyAccessor**#`convertForProperty`
	1. 
        ```java
        protected Object convertForProperty(String propertyName, @Nullable Object oldValue, @Nullable Object newValue, TypeDescriptor td) throws TypeMismatchException {
            return convertIfNecessary(propertyName, oldValue, newValue, td.getType(), td);
        }
        ```

        ```java
        private Object convertIfNecessary(@Nullable String propertyName, @Nullable Object oldValue,@Nullable Object newValue, @Nullable Class<?> requiredType, @Nullable TypeDescriptor td)throws TypeMismatchException {
            // this.typeConverterDelegate
            return this.typeConverterDelegate.convertIfNecessary(propertyName, oldValue, newValue, requiredType, td);
        }
        ```

2.  org.springframework.beans.**TypeConverterDelegate**#`convertIfNecessary`(java.lang.String, java.lang.Object, java.lang.Object, java.lang.Class\<T>, org.springframework.core.convert.TypeDescriptor)——>**获取类型转换的包装类ConversionService**
	1. 
        ```java
        private Object convertIfNecessary(@Nullable String propertyName, @Nullable Object oldValue,@Nullable Object newValue, 					@Nullable Class<?> requiredType, @Nullable TypeDescriptor td)throws TypeMismatchException {    
        	ConversionService conversionService = this.propertyEditorRegistry.getConversionService();
            TypeDescriptor sourceTypeDesc = TypeDescriptor.forObject(newValue);
            if (conversionService.canConvert(sourceTypeDesc, typeDescriptor)) {
                    return (T) conversionService.convert(newValue, sourceTypeDesc, typeDescriptor);
            }
        }
        ```

3.  org.springframework.core.convert.support.**GenericConversionService**#`convert`(java.lang.Object, org.springframework.core.convert.TypeDescriptor, org.springframework.core.convert.TypeDescriptor)——>**类型转换**
	```java
	public Object convert(@Nullable Object source, @Nullable TypeDescriptor sourceType, TypeDescriptor targetType) {
		Assert.notNull(targetType, "Target type to convert to cannot be null");
		// 获取转换器
		GenericConverter converter = getConverter(sourceType, targetType);
		if (converter != null) {
			// 执行转换
			Object result = ConversionUtils.invokeConverter(converter, source, sourceType, targetType);
			return handleResult(sourceType, targetType, result);
		}
		return handleConverterNotFound(source, sourceType, targetType);
	}
	```

4.  org.springframework.core.convert.support.**ConversionUtils**#`invokeConverter`

5.  org.springframework.core.convert.support.GenericConversionService.**ConverterFactoryAdapter**#`convert`——>**获取类型转换器并转换**

### 响应结果处理

#### 封装响应到mv

1.  org.springframework.web.servlet.mvc.method.annotation.**ServletInvocableHandlerMethod**#`invokeAndHandle`**——>继承InvocableHandlerMethod——>实现HandlerMethod**
	1. 

        ```java
        public void invokeAndHandle(ServletWebRequest webRequest, ModelAndViewContainer mavContainer, Object... providedArgs) throws Exception {
            // 调用处理器之前
            Object returnValue = invokeForRequest(webRequest, mavContainer, providedArgs);
            // 调用处理器之后,设置处理结果状态
            setResponseStatus(webRequest);
            // ★ 处理返回值
            this.returnValueHandlers.handleReturnValue(returnValue, getReturnValueType(returnValue), mavContainer, webRequest);
        }
        ```

##### 选择HandlerMethodReturnValueHandler

1.  org.springframework.web.method.support.**HandlerMethodReturnValueHandlerComposite**#`handleReturnValue`
	1. 

        ```java
        public void handleReturnValue(@Nullable Object returnValue, MethodParameter returnType,
                                      ModelAndViewContainer mavContainer, NativeWebRequest webRequest) throws Exception {
            // ★ 选择处理器
            HandlerMethodReturnValueHandler handler = selectHandler(returnValue, returnType);
            if (handler == null) {
                throw new IllegalArgumentException("Unknown return value type: " + returnType.getParameterType().getName());
            }
            // ★ 处理返回值
            handler.handleReturnValue(returnValue, returnType, mavContainer, webRequest);
        }
        ```

    2.  选择处理器：org.springframework.web.method.support.**HandlerMethodReturnValueHandlerComposite**#`selectHandler`

        1. 

            ```java
            @Nullable
            private HandlerMethodReturnValueHandler selectHandler(@Nullable Object value, MethodParameter returnType) {
                boolean isAsyncValue = isAsyncReturnValue(value, returnType);
                // 遍历判断是否支持处理返回值——>HandlerMethodReturnValueHandler的实例
                for (HandlerMethodReturnValueHandler handler : this.returnValueHandlers) {
                    if (isAsyncValue && !(handler instanceof AsyncHandlerMethodReturnValueHandler)) {
                        continue;
                    }
                    if (handler.supportsReturnType(returnType)) {
                        return handler;
                    }
                }
                return null;
            }
            ```

        2.  返回值处理器：
            ![](https://raw.gitmirror.com/jiuxi521/typora/master/20240105152304.png)

2.  处理返回值：org.springframework.web.method.support.**HandlerMethodReturnValueHandler**#`handleReturnValue`

    1.  调用`HandlerMethodReturnValueHandler`的实现类处理返回结果
        ![](https://raw.gitmirror.com/jiuxi521/typora/master/20240105152211.png)

##### HandlerMethodReturnValueHandler

1.  父类接口
	1. 

        ```java
        // ★ 返回值处理器顶级接口
        public interface HandlerMethodReturnValueHandler {
            // 是否支持处理该返回值类型
        	boolean supportsReturnType(MethodParameter returnType);
            
            // 通过向模型添加属性并设置一个视图来处理给定的返回值，或者
            // 将{@link ModelAndViewContainer#setRequestHandled}标志设置为{@code true}以标志响应已被处理。
        	void handleReturnValue(@Nullable Object returnValue, MethodParameter returnType,
        			ModelAndViewContainer mavContainer, NativeWebRequest webRequest) throws Exception;
        }
        ```

###### 处理器标注@ResponseBody

> 1.  RequestResponseBodyMethodProcessor：处理标注ResponseBody注解的处理器方法
> 2.  响应内容
>     1.  **内容协商**：需要进行**内容协商**，确定客户端的可接受类型和服务器端的提供类型，根据类型优先级进行最优匹配。
>     2.  **消息转换**：确定响应类型（Json、String、Xml）后，使用消息转换器，对响应内容进行转换

1.  org.springframework.web.servlet.mvc.method.annotation.**RequestResponseBodyMethodProcessor——>继承AbstractMessageConverterMethodProcessor抽象类——>实现HandlerMethodReturnValueHandler**

    ```java
    public class RequestResponseBodyMethodProcessor implements HandlerMethodReturnValueHandler {
        @Override
        public boolean supportsReturnType(MethodParameter returnType) {
            // 类上或方法上标注了@ResponseBody注解，支持处理
            return (AnnotatedElementUtils.hasAnnotation(returnType.getContainingClass(), ResponseBody.class) || returnType.hasMethodAnnotation(ResponseBody.class));
        }
    
        @Override
        public void handleReturnValue(@Nullable Object returnValue, MethodParameter returnType, ModelAndViewContainer mavContainer, NativeWebRequest webRequest) throws IOException, HttpMediaTypeNotAcceptableException, HttpMessageNotWritableException {
            // ★ 标记请求已被处理器处理完成，可以直接返回
            mavContainer.setRequestHandled(true);
            
            // 包装请求和响应实体 
            ServletServerHttpRequest inputMessage = createInputMessage(webRequest);
            ServletServerHttpResponse outputMessage = createOutputMessage(webRequest);
    
            // ★ 使用消息转换器转换消息，保存到响应outputMessage中
            writeWithMessageConverters(returnValue, returnType, inputMessage, outputMessage);
        }
    }
    ```

###### 响应内容协商

1.  org.springframework.web.servlet.mvc.method.annotation.**AbstractMessageConverterMethodProcessor**#`writeWithMessageConverters`(T, org.springframework.core.MethodParameter, org.springframework.http.server.ServletServerHttpRequest, org.springframework.http.server.ServletServerHttpResponse)
	1. 

        ```java
        protected <T> void writeWithMessageConverters(@Nullable T value, MethodParameter returnType, ServletServerHttpRequest inputMessage, ServletServerHttpResponse outputMessage) throws IOException, HttpMediaTypeNotAcceptableException, HttpMessageNotWritableException {
        
                Object body = null;
                Class<?> valueType = getReturnValueType(body, returnType);
                Type targetType = GenericTypeResolver.resolveType(getGenericType(returnType), returnType.getContainingClass());
        
                HttpServletRequest request = inputMessage.getServletRequest();
                // 获取请求方可接受的返回值类型
                List<MediaType> acceptableTypes = getAcceptableMediaTypes(request);
                // 获取服务器提供的返回值类型
                List<MediaType> producibleTypes = getProducibleMediaTypes(request, valueType, targetType);
        
                List<MediaType> mediaTypesToUse = new ArrayList<>();
                for (MediaType requestedType : acceptableTypes) {
                    for (MediaType producibleType : producibleTypes) {
                        // ★ 判断客户端需求类型与服务端提供类型之间兼容的MediaType
                        if (requestedType.isCompatibleWith(producibleType)) {
                            mediaTypesToUse.add(getMostSpecificMediaType(requestedType, producibleType));
                        }
                    }
                }
            
                // 对可用的mediaType组合进行优先级排序
                MediaType.sortBySpecificityAndQuality(mediaTypesToUse);
        
                // 选择消息转换器
                for (HttpMessageConverter<?> converter : this.messageConverters) {
                    GenericHttpMessageConverter genericConverter = (converter instanceof GenericHttpMessageConverter ? (GenericHttpMessageConverter<?>) converter : null);
                    // ★ 判断是否可以转换消息给响应
                    if (genericConverter != null ? ((GenericHttpMessageConverter<?>) converter).canWrite(targetType, valueType, selectedMediaType) : converter.canWrite(valueType, selectedMediaType)) {
                        body = getAdvice().beforeBodyWrite(body, returnType, selectedMediaType, (Class<? extends HttpMessageConverter<?>>) converter.getClass(), inputMessage, outputMessage);
                        Object theBody = body;
                        LogFormatUtils.traceDebug(logger, traceOn -> "Writing [" + LogFormatUtils.formatValue(theBody, !traceOn) + "]");
                        addContentDispositionHeader(inputMessage, outputMessage);
                        // 将返回值body写入outputMessage
                        if (genericConverter != null) {
                            genericConverter.write(body, targetType, selectedMediaType, outputMessage);
                        } else {
                            ((HttpMessageConverter) converter).write(body, selectedMediaType, outputMessage);
                        }
                    }
                }
            }
        ```

2.  获取请求方可接受的返回值类型

    1.  org.springframework.web.servlet.mvc.method.annotation.**AbstractMessageConverterMethodProcessor**#`getAcceptableMediaTypes`
	    1. 

            ```java
            private List<MediaType> getAcceptableMediaTypes(HttpServletRequest request) throws HttpMediaTypeNotAcceptableException {
                // this.contentNegotiationManager：内容协商管理器
                // ★ 获取请求中的期待类型与内容协商器匹配的结果
               return this.contentNegotiationManager.resolveMediaTypes(new ServletWebRequest(request));
            }
            ```

        2.  org.springframework.web.accept.**ContentNegotiationManager**#`resolveMediaTypes`

            1. 

                ```java
                public List<MediaType> resolveMediaTypes(NativeWebRequest request) throws HttpMediaTypeNotAcceptableException {
                    // 遍历内容协商管理策略，返回支持的MediaType
                    for (ContentNegotiationStrategy strategy : this.strategies) {
                        List<MediaType> mediaTypes = strategy.resolveMediaTypes(request);
                        if (mediaTypes.equals(MEDIA_TYPE_ALL_LIST)) {
                            continue;
                        }
                        return mediaTypes;
                    }
                    return MEDIA_TYPE_ALL_LIST;
                }
                ```

3.  获取服务器可提供的返回值类型

    1.  org.springframework.web.servlet.mvc.method.annotation.**AbstractMessageConverterMethodProcessor**#`getProducibleMediaTypes`(javax.servlet.http.HttpServletRequest, java.lang.Class\<?>, java.lang.reflect.Type)
	    1. 

            ```java
            protected List<MediaType> getProducibleMediaTypes(HttpServletRequest request, Class<?> valueClass, @Nullable Type targetType) {
                List<MediaType> result = new ArrayList<>();
                // 遍历支持的messageConverters
                for (HttpMessageConverter<?> converter : this.messageConverters) {
                    if (converter instanceof GenericHttpMessageConverter && targetType != null) {
                        if (((GenericHttpMessageConverter<?>) converter).canWrite(targetType, valueClass, null)) {
                            result.addAll(converter.getSupportedMediaTypes());
                        }
                    } else if (converter.canWrite(valueClass, null)) {
                        result.addAll(converter.getSupportedMediaTypes());
                    }
                }
                return result;
            }
            ```

4.  消息转换器：
    ![](https://raw.gitmirror.com/jiuxi521/typora/master/20240105152130.png)

###### 消息转换器：HttpMessageConvert

```java
public interface HttpMessageConverter<T> {

	// 是否能从请求中读取消息（Indicates whether the given class can be read by this converter.）
	boolean canRead(Class<?> clazz, @Nullable MediaType mediaType);

	// 是否可以写消息到响应实体（Indicates whether the given class can be written by this converter.）
	boolean canWrite(Class<?> clazz, @Nullable MediaType mediaType);
	
	// 获取转换器支持的MediaType列表（Return the list of {@link MediaType} objects supported by this converter.）
	List<MediaType> getSupportedMediaTypes();

	// 执行读取操作（Read an object of the given type from the given input message, and returns it.）
	T read(Class<? extends T> clazz, HttpInputMessage inputMessage)
			throws IOException, HttpMessageNotReadableException;

	// 执行写操作（Write an given object to the given output message.）
	void write(T t, @Nullable MediaType contentType, HttpOutputMessage outputMessage)
			throws IOException, HttpMessageNotWritableException;
}
```

#### 处理转发结果`mv`

1.  org.springframework.web.servlet.**DispatcherServlet**#`processDispatchResult`
	1. 

        ```java
        private void org.springframework.web.servlet.DispatcherServlet#processDispatchResult(HttpServletRequest request, HttpServletResponse response, @Nullable HandlerExecutionChain mappedHandler, @Nullable ModelAndView mv, @Nullable Exception exception) throws Exception {
        
            boolean errorView = false;
        
            // ★ 异常处理
            if (exception != null) {
                // 视图模型定义异常
                if (exception instanceof ModelAndViewDefiningException) {
                    logger.debug("ModelAndViewDefiningException encountered", exception);
                    mv = ((ModelAndViewDefiningException) exception).getModelAndView();
                } else {
                    // 处理处理器异常
                    Object handler = (mappedHandler != null ? mappedHandler.getHandler() : null);
                    mv = processHandlerException(request, response, handler, exception);
                    errorView = (mv != null);
                }
            }
        
            // ★ 渲染 处理器返回的结果
            if (mv != null && !mv.wasCleared()) {
                render(mv, request, response);
            }
            
            // 收尾工作，调用拦截器
            if (mappedHandler != null) {
                // Exception (if any) is already handled..
                mappedHandler.triggerAfterCompletion(request, response, null);
            }
        }
        ```

2.  org.springframework.web.servlet.**DispatcherServlet**#`render`
	1. 

        ```java
        protected void render(ModelAndView mv, HttpServletRequest request, HttpServletResponse response) throws Exception {
            View view;
            String viewName = mv.getViewName();
            if (viewName != null) {
                // 解析视图名称 （例如：请求转发、静态页面返回）
                view = resolveViewName(viewName, mv.getModelInternal(), locale, request);
            } else {
                // 无需查找：ModelAndView对象包含实际的View对象.
                view = mv.getView();
            }
            // 渲染视图
            view.render(mv.getModelInternal(), request, response)
        }
        ```

##### 获取视图对象View

1.  org.springframework.web.servlet.DispatcherServlet#resolveViewName
	1. 

        ```java
        protected View resolveViewName(String viewName, @Nullable Map<String, Object> model,
              Locale locale, HttpServletRequest request) throws Exception {
        
           if (this.viewResolvers != null) {
              for (ViewResolver viewResolver : this.viewResolvers) {
                 View view = viewResolver.resolveViewName(viewName, locale);
                 if (view != null) {
                    return view;
                 }
              }
           }
           return null;
        }
        ```

###### 视图解析器

> 1.  视图解析器超类接口：org.springframework.web.servlet.ViewResolver
> 2.  org.springframework.web.servlet.view\.ContentNegotiatingViewResolver\@14cd5899,
>     1.  内容协商视图解析器，ContentNegotiatingViewResolver**本身不解析视图，而是委托给其他ViewResolver**
>     2.  默认情况下，这些其他视图解析器是从应用程序上下文中自动获取的，但也可以使用`viewResolver`属性显式设置它们。
>     3.  此视图解析器根据请求的媒体类型为请求选择合适的视图。请求的媒体类型是通过配置的ContentNegotiationManager确定的。确定所请求的媒体类型后，此解析器将查询每个代理视图解析器以获取视图，并确定所请求媒体类型是否与视图的内容类型兼容）。将返回最兼容的视图。
> 3.  org.springframework.web.servlet.view\.BeanNameViewResolver\@1a0aa470
>     1.  将视图名称解释为当前应用程序上下文中的 bean 名称
> 4.  org.springframework.web.servlet.view\.ViewResolverComposite\@1e3533e9
>     1.  视图解析器组合类，可自定义视图解析器（通过`WebMvcConfigure#configureViewResolvers`）
> 5.  org.springframework.web.servlet.view\.InternalResourceViewResolver\@5b37ae4b
>     1.  处理视图资源（jsp），处理`forward`、`redirect`
>     2.  返回`InternalResourceView`（资源路径、forward请求）、`RedirectView`（redirect请求）

1.  获取一个视图View

    1.  org.springframework.web.servlet.**DispatcherServlet**#`resolveViewName`
	    1. 

            ```java
            public View resolveViewName(String viewName, Locale locale) throws Exception {
                // 获取客户端请求携带的可接受响应类型
                List<MediaType> requestedMediaTypes = getMediaTypes(((ServletRequestAttributes) attrs).getRequest());
                // 获取候选视图（客户端兼容类型的视图）
                List<View> candidateViews = getCandidateViews(viewName, locale, requestedMediaTypes);
                // 获取最佳视图
                View bestView = getBestView(candidateViews, requestedMediaTypes, attrs);
                return bestView;
            }
            ```

    2.  获取候选视图

        1.  org.springframework.web.servlet.view\.ContentNegotiatingViewResolver#getCandidateViews
	        1. 

                ```java
                private List<View> getCandidateViews(String viewName, Locale locale, List<MediaType> requestedMediaTypes)
                    throws Exception {
                    List<View> candidateViews = new ArrayList<>();
                    // 遍历视图解析器，
                    for (ViewResolver viewResolver : this.viewResolvers) {
                        // 解析视图
                        View view = viewResolver.resolveViewName(viewName, locale);
                        if (view != null) {
                            candidateViews.add(view);
                        }
                    }
                    return candidateViews;
                }
                ```

##### 视图对象执行渲染

1.  解析视图

    1.  org.springframework.web.servlet.view.**AbstractView**#`render`**——>实现View**

    2.  org.springframework.web.servlet.view.**AbstractView**#`renderMergedOutputModel`

    3.  org.springframework.web.servlet.view.**InternalResourceView**#`renderMergedOutputModel`**——>继承AbstractView★ **
	    1. 

            ```java
            protected void renderMergedOutputModel(Map<String, Object> model, HttpServletRequest request, HttpServletResponse response) throws Exception {
                // 将Model中的属性拷贝给request的请求域
                exposeModelAsRequestAttributes(model, request);
                // 获取请求转发的URI
                String dispatcherPath = prepareForRendering(request, response);
                
                // 获取RequestDispatcher
                RequestDispatcher rd = getRequestDispatcher(request, dispatcherPath);
                // 如果已包含或响应已提交，则执行包含，否则转发。
                if (useInclude(request, response)) {
                    // 请求包含  调用原生servlet的API：request.getRequestDispatcher(path).include(request, response);
                    response.setContentType(getContentType());
                    rd.include(request, response);
                } else {
                    // ★ 请求转发  
                    // 调用原生servlet的API：request.getRequestDispatcher(path).forward(request, response);
                    // ★ 静态资源也走请求转发
                    rd.forward(request, response);
                }
            }
            ```

### 异常处理

> 1.  异常处理自动配置类：org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration
> 2.  异常白页：org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration.StaticView
> 3.  response.sendError()：当前请求结束，发送/error请求

#### 框架组件

1.  异常处理器：**BasicErrorController**——>实现ErrorController
	1. 

        ```java
        @Controller
        // 设置映射地址。当server.error.path没有值，取error.path:/error
        @RequestMapping("${server.error.path:${error.path:/error}}")
        public class BasicErrorController extends AbstractErrorController {
            // ★ 处理客户端接受text/html类型响应的/error请求
            @RequestMapping(produces = MediaType.TEXT_HTML_VALUE)
        	public ModelAndView errorHtml(HttpServletRequest request, HttpServletResponse response) {
        		HttpStatus status = getStatus(request);
                // ★ 调用getErrorAttributes给model添加报错信息
        		Map<String, Object> model = Collections
        				.unmodifiableMap(getErrorAttributes(request, getErrorAttributeOptions(request, MediaType.TEXT_HTML)));
        		response.setStatus(status.value());
        		ModelAndView modelAndView = resolveErrorView(request, response, status, model);
                // 返回一个默认的error页面
        		return (modelAndView != null) ? modelAndView : new ModelAndView("error", model);
        	}
    
            // ★ 处理/error请求
        	@RequestMapping
        	public ResponseEntity<Map<String, Object>> error(HttpServletRequest request) {
        		HttpStatus status = getStatus(request);
        		if (status == HttpStatus.NO_CONTENT) {
        			return new ResponseEntity<>(status);
        		}
        		Map<String, Object> body = getErrorAttributes(request, getErrorAttributeOptions(request, MediaType.ALL));
                // @ResponseEntity不仅可以返回json结果，还可以定义返回的HttpHeaders和HttpStatus
        		return new ResponseEntity<>(body, status);
        	}
        }
        ```

    2.  视图解析时，请求路径为/error，通过“error”找到对应的bean：StaticView

        1. 

            ```java
            @Configuration(proxyBeanMethods = false)
            @ConditionalOnProperty(prefix = "server.error.whitelabel", name = "enabled", matchIfMissing = true)
            @Conditional(ErrorTemplateMissingCondition.class)
            protected static class WhitelabelErrorViewConfiguration {
            
                private final StaticView defaultErrorView = new StaticView();
            
                // ★ 注入id为error的bean，作为默认错误视图
                @Bean(name = "error")
                @ConditionalOnMissingBean(name = "error")
                public View defaultErrorView() {
                    return this.defaultErrorView;
                }
            
                // If the user adds @EnableWebMvc then the bean name view resolver from
                // WebMvcAutoConfiguration disappears, so add it back in to avoid disappointment.
                @Bean
                @ConditionalOnMissingBean
                public BeanNameViewResolver beanNameViewResolver() {
                    BeanNameViewResolver resolver = new BeanNameViewResolver();
                    resolver.setOrder(Ordered.LOWEST_PRECEDENCE - 10);
                    return resolver;
                }
            
            }
            ```

2.  默认视图解析器\*\*（根据状态码获取资源路径下/error/404.html|5xx.html）\*\*：DefaultErrorViewResolver.java——>实现ErrorViewResolver.java

    1.  错误视图资源获取：org.springframework.boot.autoconfigure.web.servlet.error.DefaultErrorViewResolver#resolveErrorView
	    1. 

            ```java
            // 将状态status与视图对应，eg:4xx.html对应404、4xx
            public ModelAndView resolveErrorView(HttpServletRequest request, HttpStatus status, Map<String, Object> model) {
                // 解析状态码（精确匹配404.html）
                ModelAndView modelAndView = resolve(String.valueOf(status.value()), model);
                // 状态码（模糊匹配SERIES_VIEWS(4xx.html,5xx.html)）
                if (modelAndView == null && SERIES_VIEWS.containsKey(status.series())) {
                    // 根据状态码获取mav
                    modelAndView = resolve(SERIES_VIEWS.get(status.series()), model);
                }
                return modelAndView;
            }
            ```

            ```java
            public class DefaultErrorViewResolver implements ErrorViewResolver, Ordered {
                private static final Map<Series, String> SERIES_VIEWS;
                // 
                static {
                    Map<Series, String> views = new EnumMap<>(Series.class);
                    views.put(Series.CLIENT_ERROR, "4xx");
                    views.put(Series.SERVER_ERROR, "5xx");
                    SERIES_VIEWS = Collections.unmodifiableMap(views);
                }
            }
            ```

    2.  根据status code获取对应视图
	    1. 

            ```java
            private ModelAndView resolve(String viewName, Map<String, Object> model) {
                // viewName = 404、4xx、5xx 
                String errorViewName = "error/" + viewName;
                TemplateAvailabilityProvider provider = this.templateAvailabilityProviders. 			                                                                getProvider(errorViewName,this.applicationContext);
                if (provider != null) {
                    return new ModelAndView(errorViewName, model);
                }
                // 解析视图资源
                return resolveResource(errorViewName, model);
            }
            ```

3.  给错误响应视图提供错误信息：DefaultErrorAttributes

    1.  org.springframework.boot.web.servlet.error.**DefaultErrorAttributes**#`getErrorAttributes`(org.springframework.web.context.request.WebRequest, org.springframework.boot.web.error.ErrorAttributeOptions)

        ```java
        timestamp - The time that the errors were extracted
        status - The status code
        error - The error reason
        exception - The class name of the root exception (if configured)
        message - The exception message (if configured)
        errors - Any ObjectErrors from a BindingResult exception (if configured)
        trace - The exception stack trace (if configured)
        path - The URL path when the exception was raised
        ```

#### 自定义异常处理机制

##### 自定义方案

1.  定义一个`id="error"的bean`，类型为`View`
    1.  会替代默认的白页（StaticView）
2.  资源根目录下添加`/error`文件夹，添加`404.html、4xx.html、5xx.html`等自定义页面
    1.  4xx.html、5xx.html是模糊匹配，404是精确匹配
3.  实现`ErrorController`，并注册该处理器bean，处理`/error`请求
    1.  重定义处理器映射`/error请求`
        1.  默认使用`BasicErrorController`处理`/error`请求
        2.  默认使用`DefaultErrorViewResolver`，根据状态码解析
4.  添加`ErrorAttributes`类型的组件，修改页面的提示信息
5.  `@ControllerAdvice + @ExceptionHandler组合`，处理异常
6.  `@ResponseStatus + 自定义异常类组合`，配置响应状态status和异常原因reason
7.  实现 `HandlerExceptionResolver`
    1.  创建子类实现接口`HandlerExceptionResolver`，注册该bean，会自动被扫描加入解析器集合
        1.  org.springframework.web.servlet.**DispatcherServlet**#`initHandlerExceptionResolvers`
    2.  创建子类实现接口`HandlerExceptionResolver`，调用`WebMvcConfigurer.extendHandlerExceptionResolvers()`，将实现加入`HandlerExceptionResolverComposite`的`resolvers`集合
        1.  org.springframework.web.servlet.config.annotation.**WebMvcConfigurationSupport**#`handlerExceptionResolver`

##### @ControllerAdvice + @ExceptionHandler组合
```java
@ControllerAdvice
public class ExceptionController {
	/**
	*  标注处理算术异常
	*  使用@ResponseBody标注，直接返回字符串（RequestResponseBodyMethodProcessor处理）
	*/
	@ExceptionHandler(ArithmeticException.class)
	@ResponseBody
	public String handler1(HttpServletRequest request, HttpServletResponse response) {
		return "错啦";
	}
	
	/**
	*  标注处理方法参数校验失败异常
	*  返回 ResponseEntity<ErrorResponse>  ，可自定义状态码（HttpEntityMethodProcessor处理）
	*/
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> processException(MethodArgumentNotValidException e) throws Exception {
		String message = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
		return new ResponseEntity<>(new ErrorResponse("404", message), HttpStatus.NOT_FOUND);
	}
}
```

##### @ResponseStatus + 自定义异常类组合

```java
@ResponseStatus(value = HttpStatus.SEE_OTHER, reason = "错误啦")
public class BusinessException extends Exception {}
```

##### 实现HandlerExceptionResolver并注册

1.  加入HandlerExceptionResolverComposite

    ```java
    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void extendHandlerExceptionResolvers(List<HandlerExceptionResolver> resolvers) {
                resolvers.add(new HandlerExceptionResolver() {
                    @Override
                    public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
                        // 相对路径，指定新的视图
                        return new ModelAndView("/res/index.html");
                    }
                });
            }
        };
    }
    ```

2.  自定义组件bean

    ```java
    @Component
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public class CustomerHandlerExceptionResolver implements HandlerExceptionResolver {
        @Override
        public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
            return new ModelAndView("/res/index2.html");
        }
    }
    ```

#### 源码

1.  org.springframework.web.servlet.DispatcherServlet#processDispatchResult

```java
private void processDispatchResult(HttpServletRequest request, HttpServletResponse response, @Nullable HandlerExecutionChain mappedHandler, @Nullable ModelAndView mv, @Nullable Exception exception) throws Exception {
	if (exception != null) {
		// 视图模型异常
		if (exception instanceof ModelAndViewDefiningException) {
			mv = ((ModelAndViewDefiningException) exception).getModelAndView();
		} else {
			Object handler = (mappedHandler != null ? mappedHandler.getHandler() : null);
			// ★ 处理处理器异常
			mv = processHandlerException(request, response, handler, exception);
		}
	}
}
```

##### 处理处理器异常

1.  org.springframework.web.servlet.DispatcherServlet#processHandlerException

```java
protected ModelAndView processHandlerException(HttpServletRequest request, HttpServletResponse response, @Nullable Object handler, Exception ex) throws Exception {
	if (this.handlerExceptionResolvers != null) {
		// ★ 处理器异常处理器，处理异常，返异常对应视图
		for (HandlerExceptionResolver resolver : this.handlerExceptionResolvers) {
			exMv = resolver.resolveException(request, response, handler, ex);
			if (exMv != null) {
				break;
			}
		}
	}
}
```

##### 处理器异常解析器

> 1.  org.springframework.boot.web.servlet.error.DefaultErrorAttributes\@224a05b9
>     1.  给request添加错误信息
> 2.  org.springframework.web.servlet.handler.HandlerExceptionResolverComposite\@2c8def80
>     1.  org.springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver\@42a57c48
>         1.  **找到@ControllerAdvice + @ExceptionHandler方法并调用它来处理，调用@ExceptionHandler标注的处理器处理@ExceptionHandler指定的异常**
>     2.  org.springframework.web.servlet.mvc.annotation.ResponseStatusExceptionResolver\@4c628a6c
>         1.  处理标注@ResponseStatus注解的异常类，**给异常封装状态码和异常原因，之后调用response.sendError()发送/error请求**
>     3.  org.springframework.web.servlet.mvc.support.DefaultHandlerExceptionResolver\@485d1738
>         1.  处理Spring MVC底层异常：HttpRequestMethodNotSupportedException、HttpMediaTypeNotSupportedException等异常

### 拦截器

> 拦截器顶级父类：org.springframework.web.servlet.HandlerInterceptor

#### 配置使用

1.  创建HandlerInteceptor实现类，并实现方法

```java
@Slf4j
public class LoginInterceptor implements HandlerInterceptor {
	@Override
   public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		return "zhangsan".equals(request.getParameter("name")) && "111111".equals(request.getParameter("password"));
	}

	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
		log.info("处理器方法执行后调用");
	}

	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
		log.info("业务处理完成或出现异常后调用");
	}
}
```

2.  注册拦截器

```java
@Bean
public WebMvcConfigurer webMvcConfigurer() {
	new WebMvcConfigurer() {
		@Override
		public void addInterceptors(InterceptorRegistry registry) {
			// 拦截除/c2/**外的所有请求
			registry.addInterceptor(new LoginInterceptor()).addPathPatterns("/**").excludePathPatterns("/c2/**");
		}
	};
}
```

#### 原理解析

##### 执行流程

1.  根据当前请求，找到\*\*HandlerExecutionChain【\*\*可以处理请求的handler以及handler的所有 拦截器】
2.  先来**顺序执行** 所有拦截器的 preHandle方法
    1.  如果当前拦截器prehandler返回为true。则执行下一个拦截器的preHandle
    2.  如果当前拦截器返回为false。直接    倒序执行所有已经执行了的拦截器的  afterCompletion；
3.  如果任何一个拦截器返回false。直接跳出不执行目标方法
4.  所有拦截器都返回True。执行目标方法
5.  倒序执行所有拦截器的postHandle方法。
6.  前面的步骤有任何异常都会直接倒序触发 afterCompletion
7.  页面成功渲染完成以后，也会倒序触发 afterCompletion

##### 源码解析

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
    // 获取处理器
    mappedHandler = getHandler(processedRequest);

    // 获取处理器适配器
    HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

    // ★ 调用拦截器的preHandler()方法
    if (!mappedHandler.applyPreHandle(processedRequest, response)) {
        return;
    }

    // 实际调用处理器，处理器上标注有@ResponseBody注解，mv为null
    mv = ha.handle(processedRequest, response, mappedHandler.getHandler());
    
    // 设置默认的视图名
    applyDefaultViewName(processedRequest, mv);
    
    // ★ 调用拦截器的postHandler()方法
    mappedHandler.applyPostHandle(processedRequest, response, mv);
    
    // 渲染响应封装的ModelAndView:mv
    processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
}
```

1.  调用拦截器的preHandler()方法：org.springframework.web.servlet.HandlerExecutionChain#applyPreHandle

```java
boolean applyPreHandle(HttpServletRequest request, HttpServletResponse response) throws Exception {
	HandlerInterceptor[] interceptors = getInterceptors();
	if (!ObjectUtils.isEmpty(interceptors)) {
		for (int i = 0; i < interceptors.length; i++) {
			HandlerInterceptor interceptor = interceptors[i];
			if (!interceptor.preHandle(request, response, this.handler)) {
				// ★ 场景1：拦截器返回false，调用afterCompletion()方法
				triggerAfterCompletion(request, response, null);
				return false;
			}
			this.interceptorIndex = i;
		}
	}
	return true;
}
```

2.  调用拦截器的postHandler()方法：org.springframework.web.servlet.HandlerExecutionChain#applyPostHandle

```java
void applyPostHandle(HttpServletRequest request, HttpServletResponse response, @Nullable ModelAndView mv) throws Exception {
	HandlerInterceptor[] interceptors = getInterceptors();
	if (!ObjectUtils.isEmpty(interceptors)) {
		for (int i = interceptors.length - 1. i >= 0; i--) {
			HandlerInterceptor interceptor = interceptors[i];
			interceptor.postHandle(request, response, this.handler, mv);
		}
	}
}
```

3.  调用拦截器的afterCompletion()方法：org.springframework.web.servlet.HandlerExecutionChain#triggerAfterCompletion

```java
void triggerAfterCompletion(HttpServletRequest request, HttpServletResponse response, @Nullable Exception ex)
	throws Exception {

	HandlerInterceptor[] interceptors = getInterceptors();
	if (!ObjectUtils.isEmpty(interceptors)) {
		// ★ 倒序调用拦截器的afterCompletion()方法
		for (int i = this.interceptorIndex; i >= 0; i--) {
			HandlerInterceptor interceptor = interceptors[i];
			try {
				interceptor.afterCompletion(request, response, this.handler, ex);
			}
			catch (Throwable ex2) {
				logger.error("HandlerInterceptor.afterCompletion threw exception", ex2);
			}
		}
	}
}
```

### 附件上传

#### 配置

1.  表单的method=post，enctype="multipart/form-data"

	```java
	<form method="post" action="/upload" enctype="multipart/form-data">
		<input type="file" name="headerImg"><br>
		<input type="photos" name="headerImg"><br>
		<input type="submit" value="提交">
	</form>
	```

2.  后端使用@RequestPart注解标注的参数接收，多文件上传使用数组类型接收

	```java
	/**
	  * MultipartFile 自动封装上传过来的文件
	  */
	@PostMapping("/upload")
	public String upload(@RequestParam("email") String email,
						 @RequestParam("username") String username,
						 @RequestPart("headerImg") MultipartFile headerImg,
						 @RequestPart("photos") MultipartFile[] photos) throws IOException {
	
		log.info("上传的信息：email={}，username={}，headerImg={}，photos={}",
				 email,username,headerImg.getSize(),photos.length);
	
		if(!headerImg.isEmpty()){
			//保存到文件服务器，OSS服务器
			String originalFilename = headerImg.getOriginalFilename();
			headerImg.transferTo(new File("H:\\cache\\"+originalFilename));
		}
	
		if(photos.length > 0){
			for (MultipartFile photo : photos) {
				if(!photo.isEmpty()){
					String originalFilename = photo.getOriginalFilename();
					// 文件拷贝
					photo.transferTo(new File("D:\\cache\\"+originalFilename));
				}
			}
		}
		return "main";
	}
	```

#### 源码

> org.springframework.web.servlet.mvc.method.annotation.RequestPartMethodArgumentResolver

1.  文件上传自动配置类：MultipartAutoConfiguration
2.  文件解析器：StandardServletMultipartResolver

### Web原生组件注入

> Servlet路径模糊匹配使用`/*`，Spring模糊匹配使用`/**`

#### 注解注入

1.  在启动类标注`@ServletComponentScan`，同时使用`@WebServlet`、`@WebFilter`、`@WebListener`标注在对应实现类

    1.  **Servlet**：使用`@WebServlet`标注Servlet接口的实现类

		```java
		@Slf4j
		// value|urlPatterns：指定映射路径
		@WebServlet(name = "CustomizedServlet", value = "/CustomizedServlet")
		public class CustomizedServlet extends HttpServlet {
			@Override
			protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
				response.getWriter().write("servlet doGet调用");
				log.info("servlet doGet调用");
			}
	
			@Override
			protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
				log.info("servlet doPost调用");
			}
		}
		```

    2.  Filter：使用@WebFilter标注Filter接口的实现类

	```java
	@Slf4j
	// urlPatterns：指定拦截路径
	@WebFilter(filterName = "CustomizedFilter", urlPatterns = {"/CustomizedServlet"})
	public class CustomizedFilter implements Filter {
		public void init(FilterConfig config) throws ServletException {
			log.info("过滤器初始化");
		}
	
		public void destroy() {
			log.info("过滤器销毁");
		}
	
		@Override
		public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ServletException, IOException {
			response.setCharacterEncoding("utf-8");
			log.info("过滤器执行：:{}", request.getRemoteAddr());
			chain.doFilter(request, response);
		}
	}
	```

    3.  Listener：使用@WebListener标注Filter接口的实现类

	```java
	@WebListener
	@Slf4j
	public class CustomizedListener implements ServletContextListener, HttpSessionListener, HttpSessionAttributeListener {
	
		public CustomizedListener() {}
	
		@Override
		public void contextInitialized(ServletContextEvent sce) {
			log.info("servlet容器处理化");
			/* This method is called when the servlet context is initialized(when the Web application is deployed). */
		}
	
		@Override
		public void contextDestroyed(ServletContextEvent sce) {
			log.info("servlet容器销毁");
			/* This method is called when the servlet Context is undeployed or Application Server shuts down. */
		}
	}
	```

#### xxxRegistrationBean注入

1.  **servlet** ：org.springframework.boot.web.servlet.`ServletRegistrationBean`

2.  **Filter** ：org.springframework.boot.web.servlet.`FilterRegistrationBean`

3.  **Listener** ：org.springframework.boot.web.servlet.`ServletListenerRegistrationBean`

```java
@Configuration
public class CustomizedServletConfiguration {
	@Bean
	public ServletRegistrationBean<CustomizedServlet> servletRegistrationBean() {
		ServletRegistrationBean<CustomizedServlet> servletRegistrationBean = new ServletRegistrationBean<>();
		// 设置servlet
		servletRegistrationBean.setServlet(new CustomizedServlet());
		// 设置映射路径
		servletRegistrationBean.setUrlMappings(Collections.singleton("/CustomizedServlet/*"));
		return servletRegistrationBean;
	}

	@Bean
	public FilterRegistrationBean<CustomizedFilter> filterFilterRegistrationBean() {
		FilterRegistrationBean<CustomizedFilter> customizedFilterFilterRegistrationBean = new FilterRegistrationBean<>();
		// 设置过滤器
		customizedFilterFilterRegistrationBean.setFilter(new CustomizedFilter());
	   // 设置过滤路径
 customizedFilterFilterRegistrationBean.setUrlPatterns(Collections.singleton("/CustomizedServlet"));
		return customizedFilterFilterRegistrationBean;
	}

	@Bean
	public ServletListenerRegistrationBean<CustomizedListener> servletListenerRegistrationBean(){
		ServletListenerRegistrationBean<CustomizedListener> servletListenerRegistrationBean = new ServletListenerRegistrationBean<>();
		// 设置监听器
		servletListenerRegistrationBean.setListener(new CustomizedListener());
		return servletListenerRegistrationBean;
	}
}
```

#### 实例

1.  DispatcherServletRegistrationBean

    1.  `DispatcherServletRegistrationBean`继承了`ServletRegistrationBean<DispatcherServlet>`

		```java
		public class DispatcherServletAutoConfiguration {
			protected static class DispatcherServletRegistrationConfiguration {
				public DispatcherServletRegistrationBean dispatcherServletRegistration(DispatcherServlet dispatcherServlet, WebMvcProperties webMvcProperties, ObjectProvider<MultipartConfigElement> multipartConfig) {
					// ★ 创建 DispatcherServletRegistrationBean
					DispatcherServletRegistrationBean registration = new      DispatcherServletRegistrationBean(dispatcherServlet,webMvcProperties.getServlet().getPath());
					// 设置dispatcherServlet的名称
					registration.setName(DEFAULT_DISPATCHER_SERVLET_BEAN_NAME);
					// 设置servlet实例的创建时机。0表示浏览器第一次请求时创建，大于0表示立即创建
					registration.setLoadOnStartup(webMvcProperties.getServlet().getLoadOnStartup());
					multipartConfig.ifAvailable(registration::setMultipartConfig);
<!--SR:!2024-03-27,3,250-->
					return registration;
				}
			}
		}
		```

### 嵌入式的Servlet容器

#### 切换Servlet容器

> 1.  Servlet的web服务器工厂：org.springframework.boot.web.servlet.server.ServletWebServerFactory
>     1.  Tomcat：org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory
>     2.  Jetty：org.springframework.boot.web.embedded.jetty.JettyServletWebServerFactory
>     3.  Undertow：org.springframework.boot.web.embedded.undertow\.UndertowServletWebServerFactory
> 2.  Servlet的web服务器工厂配置类：org.springframework.boot.autoconfigure.web.servlet.ServletWebServerFactoryConfiguration
> 3.  Servlet的web服务器工厂配置装载类：org.springframework.boot.autoconfigure.web.servlet.ServletWebServerFactoryAutoConfiguration
> 4.  Web项目的IOC容器：org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext\*\*——>继承了ApplicationContext\*\*

1.  Spring Boot 提供了`Tomcat`、`Jetty`、`Undertow`三类容器

##### 容器创建

1.  创建WebServer

    1.  入口：org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext#createWebServer

		```java
		private void createWebServer() {
			WebServer webServer = this.webServer;
			ServletContext servletContext = getServletContext();
			if (webServer == null && servletContext == null) {
				// 获取工厂
				ServletWebServerFactory factory = getWebServerFactory();
				// ★ 获取Web服务器
				this.webServer = factory.getWebServer(getSelfInitializer());
				...
			}
		}
		```

    2.  创建Tomcat服务器：org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory#getWebServer

		```java
		public WebServer getWebServer(ServletContextInitializer... initializers) {
			Tomcat tomcat = new Tomcat();
			// ★ 获取Tomcat服务器
			return getTomcatWebServer(tomcat);
		}
		```

    3.  Tomcat服务器创建并启动org.springframework.boot.web.embedded.tomcat.TomcatWebServer#TomcatWebServer(org.apache.catalina.startup.Tomcat, boolean, org.springframework.boot.web.server.Shutdown)

		```java
		public TomcatWebServer(Tomcat tomcat, boolean autoStart, Shutdown shutdown) {
			Assert.notNull(tomcat, "Tomcat Server must not be null");
			this.tomcat = tomcat;
			this.autoStart = autoStart;
			this.gracefulShutdown = (shutdown == Shutdown.GRACEFUL) ? new GracefulShutdown(tomcat) : null;
			// ★ 容器初始化
			initialize();
		}
		```

        2.  容器启动：org.springframework.boot.web.embedded.tomcat.TomcatWebServer#initialize
		```java
		private void initialize() throws WebServerException {
			logger.info("Tomcat initialized with port(s): " + getPortsDescription(false));
			synchronized (this.monitor) {
				// ★ 启动服务器以触发初始化监听器
				this.tomcat.start();
			}
		}
		```

#### 定制Servlet容器

##### 实现流程

1.  实现`WebServerFactoryCustomizer<ConfigurableServletWebServerFactory>`，并注册

	```java
	@Component
	public class WebServletCustomized implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {
		@Override
		public void customize(ConfigurableServletWebServerFactory factory) {
			// 修改端口为8989
			factory.setPort(8989);
		}
	}
	```

1.  修改配置文件`application.properties`

	```property
	# 应用服务 WEB 访问端口
	server.port=8080
	```

3.  自定义`ConfigurableServletWebServerFactory`

### 定制化组件

1.  修改配置文件`application.properties`

2.  查找对应的自定义器：xxxxxCustomizer；

3.  编写自定义的配置类： xxxConfiguration(@Configuration)+ @Bean
    1.  替换、增加容器中的默认组件

4.  创建WebMvcConfigurer 的实现类

5.  @EnableWebMvc + WebMvcConfigurer：重置并重新配置（**@EnableWebMvc与WebMvcAutoConfiguration相互冲突**）
    1.  标注`@EnableWebMvc`类后，会通过`@Import(DelegatingWebMvcConfiguration.class)`引入DelegatingWebMvcConfiguration
    2.  `DelegatingWebMvcConfiguration`是`WebMvcConfigurationSupport`的子类
        1.  WebMvcConfigurationSupport支持Spring MVC最基本的功能
    3.  `WebMvcAutoConfiguration`注册的前置条件是`@ConditionalOnMissingBean(WebMvcConfigurationSupport.class)`
    4.  当容器中已经存在`WebMvcConfigurationSupport`类型的实例时，`WebMvcAutoConfiguration`不再加入容器

## 配置机制

### Profile功能

1.  支持配置文件切换

```properties
# application.yml 中指定环境
spring.profiles.active=test

# application-test.yml中配置对应环境的属性
命名规范：application-环境名.yms
```

2.  支持注解切换

```java
// 指定当前bean在test环境被注入
@Profile("test")
```

3.  支持多配置文件组合

```properties
# application.yml 中指定环境
spring.profiles.active=test

# application-test.yml 指定对应环境
spring.profiles.test[0]=test0
spring.profiles.test[1]=test1

# application-test0.yml 中配置对应环境的属性
# application-test1.yml 中配置对应环境的属性
```

### 配置文件

[Spring Boot 配置文件特性](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-external-config)

1.  配置文件扫描位置\*\*（位置由内向外）\*\*
    1.  `classpath:`根路径
    2.  `classpath:`根路径下的`/config`目录
    3.  Jar包所在目录
    4.  Jar包所在目录下的`/config`目录
    5.  `/config`子目录的直接子目录 eg：/config/xxx/application.yml
2.  优先级
    1.  指定环境优先（application-test.yml 优先于 application.yml）
    2.  外部优先（Jar包所在目录 优先于`classpath:`根路径）

### 自定义Starter

1.  创建spring-boot-xxx-starter（启动模块）

    1.  启动器的pom.xml引入依赖spring-boot-starter-xxx-autoconfigure（自动配置模块）

2.  创建spring-boot-starter-xxx-autoconfigure（自动配置模块）

    1.  autoconfigure模块中配置`META-INF/spring.factories`，指定`EnableAutoConfiguration`的值，项目启动时加载指定的配置类`xxxAutoConfiguration`

		```java
		org.springframework.boot.autoconfigure.EnableAutoConfiguration=com.xxx.config.xxxAutoCOnfiguration
		```

    2.  创建自动配置类xxxAutoConfiguration.java

        1.  使用`@EnableConfigurationProperties(xxxProperties.class)`引入`xxxProperties.java`

		```java
		@EnableConfigurationProperties(xxxProperties.class)
		@Configuration
		class xxxAutoConfiguration{
			
			@Bean("xxxService")
			@ConditionalOnMissingBean(XxxService.class)
			public XxxService customizedService(){
				XxxService service = new XxxService();
				return serevice;
			}
		}
		```

    3.  创建属性配置类xxxProperties.java

        1.  使用`@ConfigurationProperties(prefix="xxx")`映射`application.yml`配置文件

            ```java
            @ConfigurationProperties("xxx")
            @Data
            public class xxxProperties{
                String url;
                String port;
            }
            ```

    4.  创建业务类XxxService.java

        1.  使用`@Autowired`将属性类`xxxProperties`的实例注入XxxService中

            ```java
            public class XxxService{
                @Autowired
                private xxxProperties properties;
                
                public String handler(){
                    properties.getUrl + "_" + properties.getPort();
                }
            }
            ```

## 启动流程

> Spring Boot应用引导类：org.springframework.boot.SpringApplication
> 
> 1.  创建 ApplicationContext实例
> 2.  注册CommandLinePropertySource，将命令行参数保存到Spring 属性
> 3.  刷新ApplicationContext，加载所有单例bean
> 4.  触发CommandLineRunner调用run()方法执行

### 创建SpringApplication

```java
public SpringApplication(ResourceLoader resourceLoader, Class<?>... primarySources) {
    this.resourceLoader = resourceLoader;
    Assert.notNull(primarySources, "PrimarySources must not be null");
    this.primarySources = new LinkedHashSet<>(Arrays.asList(primarySources));
    // 推断Web应用的类型
    this.webApplicationType = WebApplicationType.deduceFromClasspath();
    // 设置初始化器：ApplicationContextInitializer
    setInitializers((Collection) getSpringFactoriesInstances(ApplicationContextInitializer.class));
    // 设置监听器：ApplicationListener
    setListeners((Collection) getSpringFactoriesInstances(ApplicationListener.class));
    // 推断main方法所在的主类
    this.mainApplicationClass = deduceMainApplicationClass();
}
```

#### 推断Web应用的类型

1.  类型

	```java
	WebApplicationType.SERVLET
	存在："javax.servlet.Servlet"
	存在："org.springframework.web.context.ConfigurableWebApplicationContext"
	```

	```java
	WebApplicationType.REACTIVE
	存在："org.springframework.web.reactive.DispatcherHandler"
	不存在："org.springframework.web.servlet.DispatcherServlet"
	```

2.  判断类是否存在，使用全限定类名

	```java
	ClassUtils.isPresent(WEBFLUX_INDICATOR_CLASS, null)
	```

#### 设置初始化器

> 1.  **准备ConfigurableApplicationContext上下文时调用。** 。
> 2.  通常用于需要对应用程序上下文进行编程初始化的web应用程序中。例如，注册属性源或根据上下文环境激活配置文件

```java
public interface ApplicationContextInitializer<C extends ConfigurableApplicationContext>{
	/**
	 * Initialize the given application context.
	 * @param applicationContext the application to configure
	 */
	void initialize(C applicationContext);
}
```

#### 设置监听器

> 1.  特殊时机调用
>     1.  在加载应用程序上下文之后但在刷新之前调用。
>         1.  org.springframework.boot.SpringApplicationRunListener#contextLoaded
> 2.  调用类：org.springframework.context.event.SimpleApplicationEventMulticaster#multicastEvent(org.springframework.context.ApplicationEvent, org.springframework.core.ResolvableType)

```java
public interface ApplicationListener<E extends ApplicationEvent> extends EventListener {
	/**
	 * Handle an application event.
	 * @param event the event to respond to
	 */
	void onApplicationEvent(E event);
}
```

1.  org.springframework.boot.ClearCachesApplicationListener\@59309333
2.  初始化或刷新ApplicationContext时引发的事件。
3.  org.springframework.boot.autoconfigure.BackgroundPreinitializer\@67d48005,
    1.  执行自动配置早期的初始化

#### 推断main方法所在的主类

```java
private Class<?> deduceMainApplicationClass() {
    // 获取当前执行堆栈
    StackTraceElement[] stackTrace = new RuntimeException().getStackTrace();
    // 遍历堆栈，获取main()方法所在类
    for (StackTraceElement stackTraceElement : stackTrace) {
        if ("main".equals(stackTraceElement.getMethodName())) {
            return Class.forName(stackTraceElement.getClassName());
        }
    }
}
```

### 运行SpringApplication

```java
public ConfigurableApplicationContext run(String... args) {
    // ★ 获取应用运行监听器
    SpringApplicationRunListeners listeners = getRunListeners(args);
    // 容器首次启动时调用
    listeners.starting();
    // 封装main()方法传入的参数
    ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);
    // ★ 创建 & 初始化环境实例environment
    ConfigurableEnvironment environment = prepareEnvironment(listeners, applicationArguments);
    // ★ 创建IOC容器
    ConfigurableApplicationContext context = createApplicationContext();
    // 创建异常报告器
    Collection<SpringBootExceptionReporter> exceptionReporters = getSpringFactoriesInstances(SpringBootExceptionReporter.class,
					new Class[] { ConfigurableApplicationContext.class }, context);
    // ★ 初始化IOC容器
    prepareContext(context, environment, listeners, applicationArguments, printedBanner);
    // ★ 容器执行刷新操作，保存单实例bean
    refreshContext(context);
    // 容器刷新完成的时机
    afterRefresh(context, applicationArguments); 
    // 容器启动成功
    listeners.started(context);
    // ★ 调用CommandLineRunners和ApplicationRunners
    callRunners(context, applicationArguments);
    
    listeners.running(context);
}
```

#### 获取应用运行监听器

> org.springframework.boot.SpringApplicationRunListener

```java
public interface SpringApplicationRunListener {
    // starting：首次启动 run 方法时立即调用。可用于非常早期的初始化。
	default void starting() {
	}
    // environment准备好，在context创建之前
	default void environmentPrepared(ConfigurableEnvironment environment) {
	}
    // context创建&准备好，source加载之前调用
	default void contextPrepared(ConfigurableApplicationContext context) {
	}
    // 在加载应用程序上下文之后但在刷新之前调用
	default void contextLoaded(ConfigurableApplicationContext context) {
	}
    // 上下文已刷新，应用程序已启动，但尚未调用CommandLineRunners和ApplicationRunners
	default void started(ConfigurableApplicationContext context) {
	}
    // CommandLineRunners和ApplicationRunners被调用之后
	default void running(ConfigurableApplicationContext context) {
	}
    // 运行应用程序时发生故障时调用
    // @param context :应用程序上下文，或者｛@code null｝如果在创建上下文之前发生故障
	default void failed(ConfigurableApplicationContext context, Throwable exception) {
	}
}
```

#### 创建 & 初始化环境实例environment

```java
private ConfigurableEnvironment prepareEnvironment(SpringApplicationRunListeners listeners,ApplicationArguments applicationArguments) {
	// 获取标准环境容器：StandardServletEnvironment
	ConfigurableEnvironment environment = getOrCreateEnvironment();
	// ★ 配置环境容器
	configureEnvironment(environment, applicationArguments.getSourceArgs());
	// context创建&准备好，source加载之前调用
	listeners.environmentPrepared(environment);
	// 绑定"spring.main.xxx"的配置
	bindToSpringApplication(environment);
	// ★ 将属性集合装载到ConfigurationPropertySource类型实例，便于通过PropertyResolver解析
	ConfigurationPropertySources.attach(environment);
	return environment;
}
```

2.  配置环境容器

    ```java
    // 按照该顺序委托给configurePropertySources（ConfigurationEnvironment，String[]）和configureProfiles（ConfigurationEnvironment，String[]）的模板方法。重写此方法可完全控制环境自定义，或分别使用上述方法之一对属性源或配置文件进行细粒度控制。
    protected void configureEnvironment(ConfigurableEnvironment environment, String[] args) {
        // 添加转换器
        if (this.addConversionService) {
            ConversionService conversionService = ApplicationConversionService.getSharedInstance();
            environment.setConversionService((ConfigurableConversionService) conversionService);
        }
        // 属性源PropertySOurce处理
        configurePropertySources(environment, args);
        // 为此应用程序环境配置哪些配置文件处于活动状态（或默认情况下处于活动状态）。在配置文件处理过程中，可以通过spring.profiles.active属性激活其他配置文件。
        configureProfiles(environment, args);
    }
    ```

#### 创建IOC容器

> 1.  DEFAULT\_SERVLET\_WEB\_CONTEXT\_CLASS：org.springframework.boot.web.servlet.context.AnnotationConfigServletWebServerApplicationContext
> 2.  DEFAULT\_REACTIVE\_WEB\_CONTEXT\_CLASS：org.springframework.boot.web.reactive.context.AnnotationConfigReactiveWebServerApplicationContext
> 3.  DEFAULT\_CONTEXT\_CLASS：org.springframework.context.annotation.AnnotationConfigApplicationContext

```java
protected ConfigurableApplicationContext createApplicationContext() {
    Class<?> contextClass = this.applicationContextClass;
    switch (this.webApplicationType) {
        case SERVLET:
            contextClass = Class.forName(DEFAULT_SERVLET_WEB_CONTEXT_CLASS);
            break;
        case REACTIVE:
            contextClass = Class.forName(DEFAULT_REACTIVE_WEB_CONTEXT_CLASS);
            break;
        default:
            contextClass = Class.forName(DEFAULT_CONTEXT_CLASS);
    }
    // 实例化bean
    return (ConfigurableApplicationContext) BeanUtils.instantiateClass(contextClass);
}
```

#### 异常报告器

```java
@FunctionalInterface
public interface SpringBootExceptionReporter {
    // 通知用户启动错误
   boolean reportException(Throwable failure);
}
```

#### 初始化IOC容器

```java
private void prepareContext(ConfigurableApplicationContext context, ConfigurableEnvironment environment, SpringApplicationRunListeners listeners, ApplicationArguments applicationArguments, Banner printedBanner) {
    context.setEnvironment(environment);
    // 注册BeanNameGenerator、设置转换器ConversionService、设置资源加载器ResourceLoader、类加载器ClassLoader。子类可以根据需要应用其他处理。
    postProcessApplicationContext(context);
    // 调用ApplicationContextInitializer初始化器，进行容器初始化
    applyInitializers(context);
    // context创建&准备好，source加载之前调用
    listeners.contextPrepared(context);

    // ★ 注册引导的bean
    ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
    beanFactory.registerSingleton("springApplicationArguments", applicationArguments);
    if (printedBanner != null) {
        beanFactory.registerSingleton("springBootBanner", printedBanner);
    }
    // 设置允许Bean定义重写
    if (beanFactory instanceof DefaultListableBeanFactory) {
        ((DefaultListableBeanFactory) beanFactory)
        .setAllowBeanDefinitionOverriding(this.allowBeanDefinitionOverriding);
    }
    // 懒加载后置处理器
    if (this.lazyInitialization) {
        context.addBeanFactoryPostProcessor(new LazyInitializationBeanFactoryPostProcessor());
    }
    // ★ 装载资源配置文件
    Set<Object> sources = getAllSources();
    // 装载sources中的bean到IOC容器上下文
    load(context, sources.toArray(new Object[0]));
    listeners.contextLoaded(context);
}
```

#### 容器执行刷新操作，保存单实例Bean

1.  调用org.springframework.context.support.AbstractApplicationContext#refresh执行刷新操作

#### 调用CommandLineRunners和ApplicationRunners

> 提供服务正常允许后的任意预置操作

```java
private void callRunners(ApplicationContext context, ApplicationArguments args) {
    List<Object> runners = new ArrayList<>();
    runners.addAll(context.getBeansOfType(ApplicationRunner.class).values());
    runners.addAll(context.getBeansOfType(CommandLineRunner.class).values());
    AnnotationAwareOrderComparator.sort(runners);
    // 执行调用
    for (Object runner : new LinkedHashSet<>(runners)) {
        if (runner instanceof ApplicationRunner) {
            callRunner((ApplicationRunner) runner, args);
        }
        if (runner instanceof CommandLineRunner) {
            callRunner((CommandLineRunner) runner, args);
        }
    }
}
```

## 数据访问

> 1.  数据库：MySQL、H2
>     1.  存储数据的具体实体
> 2.  数据源：DataSource
>     1.  数据源是一个变量，我们定义的一个数据源，可以随时修改指向不同的数据库，而数据库是个存在的实体。
> 3.  Java操作数据库的API：JDBC
> 4.  数据库连接池：Hikari、Druid
>     1.  用于和数据库进行连接、它可以负责管理、分配和释放数据库的连接
> 5.  持久层框架、对JDBC进行封装：MyBatis

### Jdbc自动配置

1.  引入操作数据库依赖：JDBC

    ```xml
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    ```

#### DataSourceAutoConfiguration

1.  Spring集成了EmbeddedDatabaseConfiguration（**嵌入式数据库**）、PooledDataSourceConfiguration（**池化数据源**）。默认支持`HikariDataSource`数据库连接池，可以连接任意数据库。

    1.  嵌入式数据库（EmbeddedDatabaseConnection）：H2、DERBY、HSQL
    2.  池化数据源（DataSourceConfiguration）：Tomcat、Hikari、Dbcp2、Generic

2.  当未引入任何DataSource的子类时，默认引入Hikari作为数据库连接池<font color="red">（spring-boot-starter-jdbc中默认引入HikariDataSource类）</font>

	```java
	abstract class DataSourceConfiguration {	
		@Configuration(proxyBeanMethods = false)
		// ★ HikariDataSource类在spring-boot-starter-jdbc中默认引入
		@ConditionalOnClass(HikariDataSource.class)
		// ★ 容器中没有任何DataSource子类实例
		@ConditionalOnMissingBean(DataSource.class)
		// 配置文件中存在属性spring.datasource.type=com.zaxxer.hikari.HikariDataSource
		// ★ 即使没有这个配置，也当做有
		@ConditionalOnProperty(name = "spring.datasource.type", havingValue = "com.zaxxer.hikari.HikariDataSource", matchIfMissing = true)
		static class Hikari {

			@Bean
			@ConfigurationProperties(prefix = "spring.datasource.hikari")
			HikariDataSource dataSource(DataSourceProperties properties) {
				HikariDataSource dataSource = createDataSource(properties, HikariDataSource.class);
				if (StringUtils.hasText(properties.getName())) {
					dataSource.setPoolName(properties.getName());
				}
				return dataSource;
			}

		}
	}
	```

3.  Spring Boot没有自动引入数据库驱动的包，因为不知道操作什么数据库

    1.  当引入`mysql-connector-java`依赖时，适配MySQL数据库

		```xml
		<dependency>
			<groupId>mysql</groupId>
			<artifactId>mysql-connector-java</artifactId>
		</dependency>
		```

    2.  当引入`H2`依赖时，适配H2数据库

		```xml
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
		</dependency>
		```

##### 创建DataSource（HikariDataSource）

```java
@Bean
@ConfigurationProperties(prefix = "spring.datasource.hikari")
HikariDataSource dataSource(DataSourceProperties properties) {
	// ★ 获取属性配置properties创建数据源
	HikariDataSource dataSource = createDataSource(properties, HikariDataSource.class);
	if (StringUtils.hasText(properties.getName())) {
		dataSource.setPoolName(properties.getName());
	}
	return dataSource;
}
// ★ 创建数据源的四要素
public DataSourceBuilder<?> initializeDataSourceBuilder() {
	return DataSourceBuilder
		.create(getClassLoader()).type(getType())
		// 驱动类
		.driverClassName(determineDriverClassName())
		// URL
		.url(determineUrl())
		// 用户名
		.username(determineUsername())
		// 密码
		.password(determinePassword());
}
```

#### JdbcTemplateAutoConfiguration

##### 创建`JdbcTemplate`

```java
@Bean
@Primary
JdbcTemplate jdbcTemplate(DataSource dataSource, JdbcProperties properties) {
	// ★ 数据源传入，作为构造函数的参数
	JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
	
	JdbcProperties.Template template = properties.getTemplate();
	jdbcTemplate.setFetchSize(template.getFetchSize());
	jdbcTemplate.setMaxRows(template.getMaxRows());
	if (template.getQueryTimeout() != null) {
		jdbcTemplate.setQueryTimeout((int) template.getQueryTimeout().getSeconds());
	}
	return jdbcTemplate;
}
```

##### JdbcTemplate操作数据库

```java
@SpringBootTest
class SpringBootWebApplicationTests {

	@Resource
	private JdbcTemplate jdbcTemplate;
	// 使用JdbcTemplate操作数据库
	@Test
	void contextLoads() {
		List<Long> count = jdbcTemplate.queryForList("select count(*) from test", Long.class);
		System.out.println(count);
	}
}
```

#### Statement操作数据库

1.  数据库访问四要素：驱动`driver`、数据库地址`URL`、用户名、密码

```java
@SpringBootTest
class SpringBootWebApplicationTests {
	// 使用Statement操作数据库
	@Test
	void jdbcTest() throws ClassNotFoundException, SQLException {
		Class.forName("com.mysql.cj.jdbc.Driver");
		Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/study?serverTimezone=GMT%2B8", "root", "rootroot");
		Statement statement = connection.createStatement();

		int count = statement.executeUpdate("insert into test(a) values ('4')");
		System.out.println(count);
	}
}
```

### Druid连接池

> 1.  [Druid GitHub](https://github.com/alibaba/druid)
> 2.  [Druid中文版](https://github.com/alibaba/druid/wiki/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)
> 3.  [Spring Boot和 Druid集成](https://github.com/alibaba/druid/tree/master/druid-spring-boot-starter)

#### 自定义DruidDataSource

1.  自定义druid数据源（不使用自动配置，仅引入druid依赖）

    1.  添加`druid`依赖

	```xml
	<dependency>
		<groupId>com.alibaba</groupId>
		<artifactId>druid</artifactId>
		<version>1.2.15</version>
	</dependency>
	```

2.  向容器中注入DruidDataSource<font color="red">（替换Jdbc默认自带的连接池PooledDataSourceConfiguration）</font>

	```java
	@Configuration
	public class CustomizedDataSourceConfiguration {
		// 从配置文件中读取配置
		@Bean
		@ConfigurationProperties("spring.datasource")
		public DruidDataSource dataSource() {
			return new DruidDataSource();
		}
	}
	```

#### Druid自动配置

1.  引入Druid启动器依赖

```xml
<dependency>
	<groupId>com.alibaba</groupId>
	<artifactId>druid-spring-boot-starter</artifactId>
	<version>1.2.9</version>
</dependency>
```

##### DruidDataSourceAutoConfigure

```java
// ★ DataSourceProperties：前缀spring.datasource
@EnableConfigurationProperties({DruidStatProperties.class, DataSourceProperties.class})
public class DruidDataSourceAutoConfigure {
	// ★ 指定初始化方法，先调用构造方法创建对象，再调用init方法初始化对象
	@Bean(initMethod = "init")
	@ConditionalOnMissingBean
	public DataSource dataSource() {
		LOGGER.info("Init DruidDataSource");
		return new DruidDataSourceWrapper();
	}
}
```

###### 创建DruidDataSource

1.  调用构造方法创建：使用前缀`"spring.datasource.druid"`配置数据源

```java
public class DruidDataSource extends DruidAbstractDataSource {
	public DruidDataSource(){
		this(false);
	}
	public DruidDataSource(boolean fairLock){
		super(fairLock);
		// ★ 优先使用前缀"spring.datasource.druid"配置数据源
		configFromPropety(System.getProperties());
	}
}
```

2.  读取配置文件：com.alibaba.druid.pool.DruidDataSource#configFromPropety

```java
public void configFromPropety(Properties properties) {
	{
		String property = properties.getProperty("druid.name");
		if (property != null) {
			this.setName(property);
		}
	}
	{
		String property = properties.getProperty("druid.url");
		if (property != null) {
			this.setUrl(property);
		}
	}
	{
		String property = properties.getProperty("druid.username");
		if (property != null) {
			this.setUsername(property);
		}
	}
	{
		String property = properties.getProperty("druid.password");
		if (property != null) {
			this.setPassword(property);
		}
	}
	...
}
```

3.  初始化数据源：com.alibaba.druid.pool.DruidDataSource#init（）

```java
public void init() throws SQLException {
	// 加载驱动
	DruidDriver.getInstance();
	// 数据源Id
	this.id = DruidDriver.createDataSourceId();
	...
}
```

4.  属性后置处理（使用`"spring.datasource"`前缀配置）

	```java
	@Override
	public void afterPropertiesSet() throws Exception {
		// ★ 如果找不到前缀“spring.datasource.druid"的jdbc属性，将使用"spring.datasource"前缀的jdbc属性。
		if (super.getUsername() == null) {
			super.setUsername(basicProperties.determineUsername());
		}
		if (super.getPassword() == null) {
			super.setPassword(basicProperties.determinePassword());
		}
		if (super.getUrl() == null) {
			super.setUrl(basicProperties.determineUrl());
		}
		if (super.getDriverClassName() == null) {
			super.setDriverClassName(basicProperties.getDriverClassName());
		}
	}
	```

### Mybatis自动配置

> 1.  [Spring Boot 与MyBatis集成](https://github.com/mybatis/spring-boot-starter/blob/master/mybatis-spring-boot-autoconfigure/src/site/zh/markdown/index.md)
> 2.  [mybatis-spring](https://mybatis.org/spring/zh/mappers.html#scan)
> 3.  要与 Spring 一起使用 MyBatis，你至少需要一个 `SqlSessionFactory` 和一个 mapper 接口

1.  引入MyBatis启动器依赖

	```xml
	<dependency>
		<groupId>org.mybatis.spring.boot</groupId>
		<artifactId>mybatis-spring-boot-starter</artifactId>
		<version>2.1.4</version>
	</dependency>
	```

#### MybatisAutoConfiguration

##### 创建SqlSessionFactory

1.  SqlSessionFactoryBean—创建—>SqlSessionFactory—创建—>SqlSessionTempalte

    1.  SqlSessionFactoryBean实现了`FactoryBean<SqlSessionFactory>`、`InitializingBean`

        1.  `SqlSessionFactoryBean`重写了`FactoryBean#getObject()`方法——>调用了`InitializingBean#afterPropertiesSet()`——>调用<font color="red">SqlSessionFactoryBean#buildSqlSessionFactory()</font>创建了SqlSessionFactory\[`初始化了Environment实例`]

    2.  org.mybatis.spring.boot.autoconfigure.MybatisAutoConfiguration#sqlSessionFactory

	```java
	@Bean
	@ConditionalOnMissingBean
	public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
		// SqlSessionFactoryBean
		SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
		factory.setDataSource(dataSource);
		
		// ★ 创建Configuration（Environment为空，初始化Configuration配置）
		applyConfiguration(factory);
		
		// ★ 创建SqlSessionFactory（初始化Environment）
		return factory.getObject();
	}
	```

    3.  org.mybatis.spring.SqlSessionFactoryBean#buildSqlSessionFactory

	```java
	protected SqlSessionFactory buildSqlSessionFactory() throws Exception {
	
		final Configuration targetConfiguration;
	
		XMLConfigBuilder xmlConfigBuilder = null;
		// ★ 获取Mybatis主配置文件位置
		if (this.configuration != null) {
			// 读取application.yml配置
		} else if (this.configLocation != null) {
			// 获取xml配置文件指定的配置
			xmlConfigBuilder = new XMLConfigBuilder(this.configLocation.getInputStream(), null, this.configurationProperties);
			targetConfiguration = xmlConfigBuilder.getConfiguration();
		} else {
			// 使用默认配置
			targetConfiguration = new Configuration();
		}
		...;
		// ★ 创建并初始化environment实例
		targetConfiguration.setEnvironment(
			new Environment(this.environment,
							this.transactionFactory == null ? new SpringManagedTransactionFactory() : this.transactionFactory,
							this.dataSource));
		// ★ 获取mapper映射文件配置
		if (this.mapperLocations != null) {
			for (Resource mapperLocation : this.mapperLocations) {
				if (mapperLocation == null) {
					continue;
				}
				XMLMapperBuilder xmlMapperBuilder = new XMLMapperBuilder(mapperLocation.getInputStream(),targetConfiguration, mapperLocation.toString(), targetConfiguration.getSqlFragments());
				xmlMapperBuilder.parse();
			}
		}
		// ★ 构建sqlSessionFactory
		return this.sqlSessionFactoryBuilder.build(targetConfiguration);
	}
	```

    4.  org.apache.ibatis.session.SqlSessionFactoryBuilder#build(org.apache.ibatis.session.Configuration)
	```java
	public SqlSessionFactory build(Configuration config) {
		return new DefaultSqlSessionFactory(config);
	}
	```

###### 创建Configuration

1.  Configuration

	```java
	public class Configuration {
		// Environment实例：保存事务管理器、数据源
		protected Environment environment;
		// 是否开启驼峰命名处理
		protected boolean mapUnderscoreToCamelCase;
		// 是否开启缓存
		protected boolean cacheEnabled = true;
		// 日志实现类
		protected Class<? extends Log> logImpl;
		// 执行器默认类型
		protected ExecutorType defaultExecutorType = ExecutorType.SIMPLE;
		// 代理工厂
		protected ProxyFactory proxyFactory = new JavassistProxyFactory();
		
		// Mapper映射
		protected final MapperRegistry mapperRegistry = new MapperRegistry(this);
		// 拦截器
		protected final InterceptorChain interceptorChain = new InterceptorChain();
		protected final TypeHandlerRegistry typeHandlerRegistry = new TypeHandlerRegistry(this);
		protected final TypeAliasRegistry typeAliasRegistry = new TypeAliasRegistry();
		protected final LanguageDriverRegistry languageRegistry = new LanguageDriverRegistry();
	}
	```

2.  创建Configuration（applyConfiguration(factory);）

```java
public Configuration() {
	// ★ 注册类型别名映射
	typeAliasRegistry.registerAlias("JDBC", JdbcTransactionFactory.class);
	typeAliasRegistry.registerAlias("MANAGED", ManagedTransactionFactory.class);

	typeAliasRegistry.registerAlias("JNDI", JndiDataSourceFactory.class);
	typeAliasRegistry.registerAlias("POOLED", PooledDataSourceFactory.class);
	typeAliasRegistry.registerAlias("UNPOOLED", UnpooledDataSourceFactory.class);

	typeAliasRegistry.registerAlias("PERPETUAL", PerpetualCache.class);
	typeAliasRegistry.registerAlias("FIFO", FifoCache.class);
	typeAliasRegistry.registerAlias("LRU", LruCache.class);
	typeAliasRegistry.registerAlias("SOFT", SoftCache.class);
	typeAliasRegistry.registerAlias("WEAK", WeakCache.class);

	typeAliasRegistry.registerAlias("DB_VENDOR", VendorDatabaseIdProvider.class);
	// XML语言驱动程序
	typeAliasRegistry.registerAlias("XML", XMLLanguageDriver.class);
	typeAliasRegistry.registerAlias("RAW", RawLanguageDriver.class);
	// 日志类
	typeAliasRegistry.registerAlias("SLF4J", Slf4jImpl.class);
	typeAliasRegistry.registerAlias("COMMONS_LOGGING", JakartaCommonsLoggingImpl.class);
	typeAliasRegistry.registerAlias("LOG4J", Log4jImpl.class);
	typeAliasRegistry.registerAlias("LOG4J2", Log4j2Impl.class);
	typeAliasRegistry.registerAlias("JDK_LOGGING", Jdk14LoggingImpl.class);
	typeAliasRegistry.registerAlias("STDOUT_LOGGING", StdOutImpl.class);
	typeAliasRegistry.registerAlias("NO_LOGGING", NoLoggingImpl.class);

	typeAliasRegistry.registerAlias("CGLIB", CglibProxyFactory.class);
	typeAliasRegistry.registerAlias("JAVASSIST", JavassistProxyFactory.class);
	// 注册语言解析器
	languageRegistry.setDefaultDriverClass(XMLLanguageDriver.class);
	languageRegistry.register(RawLanguageDriver.class);
}
```

###### 创建Environment

1.  Environment

```java
public final class Environment {
	// 唯一标识
	private final String id;
	// 事务工厂
	private final TransactionFactory transactionFactory;
	// 数据源
	private final DataSource dataSource;
}
```

2.  创建Environment（初始化Configuration中的Environment）

```java
protected SqlSessionFactory buildSqlSessionFactory() throws Exception {
	targetConfiguration.setEnvironment(
		new Environment(
			// environment = SqlSessionFactoryBean.class.getSimpleName();
			this.environment,
			// ★ 创建事务工厂
			this.transactionFactory == null ? new SpringManagedTransactionFactory() : this.transactionFactory,
			this.dataSource));
}
```

##### 创建SqlSessionTemplate

1.  org.mybatis.spring.boot.autoconfigure.**MybatisAutoConfiguration**#`sqlSessionTemplate`

```java
@Bean
@ConditionalOnMissingBean
public SqlSessionTemplate sqlSessionTemplate(SqlSessionFactory sqlSessionFactory) {
	ExecutorType executorType = this.properties.getExecutorType();
	if (executorType != null) {
		// ★ 调用构造方法创建
		return new SqlSessionTemplate(sqlSessionFactory, executorType);
	} else {
		return new SqlSessionTemplate(sqlSessionFactory);
	}
}
```

2.  org.mybatis.spring.**SqlSessionTemplate**#`SqlSessionTemplate(SqlSessionFactory, ExecutorType)`

	```java
	public SqlSessionTemplate(SqlSessionFactory sqlSessionFactory, ExecutorType executorType) {
		this(
			sqlSessionFactory,
			executorType,
			 new MyBatisExceptionTranslator(sqlSessionFactory.getConfiguration().getEnvironment().getDataSource()
			,true));
	}
	```

    2.  <font color="red">创建SqlSession代理，管理SqlSession实例，自动创建|销毁</font>，**见SqlSession调用**

        ```java
        public SqlSessionTemplate(SqlSessionFactory sqlSessionFactory, ExecutorType executorType,
                                  PersistenceExceptionTranslator exceptionTranslator) {
            this.sqlSessionFactory = sqlSessionFactory;
            this.executorType = executorType;
            this.exceptionTranslator = exceptionTranslator;
            // ★ 创建SqlSession代理，管理SqlSession实例，自动创建|销毁
            this.sqlSessionProxy = (SqlSession) newProxyInstance(SqlSessionFactory.class.getClassLoader(),
                                    new Class[] { SqlSession.class }, new SqlSessionInterceptor());
        }
        ```

##### 创建SqlSession

###### 调用SqlSessionTemplate的query、update方法

1.  org.mybatis.spring.SqlSessionTemplate.**SqlSessionInterceptor**#`invoke`——>实现了`InvocationHandler`

	```java
	private class SqlSessionInterceptor implements InvocationHandler {
		@Override
		public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
			// * 第一次调用时，获取SqlSession
			SqlSession sqlSession = 
				getSqlSession(SqlSessionTemplate.this.sqlSessionFactory, SqlSessionTemplate.this.executorType,SqlSessionTemplate.this.exceptionTranslator);
			// 调用SqlSession的目标方法执行
			Object result = method.invoke(sqlSession, args);
			// 设置自动提交
			if (!isSqlSessionTransactional(sqlSession, SqlSessionTemplate.this.sqlSessionFactory)) {
				// 强制提交
				sqlSession.commit(true);
			}
			return result;
		}
	}
	```

2.  org.mybatis.spring.**SqlSessionUtils**#`getSqlSession`(SqlSessionFactory, ExecutorType, PersistenceExceptionTranslator)

	```java
	public static SqlSession getSqlSession(SqlSessionFactory sessionFactory, ExecutorType executorType,
										   PersistenceExceptionTranslator exceptionTranslator) {
		SqlSessionHolder holder = (SqlSessionHolder) TransactionSynchronizationManager.getResource(sessionFactory);
		SqlSession session = sessionHolder(executorType, holder);
		if (session != null) {
			return session;
		}
		// ★ 创建SqlSession
		session = sessionFactory.openSession(executorType);
		// 将SqlSession实例保存至TransactionSynchronizationManager
		registerSessionHolder(sessionFactory, executorType, exceptionTranslator, session);
		return session;
	}
	```

###### 创建SqlSession，执行调用

> 使用`DefaultSqlSessionFactory`创建`SqlSession`

1.  org.apache.ibatis.session.defaults.**DefaultSqlSessionFactory**#`openSession`(org.apache.ibatis.session.ExecutorType)

	```java
	@Override
	public SqlSession openSession(Connection connection) {
		return openSessionFromConnection(configuration.getDefaultExecutorType(), connection);
	}
	```

2.  org.apache.ibatis.session.defaults.DefaultSqlSessionFactory#`openSessionFromConnection`

	```java
	private SqlSession openSessionFromConnection(ExecutorType execType, Connection connection) {
		boolean autoCommit = connection.getAutoCommit();
		// 获取环境配置
		final Environment environment = configuration.getEnvironment();
		// 获取事务工厂
		TransactionFactory transactionFactory = getTransactionFactoryFromEnvironment(environment);
		// 创建事务
		Transaction tx = transactionFactory.newTransaction(connection);
		// 创建执行器
		Executor executor = configuration.newExecutor(tx, execType);
		// ★ 创建SqlSession
		return new DefaultSqlSession(configuration, executor, autoCommit);
	}
	```

    2.  初始化SqlSessionFactory时，调用`new SpringManagedTransactionFactory()`创建

        1. 

		```java
		// 事务工厂（type：子类全限定名）
		TransactionFactory factory = (TransactionFactory) resolveClass(type).getDeclaredConstructor().newInstance();
		// 例如：直接创建子类映射
		TransactionFactory factory = new SpringManagedTransactionFactory()
		```

    3.  根据执行器类型ExecutorType创建执行器Executor
	```java
	public Executor newExecutor(Transaction transaction, ExecutorType executorType) {
		executorType = executorType == null ? defaultExecutorType : executorType;
		executorType = executorType == null ? ExecutorType.SIMPLE : executorType;
		Executor executor;
		if (ExecutorType.BATCH == executorType) {
			executor = new BatchExecutor(this, transaction);
		} else if (ExecutorType.REUSE == executorType) {
			executor = new ReuseExecutor(this, transaction);
		} else {
			executor = new SimpleExecutor(this, transaction);
		}
		if (cacheEnabled) {
			executor = new CachingExecutor(executor);
		}
		// 执行器增强
		executor = (Executor) interceptorChain.pluginAll(executor);
		return executor;
	}
	```

#### Mybatis使用

##### 配置Configuration，指定全局配置信息

1. 使用`mybatis.config-location=xxx`指定主配置文件`mybatis-config.xml`

    1.  application.yml
	    ```property
		    mybatis.config-location=classpath:/mapper/config/mybatis-config.xml
	    ```

    2. mybatis-config.xml
	```xml
	<?xml version="1.0" encoding="UTF-8" ?>
	<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">
	<configuration>
		<!--settings：控制mybatis全局行为-->
		<settings>
			<!--设置mybatis输出日志-->
			<setting name="logImpl" value="STDOUT_LOGGING"/>
			<setting name="mapUnderscoreToCamelCase" value="true"/>
		</settings>
		<!--开启实体POJO类别名-->
		<typeAliases>
			<package name="com.example.springbootweb.pojo"/>
		</typeAliases>
		<!-- sql mapper(sql映射文件)的位置-->
		<mappers>
			<mapper resource="com/bjpowernode/dao/StudentDao.xml"/>
		</mappers>
	</configuration>
	```

2.  使用`application.properties`配置Configuration

	```property
	# 开启下划线与驼峰映射
	mybatis.configuration.map-underscore-to-camel-case=true
	# 开启Pojo实体别名
	mybatis.type-aliases-package=com.example.springbootweb.pojo
	# 指定Mapper映射文件的位置
	mybatis.mapper-locations=mapper/*.xml
	# 开启实体POJO类别名
	mybatis.type-aliases-package=com.example.springbootweb.pojo
	```

##### 指定Mapper.xml文件的位置

1.  使用xml文件（主配置文件中指定）

	```xml
	<mappers>
		<mapper resource="com/bjpowernode/dao/StudentDao.xml"/>
	</mappers>
	```

2.  使用`application.properties`

	```properties
	# 指定Mapper映射文件的位置（不能加lasspath:/）
	mybatis.mapper-locations=mapper/*.xml
	# 指定mybatis主配置文件的位置（一定要加classpath:/）
	mybatis.config-location=classpath:/mapper/config/mybatis-config.xml
	```

##### 创建Mapper.java接口文件

1.  第一种：使用@Insert注解直接标注Sql语句，无需mapper.xml文件

	```java
	@Mapper
	public interface GrmMapper {
		// 第一种：使用@Insert注解直接标注Sql语句，无需mapper.xml文件
		@Insert("insert into test(a) values (#{a})")
		int insertA(String a);
	}
	```

2.  第二种：与mapper.xml文件映射

    1.  mapper接口文件
	
		```java
		@Mapper
		public interface GrmMapper {
			// 第二种：与mapper.xml文件映射
			void i1(Pet pet);
		}
		```

    2.  mapper.xml文件

		```xml
		<?xml version="1.0" encoding="UTF-8" ?>
		<!DOCTYPE mapper
				PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
				"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
		
		<mapper namespace="com.example.springbootweb.dao.GrmMapper">
			<insert id="i1. parameterType="pet">
				insert into pet(name, age) value (#{name}, #{age});
			</insert>
		</mapper>
		```

##### 扫描Mapper.java接口文件

1.  在接口类上标注`@Mapper`注解或在启动类上标注`@MapperScan(basePackages = {"com.example.springbootweb.dao"})`

### Mybatis-Plus自动配置

> [插件注册](https://baomidou.com/pages/2976a3/#mybatisplusinterceptor)
> 
> [分页插件](https://baomidou.com/pages/97710a/)

1.  添加依赖

```xml
<dependency>
	<groupId>com.baomidou</groupId>
	<artifactId>mybatis-plus-boot-starter</artifactId>
	<version>3.5.2</version>
</dependency>
```

#### MybatisPlusAutoConfiguration

1.  自动注册了`SqlSessionFactory`、`SqlSessionTemplate`、绑定默认配置类`MybatisPlusProperties（prefix=mybatis-plus）`
2.  `mapperLocations`默认值取\*\*`classpath\*:/mapper/**/*.xml`**，即**任意包\*\*的类路径下的所有mapper文件夹，其下的所有`xxx.xml`文件

#### 使用Mybatis-Plus

1.  编写POJO类

	```java
	@Data
	// 指定表名
	@TableName("cat_nick")
	public class Cat {
		long id;
		String name;
		// 属性在数据库中不存在
		@TableField(exist = false)
		int age;
		double weight;
		boolean isSupper;
	}
	```

2.  Mapper层接口实现`BaseMapper<POJO>`，也可使用`@MapperScan("com.example.springbootweb")`

	```java
	@Mapper
	public interface CatMapper extends BaseMapper<Cat> {}
	```

3.  Service层接口继承`IService<POJO>`，Service层实现类继承`ServiceImpl<POJO>`

	```java
	public interface ICatService extends IService<Cat> {}
	```

	```java
	@Service
	public class CatServiceImpl extends ServiceImpl<CatMapper, Cat> implements ICatService {}
	```

4.  调用service

	```java
	@RequestMapping("/m4")
	public String m4(Cat cat) {
		boolean save = catService.save(cat);
		return save + "";
	}
	```

5.  分页插件适配

    1.  注册分页拦截器

	```java
	@Configuration
	public class CustomizedMybatisPlusConfiguration {
		@Bean
		public MybatisPlusInterceptor mybatisPlusInterceptor() {
			PaginationInnerInterceptor paginationInnerInterceptor = new PaginationInnerInterceptor();
			paginationInnerInterceptor.setDbType(DbType.MYSQL);
			MybatisPlusInterceptor mybatisPlusInterceptor = new MybatisPlusInterceptor();
			mybatisPlusInterceptor.addInnerInterceptor(paginationInnerInterceptor);
			return mybatisPlusInterceptor;
		}
	}
	```

    2.  使用分页插件

	```java
	@RequestMapping("/m5")
	public String m4(@RequestParam("pn") Integer pageNo) {
		// 指定初始页数和每页条数
		Page<Cat> catPage = new Page<>(pageNo, 2);
		Page<Cat> page = catService.page(catPage);
		return page.getRecords().toString();
	}
	```

### Redis自动配置

1.  依赖

	```xml
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-data-redis</artifactId>
	</dependency>
	```

#### RedisAutoConfiguration

> 1.  RedisTemplate\<Object,Object>
> 2.  StringRedisTemplate\<String,String>
> 3.  RedisConnectionFactory：Redis连接工厂

##### 创建`RedisTemplate<Object,Object>`

1.  设置Redis连接池

	```java
	@Bean
	@ConditionalOnMissingBean(name = "redisTemplate")
	public RedisTemplate<Object, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) throws UnknownHostException {
		RedisTemplate<Object, Object> template = new RedisTemplate<>();
		// ★ 设置Redis连接池
		template.setConnectionFactory(redisConnectionFactory);
		return template;
	}
	```

2.  创建`StringRedisTemplate<String,String>`

	```java
	@Bean
	@ConditionalOnMissingBean
	public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory redisConnectionFactory) throws UnknownHostException {
		StringRedisTemplate template = new StringRedisTemplate();
		// ★ 设置Redis连接池
		template.setConnectionFactory(redisConnectionFactory);
		return template;
	}
	```

##### 创建`RedisConnectionFactory`

> 1.  Spring提供Lettuce、Jedis两类连接工厂
>     1.  spring-boot-starter-data-redis中默认引入Lettuce的依赖
> 2.  redis连接四要素
>     1.  host、port、password、databaseId（库号）

###### JedisConnectionFactory

1.  单例redis配置

	```java
	protected final RedisStandaloneConfiguration getStandaloneConfig() {
		RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
		if (StringUtils.hasText(this.properties.getUrl())) {
			ConnectionInfo connectionInfo = parseUrl(this.properties.getUrl());
			config.setHostName(connectionInfo.getHostName());
			config.setPort(connectionInfo.getPort());
			config.setPassword(RedisPassword.of(connectionInfo.getPassword()));
		}
		else {
			// host
			config.setHostName(this.properties.getHost());
			// 端口
			config.setPort(this.properties.getPort());
			// 密码
			config.setPassword(RedisPassword.of(this.properties.getPassword()));
		}
		// 库号
		config.setDatabase(this.properties.getDatabase());
		return config;
	}
	```

#### Redis使用

1.  配置Redis

```properties
spring:
  redis:
	host: 172.20.32.76
	port: 6385
	password: kEb4LpAJQfpOo9mF
	database: 1.         
```

2.  注入RedisTemplate

```java
@Resource
private RedisTemplate<Object, Object> redisTemplate;

@Test
public void t1() {
	ValueOperations<Object, Object> operations = redisTemplate.opsForValue();
	redisTemplate.setValueSerializer(new GenericToStringSerializer<>(Long.class));
	operations.set("name", "billno");
	operations.increment("c1");
	operations.increment("c1");
	System.out.println(operations.get("c1"));
}
```