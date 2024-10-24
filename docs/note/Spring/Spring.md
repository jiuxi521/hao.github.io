---
title: Spring
createTime: 2024/10/24 16:40:01
permalink: /article/nu7i2eyd/
---
# Spring 使用

## Spring 组件

### FactoryBean

1. 通过`工厂bean的id`直接获取的是bean对象（通过调用`getObject()`方法获取的bean）
2. 通过`&工厂bean的id`获取的是工厂bean本身
3. [FactoryBeanTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/beanfactory/FactoryBeanTest.java)

### BeanFactory

```java
public interface BeanFactory {
    String FACTORY_BEAN_PREFIX = "&";
    // 通过名称获取Bean
    Object getBean(String name) throws BeansException;
    // 通过类型获取bean
    <T> T getBean(Class<T> requiredType) throws BeansException;
}
```

#### 接口

##### ConfigurableBeanFactory

配置容器的功能

##### AutowireCapableBeanFactory

让不受 spring 管理的类具有 spring 自动注入的特性，容器中不存在该类对象的定义<font color="#b7dde8">BeanDefinition</font>

```java
// 创建Bean
<T> T createBean(Class<T> beanClass);

// bean装配：对于bean中带有注解（@Value|@Inject|@Autowired）的属性，实现自动装配其属性
Object autowire(Class beanClass, int autowireMode, boolean dependencyCheck);
// 应用容器的Aware和BeanPostProcessor方法
Object initializeBean(Object existingBean, String beanName)

// bean初始化前处理器
Object applyBeanPostProcessorsBeforeInitialization(Object existingBean, String beanName);
// bean初始化后处理器
Object applyBeanPostProcessorsAfterInitialization(Object existingBean, String beanName)
```

#### 子类

##### DefaultListableBeanFactory

[DefaultListableBeanFactoryTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/beanfactory/DefaultListableBeanFactoryTest.java)

<img src="https://raw.gitmirror.com/jiuxi521/typora/master/202403071535534.png" alt="DefaultListableBeanFactory" style="zoom:50%;" />

##### AbstractAutowireCapableBeanFactory

抽象类——创建Bean的工具类

```java
// 创建Bean实例、填充bean、初始化bean
Object createBean(String beanName, RootBeanDefinition mbd, @Nullable Object[] args);
// 创建Bean实例
Object doCreateBean(String beanName, RootBeanDefinition mbd, @Nullable Object[] args);
// 填充bean属性
void populateBean(String beanName, RootBeanDefinition mbd, @Nullable BeanWrapper bw);
// 填充bean属性
void applyPropertyValues(String beanName, BeanDefinition mbd, BeanWrapper bw, PropertyValues pvs);
// 初始化bean
Object initializeBean(String beanName, Object bean, @Nullable RootBeanDefinition mbd);
```

### ApplicationContext

![ApplicationContext的实现类.png](https://raw.gitmirror.com/jiuxi521/typora/master/202403071547754.png)

#### 子类

> 1. [ApplicationContextTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/applicationcontext/ApplicationContextTest.java)

##### ClassPathXmlApplicationContext

> 从`classpath:`下读取配置文件

##### FileSystemXMLApplicationContext

> 1. 文件系统路径包括绝对路径（以`/`开头）和相对路径（不以`/`开头）

##### AnnotationConfigApplicationContext

> 1. 从Java 配置类读取配置文件
> 2. 后置处理器的加入<====>`<context:annotation-config/>`

##### AnnotationConfigServletWebServerApplicationContext

> 1. mvc项目必备的三大组件
>     1. ServletWebServerFactory：注册服务器，例如：Tomcat；
>     2. DispatcherServlet：请求转发
>     3. DispatcherServletRegistrationBean：注册DispatcherServlet到Tomcat服务器的关系

#### 实现的接口

![image-20230108123226661](https://raw.gitmirror.com/jiuxi521/typora/master/ApplicationContext接口.png)

##### HierarchicalBeanFactory

层次类型的容器特性，容器间存在层级关系，子容器找不到可以在父容器中寻找

##### ListableBeanFactory

将容器中的bean进行枚举，使用Map维护了beanDefinition、beanClass、beanName的映射关系；

```java
String[] getBeanDefinitionNames()：获取容器中所有bean的名称
String[] getBeanNamesForAnnotation(Class<? extends Annotation> annotationType)：获取标识指定注解的bean名称
Map<String, Object> getBeansWithAnnotation(Class<? extends Annotation> annotationType)：获取标识指定注解的bean对象
public <A extends Annotation> A findAnnotationOnBean(String beanName, Class<A> annotationType):获取指定bean的注解
```

##### ResourcePatternResolver

资源文件加载接口

<img src="https://raw.gitmirror.com/jiuxi521/typora/master/ResourceLoader.png" alt="ResourceLoader" style="zoom:50%;" />

1. ResourceLoader：使用相对|绝对路径匹配资源

```java
	public interface ResourceLoader {
		String CLASSPATH_URL_PREFIX = "classpath:";
	}
```

2. ResourcePatternResolver：使用通配符匹配资源

	```java
	public interface ResourcePatternResolver extends ResourceLoader {
		// 通配符匹配，可以获取jar包中的文件
		String CLASSPATH_ALL_URL_PREFIX = "classpath*:";
	
		Resource[] getResources(String locationPattern) throws IOException;
	}
	```

3. [ResourceLoaderTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/applicationcontext/ResourceLoaderTest.java)

##### MessageSource

国际化资源接口

<img src="https://raw.gitmirror.com/jiuxi521/typora/master/MessageSource.png" alt="image-20230113140225290" style="zoom:50%;" />

1. AbstractMessageSource

```java
public abstract class AbstractMessageSource extends MessageSourceSupport implements HierarchicalMessageSource {
	// 1.             public final String getMessage(String code, Object[] args, Locale locale) throws NoSuchMessageException {
		if (getMessageInternal(code, args, locale) != null) {
			return msg;
		}
	}
	// 2.
	protected String getMessageInternal(String code, @Nullable Object[] argsToUse, @Nullable Locale locale) {
		if (存在参数) {
			// 2.1 调用ResourceBundleMessageSource的方法
			return resolveCodeWithoutArguments(code, locale);
		} else {
			argsToUse = resolveArguments(args, locale);
		}
	}
}
```

2. AbstractResourceBasedMessageSource

```java
	// 基于资源包进行加载
	public abstract class AbstractResourceBasedMessageSource extends AbstractMessageSource {
		// 资源包的前缀集合
		private final Set<String> basenameSet = new LinkedHashSet<>(4);
		// 设置资源包的前缀
		public void setBasenames(String... basenames) {
			this.basenameSet.clear();
			if (!ObjectUtils.isEmpty(basenames)) {
				for (String basename : basenames) {
					Assert.hasText(basename, "Basename must not be empty");
					this.basenameSet.add(basename.trim());
				}
			}
		}
	}
```

3. ResourceBundleMessageSource

```java
public class ResourceBundleMessageSource {
	
	// 缓存basename和（locale + ResourceBundle）的映射
	Map<String, Map<Locale, ResourceBundle>> cachedResourceBundles = new ConcurrentHashMap<>();

	// 3.
	protected String resolveCodeWithoutArguments(String code, Locale locale) {
		for (String basename : getBasenameSet()) {
			// 加载资源包对应的locale语种
			ResourceBundle bundle = getResourceBundle(basename, locale);
			// 从Bundle中获取code对应的文本
			String result = getStringOrNull(bundle, code);
			if (result != null) {
				result;
			}
		}
	}
	// 3.1 从ResourceBundle获取key对应的Value
	protected String getStringOrNull(ResourceBundle bundle, String key) {
		if (bundle.containsKey(key)) {
			return bundle.getString(key);
		}
		return null;
	}

	protected ResourceBundle getResourceBundle(String basename, Locale locale) {
		return doGetBundle(basename, locale);
	}

	protected ResourceBundle doGetBundle(String basename, Locale locale) throws MissingResourceException {
		// ★ 获取资源Bundle
		return ResourceBundle.getBundle(basename, locale, classLoader);
	}
}
```

4. [MessageSourceTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/applicationcontext/MessageSourceTest.java)

ResourceBundle

##### ApplicationEventPublisher

容器事件发布 

```java
    public interface ApplicationEventPublisher {
        default void publishEvent(ApplicationEvent event) {
            publishEvent((Object) event);
        }
    }
```

2. [EventConfiguration](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/org/example/config/EventConfiguration.java)

##### EnviromentCapable

获取容器配置、系统配置

```java
public interface EnvironmentCapable {
	// 获取环境资源对象：使用PropertySourcesPropertyResolver 解析 MutablePropertySources
	// MutablePropertySources——>PropertiesPropertySource——>Properties对象——>xxx.properties文件
	Environment getEnvironment();
}
```

2. [EnvironmentCapableTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/EnvironmentCapableTest.java)

#### 策略模式

> IOC容器作为上下文对象，保存了`List<BeanPostProcessor>`和`List<BeanFactoryPostProcessor>`，可以在不修改refresh()方法的前提下，对bean和beanFactory进行扩展

```java
public abstract class AbstractApplicationContext extends DefaultResourceLoader implements ConfigurableApplicationContext {
    // ★ 上下文对象保存处理器集合的引用 
    private final List<BeanFactoryPostProcessor> beanFactoryPostProcessors = new ArrayList<>();

    public void addBeanFactoryPostProcessor(BeanFactoryPostProcessor postProcessor) {
        Assert.notNull(postProcessor, "BeanFactoryPostProcessor must not be null");
        this.beanFactoryPostProcessors.add(postProcessor);
    }

    public List<BeanFactoryPostProcessor> getBeanFactoryPostProcessors() {
        return this.beanFactoryPostProcessors;
    }

    protected void invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory) {
        // 通过助手类调用
        PostProcessorRegistrationDelegate.invokeBeanFactoryPostProcessors(beanFactory, getBeanFactoryPostProcessors());
    }
}

private static void invokeBeanDefinitionRegistryPostProcessors(
    Collection<? extends BeanDefinitionRegistryPostProcessor> postProcessors, BeanDefinitionRegistry registry, ApplicationStartup applicationStartup) {
    // ★ 遍历处理器，执行扩展增强
    for (BeanDefinitionRegistryPostProcessor postProcessor : postProcessors) {
        StartupStep postProcessBeanDefRegistry = applicationStartup.start("spring.context.beandef-registry.post-process")
            .tag("postProcessor", postProcessor::toString);
        postProcessor.postProcessBeanDefinitionRegistry(registry);
        postProcessBeanDefRegistry.end();
    }
}
```

### BeanFactoryPostProcessor

#### EventListenerMethodProcessor

> 解析@EventListener
> 
> [ApplicationEventListenerTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/org/example/listener/ApplicationEventListenerTest.java)

> 1. 通过EventListenerMethodProcessor**【实现SmartInitializingSingleton接口】**的`afterSingletonsInstantiated`处理`@EventListener`注解处理
>     1. org.springframework.context.event.**EventListenerMethodProcessor**#`processBean`

```java
private void processBean(final String beanName, final Class targetType) {
    // 存在@EventListener注解
    if (!this.nonAnnotatedClasses.contains(targetType) &&AnnotationUtils.isCandidateClass(targetType, EventListener.class) && !isSpringContainerClass(targetType)) {
        // 获取存在EventListener的方法
        Map<Method, EventListener> annotatedMethods =  = MethodIntrospector.selectMethods(targetType,(MethodIntrospector.MetadataLookup<EventListener>) method ->AnnotatedElementUtils.findMergedAnnotation(method, EventListener.class));

        ConfigurableApplicationContext context = this.applicationContext;

        List<EventListenerFactory> factories = this.eventListenerFactories;

        // ★ 遍历标注@EventListener的方法集
        for (Method method : annotatedMethods.keySet()) {
            for (EventListenerFactory factory : factories) {
                if (factory.supportsMethod(method)) {
                    // 获取目标方法
                    Method methodToUse = AopUtils.selectInvocableMethod(method, context.getType(beanName));
                    // 创建监听器
                    ApplicationListener applicationListener =
                        factory.createApplicationListener(beanName, targetType, methodToUse);
                    if (applicationListener instanceof ApplicationListenerMethodAdapter) {
                        ((ApplicationListenerMethodAdapter) applicationListener).init(context, this.evaluator);
                    }
                    // 将监听器加入上下文
                    context.addApplicationListener(applicationListener);
                    break;
                }
            }
        }
    }
}
```

##### DefaultEventListenerFactory

> @EventListener注解解析工厂

```java
public interface EventListenerFactory {

    boolean supportsMethod(Method method);

    ApplicationListener createApplicationListener(String beanName, Class type, Method method);
}
```

#### BeanDefinitionRegistryPostProcessor

<img src="https://raw.gitmirror.com/jiuxi521/typora/master/MapperScannerConfigurer.png" alt="MapperScannerConfigurer" style="zoom:50%;" />

[ConfigurationClassPostProcessorTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/processor/ConfigurationClassPostProcessorTest.java)

1. MapperScannerConfigure#postProcessBeanDefinitionRegistry: 
    1. 处理@Mapper注解，将接口类的实现加入容器；
    2. 获取@MapperScan注解的basePackage属性；将所有@Mapper接口完成bean定义注册，也就是加入容器（registerBeanDeginition）
2. ConfigurationClassPostProcessor#postProcessBeanDefinitionRegistry: 
    1. 处理@ComponentScan、@Configuration、@Bean、@Import、@ImportResource
    2. [ConfigurationClassPostProcessorTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/processor/ConfigurationClassPostProcessorTest.java)

### BeanDefinition

#### BeanDefinitionRegistry

```java
// 将bean定义注册至容器
void registerBeanDefinition(String beanName, BeanDefinition beanDefinition); 
// 根据beanName获取bean定义
BeanDefinition getBeanDefinition(String beanName);
// 注册别名
void registerAlias(String name, String alias);
// 获取别名
String[] getAliases(String name);
```

#### BeanDefinitionBuilder

构建BeanDefinition

### BeanPostProcessor

> [BeanPostProcessorTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/processor/BeanPostProcessorTest.java)

#### CommonAnnotationBeanPostProcessor

> 解析@Resource注解
> 
> [CommonAnnotationBeanPostProcessorTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/processor/CommonAnnotationBeanPostProcessorTest.java)

#### AutowiredAnnotationBeanPostProcessor

> @Autowired 、@Value、@Inject
> 
> [AutowiredAnnotationBeanPostProcessorTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/processor/AutowiredAnnotationBeanPostProcessorTest.java)
> 
> 需要搭配：ContextAnnotationAutowireCandidateResolver、StringValueResolver

##### AutowireCandidateResolver

> `ContextAnnotationAutowireCandidateResolver`
> 
> @Qualifier、@Lazy注解解析助手，支持@Value的属性值匹配

```java
// org.springframework.beans.factory.support.DefaultListableBeanFactory#autowireCandidateResolver
public interface AutowireCandidateResolver {
	@Nullable
	default Object getLazyResolutionProxyIfNecessary(DependencyDescriptor descriptor, @Nullable String beanName) {
		return null;
	}
	default boolean isAutowireCandidate(BeanDefinitionHolder bdHolder, DependencyDescriptor descriptor) {
		return bdHolder.getBeanDefinition().isAutowireCandidate();
	}
}
```

##### StringValueResolver

> `new StandardEnvironment()::resolvePlaceholders`
<!--SR:!2024-03-27,3,250-->
> 
> `${}`占位符解析器

```java
// org.springframework.beans.factory.support.AbstractBeanFactory#embeddedValueResolvers
public interface StringValueResolver {
	// 解析strValue，返回实际值
	String resolveStringValue(String strVal);
}
```

### Aware

> initializeBean时调用，对bean对象进行增强

#### BeanNameAware

```java
void setBeanName(String name);		// 设置bean名称
```

#### BeanFactoryAware

```java
// 设置Bean的BeanFactory属性
void setBeanFactory(BeanFactory beanFactory);
```

#### ApplicationContextAware

```java
// 填充Bean的ApplicationContext属性
void setApplicationContext(ApplicationContext applicationContext);
```

#### PropertyResourceConfigurer

子类：PropertyOverrideConfigurer

```properties
使用配置文件.properties中的配置覆盖bean的默认配置（属性的默认值）
配置行应采用以下形式：
    beanName.property=value
示例属性文件：
    dataSource.driverClassName=com.mysql.jdbc.Driver
    dataSource.url=jdbc:mysql:mydb
```

子类：PropertyPlaceholderConfigurer

属性资源配置器：解析XML、注解上的占位符，与资源文件.properties匹配

```properties
# bean.xml
<bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
    <property name="driverClassName" value="${driver}" />
    <property name="url" value="jdbc:${dbname}" />
</bean>

@Value("${driver}")
private String driver;

# application.properties
driver=com.mysql.jdbc.Driver
dbname=mysql:mydb
```

## Spring注解

### 组件注册

> Bean注入： @Repository 、@Controller、 @Service 、@Component

#### @ImportResource

> 引入指定的xml配置文件

1. 可以标注在类上

```java
@ImportResource("classpath:/spring-bean.xml")
```

#### @Configuration

> 1. proxyBeanMethods
>    1. 是否代理bean方法
>    2. 默认true，通过配置类的bean方法，获取的是单例bean（一个被代理的bean，调用实例方法，返回同一个实例对象）
>    3. 如果为false，每次调用均新建对象
> 2. 解决组件依赖：
>    1.  proxyBeanMethods=true： Full模式，A组件被B组件依赖，B组件获取时，必须判断A组件是否已存在（单例），启动较慢
>    2.  proxyBeanMethods=false：Lite模式，A组件不被其他组件依赖，无须判断是否已存在

```java
@Configuration(proxyBeanMethods=true)
public class Configuration01. 	@Bean("dog1")
    public Pet dog2(){
        return new Pet("dog");
    }
    public User user01(){
        User user = new User();
        // User依赖Pet，dog()返回必须是同一个bean
        user.setPet(dog2());
        return user;
    }
}
```

#### @ConfigurationProperties

1. [ConfigurationProperties](/Spring Boot.md/#@ConfigurationProperties)
1. [Spring boot](Spring Boot.md)

#### @Bean

> [BeanScanBeanFactoryPostProcessor](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/processor/ConfigurationClassPostProcessorTest.java)

1. 使用`initMethod`属性可指定初始化方法
    1. 对象创建完成后，调用初始化方法
2. 使用`destroyMethod`属性指定bean销毁方法
   1. singleton bean：容器关闭时调用
   2. prototype bean：容器不管理bean的销毁

##### @Scope

> [ScopeTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/applicationcontext/scope/ScopeTest.java)

1. 取值

   1. prototype：原型。多实例模式，每次获取都重新创建一个bean
   2. singleton：单例。单实例模式，每次获取的都是同一个bean。根据是否懒加载定义bean的创建时机
   3. request：请求作用域
   4. session：会话作用域（<font color='red'>不同浏览器属于不同的会话</font>）
   5. application：应用级作用域

##### @Lazy

1. 仅在**单例模式**有意义
2. 是否懒加载：懒加载指容器创建时，不加载bean；直到第一次获取bean时，创建该bean

#### @Import

> [@ImportTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/org/example/config/ImportTest.java)
> 
> `@Import({Dao1.class, MyImportSelector.class, MyImportBeanDefinitionRegistrar.class})`

1. 将组件导入容器中，调用指定类的无参构造方法，默认**bean的id=类的全限定名**

2. 使用ImportSelector的实现类指定。默认**bean的id=类的全限定名**

   ```java
      public class MyImportSelector implements ImportSelector {
          @Override
          public String[] selectImports(AnnotationMetadata importingClassMetadata) {
              // 返回引入类的集合
              return new String[]{"org.example.dao.Dao1"};
          }
      }
      ```

3. 使用ImportBeanDefinitionRegistrar的实现类指定

   ```java
      public class MyImportBeanDefinitionRegistrar implements ImportBeanDefinitionRegistrar {
          @Override
          public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
              registry.registerBeanDefinition("dao1", new RootBeanDefinition(Dao1.class));
          }
      }
      ```

#### @ComponentScan

> [ComponentScanBeanFactoryPostProcessor](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/processor/ConfigurationClassPostProcessorTest.java)

1. basePackages：指扫描的包，默认扫描配置类所在包及其子包
2. excludeFilters：排除的类，通过注解、正则等指定
3. includeFilters：需要扫描的类，必须同`useDefaultFilters = false`一同使用，关闭默认的扫描策略

### 属性赋值

#### @PropertySource

> 引入外部的`properties`配置文件

```java
@PropertySource("classpath:/application.properties")

// 等同于xml配置的：<context:property-placeholder location="classpath:/application.properties"/>
```

#### @Value

1. 映射配置属性的值

   1. 使用`${}`占位符
   2. 使用SPEL表达式`#{}`
   3. 使用`基本数据类型`

2. 指定默认值
	1. 可使用`${dog.age:defaultValue}`指定默认值

4. 可通过注入`PropertySourcesPlaceholderConfigurer`保证：当属性映射错误时，抛出异常，容器启动失败

   ```java
      @Bean
      public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
          return new PropertySourcesPlaceholderConfigurer();
      }
      ```

4. 代码

   ```java
      @ToString
      @Data
      public class Dog {
          @Value("${dog.name}")
          String name;
          @Value("${dog.age:12}")
          int age;
          @Value("#{2-1}")
          int level;
          @Value("文本")
          String backup;
      }
      ```

### 组件装配

> 1. @Autowired、@Inject、@Value、@Resource注解由Spring的BeanPostProcessor实现了处理。
>     1. 在BeanPostProcessor、BeanFactoryPostProcessor中使用<font color='red'>**注入类**</font>注解，将导致注解失效
> 2. [@Autowired注解官方文档](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-autowired-annotation)
> 3. [AutowiredTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/org/example/config/AutowiredTest.java)

#### @Autowired

> @Qualifier：优先级最高。
> 
> @Autowired：优先按照**类型匹配**，当有多个时，先看是否指定了**value属性**，之后再使用**变量名称**与bean的name匹配

1. 属性`required`：设置注入的bean是否必须存在
2. 标注位置

   1. 标注在属性上

      1. 标注在构造方法上，如果只有一个构造方法，可不标注注解@Autowired

      2. 标注在`setXXX()`方法上
      3. 标注在集合、数组类型的属性上
   2. 标注在普通方法上
      1. 标注在具有任意名称和多个参数的方法

##### @Qualifier

> 明确指定bean，<font color='red'>优先级最高</font>
> 
> `@Qualifier("beanId")`明确指定bean

##### @Primary

1. 指定<font color='red'>候选bean</font>中优先级最高的bean，<font color='red'>与`@Qualifier`冲突</font>

##### @Order

1. @Order由Spring提供
2. @Priority和@Order都是数值越小，优先级越高
3. @Priority优先级高于@Order

##### @Priority

1. @Priority由`javax.annotation`提供
2. @Priority侧重于单个注入的优先级排序；
3. @Priority注解可以控制组件的注入顺序，搭配@Autowired注入集合或数组中使用

#### @Resource

1. Java提供的注解
2. 默认通过**组件名称**装配
3. 通过`@Resource(name="bookDao2")`的name属性可以指定
4. <font color='red'>不支持`@Qualifier`和`@Primary`</font>

#### @Inject

1. 需要导入`javax.inject`依赖
2. 效果与@Autowired相同，但没有`required`属性

#### 装配优先级

1. @Qualifier指定的bean > @Primary指定的bean > @Priority数值较小指定的bean > @Order数值较小指定的bean || 组件实现Ordered接口

    ```java
       public class User implements Ordered {
           @Override
           public int getOrder() {
               return 0;
           }
       }
       ```

#### 自动装配非必选

1. @Autowired的require属性

2. 使用@Nullable注解

```java
  @Bean
  Student student4(@Nullable User user) {
	  return new Student();
  }
  ```

3. 使用`Optional<T>`

   ```java
      @Bean
      Student student4(Optional<User> user) {
          return new Student();
      }
      ```

### 事件监听

#### @EventListener

> 1. 监听事件：监听ApplicationEvent的子类
>     1. 监听ContextRefreshedEvent：容器刷新事件
>     2. 监听ContextClosedEvent：容器关闭事件
> 2. 发布自定义事件
> 3. 自定义监听器
>     1. 实现`ApplicationListener<ApplicationEvent>`接口
>     2. 对任意方法标注`@EventListener`注解
> 4. [ApplicationEventListenerTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/org/example/listener/ApplicationEventListenerTest.java)

# Spring 面试

## Bean的生命周期

1. 实例化Bean：在堆内存中申请空间，对象属性一般是默认值。通过反射调用构造函数创建[createBeanInstace](#createBeanInstance)
2. 属性赋值：
   1. 自定义属性赋值：[populateBean](#populateBean)
   2. 容器对象属性赋值：[invokeAwareMethods](#invokeAwareMethods)
3. 执行增强：一般情况下，当完成对象的创建和属性的赋值之后，对象就可以直接拿来进行使用了。在spring框架中，创建好对象之后还要考虑一件事：<font color='red'>对象增强的操作：AOP等 </font>：[wrapIfNecessary](#wrapIfNecessary)
   1. 执行前置处理方法：[postProcessBeforeInitialization](#postProcessBeforeInitialization)
   2. 执行初始化方法：[invokeInitMethod](#invokeInitMethod)
      1. 给bean的属性赋值或调用任意方法：[afterPropertiesSet](#afterPropertiesSet)
   3. 执行后置处理方法：[postProcessAfterInitialization](#postProcessAfterInitialization)
4. 使用bean：getBean()
5. 销毁bean

## Bean的初始化和销毁时机

> [InitAndDestroyTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/ioc/applicationcontext/InitAndDestroyTest.java)

### 调用时机

1. 使用@Bean的`initMethod`和`DestroyMethod`属性
2. 实现`InitializingBean#afterPropertiesSet`和`DisposableBean#destroy`
3. 使用`@PostConstruct`和`@PreDestroy`标注方法

### 调用顺序

1. @PostConstruct注解（CommonAnnotationBeanFactoryPostProcessor#`applyBeanPostProcessorsBeforeInitialization`）
2. 实现接口（invokeInitMethods——>`afterPropertiesSet`）
3. @Bean标注（invokeInitMethods——>`invokeCustomInitMethod`） 

### 实现BeanPostProcessor：在bean初始化前后做一些处理

1. BeanPostProcessor

    1. postProcessBeforeInitialization：**初始化方法执行之前**调用

    2. postProcessAfterInitialization：**初始化方法执行之后**调用

2. 源码

    1. org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory#initializeBean(String, Object, RootBeanDefinition)

	```java
	Object wrappedBean = bean;
	// ★ 初始化方法调用之前
	wrappedBean = applyBeanPostProcessorsBeforeInitialization(wrappedBean, beanName);
	// ★ 调用初始化方法
	invokeInitMethods(beanName, wrappedBean, mbd);
	// ★ 初始化方法调用之后
	wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
	```

3. 代码：

```java
	// 需要将处理器注入容器
	@Component
	public class MyBeanPostProcessor implements BeanPostProcessor {
		@Override
		public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
			System.out.println(String.format("beanName:%s,初始化方法执行之后调用", beanName));
			return BeanPostProcessor.super.postProcessAfterInitialization(bean, beanName);
		}
	
		@Override
		public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
			System.out.println(String.format("beanName:%s,初始化方法执行之前调用", beanName));
			return BeanPostProcessor.super.postProcessBeforeInitialization(bean, beanName);
		}
	}
```

## BeanFactory和FactoryBean的区别

1. BeanFactory：必须遵循完整的bean的生命周期来进行对象的创建，相当于是<font color='red'>流水线的标准化工作</font>
2. FactoryBean：<font color='red'>等同于用户的私人订制的工作</font>，可按照用户的需求，对bean进行定制化（返回对象、返回代理后的对象）
   1. isSingleton：是否是单例对象
   2. getObjectType：获取对象类型
   3. getObject：获取创建的对象

## IOC和AOP的关系

1. AOP是整个IOC执行流程中的某个扩展点实现

## 如何解决循环依赖

> <font color='blue'>**使用三级缓存，提前暴露对象引用**</font><font color='red'>（bean的实例化与初始化是分开的）</font>

<img src="https://raw.gitmirror.com/jiuxi521/typora/master/循环依赖.png" alt="image-20221231210926914" style="zoom: 50%;" />

1. 依次创建Bean对象：[preInstantiateSingletons](#preInstantiateSingletons)
   1. 创建A对象：[doCreateBean](#doCreateBean)
      1. 调用[getSingleton(String,boolean)](#getSingleton(String,boolean))从缓存中获取，返回null
      2. 开始创建对象[createBeanInstance](#createBeanInstance)
      3. <font color='red'>将A对象^ObjectFactory引用^加入三级缓存</font>：[addSingletonFactory](#addSingletonFactory)
      4. 对A对象的属性赋值：[populateBean](#populateBean)#[applyPropertyValues](#applyPropertyValues)
         1. 解析属性值：[resolveValueIfNecessary](#resolveValueIfNecessary)，发现b引用
         2. 解析b引用：[resolveReference](#resolveReference)，**准备创建B**
      5. 创建B对象：[doCreateBean](#doCreateBean)
         1. 调用[getSingleton(String,boolean)](#getSingleton(String,boolean))从缓存中获取，返回null
         2. 开始创建B^半^对象[createBeanInstance](#createBeanInstance)
         3. <font color='red'>将B^ObjectFactory引用^对象加入三级缓存</font>：[addSingletonFactory](#addSingletonFactory)
         4. 对B对象的属性赋值：[populateBean](#populateBean)#[applyPropertyValues](#applyPropertyValues) 
            1. 解析属性值：[resolveValueIfNecessary](#resolveValueIfNecessary)，发现a引用
            2. 解析a引用：[resolveReference](#resolveReference)
               1. 调用[doGetBean()](#doGetBean)#[getSingleton(String,boolean)](#getSingleton(String,boolean))返回A对象^半^，<font color='red'>将A对象^半^加入二级缓存，从三级缓存中移除</font>
         5. 完成B对象的属性赋值，此时B对象^全^
         6. 调用[addSingleton(String,Object)](#addSingleton(String,Object))，<font color='red'>将B对象^全^加入一级缓存，从三级缓存中移除</font>
      6. 完成A对象的属性赋值，此时A对象^全^
      7. 调用[addSingleton(String,Object)](#addSingleton(String,Object))，<font color='red'>将A对象^全^加入一级缓存，从二级缓存中移除</font>
   2. 创建B对象：[doCreateBean](#doCreateBean)
      1. 调用[getSingleton(String,boolean)](#getSingleton(String,boolean))，从一级缓存中发现B对象，直接返回
2. 完成Bean：A,B的创建

<img src="https://raw.gitmirror.com/jiuxi521/typora/master/循环依赖2.png" alt="image-20230101145636194" />

### 三个缓存Map分别存储什么对象

```java
public class DefaultSingletonBeanRegistry extends SimpleAliasRegistry implements SingletonBeanRegistry {
  // 一级缓存：单例对象的缓存：Bean名称到Bean实例。
  private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);

  // 三级缓存：单例工厂的缓存：保存bean和创建bean的工厂【存、取都加入了synchronized操作】
  private final Map<String, ObjectFactory> singletonFactories = new HashMap<>(16);

  // ★ 二级缓存：保存beanName和创建bean实例之间的关系；与singletonFactories的区别：当一个单例bean被保存在earlySingletonObjects后，就可以通过getBean()方法获取到，方便进行循环依赖的检测
  private final Map<String, Object> earlySingletonObjects = new ConcurrentHashMap<>(16);
}
```

1.  一级缓存：保存成品
2.  二级缓存：保存半成品
3.  三级缓存：保存ObjectFactory的lambda表达式

### 三级缓存的存取

1.  org.springframework.beans.factory.support.DefaultSingletonBeanRegistry#addSingletonFactory

```java
protected void addSingletonFactory(String beanName, ObjectFactory singletonFactory) {
  Assert.notNull(singletonFactory, "Singleton factory must not be null");
  synchronized (this.singletonObjects) {
	if (!this.singletonObjects.containsKey(beanName)) {
	  // 存
	  this.singletonFactories.put(beanName, singletonFactory);
	  this.earlySingletonObjects.remove(beanName);
	  this.registeredSingletons.add(beanName);
	}
  }
}
```

2.  org.springframework.beans.factory.support.DefaultSingletonBeanRegistry#getSingleton(java.lang.String, boolean)

```java
	protected Object getSingleton(String beanName, boolean allowEarlyReference) {
	  // Quick check for existing instance without full singleton lock
	  Object singletonObject = this.singletonObjects.get(beanName);
	  if (singletonObject == null && isSingletonCurrentlyInCreation(beanName)) {
		singletonObject = this.earlySingletonObjects.get(beanName);
		if (singletonObject == null && allowEarlyReference) {
		  synchronized (this.singletonObjects) {
			// Consistent creation of early reference within full singleton lock
			singletonObject = this.singletonObjects.get(beanName);
			if (singletonObject == null) {
			  singletonObject = this.earlySingletonObjects.get(beanName);
			  if (singletonObject == null) {
				ObjectFactory singletonFactory = this.singletonFactories.get(beanName);
				if (singletonFactory != null) {
				  // 取
				  singletonObject = singletonFactory.getObject();
				  this.earlySingletonObjects.put(beanName, singletonObject);
				  // 移除
				  this.singletonFactories.remove(beanName);
				}
			  }
			}
		  }
		}
	  }
	  return singletonObject;
	}
```

### 可以只使用一个Map缓存么？

1.  可以，但是不优雅，map的key是bean的name，要求唯一，故只能在value上打标识，需要频繁判断

### 可以只使用两个Map缓存么？

1.  可以，但要求循环依赖的对象对象不能是动态代理对象
2.  因为动态代理的创建，需要经过三级缓存的[ObjectFactory#getObject()](#ObjectFactory#getObject())方法，最终调用[getEarlyBeanReference](#getEarlyBeanReference)对实例进行代理增强

### 三级缓存是如何解决循环依赖问题的？

1.  创建代理对象的时候是否需要创建原始对象？
    1.  需要，因为bea的生命周期是固定的，每次在对象创建的时候必须要先创建出原始对象
2.  同一个容器中能同时存在同名的不同对象吗？
    1.  不能
3.  如果同时存在了原始对象和代理对象，怎么办？
    1.  当对外暴露的时候应该使用代理对象，覆盖原始对象【以代理对象作为最终版本】
4.  为什么加了一个三级缓存就可以解决这个问题？
    1.  在整个bean的生命周期中，bean对象的属性赋值(populateBean)在前执行，而bean动态代理对象(BeanPostProcessor的后置处理方法)的创建在后执行。
    2.  按照正常的流程，先进行对象属性的赋值，而对象属性的赋值过程引用的都是原始对象，当赋值完成之后才会进行代理对象的创建，那么此时引用的对象必然不是最终版本的bean对象
5.  如果想解决这个问题的话，怎么办？
    1.  需要将代理对象的创建过程前置，也就是说在进行对象的属性赋值的时候，在设置具体的值之前，必须要唯一性的确定出到底是代理对象还是原始对象
6.  为什么要用lambda表达式呢？
    1.  因为在方法调用的时候ambda表达式并不会立刻执，行，在设置值具体确定的前一个步骤，回调即可，就可以唯一性的确定好是用代理对象还是原始对象了

## 实例化单例Bean的增强时机 

### 创建Bean

1. AbstractAutowireCapableBeanFactory#`createBean`(String,RootBeanDefinition,Object[])
    1. Bean创建之前有一个时机，AbstractAutowireCapableBeanFactory#resolveBeforeInstantiation
        1. 调用InstantiationAwareBeanPostProcessor#postProcessBeforeInstantiation获取实例
        2. 如果实例不为null，调用BeanPostProcessor#postProcessAfterInitialization初始化bean
        3. 初始化完成后，直接返回该Bean
    2. Bean的创建
        1. 在内存中创建Bean
        2. 允许修改Bean定义：调用MergedBeanDefinitionPostProcessor#postProcessMergedBeanDefinition【创建好但未进行属性赋值】
        3. 进行属性赋值：<font color='red'>进行依赖注入：解析</font>
            1. 允许提前进行属性赋值，并控制是否继续进行属性赋值：调用InstantiationAwareBeanPostProcessor#postProcessAfterInstantiation【未进行属性赋值之前】
            2. 对PropertyValues或Bean进行处理：InstantiationAwareBeanPostProcessor#postProcessProperties 
            3. 给自定义的属性赋值：AbstractAutowireCapableBeanFactory#applyPropertyValues
        4. 初始化Bean
            1. 给容器的属性赋值：AbstractAutowireCapableBeanFactory#invokeAwareMethods
                1. BeanNameAware|BeanClassLoaderAware|BeanFactoryAware
            2. 初始化之前调用：BeanPostProcessor#postProcessBeforeInitialization
            3. 调用初始化方法：AbstractAutowireCapableBeanFactory#invokeInitMethods
                1. 实现InitializingBean接口，调用afterPropertiesSet()初始化
                2. 如果指定了init-method ，调用指定的方法完成初始化
            4. 初始化之后调用：BeanPostProcessor#postProcessAfterInitialization
        5. 给bean指定销毁方法
            1. 实现DisposableBean接口，实现销毁方法destroy()
            2. 指定destroy-method，
            3. 实现AutoCloseable接口，实现关闭方法close()
2. 容器中所有的单实例Bean都创建&初始化完成后调用的：SmartInitializingSingleton的afterSingletonsInstantiated()

### 销毁Bean

1. 调用DestructionAwareBeanPostProcessors#postProcessBeforeDestruction执行销毁方法

## BeanFactory的增强时机

1. 修改Bean定义：BeanDefinitionRegistryPostProcessor#postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry)【IOC初始化完成】
2. 修改Bean工厂的配置：BeanFactoryPostProcessor#postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory)

## Spring中用到的设计模式

1. [适配器模式](#适配器模式)
2. [责任链模式](#责任链模式)
3. 模板方法模式
    1. AbstractApplicationContext的refresh方法以及调用的方法，可以被子类重写，进行扩展
    2. [refresh](refresh())
4. [策略模式](#策略模式)

# Spring IOC

> 1. Bean工厂实现应该尽可能地支持标准Bean生命周期接口。完整的初始化方法及其标准顺序为：
>    1. BeanNameAware's setBeanName
>    2. BeanClassLoaderAware's setBeanClassLoader
>    3. BeanFactoryAware's setBeanFactory
>    4. EnvironmentAware's setEnvironment
>    5. EmbeddedValueResolverAware's setEmbeddedValueResolver
>    6. ResourceLoaderAware's setResourceLoader (only applicable when running in an application context)
>    7. ApplicationEventPublisherAware's setApplicationEventPublisher (only applicable when running in an application context)
>    8. MessageSourceAware's setMessageSource (only applicable when running in an application context)
>    9. ApplicationContextAware's setApplicationContext (only applicable when running in an application context)
>    10. ServletContextAware's setServletContext (only applicable when running in a web application context)
>    11. postProcessBeforeInitialization methods of BeanPostProcessors
>    12. InitializingBean's afterPropertiesSet
>    13. a custom init-method definition(InitializingBean‘s afterPropertiesSet)
>    14. postProcessAfterInitialization methods of BeanPostProcessors
> 2. 在关闭bean工厂时，应用以下生命周期方法:
>    1. postProcessBeforeDestruction methods of DestructionAwareBeanPostProcessors
>    2. DisposableBean's destroy
>    3. a custom destroy-method definition

```java
public AnnotationConfigApplicationContext(Class... componentClasses) {
    // 创建 IOC容器：DefaultListableBeanFactory
    this();
    // 注册配置类
    register(componentClasses);
    // 容器刷新运行
    refresh();
}
```

## this()

> AnnotationConfigApplicationContext——>GenericApplicationContext——>AbstractApplicationContext——>DefaultResourceLoader

### AnnotatedBeanDefinitionReader

1. 创建注解解析器和扫描器：org.springframework.context.annotation.**AnnotationConfigApplicationContext**#`AnnotationConfigApplicationContext`()

   ```java
      public AnnotationConfigApplicationContext() {
          this.reader = new AnnotatedBeanDefinitionReader(this);
          this.scanner = new ClassPathBeanDefinitionScanner(this);
      }
      ```

#### AnnotatedBeanDefinitionReader

1. org.springframework.context.annotation.**AnnotatedBeanDefinitionReader**#`AnnotatedBeanDefinitionReader`(BeanDefinitionRegistry, Environment)

   ```java
      public AnnotatedBeanDefinitionReader(BeanDefinitionRegistry registry, Environment environment) {
          Assert.notNull(registry, "BeanDefinitionRegistry must not be null");
          Assert.notNull(environment, "Environment must not be null");
          this.registry = registry;
          // 解析@Conditional注解
          this.conditionEvaluator = new ConditionEvaluator(registry, environment, null);
          // ★ 给factory中添加注解处理器的定义
          AnnotationConfigUtils.registerAnnotationConfigProcessors(this.registry);
      }
      ```

#### AnnotationConfigUtils

1. org.springframework.context.annotation.**AnnotationConfigUtils**#`registerAnnotationConfigProcessors`(BeanDefinitionRegistry,Object)

   ```java
      public static Set<BeanDefinitionHolder> registerAnnotationConfigProcessors(
          BeanDefinitionRegistry registry, @Nullable Object source) {
          // 获取IOC容器：DefaultListableBeanFactory类型直接返回；GenericApplicationContext类型获取beanFactory属性
          DefaultListableBeanFactory beanFactory = unwrapDefaultListableBeanFactory(registry);
          if (beanFactory != null) {
              if (!(beanFactory.getDependencyComparator() instanceof AnnotationAwareOrderComparator)) {
                  // 支持 Ordered实现类，@Order、@Priority注解的比较器
                  beanFactory.setDependencyComparator(AnnotationAwareOrderComparator.INSTANCE);
              }
              if (!(beanFactory.getAutowireCandidateResolver() instanceof ContextAnnotationAutowireCandidateResolver)) {
                  // 支持解析@Lazy、@Qualifier、@Value 注解
                  beanFactory.setAutowireCandidateResolver(new ContextAnnotationAutowireCandidateResolver());
              }
          }
      
          Set<BeanDefinitionHolder> beanDefs = new LinkedHashSet<>(8);
      
          // ConfigurationClassPostProcessor
          if (!registry.containsBeanDefinition(CONFIGURATION_ANNOTATION_PROCESSOR_BEAN_NAME)) {
              RootBeanDefinition def = new RootBeanDefinition(ConfigurationClassPostProcessor.class);
              def.setSource(source);
              beanDefs.add(registerPostProcessor(registry, def, CONFIGURATION_ANNOTATION_PROCESSOR_BEAN_NAME));
          }
          // AutowiredAnnotationBeanPostProcessor
          if (!registry.containsBeanDefinition(AUTOWIRED_ANNOTATION_PROCESSOR_BEAN_NAME)) {
              RootBeanDefinition def = new RootBeanDefinition(AutowiredAnnotationBeanPostProcessor.class);
              def.setSource(source);
              beanDefs.add(registerPostProcessor(registry, def, AUTOWIRED_ANNOTATION_PROCESSOR_BEAN_NAME));
          }
      
          // CommonAnnotationBeanPostProcessor
          if (jsr250Present && !registry.containsBeanDefinition(COMMON_ANNOTATION_PROCESSOR_BEAN_NAME)) {
              RootBeanDefinition def = new RootBeanDefinition(CommonAnnotationBeanPostProcessor.class);
              def.setSource(source);
              beanDefs.add(registerPostProcessor(registry, def, COMMON_ANNOTATION_PROCESSOR_BEAN_NAME));
          }
      
          // Check for JPA support, and if present add the PersistenceAnnotationBeanPostProcessor.
          if (jpaPresent && !registry.containsBeanDefinition(PERSISTENCE_ANNOTATION_PROCESSOR_BEAN_NAME)) {
              RootBeanDefinition def = new RootBeanDefinition();
              try {
                  def.setBeanClass(ClassUtils.forName(PERSISTENCE_ANNOTATION_PROCESSOR_CLASS_NAME,
                                                      AnnotationConfigUtils.class.getClassLoader()));
              }
              catch (ClassNotFoundException ex) {
                  throw new IllegalStateException(
                      "Cannot load optional framework class: " + PERSISTENCE_ANNOTATION_PROCESSOR_CLASS_NAME, ex);
              }
              def.setSource(source);
              beanDefs.add(registerPostProcessor(registry, def, PERSISTENCE_ANNOTATION_PROCESSOR_BEAN_NAME));
          }
          // 注册事件处理器：EventListenerMethodProcessor【实现了SmartInitializingSingleton接口，处理@EventListener注解】
          if (!registry.containsBeanDefinition(EVENT_LISTENER_PROCESSOR_BEAN_NAME)) {
              RootBeanDefinition def = new RootBeanDefinition(EventListenerMethodProcessor.class);
              def.setSource(source);
              beanDefs.add(registerPostProcessor(registry, def, EVENT_LISTENER_PROCESSOR_BEAN_NAME));
          }
          // 注册默认事件工厂：DefaultEventListenerFactory
          if (!registry.containsBeanDefinition(EVENT_LISTENER_FACTORY_BEAN_NAME)) {
              RootBeanDefinition def = new RootBeanDefinition(DefaultEventListenerFactory.class);
              def.setSource(source);
              beanDefs.add(registerPostProcessor(registry, def, EVENT_LISTENER_FACTORY_BEAN_NAME));
          }
      
          return beanDefs;
      }
      ```

#### ClassPathBeanDefinitionScanner

1. org.springframework.context.annotation.ClassPathBeanDefinitionScanner#ClassPathBeanDefinitionScanner(BeanDefinitionRegistry,boolean,ResourceLoader)

   ```java
      public ClassPathBeanDefinitionScanner(BeanDefinitionRegistry registry, boolean useDefaultFilters,
                                            Environment environment, @Nullable ResourceLoader resourceLoader) {
      
          Assert.notNull(registry, "BeanDefinitionRegistry must not be null");
          this.registry = registry;
      
          if (useDefaultFilters) {
              // 注册默认的过滤器
              registerDefaultFilters();
          }
          setEnvironment(environment);
          setResourceLoader(resourceLoader);
      }
      ```

   2. org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider#registerDefaultFilters

      ```java
         protected void registerDefaultFilters() {
             // 注册 @Component 注解的过滤器
             this.includeFilters.add(new AnnotationTypeFilter(Component.class));
             ClassLoader cl = ClassPathScanningCandidateComponentProvider.class.getClassLoader();
             
             // 注册@ManagedBean注解的过滤器
             try {
                 this.includeFilters.add(new AnnotationTypeFilter(
                     ((Class<? extends Annotation>) ClassUtils.forName("javax.annotation.ManagedBean", cl)), false));
                 logger.trace("JSR-250 'javax.annotation.ManagedBean' found and supported for component scanning");
             }catch (ClassNotFoundException ex) {}
             
             // 注册@Named注解的过滤器
             try {
                 this.includeFilters.add(new AnnotationTypeFilter(
                     ((Class<? extends Annotation>) ClassUtils.forName("javax.inject.Named", cl)), false));
                 logger.trace("JSR-330 'javax.inject.Named' annotation found and supported for component scanning");
             }catch (ClassNotFoundException ex) {}
         }
         ```

### DefaultListableBeanFactory

1. 创建容器工厂：org.springframework.context.support.GenericApplicationContext#GenericApplicationContext()

   ```java
      public GenericApplicationContext() {
          this.beanFactory = new DefaultListableBeanFactory();
      }
      ```

### PathMatchingResourcePatternResolver

1. 创建资源加载器：org.springframework.context.support.AbstractApplicationContext#AbstractApplicationContext()

   ```java
      public AbstractApplicationContext() {
         this.resourcePatternResolver = getResourcePatternResolver();
      }
      ```

   2. org.springframework.context.support.AbstractApplicationContext#getResourcePatternResolver

      ```java
         protected ResourcePatternResolver getResourcePatternResolver() {
             return new PathMatchingResourcePatternResolver(this);
         }
         ```

   3. 加载资源：org.springframework.context.support.AbstractApplicationContext#getResources

      ```java
         public Resource[] getResources(String locationPattern) throws IOException {
             return this.resourcePatternResolver.getResources(locationPattern);
         }
         ```

### DefaultResourceLoader

1. 获取默认类加载器：org.springframework.core.io.DefaultResourceLoader#DefaultResourceLoader()

   ```java
      // 获取默认的类加载器
      public DefaultResourceLoader() {
          this.classLoader = ClassUtils.getDefaultClassLoader();
      }
      ```

   2. org.springframework.util.ClassUtils#getDefaultClassLoader

      ```java
         public static ClassLoader getDefaultClassLoader() {
            ClassLoader cl = null;
            try {
               cl = Thread.currentThread().getContextClassLoader();
            }
            catch (Throwable ex) {
               // 无法访问线程上下文ClassLoader-正在回退...
            }
            if (cl == null) {
               // 无线程上下文类装入器-》使用该类的类装入器。
               cl = ClassUtils.class.getClassLoader();
               if (cl == null) {
                  // getClassLoader()返回null，使用引导类加载器BootStrap-ClassLoader
                  try {
                     cl = ClassLoader.getSystemClassLoader();
                  }
                  catch (Throwable ex) {
                     // Cannot access system ClassLoader - oh well, maybe the caller can live with null...
                  }
               }
            }
            return cl;
         }
         ```

## register()

1. org.springframework.context.annotation.AnnotatedBeanDefinitionReader#doRegisterBean

   ```java
      private <T> void doRegisterBean(Class<T> beanClass, @Nullable String name,
                                      @Nullable Class<? extends Annotation>[] qualifiers, @Nullable Supplier<T> supplier,
                                      @Nullable BeanDefinitionCustomizer[] customizers) {
      
          AnnotatedGenericBeanDefinition abd = new AnnotatedGenericBeanDefinition(beanClass);
      
          // 通过Conditional解析器判断是否跳过注册
          if (this.conditionEvaluator.shouldSkip(abd.getMetadata())) {
              return;
          }
      
          abd.setInstanceSupplier(supplier);
          ScopeMetadata scopeMetadata = this.scopeMetadataResolver.resolveScopeMetadata(abd);
          abd.setScope(scopeMetadata.getScopeName());
          String beanName = (name != null ? name : this.beanNameGenerator.generateBeanName(abd, this.registry));
          
          // 处理Lazy、Primary、DependsOn、Role、Description注解
          AnnotationConfigUtils.processCommonDefinitionAnnotations(abd);
          if (qualifiers != null) {
              for (Class<? extends Annotation> qualifier : qualifiers) {
                  if (Primary.class == qualifier) {
                      abd.setPrimary(true);
                  } else if (Lazy.class == qualifier) {
                      abd.setLazyInit(true);
                  } else {
                      abd.addQualifier(new AutowireCandidateQualifier(qualifier));
                  }
              }
          }
          if (customizers != null) {
              for (BeanDefinitionCustomizer customizer : customizers) {
                  customizer.customize(abd);
              }
          }
          
          // 注册bean
          BeanDefinitionHolder definitionHolder = new BeanDefinitionHolder(abd, beanName);
          definitionHolder = AnnotationConfigUtils.applyScopedProxyMode(scopeMetadata, definitionHolder, this.registry);
          BeanDefinitionReaderUtils.registerBeanDefinition(definitionHolder, this.registry);
      }
      ```

## refresh()

1. org.springframework.context.support.AbstractApplicationContext#refresh

   ```java
      public void refresh() throws BeansException, IllegalStateException {
          synchronized (this.startupShutdownMonitor) {
              // Prepare this context for refreshing.
              prepareRefresh();
      
              // Tell the subclass to refresh the internal bean factory.
              ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
      
              // Prepare the bean factory for use in this context.
              prepareBeanFactory(beanFactory);
      
              try {
                  // Allows post-processing of the bean factory in context subclasses.
                  postProcessBeanFactory(beanFactory);
      
                  // Invoke factory processors registered as beans in the context.
                  invokeBeanFactoryPostProcessors(beanFactory);
      
                  // ★ 注册拦截Bean创建的后置处理器。
                  registerBeanPostProcessors(beanFactory);
      
                  // Initialize message source for this context.
                  initMessageSource();
      
                  // Initialize event multicaster for this context.
                  initApplicationEventMulticaster();
      
                  // Initialize other special beans in specific context subclasses.
                  onRefresh();
      
                  // Check for listener beans and register them.
                  registerListeners();
      
                  // ★ 实例化所有剩余的（非lazy-init）单例bean。
                  finishBeanFactoryInitialization(beanFactory);
      
                  // Last step: publish corresponding event.
                  finishRefresh();
              } catch (BeansException ex) {
                  if (logger.isWarnEnabled()) {
                      logger.warn("Exception encountered during context initialization - cancelling refresh attempt: " + ex);
                  }
      
                  // Destroy already created singletons to avoid dangling resources.
                  destroyBeans();
      
                  // Reset 'active' flag.
                  cancelRefresh(ex);
      
                  // Propagate exception to caller.
                  throw ex;
              } finally {
                  // Reset common introspection caches in Spring's core, since we
                  // might not ever need metadata for singleton beans anymore...
                  resetCommonCaches();
              }
          }
      }
      ```

### prepareRefresh

> 1. 设置容器active=true，close=false
> 1. 获取Enviroment对象
> 1. 准备监听器和事件的集合对象

```java
protected void prepareRefresh() {
    // Switch to active.
    this.startupDate = System.currentTimeMillis();
    this.closed.set(false);
    this.active.set(true);

    // 初始化上下文环境中的任何占位符属性源。（子类可重写进行初始化）
    initPropertySources();

    // 校验必需的属性
    getEnvironment().validateRequiredProperties();

    // 保存预刷新的 ApplicationListeners
    if (this.earlyApplicationListeners == null) {
        this.earlyApplicationListeners = new LinkedHashSet<>(this.applicationListeners);
    }else {
        // 将本地应用程序侦听器重置为预刷新状态。
        this.applicationListeners.clear();
        this.applicationListeners.addAll(this.earlyApplicationListeners);
    }
    
    // 发布早期的事件，准备发布给广播器
    this.earlyApplicationEvents = new LinkedHashSet<>();
}
```

### obtainFreshBeanFactory

> 1. 设置容器的序列化值
> 2. 设置容器开始刷新

```java
protected ConfigurableListableBeanFactory obtainFreshBeanFactory() {
    refreshBeanFactory();
    return getBeanFactory();
}
```

1. org.springframework.context.support.GenericApplicationContext#refreshBeanFactory

   ```java
      protected final void refreshBeanFactory() throws IllegalStateException {
          if (!this.refreshed.compareAndSet(false, true)) {
              throw new IllegalStateException(
                  "GenericApplicationContext does not support multiple refresh attempts: just call 'refresh' once");
          }
          // ★ 设置容器的序列化值
          this.beanFactory.setSerializationId(getId());
      }
      ```

### prepareBeanFactory

> 1. 配置BeanFactory的标准上下文特征
>    1. 上下文的类加载器
>    2. 表达式解析器：<font color='red'>SPEL：</font>SpelParserConfiguration
>    3. 后处理器
>        1. ApplicationContextAwareProcessor：
>            1. 处理EnvironmentAware、EmbeddedValueResolverAware、ResourceLoaderAware、ApplicationEventPublisherAware、ApplicationEventPublisherAware、ApplicationEventPublisherAware
>        2. ApplicationListenerDetector：
>            1. 处理ApplicationListener

```java
protected void prepareBeanFactory(ConfigurableListableBeanFactory beanFactory) {
    // 注册类加载器
    beanFactory.setBeanClassLoader(getClassLoader());
    // 注册表达式解析器：SpelParserConfiguration
    beanFactory.setBeanExpressionResolver(new StandardBeanExpressionResolver(beanFactory.getBeanClassLoader()));
    // 对bean属性进行设置管理的工具类。为给定 ResourceLoader（通常是ApplicationContext） 和 PropertyResolver （通常是Environment）创建新的资源编辑器注册器。
    beanFactory.addPropertyEditorRegistrar(new ResourceEditorRegistrar(this, getEnvironment()));

    // 使用上下文回填充配置bean工厂（回填applicationCOntext）
    beanFactory.addBeanPostProcessor(new ApplicationContextAwareProcessor(this));
    
    // 接口的实现通过setter方法注入，在使用autowired装配时，需要忽略Aware接口
    beanFactory.ignoreDependencyInterface(EnvironmentAware.class);
    beanFactory.ignoreDependencyInterface(EmbeddedValueResolverAware.class);
    beanFactory.ignoreDependencyInterface(ResourceLoaderAware.class);
    beanFactory.ignoreDependencyInterface(ApplicationEventPublisherAware.class);
    beanFactory.ignoreDependencyInterface(MessageSourceAware.class);
    beanFactory.ignoreDependencyInterface(ApplicationContextAware.class);

    // BeanFactory interface not registered as resolvable type in a plain factory.
    // MessageSource registered (and found for autowiring) as a bean.
    beanFactory.registerResolvableDependency(BeanFactory.class, beanFactory);
    beanFactory.registerResolvableDependency(ResourceLoader.class, this);
    beanFactory.registerResolvableDependency(ApplicationEventPublisher.class, this);
    beanFactory.registerResolvableDependency(ApplicationContext.class, this);

    // 将用于检测内部bean的早期处理器注册为ApplicationListeners。
    beanFactory.addBeanPostProcessor(new ApplicationListenerDetector(this));

    // 检测LoadTimeWeaver并准备在发现时进行编织。
    if (beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
        beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
        // Set a temporary ClassLoader for type matching.
        beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
    }

    // 注册默认环境bean。
    if (!beanFactory.containsLocalBean(ENVIRONMENT_BEAN_NAME)) {
        beanFactory.registerSingleton(ENVIRONMENT_BEAN_NAME, getEnvironment());
    }
    if (!beanFactory.containsLocalBean(SYSTEM_PROPERTIES_BEAN_NAME)) {
        beanFactory.registerSingleton(SYSTEM_PROPERTIES_BEAN_NAME, getEnvironment().getSystemProperties());
    }
    if (!beanFactory.containsLocalBean(SYSTEM_ENVIRONMENT_BEAN_NAME)) {
        beanFactory.registerSingleton(SYSTEM_ENVIRONMENT_BEAN_NAME, getEnvironment().getSystemEnvironment());
    }
}
```

### postProcessBeanFactory

> 1. 允许子类实现<font color='red'>修改bean工厂</font>
> 2. 在IOC容器标准初始化之后<font color='red'>修改bean工厂</font>。所有bean定义都已加载，但还没有bean被实例化。
> 3. 这允许在ApplicationContext的子类中注册特殊的BeanPostProcessors。

### invokeBeanFactoryPostProcessors

> 1. 执行后置处理器
>     1. 执行BeanDefinitionRegistryPostProcessor的postProcessBeanDefinitionRegistry方法
>     2. 执行BeanFactoryPostProcessor的postProcessBeanFactory方法
> 2. 注册后置处理器
>     1. 通过ConfigurationClassPostProcessor#postProcessBeanFactory注册ConfigurationClassPostProcessor.ImportAwareBeanPostProcessor后置处理器
>         1. 处理ImportAware接口

```java
protected void invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory) {
    // 调用BeanFactory的后置处理器
    PostProcessorRegistrationDelegate.invokeBeanFactoryPostProcessors(beanFactory, getBeanFactoryPostProcessors());

    // 检测LoadTimeWeaver并准备编织
    // （例如通过ConfigurationClassPostProcessor注册的@Bean方法）
    if (beanFactory.getTempClassLoader() == null && beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
        beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
        beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
    }
}
```

1. org.springframework.context.support.**PostProcessorRegistrationDelegate**#`invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory, List<BeanFactoryPostProcessor>)`

   ```java
      public static void invokeBeanFactoryPostProcessors (ConfigurableListableBeanFactory beanFactory, List < BeanFactoryPostProcessor > beanFactoryPostProcessors){
      
          // 调用执行最早注册的BeanDefinitionRegistryPostProcessors处理器
          Set<String> processedBeans = new HashSet<>();
      
          if (beanFactory instanceof BeanDefinitionRegistry) {
              BeanDefinitionRegistry registry = (BeanDefinitionRegistry) beanFactory;
              List<BeanFactoryPostProcessor> regularPostProcessors = new ArrayList<>();
              List<BeanDefinitionRegistryPostProcessor> registryProcessors = new ArrayList<>();
      
              for (BeanFactoryPostProcessor postProcessor : beanFactoryPostProcessors) {
                  if (postProcessor instanceof BeanDefinitionRegistryPostProcessor) {
                      BeanDefinitionRegistryPostProcessor registryProcessor = (BeanDefinitionRegistryPostProcessor) postProcessor;
                      registryProcessor.postProcessBeanDefinitionRegistry(registry);
                      registryProcessors.add(registryProcessor);
                  } else {
                      regularPostProcessors.add(postProcessor);
                  }
              }
      
              // ★★ 分离实现PriorityOrdered、Ordered和其他的 BeanDefinitionRegistryPostProcessor。
              List<BeanDefinitionRegistryPostProcessor> currentRegistryProcessors = new ArrayList<>();
      
              // First, invoke the BeanDefinitionRegistryPostProcessors that implement PriorityOrdered.
              String[] postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
              for (String ppName : postProcessorNames) {
                  if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
                      currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
                      processedBeans.add(ppName);
                  }
              }
              sortPostProcessors(currentRegistryProcessors, beanFactory);
              registryProcessors.addAll(currentRegistryProcessors);
              invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
              currentRegistryProcessors.clear();
      
              // Next, invoke the BeanDefinitionRegistryPostProcessors that implement Ordered.
              postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
              for (String ppName : postProcessorNames) {
                  if (!processedBeans.contains(ppName) && beanFactory.isTypeMatch(ppName, Ordered.class)) {
                      currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
                      processedBeans.add(ppName);
                  }
              }
              sortPostProcessors(currentRegistryProcessors, beanFactory);
              registryProcessors.addAll(currentRegistryProcessors);
              invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
              currentRegistryProcessors.clear();
      
              // Finally, invoke all other BeanDefinitionRegistryPostProcessors until no further ones appear.
              boolean reiterate = true;
              while (reiterate) {
                  reiterate = false;
                  postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
                  for (String ppName : postProcessorNames) {
                      if (!processedBeans.contains(ppName)) {
                          currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
                          processedBeans.add(ppName);
                          reiterate = true;
                      }
                  }
                  sortPostProcessors(currentRegistryProcessors, beanFactory);
                  registryProcessors.addAll(currentRegistryProcessors);
                  invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
                  currentRegistryProcessors.clear();
              }
      
              // ★ 调用到目前为止处理的所有处理器的postProcessBeanFactory回调。
              invokeBeanFactoryPostProcessors(registryProcessors, beanFactory);
              invokeBeanFactoryPostProcessors(regularPostProcessors, beanFactory);
          } else {
              // Invoke factory processors registered with the context instance.
              invokeBeanFactoryPostProcessors(beanFactoryPostProcessors, beanFactory);
          }
      
          // Do not initialize FactoryBeans here: We need to leave all regular beans
          // uninitialized to let the bean factory post-processors apply to them!
          String[] postProcessorNames = beanFactory.getBeanNamesForType(BeanFactoryPostProcessor.class, true, false);
      
          // ★★ 分离实现PriorityOrdered、Ordered和其他的BeanFactoryPostProcessors。
          List<BeanFactoryPostProcessor> priorityOrderedPostProcessors = new ArrayList<>();
          List<String> orderedPostProcessorNames = new ArrayList<>();
          List<String> nonOrderedPostProcessorNames = new ArrayList<>();
          for (String ppName : postProcessorNames) {
              if (processedBeans.contains(ppName)) {
                  // skip - already processed in first phase above
              } else if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
                  priorityOrderedPostProcessors.add(beanFactory.getBean(ppName, BeanFactoryPostProcessor.class));
              } else if (beanFactory.isTypeMatch(ppName, Ordered.class)) {
                  orderedPostProcessorNames.add(ppName);
              } else {
                  nonOrderedPostProcessorNames.add(ppName);
              }
          }
      
          // First, invoke the BeanFactoryPostProcessors that implement PriorityOrdered.
          sortPostProcessors(priorityOrderedPostProcessors, beanFactory);
          invokeBeanFactoryPostProcessors(priorityOrderedPostProcessors, beanFactory);
      
          // Next, invoke the BeanFactoryPostProcessors that implement Ordered.
          List<BeanFactoryPostProcessor> orderedPostProcessors = new ArrayList<>(orderedPostProcessorNames.size());
          for (String postProcessorName : orderedPostProcessorNames) {
              orderedPostProcessors.add(beanFactory.getBean(postProcessorName, BeanFactoryPostProcessor.class));
          }
          sortPostProcessors(orderedPostProcessors, beanFactory);
          invokeBeanFactoryPostProcessors(orderedPostProcessors, beanFactory);
      
          // Finally, invoke all other BeanFactoryPostProcessors.
          List<BeanFactoryPostProcessor> nonOrderedPostProcessors = new ArrayList<>(nonOrderedPostProcessorNames.size());
          for (String postProcessorName : nonOrderedPostProcessorNames) {
              nonOrderedPostProcessors.add(beanFactory.getBean(postProcessorName, BeanFactoryPostProcessor.class));
          }
          invokeBeanFactoryPostProcessors(nonOrderedPostProcessors, beanFactory);
      
          // 清除缓存的合并bean定义，因为后处理器可能已经修改了原始元数据，例如替换值中的占位符...
          beanFactory.clearMetadataCache();
      }
      
      ```

### registerBeanPostProcessors

> 1. 获取BeanPostProcessor类型的处理器
>    1. AutowiredAnnotationBeanPostProcessor：处理@Autowired注解
>    2. CommonAnnotationBeanPostProcessor：对@PostConstruct和@PreDestroy注解的处理
> 2. 注册后置处理器：将BeanPostProcessor加入**AbstractBeanFactory**#`beanPostProcessors`中
> 3. 注册事件监听器：ApplicationListenerDetector

1. org.springframework.context.support.**PostProcessorRegistrationDelegate**#`registerBeanPostProcessors`(ConfigurableListableBeanFactory, AbstractApplicationContext)

   ```java
      public static void registerBeanPostProcessors(
          ConfigurableListableBeanFactory beanFactory, AbstractApplicationContext applicationContext) {
          // 获取所有BeanPostProcessor后置处理器类型的bean
          String[] postProcessorNames = beanFactory.getBeanNamesForType(BeanPostProcessor.class, true, false);
          
          int beanProcessorTargetCount = beanFactory.getBeanPostProcessorCount() + 1 + postProcessorNames.length;
          beanFactory.addBeanPostProcessor(new BeanPostProcessorChecker(beanFactory, beanProcessorTargetCount));
      
          // 分离实现PriorityOrdered、Ordered 和其他的BeanPostProcessors。
          List<BeanPostProcessor> priorityOrderedPostProcessors = new ArrayList<>();
          List<BeanPostProcessor> internalPostProcessors = new ArrayList<>();
          List<String> orderedPostProcessorNames = new ArrayList<>();
          List<String> nonOrderedPostProcessorNames = new ArrayList<>();
          for (String ppName : postProcessorNames) {
              // 实现PriorityOrdered
              if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
                  BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
                  priorityOrderedPostProcessors.add(pp);
                  if (pp instanceof MergedBeanDefinitionPostProcessor) {
                      internalPostProcessors.add(pp);
                  }
              }else if (beanFactory.isTypeMatch(ppName, Ordered.class)) {
                  // 实现Ordered
                  orderedPostProcessorNames.add(ppName);
              }else {
                  // 其他的BeanPostProcessors
                  nonOrderedPostProcessorNames.add(ppName);
              }
          }
      
          // First, register the BeanPostProcessors that implement PriorityOrdered.
          sortPostProcessors(priorityOrderedPostProcessors, beanFactory);
          registerBeanPostProcessors(beanFactory, priorityOrderedPostProcessors);
      
          // Next, register the BeanPostProcessors that implement Ordered.
          sortPostProcessors(orderedPostProcessors, beanFactory);
          registerBeanPostProcessors(beanFactory, orderedPostProcessors);
      
          // Now, register all regular BeanPostProcessors.
          registerBeanPostProcessors(beanFactory, nonOrderedPostProcessors);
      
          // Finally, re-register all internal BeanPostProcessors.
          sortPostProcessors(internalPostProcessors, beanFactory);
          registerBeanPostProcessors(beanFactory, internalPostProcessors);
      
          // Re-register post-processor for detecting inner beans as ApplicationListeners,
          // moving it to the end of the processor chain (for picking up proxies etc).
          beanFactory.addBeanPostProcessor(new ApplicationListenerDetector(applicationContext));
      }
      ```

### initMessageSource

> 1. 初始化国际化资源组件：
>     1. 如果容器中未注册MessageSource组件，注册默认的实现：DelegatingMessageSource

```java
protected void initMessageSource() {
    ConfigurableListableBeanFactory beanFactory = getBeanFactory();
    if (beanFactory.containsLocalBean(MESSAGE_SOURCE_BEAN_NAME)) {
        this.messageSource = beanFactory.getBean(MESSAGE_SOURCE_BEAN_NAME, MessageSource.class);
        // Make MessageSource aware of parent MessageSource.
        if (this.parent != null && this.messageSource instanceof HierarchicalMessageSource) {
            HierarchicalMessageSource hms = (HierarchicalMessageSource) this.messageSource;
            if (hms.getParentMessageSource() == null) {
                // Only set parent context as parent MessageSource if no parent MessageSource
                // registered already.
                hms.setParentMessageSource(getInternalParentMessageSource());
            }
        }
        if (logger.isTraceEnabled()) {
            logger.trace("Using MessageSource [" + this.messageSource + "]");
        }
    }else {
        // Use empty MessageSource to be able to accept getMessage calls.
        DelegatingMessageSource dms = new DelegatingMessageSource();
        dms.setParentMessageSource(getInternalParentMessageSource());
        this.messageSource = dms;
        beanFactory.registerSingleton(MESSAGE_SOURCE_BEAN_NAME, this.messageSource);
        if (logger.isTraceEnabled()) {
            logger.trace("No '" + MESSAGE_SOURCE_BEAN_NAME + "' bean, using [" + this.messageSource + "]");
        }
    }
}
```

### initApplicationEventMulticaster

> 1. 初始化事件多播器组件
>     1. 如果容器中未注册ApplicationEventMulticaster组件，注册默认的实现：SimpleApplicationEventMulticaster

```java
protected void initApplicationEventMulticaster() {
    ConfigurableListableBeanFactory beanFactory = getBeanFactory();
    if (beanFactory.containsLocalBean(APPLICATION_EVENT_MULTICASTER_BEAN_NAME)) {
        this.applicationEventMulticaster =
            beanFactory.getBean(APPLICATION_EVENT_MULTICASTER_BEAN_NAME, ApplicationEventMulticaster.class);
        if (logger.isTraceEnabled()) {
            logger.trace("Using ApplicationEventMulticaster [" + 
                         this.applicationEventMulticaster + "]");
        }
    }else {
        this.applicationEventMulticaster = new SimpleApplicationEventMulticaster(beanFactory);
        beanFactory.registerSingleton(APPLICATION_EVENT_MULTICASTER_BEAN_NAME, this.applicationEventMulticaster);
        if (logger.isTraceEnabled()) {
            logger.trace("No '" + APPLICATION_EVENT_MULTICASTER_BEAN_NAME + "' bean, using " +"[" + this.applicationEventMulticaster.getClass().getSimpleName() + "]");
        }
    }
}
```

### onRefresh

> 1. 允许子类实现，在实例化单例之前调用特殊 bean 的初始化。

### registerListeners

> 1. 注册监听器

```java
protected void registerListeners() {
    // 先注册静态指定的监听器。
    for (ApplicationListener listener : getApplicationListeners()) {
        getApplicationEventMulticaster().addApplicationListener(listener);
    }
    
    // 获取容器中的监听器，添加到多播器
    String[] listenerBeanNames = getBeanNamesForType(ApplicationListener.class, true, false);
    for (String listenerBeanName : listenerBeanNames) {
        getApplicationEventMulticaster().addApplicationListenerBean(listenerBeanName);
    }

    //  发布早期的事件
    Set<ApplicationEvent> earlyEventsToProcess = this.earlyApplicationEvents;
    this.earlyApplicationEvents = null;
    if (!CollectionUtils.isEmpty(earlyEventsToProcess)) {
        for (ApplicationEvent earlyEvent : earlyEventsToProcess) {
            getApplicationEventMulticaster().multicastEvent(earlyEvent);
        }
    }
}
```

### finishBeanFactoryInitialization

> 1. 实例化所有剩余的（非lazy-init）单例bean

1. org.springframework.context.support.**AbstractApplicationContext**#`finishBeanFactoryInitialization`

   ```java
      protected void finishBeanFactoryInitialization(ConfigurableListableBeanFactory beanFactory) {
          // ★ 初始化转换器
          if (beanFactory.containsBean(CONVERSION_SERVICE_BEAN_NAME) && beanFactory.isTypeMatch(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class)) {
              beanFactory.setConversionService(beanFactory.getBean(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class));
          }
          // 注册一个嵌套值解析器，解析注解参数
          if (!beanFactory.hasEmbeddedValueResolver()) {
              beanFactory.addEmbeddedValueResolver(strVal -> getEnvironment().resolvePlaceholders(strVal));
          }
      
          // 尽早初始化LoadTimeWeaverAware be an，以便尽早注册它们的转换器。
          String[] weaverAwareNames = beanFactory.getBeanNamesForType(LoadTimeWeaverAware.class, false, false);
          for (String weaverAwareName : weaverAwareNames) {
              getBean(weaverAwareName);
          }
      
          // 停止使用临时ClassLoader进行类型匹配。
          beanFactory.setTempClassLoader(null);
      
          // 允许缓存所有bean定义元数据，不期望进一步更改。
          beanFactory.freezeConfiguration();
      
          // ★★ 实例化单例bean
          beanFactory.preInstantiateSingletons();
      }
      ```

2. 实例化单例bean：org.springframework.beans.factory.support.**DefaultListableBeanFactory**#<a id="preInstantiateSingletons"> preInstantiateSingletons</a> 

   ```java
      public void preInstantiateSingletons() throws BeansException {
          List<String> beanNames = new ArrayList<>(this.beanDefinitionNames);
          // ★★★ 触发初始化所有非懒惰的单例bean...
          for (String beanName : beanNames) {
              // 合并父类的BeanDefinition：根据beanName获取BeanDefinition
              RootBeanDefinition bd = getMergedLocalBeanDefinition(beanName);
              // 非抽象bean && 单例 && 非懒加载
              if (!bd.isAbstract() && bd.isSingleton() && !bd.isLazyInit()) {
                  // ★ 工厂bean
                  if (isFactoryBean(beanName)) {
                      // ★★★ 调用getBean()方法，创建【工厂Bean对象】
                      Object bean = getBean(FACTORY_BEAN_PREFIX + beanName);
                      if (bean instanceof FactoryBean) {
                          FactoryBean factory = (FactoryBean) bean;
                          // 工厂bean是否需紧急初始化（实现SmartFactoryBean接口），默认调用getObject()方法时初始化
                          boolean isEagerInit;
                          if (System.getSecurityManager() != null && factory instanceof SmartFactoryBean) {
                              isEagerInit = AccessController.doPrivileged((PrivilegedAction<Boolean>) 
                                          ((SmartFactoryBean) factory)::isEagerInit,getAccessControlContext());
                          } else {
                              isEagerInit = (factory instanceof SmartFactoryBean &&
                                             ((SmartFactoryBean) factory).isEagerInit());
                          }
                          if (isEagerInit) {
                              // 紧急初始化，调用getBean创建实例；默认获取时才创建
                              getBean(beanName);
                          }
                      }
                  } else {
                      // ★★★ 创建非工厂（单例bean）
                      getBean(beanName);
                  }
              }
          }
      
          // 触发所有适用的bean的初始化后回调...
          for (String beanName : beanNames) {
              Object singletonInstance = getSingleton(beanName);
              // ★ 执行SmartInitializingSingleton的afterSingletonsInstantiated()方法
              if (singletonInstance instanceof SmartInitializingSingleton) {
                  SmartInitializingSingleton smartSingleton = (SmartInitializingSingleton) singletonInstance;
                  if (System.getSecurityManager() != null) {
                      AccessController.doPrivileged((PrivilegedAction<Object>) () -> {
                          smartSingleton.afterSingletonsInstantiated();
                          return null;
                      }, getAccessControlContext());
                  }
                  else {
                      smartSingleton.afterSingletonsInstantiated();
                  }
              }
          }
      }
      ```

#### doGetBean

1. org.springframework.beans.factory.support.**AbstractBeanFactory**#`doGetBean`

   ```java
      protected <T> T doGetBean(String name, @Nullable Class<T> requiredType, @Nullable Object[] args, boolean typeCheckOnly) throws BeansException {
          // 去除工厂bean前的&，规范bean名称
          String beanName = transformedBeanName(name);
          Object bean;
      
          // ★★★ 与循环依赖有关联，从缓存中获取已存在的实例。
          Object sharedInstance = getSingleton(beanName);
          if (sharedInstance != null && args == null) {
              if (logger.isTraceEnabled()) {
                  if (isSingletonCurrentlyInCreation(beanName)) {
                      logger.trace("Returning eagerly cached instance of singleton bean '" + beanName + "' that is not fully initialized yet - a consequence of a circular reference");
                  } else {
                      logger.trace("Returning cached instance of singleton bean '" + beanName + "'");
                  }
              }
              // ★★ 处理FactoryBean的时机
              bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
          } else {
              // 检查此工厂中是否存在bean定义。
              BeanFactory parentBeanFactory = getParentBeanFactory();
              if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
                  // Not found -> check parent.
                  String nameToLookup = originalBeanName(name);
                  if (parentBeanFactory instanceof AbstractBeanFactory) {
                      return ((AbstractBeanFactory) parentBeanFactory).doGetBean(nameToLookup, requiredType, args, typeCheckOnly);
                  } else if (args != null) {
                      // Delegation to parent with explicit args.
                      return (T) parentBeanFactory.getBean(nameToLookup, args);
                  } else if (requiredType != null) {
                      // No args -> delegate to standard getBean method.
                      return parentBeanFactory.getBean(nameToLookup, requiredType);
                  } else {
                      return (T) parentBeanFactory.getBean(nameToLookup);
                  }
              }
              if (!typeCheckOnly) {
                  // 标记bean为已创建或即将创建
                  markBeanAsCreated(beanName);
              }
              try {
                  // ★ 创建RootBeanDefinition
                  RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
                  checkMergedBeanDefinition(mbd, beanName, args);
      
                  // ★ 保证当前bean所依赖的bean的初始化。处理@DependsOn注解指定的依赖
                  String[] dependsOn = mbd.getDependsOn();
                  if (dependsOn != null) {
                      for (String dep : dependsOn) {
                          if (isDependent(beanName, dep)) {
                              throw new BeanCreationException(mbd.getResourceDescription(), beanName, "Circular depends-on relationship between '" + beanName + "' and '" + dep + "'");
                          }
                          registerDependentBean(dep, beanName);
                          try {
                              getBean(dep);
                          } catch (NoSuchBeanDefinitionException ex) {
                              throw new BeanCreationException(mbd.getResourceDescription(), beanName, "'" + 
                                                              beanName + "' depends on missing bean '" + dep + "'", ex);
                          }
                      }
                  }
      
                  if (mbd.isSingleton()) {
                      sharedInstance = getSingleton(beanName, () -> {
                          try {
                              // ★★★ 创建单例bean
                              return createBean(beanName, mbd, args);
                          } catch (BeansException ex) {
                            // 从单例缓存中显式移除实例：它可能是由创建过程急切地放在那里的，以允许循环引用解析。
                            // 还删除接收到对bean的临时引用的任何bean。
                              destroySingleton(beanName);
                              throw ex;
                          }
                      });
                      // ★  如果是FactoryBean，则通过getSingleton()获取到FactoryBean对象，再通过getObjectForBeanInstance()调用getObject()方法获取工厂生产的bean对象 
                      bean = beanInstance = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
                  } else if (mbd.isPrototype()) {
                      // ★ 创建原型bean
                      Object prototypeInstance = null;
                      try {
                          beforePrototypeCreation(beanName);
                          prototypeInstance = createBean(beanName, mbd, args);
                      } finally {
                          afterPrototypeCreation(beanName);
                      }
                      bean = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
                  } else {
                      // 
                      String scopeName = mbd.getScope();
                      if (!StringUtils.hasLength(scopeName)) {
                          throw new IllegalStateException("No scope name defined for bean '" + beanName + "'");
                      }
                      Scope scope = this.scopes.get(scopeName);
                      if (scope == null) {
                          throw new IllegalStateException("No Scope registered for scope name '" + scopeName + "'");
                      }
                      
                      Object scopedInstance = scope.get(beanName, () -> {
                          beforePrototypeCreation(beanName);
                          try {
                              return createBean(beanName, mbd, args);
                          } finally {
                              afterPrototypeCreation(beanName);
                          }
                      });
                      bean = getObjectForBeanInstance(scopedInstance, name, beanName, mbd);
                      
                  }
              } catch (BeansException ex) {  
                  cleanupAfterBeanCreationFailure(beanName);
                  throw ex;
              }
          }
      
          // Check if required type matches the type of the actual bean instance.
          if (requiredType != null && !requiredType.isInstance(bean)) {
              T convertedBean = getTypeConverter().convertIfNecessary(bean, requiredType);
              if (convertedBean == null) {
                  throw new BeanNotOfRequiredTypeException(name, requiredType, bean.getClass());
              }
              return convertedBean;
          }
          return (T) bean;
      }
      ```

2. org.springframework.beans.factory.support.**DefaultSingletonBeanRegistry**# <a id="getSingleton(String,ObjectFactory)">getSingleton(String, ObjectFactory)</a>

   ```java
      public Object getSingleton(String beanName, ObjectFactory singletonFactory) {
          Assert.notNull(beanName, "Bean name must not be null");
          synchronized (this.singletonObjects) {
              Object singletonObject = this.singletonObjects.get(beanName);
              if (singletonObject == null) {
                  beforeSingletonCreation(beanName);
                  boolean newSingleton = false;
                  boolean recordSuppressedExceptions = (this.suppressedExceptions == null);
                  if (recordSuppressedExceptions) {
                      this.suppressedExceptions = new LinkedHashSet<>();
                  }
                  try {
                      singletonObject = singletonFactory.getObject();
                      newSingleton = true;
                  } catch (IllegalStateException ex) {
                      // Has the singleton object implicitly appeared in the meantime ->
                      // if yes, proceed with it since the exception indicates that state.
                      singletonObject = this.singletonObjects.get(beanName);
                      if (singletonObject == null) {
                          throw ex;
                      }
                  } catch (BeanCreationException ex) {
                      if (recordSuppressedExceptions) {
                          for (Exception suppressedException : this.suppressedExceptions) {
                              ex.addRelatedCause(suppressedException);
                          }
                      }
                      throw ex;
                  } finally {
                      if (recordSuppressedExceptions) {
                          this.suppressedExceptions = null;
                      }
                      afterSingletonCreation(beanName);
                  }
      
                  if (newSingleton) {
                      // ★ 生成了新的单例对象，将单例对象加入缓存
                      addSingleton(beanName, singletonObject);
                  }
              }
              return singletonObject;
          }
      }
      ```

   2. org.springframework.beans.factory.support.**DefaultSingletonBeanRegistry**#<a id="addSingleton"> addSingleton</a> 

      ```java
         protected void addSingleton(String beanName, Object singletonObject) {
             synchronized (this.singletonObjects) {
                 // 将映射关系添加到单例对象的高速缓存中【一级缓存】
                 this.singletonObjects.put(beanName, singletonObject);
                 // 移除beanName在单例工厂缓存中的数据
                 this.singletonFactories.remove(beanName);
                 // 移除beanName在早期单例对象的高速缓存的数据【二级缓存】
                 this.earlySingletonObjects.remove(beanName);
                 // 将beanName添加到已注册的单例集中
                 this.registeredSingletons.add(beanName);
             }
         }
         ```

3. 创建bean：org.springframework.beans.factory.support.**AbstractAutowireCapableBeanFactory**#`createBean`(String,RootBeanDefinition, Object[])

   ```java
      protected Object createBean(String beanName, RootBeanDefinition mbd, @Nullable Object[] args) throws BeanCreationException {
          RootBeanDefinition mbdToUse = mbd;
      
          Class resolvedClass = resolveBeanClass(mbd, beanName);
          if (resolvedClass != null && !mbd.hasBeanClass() && mbd.getBeanClassName() != null) {
              mbdToUse = new RootBeanDefinition(mbd);
              mbdToUse.setBeanClass(resolvedClass);
          }
      
          // 准备方法重写。
          mbdToUse.prepareMethodOverrides();
          
          // ★ 给BeanPostProcessors返回一个代理而不是目标bean实例的机会。
          // ★ 提前实例化bean：调用 InstantiationAwareBeanPostProcessor 的实例化方法
          Object bean = resolveBeforeInstantiation(beanName, mbdToUse);
          if (bean != null) {
              return bean;
          }
          
          // ★★ 实际创建bean
          Object beanInstance = doCreateBean(beanName, mbdToUse, args);
          if (logger.isTraceEnabled()) {
              logger.trace("Finished creating instance of bean '" + beanName + "'");
          }
          return beanInstance;
      }
      ```

4. 提前实例化Bean的时机

   1. 提前实例化bean：org.springframework.beans.factory.support.**AbstractAutowireCapableBeanFactory**#`resolveBeforeInstantiation`

      ```java
         protected Object resolveBeforeInstantiation(String beanName, RootBeanDefinition mbd) {
             Object bean = null;
             if (!Boolean.FALSE.equals(mbd.beforeInstantiationResolved)) {
                 // 确保此时Bean类实际上已解析。
                 if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
                     Class targetType = determineTargetType(beanName, mbd);
                     if (targetType != null) {
                         // ★ 调用postProcessBeforeInstantiation()方法
                         bean = applyBeanPostProcessorsBeforeInstantiation(targetType, beanName);
                         if (bean != null) {
                             // ★ 调用postProcessAfterInitialization()方法
                             bean = applyBeanPostProcessorsAfterInitialization(bean, beanName);
                         }
                     }
                 }
                 // 包可见字段，指示实例化前的后处理器已经开始工作。
                 mbd.beforeInstantiationResolved = (bean != null);
             }
             return bean;
         }
         ```

##### doCreateBean

1. 实际创建bean：org.springframework.beans.factory.support.**AbstractAutowireCapableBeanFactory**#`doCreateBean`

   ```java
      protected Object doCreateBean(String beanName, RootBeanDefinition mbd, @Nullable Object[] args) throws BeanCreationException {
      
          // Instantiate the bean.
          BeanWrapper instanceWrapper = null;
          if (mbd.isSingleton()) {
              // 未完成的FactoryBean实例的缓存
              instanceWrapper = this.factoryBeanInstanceCache.remove(beanName);
          }
          if (instanceWrapper == null) {
              // ★★★ 创建bean实例：工厂方法、构造函数主动注入、反射实例化
              instanceWrapper = createBeanInstance(beanName, mbd, args);
          }
          Object bean = instanceWrapper.getWrappedInstance();
          Class beanType = instanceWrapper.getWrappedClass();
          if (beanType != NullBean.class) {
              mbd.resolvedTargetType = beanType;
          }
      
          // 允许 MergedBeanDefinitionPostProcessor 修改Bean定义。
          synchronized (mbd.postProcessingLock) {
              if (!mbd.postProcessed) {
                  applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);
                  mbd.postProcessed = true;
              }
          }
          
          // ★★ 缓存单例，以便能够解析循环引用，即使是由 BeanFactoryAware 这样的生命周期接口触发的。
          boolean earlySingletonExposure = (mbd.isSingleton() && this.allowCircularReferences && isSingletonCurrentlyInCreation(beanName));
          if (earlySingletonExposure) {
              if (logger.isTraceEnabled()) {
                  logger.trace("Eagerly caching bean '" + beanName + "' to allow for resolving potential circular references");
              }
              // ★★★ 缓存处理：协助解决循环依赖
              addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
          }
          
          Object exposedObject = bean;
          
          // ★★★ 对bean的属性进行填充，将各个属性值注入，其中，可能存在依赖于其他bean的属性，则会递归初始化依赖的bean
          // ★ 调用了InstantiationAwareBeanPostProcessor的postProcessAfterInstantiation()、postProcessProperties()
          populateBean(beanName, mbd, instanceWrapper);
          // ★ 初始化bean，调用postProcessBeforeInitialization()、init-method()、postProcessAfterInitialization()
          exposedObject = initializeBean(beanName, exposedObject, mbd);
      
          // 急切创建单例bean，以解决循环引用
          if (earlySingletonExposure) {
              Object earlySingletonReference = getSingleton(beanName, false);
              if (earlySingletonReference != null) {
                  if (exposedObject == bean) {
                      exposedObject = earlySingletonReference;
                  } else if (!this.allowRawInjectionDespiteWrapping && hasDependentBean(beanName)) {
                      String[] dependentBeans = getDependentBeans(beanName);
                      Set<String> actualDependentBeans = new LinkedHashSet<>(dependentBeans.length);
                      for (String dependentBean : dependentBeans) {
                          if (!removeSingletonIfCreatedForTypeCheckOnly(dependentBean)) {
                              actualDependentBeans.add(dependentBean);
                          }
                      }
                      if (!actualDependentBeans.isEmpty()) {
                          throw new BeanCurrentlyInCreationException(beanName,
                                                                     "Bean with name '" + beanName + "' has been injected into other beans [" + StringUtils.collectionToCommaDelimitedString(actualDependentBeans) + "] in its raw version" +
                                                                     " as part of a circular reference, but has eventually been " + "wrapped. This means that said other beans do not use the final version of the " + "bean. This" +
                                                                     " is often the result of over-eager type matching - consider using " + "'getBeanNamesForType' with the 'allowEagerInit' flag turned off, for example.");
                      }
                  }
              }
          }
          
          // 注册bean为一次性bean
          registerDisposableBeanIfNecessary(beanName, bean, mbd);
      
          return exposedObject;
      }
      
      ```

###### createBeanInstance

1. 创建未指定构造器的bean实例：org.springframework.beans.factory.support.**AbstractAutowireCapableBeanFactory**#`createBeanInstance`

   ```java
      protected BeanWrapper createBeanInstance (String beanName, RootBeanDefinition mbd, @Nullable Object[]args){
          Class beanClass = resolveBeanClass(mbd, beanName);
      
          // 使用提供的Supplier创建bean
          Supplier instanceSupplier = mbd.getInstanceSupplier();
          if (instanceSupplier != null) {
              return obtainFromSupplier(instanceSupplier, beanName);
          }
          
          // ★★ 使用工厂方法实例化bean：指定factory-method的bean 或 使用@Bean注册的bean
          if (mbd.getFactoryMethodName() != null) {
              return instantiateUsingFactoryMethod(beanName, mbd, args);
          }
      
          // 对于多次创建bean，提供一个创建bean的快捷方式
          boolean resolved = false;
          boolean autowireNecessary = false;
          if (args == null) {
              synchronized (mbd.constructorArgumentLock) {
                  if (mbd.resolvedConstructorOrFactoryMethod != null) {
                      resolved = true;
                      autowireNecessary = mbd.constructorArgumentsResolved;
                  }
              }
          }
          if (resolved) {
              if (autowireNecessary) {
                  return autowireConstructor(beanName, mbd, null, null);
              } else {
                  return instantiateBean(beanName, mbd);
              }
          }
      
          // 用于自动装配的候选构造函数：
          Constructor[] ctors = determineConstructorsFromBeanPostProcessors(beanClass, beanName);
          if (ctors != null || mbd.getResolvedAutowireMode() == AUTOWIRE_CONSTRUCTOR || mbd.hasConstructorArgumentValues() || !ObjectUtils.isEmpty(args)) {
              return autowireConstructor(beanName, mbd, ctors, args);
          }
      
          // 查找最合适的默认构造方法
          ctors = mbd.getPreferredConstructors();
          if (ctors != null) {
              return autowireConstructor(beanName, mbd, ctors, null);
          }
      
          // ★★ 无特殊处理，使用默认无参构造函数实例化bean
          return instantiateBean(beanName, mbd);
      }
      
      ```

   2. 使用默认无参构造函数实例化bean：org.springframework.beans.factory.support.**AbstractAutowireCapableBeanFactory**#`instantiateBean`

      ```java
         protected BeanWrapper instantiateBean(String beanName, RootBeanDefinition mbd) {
             Object beanInstance;
             if (System.getSecurityManager() != null) {
                 beanInstance = AccessController.doPrivileged((PrivilegedAction<Object>) () -> getInstantiationStrategy().instantiate(mbd, beanName, this), getAccessControlContext());
             }else {
                 // ★ 使用CglibSubclassingInstantiationStrategy实例化策略
                 beanInstance = getInstantiationStrategy().instantiate(mbd, beanName, this);
             }
             // 封装bean
             BeanWrapper bw = new BeanWrapperImpl(beanInstance);
             // 初始化bean
             initBeanWrapper(bw);
             return bw;
         }
         ```

      2. 使用CglibSubclassingInstantiationStrategy实例化策略实例化bean：org.springframework.beans.factory.support.**SimpleInstantiationStrategy**#`instantiate`(RootBeanDefinition, String, BeanFactory)——>**CglibSubclassingInstantiationStrategy**的父类

         ```java
            public Object instantiate (RootBeanDefinition bd, @Nullable String beanName, BeanFactory owner){
                // 如果没有重写，不要用CGLIB重写类。
                if (!bd.hasMethodOverrides()) {
                    constructorToUse;
                    synchronized (bd.constructorArgumentLock) {
                        constructorToUse = (Constructor) bd.resolvedConstructorOrFactoryMethod;
                        if (constructorToUse == null) {
                            final Class clazz = bd.getBeanClass();
                            // 如果要实例化的beanDefinition是一个接口，直接抛出异常
                            if (clazz.isInterface()) {
                                throw new BeanInstantiationException(clazz, "Specified class is an interface");
                            }
                            try {
                                // ★ 获取默认构造函数
                                Constructor constructorToUse = clazz.getDeclaredConstructor();
                                // 缓存构造函数或工厂方法
                                bd.resolvedConstructorOrFactoryMethod = constructorToUse;
                            } catch (Throwable ex) {
                                // 不存在默认构造函数
                                throw new BeanInstantiationException(clazz, "No default constructor found", ex);
                            }
                        }
                    }
                    // 调用构造方法实例化bean
                    return BeanUtils.instantiateClass(constructorToUse);
                } else {
                    // 必须生成CGLIB子类。
                    return instantiateWithMethodInjection(bd, beanName, owner);
                }
            }
            ```

      3. 使用BeanUtils工具类实例化bean：

         ```java
            public static <T> T instantiateClass(Constructor<T> ctor, Object... args) throws BeanInstantiationException {
                Assert.notNull(ctor, "Constructor must not be null");
                ReflectionUtils.makeAccessible(ctor);
                if (KotlinDetector.isKotlinReflectPresent() && KotlinDetector.isKotlinType(ctor.getDeclaringClass())) {
                    return KotlinDelegate.instantiateClass(ctor, args);
                } else {
                    Class[] parameterTypes = ctor.getParameterTypes();
                    Assert.isTrue(args.length <= parameterTypes.length, "Can't specify more arguments than constructor parameters");
                    // 获取构造方法参数
                    Object[] argsWithDefaultValues = new Object[args.length];
                    for (int i = 0 ; i < args.length; i++) {
                        if (args[i] == null) {
                            Class parameterType = parameterTypes[i];
                            argsWithDefaultValues[i] = (parameterType.isPrimitive() ? DEFAULT_TYPE_VALUES.get(parameterType) : null);
                        }
                        else {
                            argsWithDefaultValues[i] = args[i];
                        }
                    }
                    // ★ 调用构造方法
                    return ctor.newInstance(argsWithDefaultValues);
                }
            }
            ```

###### addSingletonFactory

> 处理循环依赖：addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));

1. org.springframework.beans.factory.support.**DefaultSingletonBeanRegistry**#`addSingletonFactory`

   ```java
      protected void addSingletonFactory(String beanName, ObjectFactory singletonFactory) {
          Assert.notNull(singletonFactory, "Singleton factory must not be null");
          synchronized (this.singletonObjects) {
              // 如果单例对象的高速缓存【beam名称-bean实例】没有beanName的对象【一级缓存】
              if (!this.singletonObjects.containsKey(beanName)) {
                  // ★ 将beanName,singletonFactory放到单例工厂的缓存【bean名称 - ObjectFactory】【三级缓存】
                  this.singletonFactories.put(beanName, singletonFactory);
                  // 从早期单例对象的高速缓存【bean名称-bean实例】移除beanName的相关缓存对象【二级缓存】
                  this.earlySingletonObjects.remove(beanName);
                  // 将beanName添加已注册的单例集中
                  this.registeredSingletons.add(beanName);
              }
          }
      }
      ```

###### populateBean

> 对bean的属性进行填充，将各个属性值注入，
> 
> 其中，<font color='red'>可能存在依赖于其他bean的属性，则会递归初始化依赖的bean</font>

1. 填充bean实例的属性：org.springframework.beans.factory.support.**AbstractAutowireCapableBeanFactory**#`populateBean`

   ```java
      protected void populateBean(String beanName, RootBeanDefinition mbd, @Nullable BeanWrapper bw) {
          // 非合成bean && 存在实例化bean后置处理器。
          // 让任何 InstantiationAwareBeanPostProcessor 有机会在设置属性之前修改 bean 的状态。例如，这可以用来支持字段注入的样式。
          if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
              for (BeanPostProcessor bp : getBeanPostProcessors()) {
                  if (bp instanceof InstantiationAwareBeanPostProcessor) {
                      InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;
                      if (!ibp.postProcessAfterInstantiation(bw.getWrappedInstance(), beanName)) {
                          return;
                      }
                  }
              }
          }
      
          PropertyValues pvs = (mbd.hasPropertyValues() ? mbd.getPropertyValues() : null);
          int resolvedAutowireMode = mbd.getResolvedAutowireMode();
          if (resolvedAutowireMode == AUTOWIRE_BY_NAME || resolvedAutowireMode == AUTOWIRE_BY_TYPE) {
              MutablePropertyValues newPvs = new MutablePropertyValues(pvs);
              // Add property values based on autowire by name if applicable.
              if (resolvedAutowireMode == AUTOWIRE_BY_NAME) {
                  autowireByName(beanName, mbd, bw, newPvs);
              }
              // Add property values based on autowire by type if applicable.
              if (resolvedAutowireMode == AUTOWIRE_BY_TYPE) {
                  autowireByType(beanName, mbd, bw, newPvs);
              }
              pvs = newPvs;
          }
      
          boolean hasInstAwareBpps = hasInstantiationAwareBeanPostProcessors();
          boolean needsDepCheck = (mbd.getDependencyCheck() != AbstractBeanDefinition.DEPENDENCY_CHECK_NONE);
      
          PropertyDescriptor[] filteredPds = null;
          if (hasInstAwareBpps) {
              if (pvs == null) {
                  pvs = mbd.getPropertyValues();
              }
              // ★ 解析@Autowired（AutowiredAnnotationBeanPostProcessor）和@Resource注解（CommonAnnotationBeanPostProcessor）
              for (BeanPostProcessor bp : getBeanPostProcessors()) {
                  if (bp instanceof InstantiationAwareBeanPostProcessor) {
                      InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;
                      PropertyValues pvsToUse = ibp.postProcessProperties(pvs, bw.getWrappedInstance(), beanName);
                      if (pvsToUse == null) {
                          if (filteredPds == null) {
                              filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);
                          }
                          pvsToUse = ibp.postProcessPropertyValues(pvs, filteredPds, bw.getWrappedInstance(), beanName);
                          if (pvsToUse == null) {
                              return;
                          }
                      }
                      pvs = pvsToUse;
                  }
              }
          }
          // 进行依赖项检查，
          if (needsDepCheck) {
              if (filteredPds == null) {
                  filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);
              }
              checkDependencies(beanName, mbd, filteredPds, pvs);
          }
      
          if (pvs != null) {
              // ★★★ 应用给定的属性值，解决在这个bean工厂运行时其他bean的引用。使用深拷贝
              applyPropertyValues(beanName, mbd, bw, pvs);
          }
      }
      
      ```

   2. 应用给定的属性值：org.springframework.beans.factory.support.**AbstractAutowireCapableBeanFactory**#<a id="applyPropertyValues"> applyPropertyValues </a> 

      ```java
         protected void applyPropertyValues(String beanName, BeanDefinition mbd, BeanWrapper bw, PropertyValues pvs) {
             MutablePropertyValues mpvs = null;
             List<PropertyValue> original;
         
             // MutablePropertyValues:PropertyValues接口的默认实现。允许对属性进行简单操作，并提供构造函数支持用映射
             // ★ 获取属性列表
             if (pvs instanceof MutablePropertyValues) {
                 mpvs = (MutablePropertyValues) pvs;
                 if (mpvs.isConverted()) {
                     // Shortcut: use the pre-converted values as-is.
                     try {
                         bw.setPropertyValues(mpvs);
                         return;
                     }
                     catch (BeansException ex) {
                         throw new BeanCreationException(
                             mbd.getResourceDescription(), beanName, "Error setting property values", ex);
                     }
                 }
                 original = mpvs.getPropertyValueList();
             } else {
                 original = Arrays.asList(pvs.getPropertyValues());
             }
         
             // 获取自定义类型转换器
             TypeConverter converter = getCustomTypeConverter();
             if (converter == null) {
                 converter = bw;
             }
             
             // BeanDefinitionValueResolver在bean工厂实现中使用Hepler类，将beanDefinition对象中包含的值解析为应用于目标bean实例的值解析器
             BeanDefinitionValueResolver valueResolver = new BeanDefinitionValueResolver(this, beanName, mbd, converter);
         
             // ★ 进行深层拷贝，解析值的任何引用。
             List<PropertyValue> deepCopy = new ArrayList<>(original.size());
             boolean resolveNecessary = false;
             for (PropertyValue pv : original) {
                 if (pv.isConverted()) {
                     deepCopy.add(pv);
                 } else {
                     String propertyName = pv.getName();
                     Object originalValue = pv.getValue();
                     if (originalValue == AutowiredPropertyMarker.INSTANCE) {
                         Method writeMethod = bw.getPropertyDescriptor(propertyName).getWriteMethod();
                         if (writeMethod == null) {
                             throw new IllegalArgumentException("Autowire marker for property without write method: " + pv);
                         }
                         originalValue = new DependencyDescriptor(new MethodParameter(writeMethod, 0), true);
                     }
                     // ★★ 交由valueResolver根据pv解析出originalValue所封装的对象
                     Object resolvedValue = valueResolver.resolveValueIfNecessary(pv, originalValue);
                     
                     Object convertedValue = resolvedValue;
                     boolean convertible = bw.isWritableProperty(propertyName) && 
                         !PropertyAccessorUtils.isNestedOrIndexedProperty(propertyName);
                     if (convertible) {
                         convertedValue = convertForProperty(resolvedValue, propertyName, bw, converter);
                     }
                     // Possibly store converted value in merged bean definition,
                     // in order to avoid re-conversion for every created bean instance.
                     if (resolvedValue == originalValue) {
                         if (convertible) {
                             pv.setConvertedValue(convertedValue);
                         }
                         deepCopy.add(pv);
                     }else if (convertible && originalValue instanceof TypedStringValue &&
                              !((TypedStringValue) originalValue).isDynamic() &&
                              !(convertedValue instanceof Collection || 
                                ObjectUtils.isArray(convertedValue))) {
                         pv.setConvertedValue(convertedValue);
                         deepCopy.add(pv);
                     }else {
                         resolveNecessary = true;
                         deepCopy.add(new PropertyValue(pv, convertedValue));
                     }
                 }
             }
             if (mpvs != null && !resolveNecessary) {
                 mpvs.setConverted();
             }
         
             try {
                 // ★★ 属性赋值操作
                 bw.setPropertyValues(new MutablePropertyValues(deepCopy));
             }catch (BeansException ex) {
                 throw new BeanCreationException(
                     mbd.getResourceDescription(), beanName, "Error setting property values", ex);
             }
         }
         ```

   3. 解析属性值：org.springframework.beans.factory.support.**BeanDefinitionValueResolver**#<a id="resolveValueIfNecessary"> resolveValueIfNecessary</a> 

      ```java
         public Object resolveValueIfNecessary(Object argName, @Nullable Object value) {
             // ★★ 我们必须检查每个值，看看它是否需要对另一个bean的运行时引用才能解析。
             // RuntimeBeanReference：当属性值对象是工厂中另一个bean的引用时，使用不可变的占位符类，在运行时进行解析
             if (value instanceof RuntimeBeanReference) {
                 RuntimeBeanReference ref = (RuntimeBeanReference) value;
                 // 解析出对应ref所封装的Bean元信息(即Bean名,Bean类型)的Bean对象
                 return resolveReference(argName, ref);
             } else if (value instanceof RuntimeBeanNameReference) {
                 String refName = ((RuntimeBeanNameReference) value).getBeanName();
                 refName = String.valueOf(doEvaluate(refName));
                 if (!this.beanFactory.containsBean(refName)) {
                     throw new BeanDefinitionStoreException("Invalid bean name '" + refName 
                                                            + "' in bean reference for " + argName);
                 }
                 return refName;
             } else if (value instanceof BeanDefinitionHolder) {
                 // Resolve BeanDefinitionHolder: contains BeanDefinition with name and aliases.
                 BeanDefinitionHolder bdHolder = (BeanDefinitionHolder) value;
                 return resolveInnerBean(argName, bdHolder.getBeanName(), bdHolder.getBeanDefinition());
             } else if (value instanceof BeanDefinition) {
                 // Resolve plain BeanDefinition, without contained name: use dummy name.
                 BeanDefinition bd = (BeanDefinition) value;
                 String innerBeanName = "(inner bean)" + BeanFactoryUtils.GENERATED_BEAN_NAME_SEPARATOR + ObjectUtils.getIdentityHexString(bd);
                 return resolveInnerBean(argName, innerBeanName, bd);
             } else if (value instanceof DependencyDescriptor) {
                 Set<String> autowiredBeanNames = new LinkedHashSet<>(4);
                 Object result = this.beanFactory.resolveDependency((DependencyDescriptor) value, this.beanName, autowiredBeanNames, this.typeConverter);
                 for (String autowiredBeanName : autowiredBeanNames) {
                     if (this.beanFactory.containsBean(autowiredBeanName)) {
                         this.beanFactory.registerDependentBean(autowiredBeanName, this.beanName);
                     }
                 }
                 return result;
             } else if (value instanceof ManagedArray) {
                 // May need to resolve contained runtime references.
                 ManagedArray array = (ManagedArray) value;
                 Class elementType = array.resolvedElementType;
                 if (elementType == null) {
                     String elementTypeName = array.getElementTypeName();
                     if (StringUtils.hasText(elementTypeName)) {
                         try {
                             elementType = ClassUtils.forName(elementTypeName, this.beanFactory.getBeanClassLoader());
                             array.resolvedElementType = elementType;
                         } catch (Throwable ex) {
                             // Improve the message by showing the context.
                             throw new BeanCreationException(this.beanDefinition.getResourceDescription(), 
                                                             this.beanName, "Error resolving array type for " + argName, ex);
                         }
                     } else {
                         elementType = Object.class;
                     }
                 }
                 return resolveManagedArray(argName, (List) value, elementType);
             } else if (value instanceof ManagedList) {
                 // May need to resolve contained runtime references.
                 return resolveManagedList(argName, (List) value);
             } else if (value instanceof ManagedSet) {
                 // May need to resolve contained runtime references.
                 return resolveManagedSet(argName, (Set) value);
             } else if (value instanceof ManagedMap) {
                 // May need to resolve contained runtime references.
                 return resolveManagedMap(argName, (Map<?, ?>) value);
             } else if (value instanceof ManagedProperties) {
                 Properties original = (Properties) value;
                 Properties copy = new Properties();
                 original.forEach((propKey, propValue) -> {
                     if (propKey instanceof TypedStringValue) {
                         propKey = evaluate((TypedStringValue) propKey);
                     }
                     if (propValue instanceof TypedStringValue) {
                         propValue = evaluate((TypedStringValue) propValue);
                     }
                     if (propKey == null || propValue == null) {
                         throw new BeanCreationException(this.beanDefinition.getResourceDescription(), this.beanName, "Error converting Properties key/value pair for " + argName + ": resolved to null");
                     }
                     copy.put(propKey, propValue);
                 });
                 return copy;
             } else if (value instanceof TypedStringValue) {
                 // Convert value to target type here.
                 TypedStringValue typedStringValue = (TypedStringValue) value;
                 Object valueObject = evaluate(typedStringValue);
                 try {
                     Class resolvedTargetType = resolveTargetType(typedStringValue);
                     if (resolvedTargetType != null) {
                         return this.typeConverter.convertIfNecessary(valueObject, resolvedTargetType);
                     } else {
                         return valueObject;
                     }
                 } catch (Throwable ex) {
                     // Improve the message by showing the context.
                     throw new BeanCreationException(this.beanDefinition.getResourceDescription(), this.beanName, "Error converting typed String value for " + argName, ex);
                 }
             } else if (value instanceof NullBean) {
                 return null;
             } else {
                 return evaluate(value);
             }
         }
         ```

   4. 解析Bean引用<font color='red'>【RuntimeBeanReference】</font>：org.springframework.beans.factory.support.**BeanDefinitionValueResolver**#<a id="resolveReference"> resolveReference</a> 

      ```java
         private Object resolveReference(Object argName, RuntimeBeanReference ref) {
           try {
             Object bean;
             Class beanType = ref.getBeanType();
             // ref存在父工厂
             if (ref.isToParent()) {
               BeanFactory parent = this.beanFactory.getParentBeanFactory();
               if (parent == null) {
                 throw new BeanCreationException(this.beanDefinition.getResourceDescription(), this.beanName,
                                                 "Cannot resolve reference to bean " + ref + 
                                                 " in parent factory: no parent factory " + "available");
               }
               if (beanType != null) {
                 bean = parent.getBean(beanType);
               } else {
                 bean = parent.getBean(String.valueOf(doEvaluate(ref.getBeanName())));
               }
             } else {
               String resolvedName;
               if (beanType != null) {
                 NamedBeanHolder namedBean = this.beanFactory.resolveNamedBean(beanType);
                 bean = namedBean.getBeanInstance();
                 resolvedName = namedBean.getBeanName();
               } else {
                 // 解析bean名称
                 resolvedName = String.valueOf(doEvaluate(ref.getBeanName()));
                 // ★★★ 调用工厂的getBean()方法获取bean对象
                 bean = this.beanFactory.getBean(resolvedName);
               }
               this.beanFactory.registerDependentBean(resolvedName, this.beanName);
             }
             if (bean instanceof NullBean) {
               bean = null;
             }
             return bean;
           } catch (BeansException ex) {
             throw new BeanCreationException(this.beanDefinition.getResourceDescription(), this.beanName, "Cannot resolve reference to bean '" + ref.getBeanName() + "' while setting " + argName, ex);
           }
         }
   























   5. <font color='red'>依赖bean的注入</font>
   
      1. org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.**AutowiredFieldElement**#`inject`

         ```java
            @Override
            protected void inject(Object bean, @Nullable String beanName, @Nullable PropertyValues pvs) throws Throwable {
                Field field = (Field) this.member;
                // 解析属性值（Service中的Dao属性）
                Object value = resolveFieldValue(field, bean, beanName);
                if (value != null) {
                    ReflectionUtils.makeAccessible(field);
                    // 设置值
                    field.set(bean, value);
                }
            }
            ```

      2. 从容器中获取依赖的bean：org.springframework.beans.factory.config.**DependencyDescriptor**#`resolveCandidate`

         ```java
            public Object resolveCandidate(String beanName, Class requiredType, BeanFactory beanFactory) throws BeansException {
                return beanFactory.getBean(beanName);
            }
            ```

###### initializeBean

1. 初始化bean：org.springframework.beans.factory.support.**AbstractAutowireCapableBeanFactory**#`initializeBean`(String,Object,RootBeanDefinition)

   ```java
      protected Object initializeBean(String beanName, Object bean, @Nullable RootBeanDefinition mbd) {
          if (System.getSecurityManager() != null) {
              AccessController.doPrivileged((PrivilegedAction<Object>) () -> {
                  invokeAwareMethods(beanName, bean);
                  return null;
              }, getAccessControlContext());
          } else {
              // ★ 调用BeanNameAware、BeanClassLoaderAware、BeanFactoryAware的对应方法，设置beanName、beanClassLoader、beanFactory
              invokeAwareMethods(beanName, bean);
          }
      
          Object wrappedBean = bean;
          // bean非合成的
          if (mbd == null || !mbd.isSynthetic()) {
              // ★ 应用初始化后置处理器：postProcessBeforeInitialization
              // 包含：InitDestroyAnnotationBeanPostProcessor
              wrappedBean = applyBeanPostProcessorsBeforeInitialization(wrappedBean, beanName);
          }
          try {
              // 调用初始化方法
              invokeInitMethods(beanName, wrappedBean, mbd);
          } catch (Throwable ex) {
              throw new BeanCreationException((mbd != null ? mbd.getResourceDescription() : null), beanName, "Invocation of init method failed", ex);
          }
          // ★ 应用初始化后置处理器：postProcessAfterInitialization
          if (mbd == null || !mbd.isSynthetic()) {
              wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
          }
          return wrappedBean;
      }
      ```

   2. org.springframework.context.annotation.**ParserStrategyUtils**#`invokeAwareMethods`

      ```java
         private static void invokeAwareMethods(Object parserStrategyBean, Environment environment,ResourceLoader 		      resourceLoader, BeanDefinitionRegistry registry, @Nullable ClassLoader classLoader) {
         
             // ★ 检查Aware接口并设置相关依赖
             if (parserStrategyBean instanceof Aware) {
                 if (parserStrategyBean instanceof BeanClassLoaderAware && classLoader != null) {
                     ((BeanClassLoaderAware) parserStrategyBean).setBeanClassLoader(classLoader);
                 }
                 if (parserStrategyBean instanceof BeanFactoryAware && registry instanceof BeanFactory) {
                     ((BeanFactoryAware) parserStrategyBean).setBeanFactory((BeanFactory) registry);
                 }
                 if (parserStrategyBean instanceof EnvironmentAware) {
                     ((EnvironmentAware) parserStrategyBean).setEnvironment(environment);
                 }
                 if (parserStrategyBean instanceof ResourceLoaderAware) {
                     ((ResourceLoaderAware) parserStrategyBean).setResourceLoader(resourceLoader);
                 }
             }
         }
         ```

##### getSingleton

> 1. 从缓存中获取已创建的单例Bean，<font color='red'>解决循环引用</font>
> 2. 存在一个增强时机：实现SmartInstantiationAwareBeanPostProcessor接口，<font color='red'>对实例进行增强代理</font>

1. org.springframework.beans.factory.support.**DefaultSingletonBeanRegistry**#`getSingleton`(java.lang.String)

   ```java
      public class DefaultSingletonBeanRegistry extends SimpleAliasRegistry implements SingletonBeanRegistry {
          // 从缓存中获取提前暴露的Bean，用于解决循环引用
          public Object getSingleton(String beanName) {
              return getSingleton(beanName, true);
          }
      }
      ```

###### getSingleton

1. org.springframework.beans.factory.support.`DefaultSingletonBeanRegistry`#<a id="getSingleton(String,boolean)"> **getSingleton**(String, boolean)</a> ——><a id="ObjectFactory#getObject()">ObjectFactory#getObject()</a>

   ```java
      protected Object getSingleton(String beanName, boolean allowEarlyReference) {
          // ★ 从一级缓存中获取beanName对应的单例对象【单例对象缓存】
          Object singletonObject = this.singletonObjects.get(beanName);
          // 一级缓存中不存在 && 当前bean正在被创建
          if (singletonObject == null && isSingletonCurrentlyInCreation(beanName)) {
              // ★ 早期单例对象：earlysingleton0bjects里的对象的都是通过提前曝光的ObjectFactory创建出来的，还未进行属性填充等操作
              // ★ 从二级缓存中获取单例对象
              singletonObject = this.earlySingletonObjects.get(beanName);
              // 二级缓存中不存在 && 允许创建早期单例对象的引用
              if (singletonObject == null && allowEarlyReference) {
                  synchronized (this.singletonObjects) {
                      singletonObject = this.singletonObjects.get(beanName);
                      if (singletonObject == null) {
                          singletonObject = this.earlySingletonObjects.get(beanName);
                          if (singletonObject == null) {
                              // 从三级缓存中获取对象
                              // ★ singletonFactories保存[beanName——>ObjectFactory的lambd表达式]。
                              // 当某些方法需要提前初始化的时候，调用addSingletonFactory方法将对应的ObjectFactory初始化
                              ObjectFactory singletonFactory = this.singletonFactories.get(beanName);
                              if (singletonFactory != null) {
                                  // ★★★ 调用getObject()，会调用FactoryBean的getObject()方法 或 getEarlyBeanReference()方法
                                  singletonObject = singletonFactory.getObject();
                                  // ★ 记录在缓存中，二级缓存和三级缓存中不能同时存在
                                  // 保存在二级缓存
                                  this.earlySingletonObjects.put(beanName, singletonObject);
                                  // 从三级缓存中移除
                                  this.singletonFactories.remove(beanName);
                              }
                          }
                      }
                  }
              }
          }
          return singletonObject;
      }
      ```

###### getEarlyBeanReference

> 1. 当引入AbstractAutoProxyCreator && 出现循环依赖时，才会调用getEarlyBeanReference
> 1. 返回原始对象或返回代理对象

1. org.springframework.beans.factory.support.**AbstractAutowireCapableBeanFactory**#`getEarlyBeanReference`

   ```java
      // 获取引用以便提前访问指定的 Bean，通常用于解析循环引用。
      protected Object getEarlyBeanReference(String beanName, RootBeanDefinition mbd, Object bean) {
          // 默认最终公开的对象是bean，是通过createBeanInstance创建出来的普通对象，
          Object exposedObject = bean;
          // mbd的synthetic属性：设置此bean定义是否是synthetic，一般是指只有AOP相关的pointCut配置或者Advice配置才会将synthetic置为 true
          // ★ mdb不是synthetic && 此工厂拥有 InstantiationAwareBeanPostProcessor，有可能将代理对象替换原始对象的
          if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
              for (BeanPostProcessor bp : getBeanPostProcessors()) {
                  // 经过SmartInstantiationAwareBeanPostProcessor处理后的bean对象
                  if (bp instanceof SmartInstantiationAwareBeanPostProcessor) {
                      SmartInstantiationAwareBeanPostProcessor ibp = (SmartInstantiationAwareBeanPostProcessor) bp;
                      // ★ 调用增强方法（代理增强）
                      exposedObject = ibp.getEarlyBeanReference(exposedObject, beanName);
                  }
              }
          }
          return exposedObject;
      }
      ```

2. 代理对象：org.springframework.aop.framework.autoproxy.**AbstractAutoProxyCreator**#`getEarlyBeanReference`——>**实现SmartInstantiationAwareBeanPostProcessor**

   ```java
      public Object getEarlyBeanReference(Object bean, String beanName) {
          Object cacheKey = getCacheKey(bean.getClass(), beanName);
          this.earlyProxyReferences.put(cacheKey, bean);
          // 返回代理对象
          return wrapIfNecessary(bean, beanName, cacheKey);
      }
      ```

##### getObjectForBeanInstance

> 1. 处理FactoryBean的时机
>     1. 如果是factoryBean，调用getObjectFromFactoryBean，通过FactoryBean#getObject()方法获取实例
>     2. 如果是普通Bean，直接返回

```java
protected Object getObjectForBeanInstance(
    Object beanInstance, String name, String beanName, @Nullable RootBeanDefinition mbd) {

    // 如果 mbd 是 FactoryBean 实现类的实例，即name是bean的原始名称，可能以&开头
    // beanName是规范化后的名称，一定不以&开头
    if (BeanFactoryUtils.isFactoryDereference(name)) {
        if (beanInstance instanceof NullBean) {
            return beanInstance;
        }
        if (!(beanInstance instanceof FactoryBean)) {
            throw new BeanIsNotAFactoryException(beanName, beanInstance.getClass());
        }
        if (mbd != null) {
            mbd.isFactoryBean = true;
        }
        return beanInstance;
    }

    // ★★★ 如果不是 FactoryBean,直接返回当前 Bean 实例
    if (!(beanInstance instanceof FactoryBean)) {
        return beanInstance;
    }

    Object object = null;
    if (mbd != null) {
        mbd.isFactoryBean = true;
    }else {
        // 从缓存中获取对象
        object = getCachedObjectForFactoryBean(beanName);
    }
    if (object == null) {
        // 从工厂返回bean实例。
        FactoryBean factory = (FactoryBean) beanInstance;
        if (mbd == null && containsBeanDefinition(beanName)) {
            // 获取bean的定义信息：myFactoryBean——>MyFactoryBean$1236
            mbd = getMergedLocalBeanDefinition(beanName);
        }
        boolean synthetic = (mbd != null && mbd.isSynthetic());
        // ★★ 获取对象FactoryBeanshil
        object = getObjectFromFactoryBean(factory, beanName, !synthetic);
    }
    return object;
}
```

1. org.springframework.beans.factory.support.**FactoryBeanRegistrySupport**#`getObjectFromFactoryBean`

   ```java
      protected Object getObjectFromFactoryBean(FactoryBean factory, String beanName, boolean shouldPostProcess) {
          // 单例工厂bean && Bean 实例已经创建过, 没有再次创建的必要, 要保证单例 Bean 全局唯一, 直接从缓存中获取
          if (factory.isSingleton() && containsSingleton(beanName)) {
              synchronized (getSingletonMutex()) {
                  Object object = this.factoryBeanObjectCache.get(beanName);
                  if (object == null) {
                      // ★★ 获取Bean对象，激活 FactoryBean 中的 getObject() 方法获取 FactoryBean包含的工件对象
                      object = doGetObjectFromFactoryBean(factory, beanName);
      
                      Object alreadyThere = this.factoryBeanObjectCache.get(beanName);
                      if (alreadyThere != null) {
                          object = alreadyThere;
                      }else {
                          if (shouldPostProcess) {
                              if (isSingletonCurrentlyInCreation(beanName)) {
                                  // Temporarily return non-post-processed object, not storing it yet..
                                  return object;
                              }
                              beforeSingletonCreation(beanName);
                              try {
                                  // 后置处理
                                  object = postProcessObjectFromFactoryBean(object, beanName);
                              }catch (Throwable ex) {
                                  throw new BeanCreationException(beanName, 
                                         "Post-processing of FactoryBean's singleton object failed", ex);}
                              finally {
                                  afterSingletonCreation(beanName);
                              }
                          }
                          if (containsSingleton(beanName)) {
                              this.factoryBeanObjectCache.put(beanName, object);
                          }
                      }
                  }
                  return object;
              }
          } else {
              // ★★ 获取对象从FactoryBean
              Object object = doGetObjectFromFactoryBean(factory, beanName);
              if (shouldPostProcess) {
                  try {
                      // 后置处理
                      object = postProcessObjectFromFactoryBean(object, beanName);
                  }
                  catch (Throwable ex) {
                      throw new BeanCreationException(beanName, "Post-processing of FactoryBean's object failed", ex);
                  }
              }
              return object;
          }
      }
      ```

###### doGetObjectFromFactoryBean

1. org.springframework.beans.factory.support.**FactoryBeanRegistrySupport**#`doGetObjectFromFactoryBean`

   ```java
      private Object doGetObjectFromFactoryBean(FactoryBean factory, String beanName) throws BeanCreationException {
          Object object;
          try {
              if (System.getSecurityManager() != null) {
                  AccessControlContext acc = getAccessControlContext();
                  try {
                      object = AccessController.doPrivileged((PrivilegedExceptionAction<Object>) factory::getObject, acc);
                  }catch (PrivilegedActionException pae) {
                      throw pae.getException();
                  }
              }else {
                  // ★ 激活FactoryBean接口中的getObject()方法使用Bean的定制初始化逻辑进行Bean的初始化并返回
                  object = factory.getObject();
              }
          }catch (FactoryBeanNotInitializedException ex) {
              throw new BeanCurrentlyInCreationException(beanName, ex.toString());
          }catch (Throwable ex) {
              throw new BeanCreationException(beanName, "FactoryBean threw exception on object creation", ex);
          }
      
          // 对于尚未完全初始化的FactoryBean，不要接受空值：许多FactoryBean会返回空值。
          if (object == null) {
              if (isSingletonCurrentlyInCreation(beanName)) {
                  throw new BeanCurrentlyInCreationException(
                      beanName, "FactoryBean which is currently in creation returned null from getObject");
              }
              object = new NullBean();
          }
          return object;
      }
      ```

###### instantiateUsingFactoryMethod

> 使用工厂方法实例化bean：解析【factory-method或@Bean直接指定的bean】org.springframework.beans.factory.support.**AbstractAutowireCapableBeanFactory**#`instantiateUsingFactoryMethod`

```java
protected BeanWrapper instantiateUsingFactoryMethod(
    String beanName, RootBeanDefinition mbd, @Nullable Object[] explicitArgs) {
    // factory-method
    return new ConstructorResolver(this).instantiateUsingFactoryMethod(beanName, mbd, explicitArgs);
}
```

1. 使用工厂方法实例化bean：org.springframework.beans.factory.support.**ConstructorResolver**#`instantiateUsingFactoryMethod`

   ```java
      public BeanWrapper instantiateUsingFactoryMethod(String beanName, RootBeanDefinition mbd, 
                                                       @Nullable Object[] explicitArgs) {
          BeanWrapperImpl bw = new BeanWrapperImpl();
          this.beanFactory.initBeanWrapper(bw);
      
          Object factoryBean;
          Class factoryClass;
          boolean isStatic;
      
          String factoryBeanName = mbd.getFactoryBeanName();
          // 存在工厂方法
          if (factoryBeanName != null) {
              if (factoryBeanName.equals(beanName)) {
                  throw new BeanDefinitionStoreException(mbd.getResourceDescription(), beanName, "factory-bean reference points back to the same bean definition");
              }
              // 获取工厂bean
              factoryBean = this.beanFactory.getBean(factoryBeanName);
              if (mbd.isSingleton() && this.beanFactory.containsSingleton(beanName)) {
                  throw new ImplicitlyAppearedSingletonException();
              }
              this.beanFactory.registerDependentBean(factoryBeanName, beanName);
              factoryClass = factoryBean.getClass();
              isStatic = false;
          } else {
              // It's a static factory method on the bean class.
              if (!mbd.hasBeanClass()) {
                  throw new BeanDefinitionStoreException(mbd.getResourceDescription(), beanName, "bean definition declares neither a bean class nor a factory-bean reference");
              }
              factoryBean = null;
              factoryClass = mbd.getBeanClass();
              isStatic = true;
          }
      
          Method factoryMethodToUse = null;
          ConstructorResolver.ArgumentsHolder argsHolderToUse = null;
          Object[] argsToUse = null;
      
          if (explicitArgs != null) {
              argsToUse = explicitArgs;
          } else {
              Object[] argsToResolve = null;
              synchronized (mbd.constructorArgumentLock) {
                  factoryMethodToUse = (Method) mbd.resolvedConstructorOrFactoryMethod;
                  if (factoryMethodToUse != null && mbd.constructorArgumentsResolved) {
                      // Found a cached factory method...
                      argsToUse = mbd.resolvedConstructorArguments;
                      if (argsToUse == null) {
                          argsToResolve = mbd.preparedConstructorArguments;
                      }
                  }
              }
              if (argsToResolve != null) {
                  argsToUse = resolvePreparedArguments(beanName, mbd, bw, factoryMethodToUse, argsToResolve);
              }
          }
      
          if (factoryMethodToUse == null || argsToUse == null) {
              // Need to determine the factory method...
              // Try all methods with this name to see if they match the given arguments.
              factoryClass = ClassUtils.getUserClass(factoryClass);
      
              List<Method> candidates = null;
              if (mbd.isFactoryMethodUnique) {
                  if (factoryMethodToUse == null) {
                      factoryMethodToUse = mbd.getResolvedFactoryMethod();
                  }
                  if (factoryMethodToUse != null) {
                      candidates = Collections.singletonList(factoryMethodToUse);
                  }
              }
              if (candidates == null) {
                  candidates = new ArrayList<>();
                  Method[] rawCandidates = getCandidateMethods(factoryClass, mbd);
                  for (Method candidate : rawCandidates) {
                      if (Modifier.isStatic(candidate.getModifiers()) == isStatic && mbd.isFactoryMethod(candidate)) {
                          candidates.add(candidate);
                      }
                  }
              }
      
              if (candidates.size() == 1 && explicitArgs == null && !mbd.hasConstructorArgumentValues()) {
                  Method uniqueCandidate = candidates.get(0);
                  if (uniqueCandidate.getParameterCount() == 0) {
                      mbd.factoryMethodToIntrospect = uniqueCandidate;
                      synchronized (mbd.constructorArgumentLock) {
                          mbd.resolvedConstructorOrFactoryMethod = uniqueCandidate;
                          mbd.constructorArgumentsResolved = true;
                          mbd.resolvedConstructorArguments = EMPTY_ARGS;
                      }
                      // ★ 获取bean实例
                      bw.setBeanInstance(instantiate(beanName, mbd, factoryBean, uniqueCandidate, EMPTY_ARGS));
                      return bw;
                  }
              }
      
              if (candidates.size() > 1. {  // explicitly skip immutable singletonList
                  candidates.sort(AutowireUtils.EXECUTABLE_COMPARATOR);
              }
      
              ConstructorArgumentValues resolvedValues = null;
              boolean autowiring = (mbd.getResolvedAutowireMode() == AutowireCapableBeanFactory.AUTOWIRE_CONSTRUCTOR);
              int minTypeDiffWeight = Integer.MAX_VALUE;
              Set<Method> ambiguousFactoryMethods = null;
      
              int minNrOfArgs;
              if (explicitArgs != null) {
                  minNrOfArgs = explicitArgs.length;
              } else {
                  // We don't have arguments passed in programmatically, so we need to resolve the
                  // arguments specified in the constructor arguments held in the bean definition.
                  if (mbd.hasConstructorArgumentValues()) {
                      ConstructorArgumentValues cargs = mbd.getConstructorArgumentValues();
                      resolvedValues = new ConstructorArgumentValues();
                      minNrOfArgs = resolveConstructorArguments(beanName, mbd, bw, cargs, resolvedValues);
                  } else {
                      minNrOfArgs = 0;
                  }
              }
      
              LinkedList<UnsatisfiedDependencyException> causes = null;
      
              for (Method candidate : candidates) {
                  int parameterCount = candidate.getParameterCount();
      
                  if (parameterCount >= minNrOfArgs) {
                      ConstructorResolver.ArgumentsHolder argsHolder;
      
                      Class[] paramTypes = candidate.getParameterTypes();
                      if (explicitArgs != null) {
                          // Explicit arguments given -> arguments length must match exactly.
                          if (paramTypes.length != explicitArgs.length) {
                              continue;
                          }
                          argsHolder = new ConstructorResolver.ArgumentsHolder(explicitArgs);
                      } else {
                          // Resolved constructor arguments: type conversion and/or autowiring necessary.
                          try {
                              String[] paramNames = null;
                              ParameterNameDiscoverer pnd = this.beanFactory.getParameterNameDiscoverer();
                              if (pnd != null) {
                                  paramNames = pnd.getParameterNames(candidate);
                              }
                              argsHolder = createArgumentArray(beanName, mbd, resolvedValues, bw, paramTypes, paramNames, candidate, autowiring, candidates.size() == 1);
                          } catch (UnsatisfiedDependencyException ex) {
                              if (logger.isTraceEnabled()) {
                                  logger.trace("Ignoring factory method [" + candidate + "] of bean '" + beanName + "': " + ex);
                              }
                              // Swallow and try next overloaded factory method.
                              if (causes == null) {
                                  causes = new LinkedList<>();
                              }
                              causes.add(ex);
                              continue;
                          }
                      }
      
                      int typeDiffWeight = (mbd.isLenientConstructorResolution() ? argsHolder.getTypeDifferenceWeight(paramTypes) : argsHolder.getAssignabilityWeight(paramTypes));
                      if (typeDiffWeight < minTypeDiffWeight) {
                          factoryMethodToUse = candidate;
                          argsHolderToUse = argsHolder;
                          argsToUse = argsHolder.arguments;
                          minTypeDiffWeight = typeDiffWeight;
                          ambiguousFactoryMethods = null;
                      }else if (factoryMethodToUse != null && typeDiffWeight == minTypeDiffWeight && !mbd.isLenientConstructorResolution() && paramTypes.length == factoryMethodToUse.getParameterCount() && !Arrays.equals(paramTypes, factoryMethodToUse.getParameterTypes())) {
                          if (ambiguousFactoryMethods == null) {
                              ambiguousFactoryMethods = new LinkedHashSet<>();
                              ambiguousFactoryMethods.add(factoryMethodToUse);
                          }
                          ambiguousFactoryMethods.add(candidate);
                      }
                  }
              }
      
              if (factoryMethodToUse == null || argsToUse == null) {
                  throw new Exception();
              }
      
              if (explicitArgs == null && argsHolderToUse != null) {
                  mbd.factoryMethodToIntrospect = factoryMethodToUse;
                  argsHolderToUse.storeCache(mbd, factoryMethodToUse);
              }
          }
      
          bw.setBeanInstance(instantiate(beanName, mbd, factoryBean, factoryMethodToUse, argsToUse));
          return bw;
      }
      ```

2. org.springframework.beans.factory.support.**ConstructorResolver**#`instantiate`(String, RootBeanDefinition,Object, Method,Object[])

   ```java
      private Object instantiate(String beanName, RootBeanDefinition mbd,
                                 @Nullable Object factoryBean, Method factoryMethod, Object[] args) {
          // 系统安全管理器不为空
          if (System.getSecurityManager() != null) {
              return AccessController.doPrivileged(
                  (PrivilegedAction<Object>) () ->this.beanFactory.getInstantiationStrategy().instantiate(
                      mbd, beanName, this.beanFactory, factoryBean, factoryMethod,args),
                  this.beanFactory.getAccessControlContext());
          }else {
              // ★ 使用工厂策略获取bean实例
              return this.beanFactory.getInstantiationStrategy().instantiate(
                  mbd, beanName, this.beanFactory, factoryBean, factoryMethod, args);
          }
      }
      ```

3. org.springframework.beans.factory.support.**SimpleInstantiationStrategy**#`instantiate`(RootBeanDefinition, String, BeanFactory, java.lang.Object, Method, Object...)

   ```java
      public Object instantiate(RootBeanDefinition bd, @Nullable String beanName, BeanFactory owner, @Nullable Object factoryBean, final Method factoryMethod, Object... args) {
          if (System.getSecurityManager() != null) {
              AccessController.doPrivileged((PrivilegedAction<Object>) () -> {
                  ReflectionUtils.makeAccessible(factoryMethod);
                  return null;
              });
          } else {
              ReflectionUtils.makeAccessible(factoryMethod);
          }
      
          Method priorInvokedFactoryMethod = currentlyInvokedFactoryMethod.get();
          try {
              currentlyInvokedFactoryMethod.set(factoryMethod);
              // ★ 执行调用FactoryBean#getObject()
              Object result = factoryMethod.invoke(factoryBean, args);
              if (result == null) {
                  result = new NullBean();
              }
              return result;
          } finally {
              if (priorInvokedFactoryMethod != null) {
                  currentlyInvokedFactoryMethod.set(priorInvokedFactoryMethod);
              } else {
                  currentlyInvokedFactoryMethod.remove();
              }
          }
      }
      ```

#### afterSingletonsInstantiated

> 触发SmartInitializingSingleton实现类的bean的初始化后回调...

1. org.springframework.beans.factory.support.**DefaultListableBeanFactory**#`preInstantiateSingletons`

```java
for (String beanName : beanNames) {
	Object singletonInstance = getSingleton(beanName);
	if (singletonInstance instanceof SmartInitializingSingleton) {
		SmartInitializingSingleton smartSingleton = (SmartInitializingSingleton) singletonInstance;
		if (System.getSecurityManager() != null) {
			AccessController.doPrivileged((PrivilegedAction<Object>) () -> {
				smartSingleton.afterSingletonsInstantiated();
				return null;
			}, getAccessControlContext());
		}
		else {
			smartSingleton.afterSingletonsInstantiated();
		}
	}
}
```

### finishRefresh

```java
protected void finishRefresh() {
    // 清除上下文级资源缓存
    clearResourceCaches();

    // 初始化生命周期处理器。注册默认实例：DefaultLifecycleProcessor
    initLifecycleProcessor();

    // 将refresh传播到 LifecycleProcessor，进行广播
    getLifecycleProcessor().onRefresh();

    // ★ 发布最后的事件。
    publishEvent(new ContextRefreshedEvent(this));

    // 如果活跃，参与LiveBeansView MBean（）。
    LiveBeansView.registerApplicationContext(this);
}
```

1. org.springframework.context.support.**AbstractApplicationContext**#`publishEvent`(Object,ResolvableType)

```java
protected void publishEvent(Object event, @Nullable ResolvableType eventType) {
	Assert.notNull(event, "Event must not be null");

	// 将事件装饰为ApplicationEvent
	ApplicationEvent applicationEvent;
	if (event instanceof ApplicationEvent) {
		applicationEvent = (ApplicationEvent) event;
	}else {
		applicationEvent = new PayloadApplicationEvent<>(this, event);
		if (eventType == null) {
			eventType = ((PayloadApplicationEvent) applicationEvent).getResolvableType();
		}
	}

	// Multicast right now if possible - or lazily once the multicaster is initialized
	if (this.earlyApplicationEvents != null) {
		this.earlyApplicationEvents.add(applicationEvent);
	}else {
		// 通过广播器进行事件广播
		getApplicationEventMulticaster().multicastEvent(applicationEvent, eventType);
	}

	// 通过父上下文发布事件...
	if (this.parent != null) {
		if (this.parent instanceof AbstractApplicationContext) {
			((AbstractApplicationContext) this.parent).publishEvent(event, eventType);
		}else {
			this.parent.publishEvent(event);
		}
	}
}
```
# Spring AOP

## 切面

高级切面：Aspect

1. 切面 = 切点（Pointcut） + 通知（Advice）

    1. 切点：增强那个方法
    2. 通知：什么时候增强、怎么增强
2. 可以包含多个切面和多个切点
    1. [MyAspect](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/aspect/entity/MyAspect.java)

低级切面：Advisor

1. 更细粒度的切面，包含一个通知和一个切点
    1. [InnerAdvisorConfiguration](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/org/springframework/aop/framework/autoproxy/InnerAdvisorConfiguration.java)

切面转换

1. [Aspect2Advisor](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/org/springframework/aop/framework/Aspect2Advisor.java)

## 切入点

### Pointcut

#### 类型匹配语法

1. *：匹配任意数量字符
2. ..：匹配任意数量字符的重复
   1. 类型模式匹配任意数量的子包
   2. 方法参数模式匹配任意数量的参数
3. +：匹配指定类型及其子类型
   1. 仅能作为后缀放在类型模式后面

#### 切入点表达式

> 1. A.getClass().isAssignableFrom(B.getClass())：A是B的父类或父接口或本身
> 2. [切入点博客](http://t.zoukankan.com/mark5-p-15534298.html)

1. execution：
2. within(类型表达式)：目标对象target的类型是否和within中指定的类型匹配
   1. 匹配原则：within(x)
      1. `target.getClass().equals(within表达式中指定的类型)`
   2. within(类型) ：
   3. within(类型+)：匹配的类型及子类
3. this(类型全限定名)：通过aop创建的代理对象的类型是否和this中指定的类型x匹配
   1. 匹配原则：`this(x)`
      1. `x.getClass().isAssignableFrom(proxy.getClass());`
   2. 创建的代理对象是目标对象的子类：基于子类 （CGLIB） 的代理
4. target(类型全限定名)：判断目标对象的类型是否和指定的类型匹配；
   1. 匹配原则：`target(x)`
      1. `x.getClass().isAssignableFrom(target.getClass());`
5. args：运行时动态匹配参数
6. bean：在spring环境中，匹配容器中指定名称的bean
7. @annotation(注解类型)：匹配被调用的方法上有指定的注解。

### MethodMatcher

> 可以理解为切点

```java
public static void main(String[] args) throws Exception {
    // AspectJ 表达式匹配
    AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
    pointcut.setExpression("execution(* getName())");

    AspectJExpressionPointcut pointcut1 = new AspectJExpressionPointcut();
    pointcut1.setExpression("@annotation(org.springframework.transaction.annotation.Transactional)");

    MethodMatcher methodMatcher = MethodMatchers.intersection(pointcut,pointcut1);
    System.out.println(methodMatcher.matches(AspectService.class.getMethod("getName"), AspectService.class));
    System.out.println(methodMatcher.matches(AspectService.class.getMethod("getUser"), AspectService.class));

    // 静态切入点匹配：自定义匹配规则，@Transactional的实现
    StaticMethodMatcherPointcut pointcut2 = new StaticMethodMatcherPointcut() {
        @Override
        public boolean matches(Method method, Class targetClass) {
            MergedAnnotations annotations = MergedAnnotations.from(method);
            if (annotations.isDirectlyPresent(Transactional.class)) {
                return true;
            }
            annotations = MergedAnnotations.from(targetClass, MergedAnnotations.SearchStrategy.TYPE_HIERARCHY);
            return annotations.isDirectlyPresent(Transactional.class);
        }
    };
    System.out.println(pointcut2.matches(AspectService.class.getMethod("getName"),AspectService.class));
    System.out.println(pointcut2.matches(AspectService.class.getMethod("getName"),AspectService.class));
    System.out.println(pointcut2.matches(AspectService.class.getMethod("getUser"),AspectService.class));
}
```

## 源码

### @EnableAspectJAutoProxy

```java
// 注册bean：org.springframework.aop.config.internalAutoProxyCreator=AnnotationAwareAspectJAutoProxyCreator
@Import(AspectJAutoProxyRegistrar.class)
public @interface EnableAspectJAutoProxy {
    // 是否要创建基于子类的CGLIB代理，而非基于接口的JDK动态代理。默认为false
    // 目标类无接口，默认创建CGLIB代理
	boolean proxyTargetClass() default false;

    // 是否暴露代理给与线程关联的AopContext[currentProxy属性]
	boolean exposeProxy() default false;
}
```

1. org.springframework.aop.config.**AopConfigUtils**#`registerAspectJAnnotationAutoProxyCreatorIfNecessary`(BeanDefinitionRegistry, Object)

```java
@Nullable
public static BeanDefinition registerAspectJAnnotationAutoProxyCreatorIfNecessary( BeanDefinitionRegistry registry, @Nullable Object source) {
  // ★ 注册bean：AnnotationAwareAspectJAutoProxyCreator.class
  return registerOrEscalateApcAsRequired(AnnotationAwareAspectJAutoProxyCreator.class, registry, source);
}
```

   2. org.springframework.aop.config.**AopConfigUtils**#`registerOrEscalateApcAsRequired`

```java
 @Nullable
 private static BeanDefinition registerOrEscalateApcAsRequired( Class cls, BeanDefinitionRegistry registry, @Nullable Object source) {
	 Assert.notNull(registry, "BeanDefinitionRegistry must not be null");
	 // ★ AUTO_PROXY_CREATOR_BEAN_NAME ="org.springframework.aop.config.internalAutoProxyCreator"
	 if (registry.containsBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME)) {
		 BeanDefinition apcDefinition = registry.getBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME);
		 if (!cls.getName().equals(apcDefinition.getBeanClassName())) {
			 int currentPriority = findPriorityForClass(apcDefinition.getBeanClassName());
			 int requiredPriority = findPriorityForClass(cls);
			 if (currentPriority < requiredPriority) {
				 apcDefinition.setBeanClassName(cls.getName());
			 }
		 }
		 return null;
	 }
	 // ★ 注册后置处理器bean：internalAutoProxyCreator
	 RootBeanDefinition beanDefinition = new RootBeanDefinition(cls);
	 beanDefinition.setSource(source);
	 beanDefinition.getPropertyValues().add("order", Ordered.HIGHEST_PRECEDENCE);
	 beanDefinition.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
	 registry.registerBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME, beanDefinition);
	 return beanDefinition;
 }
 ```

### 注册动态代理

> 1. 切面执行顺序
>     1. 可通过@Order注解，标注在@Aspect类上进行顺序控制
>         1. 标注在@Bean方法上和@Before、@After等方法上不起作用

![image-20230107204034018](https://raw.gitmirror.com/jiuxi521/typora/master/AnnotationAwareAspectJAutoProxyCreater.png)

> 1. **org.springframework.aop.aspectj.annotation.AnnotationAwareAspectJAutoProxyCreator**
>    1. org.springframework.aop.aspectj.annotation.AnnotationAwareAspectJAutoProxyCreator#`initBeanFactory`
>    2. **org.springframework.aop.aspectj.autoproxy.AspectJAwareAdvisorAutoProxyCreator**
>       1. **org.springframework.aop.framework.autoproxy.AbstractAdvisorAutoProxyCreator**
>          1. org.springframework.aop.framework.autoproxy.AbstractAdvisorAutoProxyCreator#`setBeanFactory`★ ★ 
>          2. **org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator**
>             1. org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator#`postProcessBeforeInstantiation`★ ★ 
>             2. org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator#`postProcessAfterInstantiation`
>             3. org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator#`postProcessProperties`
>             4. org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator#`postProcessBeforeInitialization`
>             5. org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator#`postProcessAfterInitialization`★ ★ ★ 
>             6. **org.springframework.beans.factory.config.SmartInstantiationAwareBeanPostProcessor**
>                1. **org.springframework.beans.factory.config.InstantiationAwareBeanPostProcessor**
>                   1. postProcessBeforeInstantiation、postProcessAfterInstantiation、postProcessProperties
>                   2. **org.springframework.beans.factory.config.BeanPostProcessor**
>                      1. postProcessBeforeInitialization、postProcessAfterInitialization
>             7. **org.springframework.beans.factory.BeanFactoryAware**
>                1. setBeanFactory

#### postProcessAfterInitialization

> 1. wrapIfNecessary：<font color='red'>获取代理对象（增强原始bean）</font>
> 2. findEligibleAdvisors：<font color='red'>将高级切面Aspect转为低级切面Advisor</font>

org.springframework.aop.framework.autoproxy.**AbstractAutoProxyCreator**#`postProcessAfterInitialization`

```java
public Object postProcessAfterInitialization(@Nullable Object bean, String beanName) {
    if (bean != null) {
        // 获取缓存唯一Key，
        Object cacheKey = getCacheKey(bean.getClass(), beanName);
        if (this.earlyProxyReferences.remove(cacheKey) != bean) {
            // ★ 封装被代理bean
            return wrapIfNecessary(bean, beanName, cacheKey);
        }
    }
    return bean;
}
```

##### wrapIfNecessary

> 1. 作用
>     1. <font color='red'>获取代理对象</font>
> 2. 代理对象创建时机
>     1. 创建Bean——>（`时机1`）Bean依赖注入——>Bean的初始化（`时机2`）
>         1. 存在循环依赖：在依赖注入之前，通过三级缓存的Lambda表达式【bean的name,ObjectFactory的getObject()】，调用其实现`getEarlyBeanReference`创建代理对象 。[getEarlyBeanReference](#getEarlyBeanReference)
>         2. 不存在循环依赖：在Bean初始化完成之后，调用`postProcessAfterInitialization`创建代理对象[postProcessAfterInitialization](#postProcessAfterInitialization)

1. org.springframework.aop.framework.autoproxy.**AbstractAutoProxyCreator**#`wrapIfNecessary`

```java
protected Object wrapIfNecessary(Object bean, String beanName, Object cacheKey) {
  if (StringUtils.hasLength(beanName) && this.targetSourcedBeans.contains(beanName)) {
	  return bean;
  }
  if (Boolean.FALSE.equals(this.advisedBeans.get(cacheKey))) {
	  return bean;
  }
  if (isInfrastructureClass(bean.getClass()) || shouldSkip(bean.getClass(), beanName)) {
	  this.advisedBeans.put(cacheKey, Boolean.FALSE);
	  return bean;
  }
  
  // ★ 获取满足条件的Advisor
  Object[] specificInterceptors = getAdvicesAndAdvisorsForBean(bean.getClass(), beanName, null);
  if (specificInterceptors != DO_NOT_PROXY) {
	  this.advisedBeans.put(cacheKey, Boolean.TRUE);
	  // ★★ 根据Advisor[]创建代理
	  Object proxy = createProxy(
		  bean.getClass(), beanName, specificInterceptors, new SingletonTargetSource(bean));
	  this.proxyTypes.put(cacheKey, proxy.getClass());
	  return proxy;
  }

  this.advisedBeans.put(cacheKey, Boolean.FALSE);
  return bean;
}
```

   2. org.springframework.aop.framework.autoproxy.**AbstractAdvisorAutoProxyCreator**#`getAdvicesAndAdvisorsForBean`

```java
 protected Object[] getAdvicesAndAdvisorsForBean( Class beanClass, String beanName, @Nullable TargetSource targetSource) {
	 // ★ 获取增强器
	 List<Advisor> advisors = (beanClass, beanName);
	 if (advisors.isEmpty()) {
		 return DO_NOT_PROXY;
	 }
	 return advisors.toArray();
 }
 ```

   3. [findEligibleAdvisors](#findEligibleAdvisors)

2. [createProxy](#createProxy)

##### findEligibleAdvisors

> 1. 作用
>     1. <font color='red'>将高级切面Aspect转为低级切面Advisor</font>

org.springframework.aop.framework.autoproxy.**AbstractAdvisorAutoProxyCreator**#`findEligibleAdvisors`

```java
protected List<Advisor> findEligibleAdvisors(Class beanClass, String beanName) {
    // ★ 获取候选增强器
    List<Advisor> candidateAdvisors = findCandidateAdvisors();
    // ★ 获取满足切入点表达式的增强器
    List<Advisor> eligibleAdvisors = findAdvisorsThatCanApply(candidateAdvisors, beanClass, beanName);
    // 增加扩展的增强器：将ExposeInvocationInterceptor添加到建议链的开头。
    extendAdvisors(eligibleAdvisors);
    if (!eligibleAdvisors.isEmpty()) {
        // 增强器排序
        eligibleAdvisors = sortAdvisors(eligibleAdvisors);
    }
    return eligibleAdvisors;
}
```

1. 获取候选的所有增强器：org.springframework.aop.aspectj.annotation.**AnnotationAwareAspectJAutoProxyCreator**#`findCandidateAdvisors`

   > 1. 从bean工厂中获取Advisor类型的bean
   > 2. 从bean工厂中获取Objecy类型的bean，处理标注有@Aspect注解的类 ，被<aop：include>元素的includePatterns匹配

```java
protected List<Advisor> findCandidateAdvisors() {
  // 从bean工厂中获取Advisor类型的bean
  List<Advisor> advisors = super.findCandidateAdvisors();{
	 this.advisorRetrievalHelper.findAdvisorBeans(); 
  }
  if (this.aspectJAdvisorsBuilder != null) {
	  // ★★ 构建Advisors(对于bean工厂中的所有AspectJ切面)
	  advisors.addAll(this.aspectJAdvisorsBuilder.buildAspectJAdvisors());
  }
  return advisors;
}
```

   2. 构建Advisor：org.springframework.aop.aspectj.annotation.**BeanFactoryAspectJAdvisorsBuilder**#`buildAspectJAdvisors`

```java
public List<Advisor> buildAspectJAdvisors() {
 List<String> aspectNames = this.aspectBeanNames;

 if (aspectNames == null) {
	 List<Advisor> advisors = new ArrayList<>();
	 aspectNames = new ArrayList<>();
	 // ★ 获取容器中的所有bean
	 String[] beanNames = BeanFactoryUtils.beanNamesForTypeIncludingAncestors(this.beanFactory, Object.class, true, false);
	 for (String beanName : beanNames) {
		 // 判断是否被<aop：include>元素的includePatterns匹配
		 if (!isEligibleBean(beanName)) {
			 continue;
		 }
		 Class beanType = this.beanFactory.getType(beanName, false);
		 if (beanType == null) {
			 continue;
		 }
		 // 判断是否标注有@Aspect注解 && 不是由ajc$编译
		 if (this.advisorFactory.isAspect(beanType)) {
			 aspectNames.add(beanName);
			 AspectMetadata amd = new AspectMetadata(beanType, beanName);
			 if (amd.getAjType().getPerClause().getKind() == PerClauseKind.SINGLETON) {
				 MetadataAwareAspectInstanceFactory factory = new BeanFactoryAspectInstanceFactory(this.beanFactory, beanName);
				 // ★★ 获取增强方法
				 List<Advisor> classAdvisors = this.advisorFactory.getAdvisors(factory);
				 if (this.beanFactory.isSingleton(beanName)) {
					 this.advisorsCache.put(beanName, classAdvisors);
				 } else {
					 this.aspectFactoryCache.put(beanName, factory);
				 }
				 advisors.addAll(classAdvisors);
			 } else {
				 // Per target or per this.
				 if (this.beanFactory.isSingleton(beanName)) {
					 throw new IllegalArgumentException("Bean with name '" + beanName + "' is a singleton, but aspect instantiation model is not singleton");
				 }
				 MetadataAwareAspectInstanceFactory factory = new PrototypeAspectInstanceFactory(this.beanFactory, beanName);
				 this.aspectFactoryCache.put(beanName, factory);
				 advisors.addAll(this.advisorFactory.getAdvisors(factory));
			 }
		 }
	 }
	 this.aspectBeanNames = aspectNames;
	 return advisors;
 }

 if (aspectNames.isEmpty()) {
	 return Collections.emptyList();
 }
 // 从缓存中获取增强器
 List<Advisor> advisors = new ArrayList<>();
 for (String aspectName : aspectNames) {
	 List<Advisor> cachedAdvisors = this.advisorsCache.get(aspectName);
	 if (cachedAdvisors != null) {
		 advisors.addAll(cachedAdvisors);
	 } else {
		 MetadataAwareAspectInstanceFactory factory = this.aspectFactoryCache.get(aspectName);
		 advisors.addAll(this.advisorFactory.getAdvisors(factory));
	 }
 }
 return advisors;
}
```

   3. 获取增强方法：org.springframework.aop.aspectj.annotation.**ReflectiveAspectJAdvisorFactory**#`getAdvisors`

```java
 public List<Advisor> getAdvisors(MetadataAwareAspectInstanceFactory aspectInstanceFactory) {
	 Class aspectClass = aspectInstanceFactory.getAspectMetadata().getAspectClass();
	 String aspectName = aspectInstanceFactory.getAspectMetadata().getAspectName();
	 validate(aspectClass);
 
	 // 用装饰器包装MetadataAwareAspectInstanceFactory，以便它只实例化一次。
	 MetadataAwareAspectInstanceFactory lazySingletonAspectInstanceFactory = new LazySingletonAspectInstanceFactoryDecorator(aspectInstanceFactory);
 
	 List<Advisor> advisors = new ArrayList<>();
	 // ★ getAdvisorMethods() 获取切面内的所有方法
	 for (Method method : getAdvisorMethods(aspectClass)) {
		 // 根据注解判断是否是增强方法（如果是返回增强方法；否返回null）
		 Advisor advisor = getAdvisor(method, lazySingletonAspectInstanceFactory, 0, aspectName);
		 if (advisor != null) {
			 advisors.add(advisor);
		 }
	 }
	 return advisors;
 }
```

2. 获取匹配的增强器：org.springframework.aop.support.**AopUtils**#`findAdvisorsThatCanApply`

```java
public static List<Advisor> findAdvisorsThatCanApply(List<Advisor> candidateAdvisors, Class clazz) {
  if (candidateAdvisors.isEmpty()) {
	  return candidateAdvisors;
  }
  List<Advisor> eligibleAdvisors = new ArrayList<>();
  for (Advisor candidate : candidateAdvisors) {
	  if (candidate instanceof IntroductionAdvisor && canApply(candidate, clazz)) {
		  eligibleAdvisors.add(candidate);
	  }
  }
  boolean hasIntroductions = !eligibleAdvisors.isEmpty();
  // ★ 遍历候选增强器
  for (Advisor candidate : candidateAdvisors) {
	  if (candidate instanceof IntroductionAdvisor) {
		  // already processed
		  continue;
	  }
	  // ★★ 判断是否可以匹配；candidate：候选增强方法；clazz：待增强bean；
	  if (canApply(candidate, clazz, hasIntroductions)) {
		  eligibleAdvisors.add(candidate);
	  }
  }
  return eligibleAdvisors;
}
```

   2. org.springframework.aop.support.**AopUtils**#`canApply`(org.springframework.aop.Advisor, java.lang.Class, boolean)

```java
 public static boolean canApply(Advisor advisor, Class targetClass, boolean hasIntroductions) {
	 if (advisor instanceof PointcutAdvisor) {
		 // ★ PointcutAdvisor匹配
		 PointcutAdvisor pca = (PointcutAdvisor) advisor;
		 return canApply(pca.getPointcut(), targetClass, hasIntroductions);
	 }
 }
```

   3. org.springframework.aop.support.**AopUtils**#`canApply`(org.springframework.aop.Pointcut, java.lang.Class, boolean)

      1. 使用ClassFilter进行类匹配过滤
         > 2. 使用MethodMatcher进行方法匹配过滤<font color='red'>MethodMatcher保存切入点Pointcut的信息</font>
		```java
		public static boolean canApply(Pointcut pc, Class targetClass, boolean hasIntroductions) {
		 Assert.notNull(pc, "Pointcut must not be null");
		 
		 // 使用ClassFilter进行类匹配过滤
		 if (!pc.getClassFilter().matches(targetClass)) {
			 return false;
		 }
		
		 MethodMatcher methodMatcher = pc.getMethodMatcher();
		 if (methodMatcher == MethodMatcher.TRUE) {
			 // 所有方法都匹配，返回true
			 return true;
		 }
		
		 IntroductionAwareMethodMatcher introductionAwareMethodMatcher = null;
		 if (methodMatcher instanceof IntroductionAwareMethodMatcher) {
			 introductionAwareMethodMatcher = (IntroductionAwareMethodMatcher) methodMatcher;
		 }
		
		 Set<Class> classes = new LinkedHashSet<>();
		 if (!Proxy.isProxyClass(targetClass)) {
			 // 获取被代理的目标类
			 classes.add(ClassUtils.getUserClass(targetClass));
		 }
		 // 获取类的所有父接口
		 classes.addAll(ClassUtils.getAllInterfacesForClassAsSet(targetClass));
		
		 for (Class clazz : classes) {
			 // 获取声明的所有方法
			 Method[] methods = ReflectionUtils.getAllDeclaredMethods(clazz);
			 for (Method method : methods) {
				 // ★★ 方法匹配
				 if (introductionAwareMethodMatcher != null ?
					 introductionAwareMethodMatcher.matches(method, targetClass, hasIntroductions) :
					 methodMatcher.matches(method, targetClass)) {
					 return true;
				 }
			 }
		 }
		 return false;
		}
		```

#### other

##### setBeanFactory

1. org.springframework.aop.framework.autoproxy.**AbstractAdvisorAutoProxyCreator**#`setBeanFactory`

```java
	@Override
	public void setBeanFactory(BeanFactory beanFactory) {
		// ★ 设置beanFactory
		this.beanFactory = beanFactory;
		if (!(beanFactory instanceof ConfigurableListableBeanFactory)) {
			throw new IllegalArgumentException(
				"AdvisorAutoProxyCreator requires a ConfigurableListableBeanFactory: " + beanFactory);
		}
		// 初始化beanFactory
		initBeanFactory((ConfigurableListableBeanFactory) beanFactory);
	}
```

##### initBeanFactory

1. org.springframework.aop.aspectj.annotation.**AnnotationAwareAspectJAutoProxyCreator**#`initBeanFactory`

    ```java
	protected void initBeanFactory(ConfigurableListableBeanFactory beanFactory) {
		// 调用AbstractAdvisorAutoProxyCreator的initBeanFactory
	   super.initBeanFactory(beanFactory);
	   if (this.aspectJAdvisorFactory == null) {
		  this.aspectJAdvisorFactory = new ReflectiveAspectJAdvisorFactory(beanFactory);
	   }
	   this.aspectJAdvisorsBuilder =
			 new BeanFactoryAspectJAdvisorsBuilderAdapter(beanFactory, this.aspectJAdvisorFactory);
	}
	```

2. org.springframework.aop.framework.autoproxy.**AbstractAdvisorAutoProxyCreator**#`initBeanFactory`

    ```java
	protected void initBeanFactory(ConfigurableListableBeanFactory beanFactory) {
		// Advisor检索帮助适配器
		this.advisorRetrievalHelper = new BeanFactoryAdvisorRetrievalHelperAdapter(beanFactory);
	}
	```

##### postProcessBeforeInstantiation

1. org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator#postProcessBeforeInstantiation

```java
public Object postProcessBeforeInstantiation(Class beanClass, String beanName) {
	// 创建缓存唯一Key，
	Object cacheKey = getCacheKey(beanClass, beanName);

	if (!StringUtils.hasLength(beanName) || !this.targetSourcedBeans.contains(beanName)) {
		if (this.advisedBeans.containsKey(cacheKey)) {
			return null;
		}
		// ★ 1. 返回是否是基础设施类的bean：Advice、Pointcut、Advisor、AopInfrastructureBean，永不会被代理、
		// 	  2. beanName以.ORIGINAL开头，跳过代理
		if (isInfrastructureClass(beanClass) || shouldSkip(beanClass, beanName)) {
			this.advisedBeans.put(cacheKey, Boolean.FALSE);
			return null;
		}
	}
	// 自定义TargetSource，在此处创建代理，以自定义方式处理目标实例。阻止不必要的目标bean默认实例化
	TargetSource targetSource = getCustomTargetSource(beanClass, beanName);
	if (targetSource != null) {
		if (StringUtils.hasLength(beanName)) {
			this.targetSourcedBeans.add(beanName);
		}
		Object[] specificInterceptors = getAdvicesAndAdvisorsForBean(beanClass, beanName, targetSource);
		Object proxy = createProxy(beanClass, beanName, specificInterceptors, targetSource);
		this.proxyTypes.put(cacheKey, proxy.getClass());
		return proxy;
	}
	return null;
}
```

### 获取代理对象

#### 创建ProxyFactory

> 1. 作用
>     1. 创建代理对象Proxy：[getProxy(ClassLoader)](#getProxy(ClassLoader))
>     2. 获取增强器对象MethodInterceptors：[getInterceptorsAndDynamicInterceptionAdvice](#getInterceptorsAndDynamicInterceptionAdvice)
> 2. 配置
>     1. proxyTargetClass=false，目标实现了接口，使用jdk实现【需要使用setInterfaces()指定目标类实现的接口】
>     2. proxyTargetClass=false，目标没实现接口，使用cglib实现
>     3. proxyTargetClass=true，  总使用cglib实现
> 3. ProxyFactory
>     1. [ProxyFactoryTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/aspect/test/ProxyFactoryTest.java)

<img src="https://raw.gitmirror.com/jiuxi521/typora/master/AOP_ProxyFactory.png" alt="image-20230107203039623" style="zoom:50%;" />

##### createProxy

1. org.springframework.aop.framework.autoproxy.`AbstractAutoProxyCreator`#**createProxy**

```java
protected Object createProxy(Class beanClass, @Nullable String beanName, @Nullable Object[] specificInterceptors, TargetSource targetSource) {
	// ★★ 创建代理工厂，设置setTargetSource、addAdvisors、proxyTargetClass
	ProxyFactory proxyFactory = new ProxyFactory();
	proxyFactory.copyFrom(this);

	// 值为true，强制使用Cglib动态代理
	if (proxyFactory.isProxyTargetClass()) {
		if (Proxy.isProxyClass(beanClass)) {
			for (Class ifc : beanClass.getInterfaces()) {
				proxyFactory.addInterface(ifc);
			}
		}
	} else {
		// 如果接口实现列表为空，使用JDK动态代理
		if (shouldProxyTargetClass(beanClass, beanName)) {
			proxyFactory.setProxyTargetClass(true);
		} else {
			evaluateProxyInterfaces(beanClass, proxyFactory);
		}
	}

	Advisor[] advisors = buildAdvisors(beanName, specificInterceptors);
	proxyFactory.addAdvisors(advisors);
	proxyFactory.setTargetSource(targetSource);
	customizeProxyFactory(proxyFactory);
	// 冻结代理工厂的配置
	proxyFactory.setFrozen(this.freezeProxy);
	if (advisorsPreFiltered()) {
		proxyFactory.setPreFiltered(true);
	}
	// ★ 使用代理工厂获取代理实例
	return proxyFactory.getProxy(getProxyClassLoader());
}
```

#### 创建Proxy

1. 使用代理工厂获取代理实例：org.springframework.aop.framework.**ProxyFactory**#<a id="getProxy(ClassLoader)"> getProxy(ClassLoader)</a> 

    ```java
	public Object getProxy(@Nullable ClassLoader classLoader) {
		return createAopProxy().getProxy(classLoader);
	}
	```

2. 获取代理工厂：org.springframework.aop.framework.**DefaultAopProxyFactory**#`createAopProxy`

    ```java
	public AopProxy createAopProxy(AdvisedSupport config) throws AopConfigException{
		if (config.isOptimize() || config.isProxyTargetClass() || hasNoUserSuppliedProxyInterfaces(config)) {
			Class targetClass = config.getTargetClass();
			if (targetClass == null) {
				throw new AopConfigException("TargetSource cannot determine target class: Either an interface or a target is required for proxy creation.");
			}
			if (targetClass.isInterface() || Proxy.isProxyClass(targetClass)) {
				return new JdkDynamicAopProxy(config);
			}
			return new ObjenesisCglibAopProxy(config);
		}else {
			return new JdkDynamicAopProxy(config);
		}
	}
	```
1. 获取代理：

    1. org.springframework.aop.framework.**CglibAopProxy**#`getProxy`(java.lang.ClassLoader)
    2. org.springframework.aop.framework.**JdkDynamicAopProxy**#`getProxy`(java.lang.ClassLoader)

### 调用增强方法

> 1. 通过MethodInvocation对象调用执行器链
>     1. <font color='red'>默认使用ReflectiveMethodInvocation#proceed()</font>

1. org.springframework.aop.framework.**CglibAopProxy**.**DynamicAdvisedInterceptor**#`intercept`

```java
  public Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
	  // ★★ 获取增强器链
	  List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
	  if (chain.isEmpty() && CglibMethodInvocation.isMethodProxyCompatible(method)) {
		  // 跳过创建MethodInvocation:直接调用目标。注意，最后的调用者必须是一个InvokerInterceptor，只对目标执行反射操作
		  Object[] argsToUse = AopProxyUtils.adaptArgumentsIfNecessary(method, args);
		  retVal = invokeMethod(target, method, argsToUse, methodProxy);
	  } else {
		  // ★★ 执行增强器链
		  retVal = new CglibMethodInvocation(proxy, target, method, args, targetClass, chain, methodProxy).proceed();
	  }
	  // 处理返回值
	  retVal = processReturnType(proxy, target, method, retVal);
	  return retVal;
  }
  ```

#### 获取增强器链

1. org.springframework.aop.framework.**DefaultAdvisorChainFactory**#<a id="getInterceptorsAndDynamicInterceptionAdvice"> getInterceptorsAndDynamicInterceptionAdvice</a> 

```java
  /**
  * Advised：AdvisedSupport,
	Advisor[] getAdvisors();增强器列表
	preFiltered：增强器是否已对特定类进行过滤
  * Pointcut：
	ClassFilter（类过滤器）、
	MethodMatcher（方法匹配器）、
	Pointcut TRUE = TruePointcut.INSTANCE（始终匹配的切入点实例）
  **/
  public List<Object> getInterceptorsAndDynamicInterceptionAdvice(Advised config, Method method, @Nullable Class targetClass) {
	  // ★ 注册适配器：MethodBeforeAdviceAdapter、AfterReturningAdviceAdapter、ThrowsAdviceAdapter
	  AdvisorAdapterRegistry registry = GlobalAdvisorAdapterRegistry.getInstance();
	  // 获取增强器列表
	  Advisor[] advisors = config.getAdvisors();
	  for (Advisor advisor : advisors) {
		  if (advisor instanceof PointcutAdvisor) {
			  PointcutAdvisor pointcutAdvisor = (PointcutAdvisor) advisor;
			  // ClassFilter进行类级别匹配
			  if (config.isPreFiltered() || pointcutAdvisor.getPointcut().getClassFilter().matches(actualClass)) {
				  // MethodMatcher：进行方法级别的匹配
				  MethodMatcher mm = pointcutAdvisor.getPointcut().getMethodMatcher();
				  boolean match;
				  if (mm instanceof IntroductionAwareMethodMatcher) {
					  if (hasIntroductions == null) {
						  hasIntroductions = hasMatchingIntroductions(advisors, actualClass);
					  }
					  match = ((IntroductionAwareMethodMatcher) mm).matches(method, actualClass, hasIntroductions);
				  } else {
					  match = mm.matches(method, actualClass);
				  }
				  if (match) {
					  // ★ 获取拦截器
					  MethodInterceptor[] interceptors = registry.getInterceptors(advisor);
					  // ★ 是否为动态匹配
					  if (mm.isRuntime()) {
						  // 创建动态匹配器
						  for (MethodInterceptor interceptor : interceptors) {
							  interceptorList.add(new InterceptorAndDynamicMethodMatcher(interceptor, mm));
						  }
					  } else {
						  interceptorList.addAll(Arrays.asList(interceptors));
					  }
				  }
			  }
		  }
	  }
	  return interceptorList;
  }
```

##### 获取拦截器

> 1. 第一重拦截：实现MethodInterceptor接口的通知：AspectJAroundAdvice、AspectJAfterAdvice、AspectJAfterThrowingAdvice
> 2. 第二重拦截：通过适配器适配的接口：MethodBeforeAdviceInterceptor、AfterReturningAdviceInterceptor

1. org.springframework.aop.framework.adapter.**DefaultAdvisorAdapterRegistry**#`getInterceptors`

   ```java
      public MethodInterceptor[] getInterceptors(Advisor advisor) throws UnknownAdviceTypeException {
          List<MethodInterceptor> interceptors = new ArrayList<>(3);
          Advice advice = advisor.getAdvice();
          // ★ 第一重拦截：实现MethodInterceptor接口的通知：AspectJAroundAdvice、AspectJAfterAdvice、AspectJAfterThrowingAdvice
          if (advice instanceof MethodInterceptor) {
              interceptors.add((MethodInterceptor) advice);
          }
          // ★ 第二重拦截：通过适配器适配的接口：MethodBeforeAdviceInterceptor、AfterReturningAdviceInterceptor
          for (AdvisorAdapter adapter : this.adapters) {
              if (adapter.supportsAdvice(advice)) {
                  interceptors.add(adapter.getInterceptor(advisor));
              }
          }
          if (interceptors.isEmpty()) {
              throw new UnknownAdviceTypeException(advisor.getAdvice());
          }
          return interceptors.toArray(new MethodInterceptor[0]);
      }
      ```

#### 执行增强器链

> 1. 增强器
>     1. 静态增强器
>         1. 扩展增强器：ExposeInvocationInterceptor
>         2. 环绕增强器：AspectJAroundAdvice
>         3. 前置增强器：MethodBeforeAdviceInterceptor——>保存MethodBeforeAdvice（AspectJMethodBeforeAdvice）
>         4. 后置增强器：AspectJAfterAdvice
>         5. 返回增强器：AfterReturningAdviceInterceptor——>保存AfterReturningAdvice（AspectJAfterReturningAdvice）
>         6. 异常增强器：AspectJAfterThrowingAdvice
>     2. 动态增强器
>         1. InterceptorAndDynamicMethodMatcher
> 2. ReflectiveMethodInvocation使用
>     1. [AdvisorAndAspectTest](https://gitee.com/ma-hao-chinese/spring-web/blob/master/src/main/java/org/springframework/aop/framework/autoproxy/AdvisorAndAspectTest.java)

1. org.springframework.aop.framework.<a id="ReflectiveMethodInvocation#proceed()">ReflectiveMethodInvocation#proceed()</a> 

   ```java
      
      public class ReflectiveMethodInvocation implements ProxyMethodInvocation, Cloneable {public Object proceed() throws Throwable {
          // ★ 执行器链计数，依次执行增强器，最后执行目标方法
          if (this.currentInterceptorIndex == this.interceptorsAndDynamicMethodMatchers.size() - 1. {
              // ★ 执行目标方法
              return invokeJoinpoint();
          }
          // 获取下一个增强器对象
          Object interceptorOrInterceptionAdvice = this.interceptorsAndDynamicMethodMatchers.get(++this.currentInterceptorIndex);
          
          // 处理动态切入点
          if (interceptorOrInterceptionAdvice instanceof InterceptorAndDynamicMethodMatcher) {
              InterceptorAndDynamicMethodMatcher dm = (InterceptorAndDynamicMethodMatcher) interceptorOrInterceptionAdvice;
              Class targetClass = (this.targetClass != null ? this.targetClass : this.method.getDeclaringClass());
              // 动态匹配切入点
              if (dm.methodMatcher.matches(this.method, targetClass, this.arguments)) {
                  // ★ 动态切入点调用
                  return dm.interceptor.invoke(this);
              } else {
                  // 动态匹配失败，执行下一个拦截器
                  return proceed();
              }
          } else {
              // ★ 静态切入点调用
              return ((MethodInterceptor) interceptorOrInterceptionAdvice).invoke(this);
          }
      }
      ```

##### 静态增强器

###### 扩展增强器

1. org.springframework.aop.interceptor.ExposeInvocationInterceptor#invoke

   ```java
      public Object invoke(MethodInvocation mi) throws Throwable {
          MethodInvocation oldInvocation = invocation.get();
          // ★ 给当前线程备份：当前AOP方法调用
          invocation.set(mi);
          try {
              // 开始执行
              return mi.proceed();
          } finally {
              invocation.set(oldInvocation);
          }
      }
      ```

###### 环绕增强器

1. org.springframework.aop.aspectj.<a id="AspectJAroundAdvice#invoke">AspectJAroundAdvice#invoke</a> 

   ```java
      public Object invoke(MethodInvocation mi) throws Throwable {
          if (!(mi instanceof ProxyMethodInvocation)) {
              throw new IllegalStateException("MethodInvocation is not a Spring ProxyMethodInvocation: " + mi);
          }
          ProxyMethodInvocation pmi = (ProxyMethodInvocation) mi;
          ProceedingJoinPoint pjp = lazyGetProceedingJoinPoint(pmi);
          JoinPointMatch jpm = getJoinPointMatch(pmi);
          // ★ 调用环绕around方法
          return invokeAdviceMethod(pjp, jpm, null, null);
      }
      ```

2. 环绕通知

```java
@Around(value = "execution(* getName(..))")
public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
	System.out.println("aspect around before");
	// ★ 调用下一个增强器 joinPint是MethodInvocationProceedingJoinPoint的实例，其保存了包含增强器链的methodInvocation对象
	Object result = joinPoint.proceed();
	System.out.println("aspect around after");
	return result;
}
```

```java
	public class MethodInvocationProceedingJoinPoint implements ProceedingJoinPoint, JoinPoint.StaticPart {
		private final ProxyMethodInvocation methodInvocation;
		public Object proceed() throws Throwable {
			// ★ 通过methodInvocation对象调用下一个拦截器
			return this.methodInvocation.invocableClone().proceed();
		}
	}
```
###### 前置增强器

1. org.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor#invoke

```java
public Object invoke(MethodInvocation mi) throws Throwable {
  // ★ 调用AspectJMethodBeforeAdvice#before方法
  this.advice.before(mi.getMethod(), mi.getArguments(), mi.getThis());
  // 通过methodInvocation对象调用下一个拦截器
  return mi.proceed();
}
```

2. org.springframework.aop.aspectj.AspectJMethodBeforeAdvice#before

```java
public void before(Method method, Object[] args, @Nullable Object target) throws Throwable {
  // 反射调用前置before方法
  invokeAdviceMethod(getJoinPointMatch(), null, null);
}
```

###### 后置增强器

1. org.springframework.aop.aspectj.AspectJAfterAdvice#invoke

```java
public Object invoke(MethodInvocation mi) throws Throwable {
  try {
	  // ★ 通过methodInvocation对象调用下一个拦截器
	  return mi.proceed();
  }finally {
	  // 反射调用后置after方法
	  invokeAdviceMethod(getJoinPointMatch(), null, null);
  }
}
```

###### 返回增强器

1. org.springframework.aop.framework.adapter.AfterReturningAdviceInterceptor#invoke

```java
public Object invoke(MethodInvocation mi) throws Throwable {
  // ★ 通过methodInvocation对象调用下一个拦截器
  Object retVal = mi.proceed();
  // 调用AspectJAfterReturningAdvice#afterReturning方法
  this.advice.afterReturning(retVal, mi.getMethod(), mi.getArguments(), mi.getThis());
  return retVal;
}
```

2. org.springframework.aop.aspectj.AspectJAfterReturningAdvice#afterReturning

```java
public void afterReturning(@Nullable Object returnValue, Method method, Object[] args, @Nullable Object target) throws Throwable {
  if (shouldInvokeOnReturnValueOf(method, returnValue)) {
	  // 反射调用返回afterReturning方法
	  invokeAdviceMethod(getJoinPointMatch(), returnValue, null);
  }
}
```

###### 异常增强器

1. org.springframework.aop.aspectj.AspectJAfterThrowingAdvice#invoke

```java
public Object invoke(MethodInvocation mi) throws Throwable {
  try {
	  // ★ 通过methodInvocation对象调用下一个拦截器
	  return mi.proceed();
  }catch (Throwable ex) {
	  // 出现异常，调用异常afterThrowing方法
	  if (shouldInvokeOnThrowing(ex)) {
		  invokeAdviceMethod(getJoinPointMatch(), null, ex);
	  }
	  throw ex;
  }
}
```

##### 动态增强器

```java
class InterceptorAndDynamicMethodMatcher {
    // 静态增强器
    final MethodInterceptor interceptor;
    // 方法匹配表达式，可以理解为切入点
    final MethodMatcher methodMatcher;

    public InterceptorAndDynamicMethodMatcher(MethodInterceptor interceptor, MethodMatcher methodMatcher) {
        this.interceptor = interceptor;
        this.methodMatcher = methodMatcher;
    }
}
```

### Native反射

> 1. invokeAdviceMethod<font color='red'>调用了Native方法</font>

1. org.springframework.aop.aspectj.AbstractAspectJAdvice#invokeAdviceMethod(org.aspectj.weaver.tools.JoinPointMatch, java.lang.Object, java.lang.Throwable)

2. org.springframework.aop.aspectj.AbstractAspectJAdvice#invokeAdviceMethodWithGivenArgs

```java
protected Object invokeAdviceMethodWithGivenArgs(Object[] args) throws Throwable {
	Object[] actualArgs = args;
	if (this.aspectJAdviceMethod.getParameterCount() == 0) {
		actualArgs = null;
	}
	ReflectionUtils.makeAccessible(this.aspectJAdviceMethod);
	// ★ 调用增强方法
	return this.aspectJAdviceMethod.invoke(this.aspectInstanceFactory.getAspectInstance(), actualArgs);
}
```
1. java.lang.reflect.Method#invoke

```java
public Object invoke(Object obj, Object... args) throws IllegalAccessException, IllegalArgumentException, InvocationTargetException {
	if (!override) {
		if (!Reflection.quickCheckMemberAccess(clazz, modifiers)) {
			Class caller = Reflection.getCallerClass();
			checkAccess(caller, clazz, obj, modifiers);
		}
	}
	MethodAccessor ma = methodAccessor;
	if (ma == null) {
		ma = acquireMethodAccessor();
	}
	// ★ 执行调用
	return ma.invoke(obj, args);
}
```
4. sun.reflect.NativeMethodAccessorImpl#invoke

```java
public Object invoke(Object var1. Object[] var2) throws IllegalArgumentException, InvocationTargetException {
	return invoke0(this.method, var1. var2);
}
```

5. sun.reflect.NativeMethodAccessorImpl#invoke0

```java
private static native Object invoke0(Method var0, Object var1. Object[] var2);
```

## 设计模式

### 适配器模式

> 将不同通知转为环绕通知（MethodInterceptor类型）

1. AfterReturningAdviceAdapter——>将AfterReturningAdvice包装为AfterReturningAdviceInterceptor——>当通过AfterReturningAdviceInterceptor调用invoke方法时，会调用AfterReturningAdvice#afterReturning进行后置增强

    1. 适配器：AfterReturningAdviceAdapter

	```java
	class AfterReturningAdviceAdapter implements AdvisorAdapter, Serializable {
		@Override
		public boolean supportsAdvice(Advice advice) {
			// 判断适配器是否支持adaptee
			return (advice instanceof AfterReturningAdvice);
		}
	
		@Override
		public MethodInterceptor getInterceptor(Advisor advisor) {
			AfterReturningAdvice advice = (AfterReturningAdvice) advisor.getAdvice();
			// 包装adaptee对象，返回Adapter对象
			return new AfterReturningAdviceInterceptor(advice);
		}
	}
	```

	2. AfterReturningAdviceInterceptor
	```java
	public class AfterReturningAdviceInterceptor implements MethodInterceptor, AfterAdvice{
	private final AfterReturningAdvice advice;
	
	@Override
	public Object invoke(MethodInvocation mi) throws Throwable {
		Object retVal = mi.proceed();
		// 调用adaptee的方法
		this.advice.afterReturning(retVal, mi.getMethod(), mi.getArguments(), mi.getThis());
		return retVal;
	}
	}
	```

    3. AfterReturningAdvice

	```java
	public class AspectJAfterReturningAdvice extends AbstractAspectJAdvice implements AfterReturningAdvice, AfterAdvice
		// 被适配的方法
		public void afterReturning(@Nullable Object returnValue, Method method, Object[] args, @Nullable Object target) throws Throwable {
		if (shouldInvokeOnReturnValueOf(method, returnValue)) {
			invokeAdviceMethod(getJoinPointMatch(), returnValue, null);
		}
	}
	```

    4. 调用适配器

	```java
		public MethodInterceptor[] getInterceptors(Advisor advisor) throws UnknownAdviceTypeException {
			List<MethodInterceptor> interceptors = new ArrayList<>(3);
			Advice advice = advisor.getAdvice();
			// 如果是MethodInterceptor类型，直接添加
			if (advice instanceof MethodInterceptor) {
				interceptors.add((MethodInterceptor) advice);
			}
			// 如果是适配器支持的类型，将通知Advice包装成一个目标类型的对象methodInterceptor，methodInterceptor实现了invoke方法，在invoke方法中，调用【被适配者】的方法
			for (AdvisorAdapter adapter : this.adapters) {
				if (adapter.supportsAdvice(advice)) {
					interceptors.add(adapter.getInterceptor(advisor));
				}
			}
			if (interceptors.isEmpty()) {
				throw new UnknownAdviceTypeException(advisor.getAdvice());
			}
			return interceptors.toArray(new MethodInterceptor[0]);
		}
	```

### 责任链模式

1. 通过**MethodInvocation对象（ReflectiveMethodInvocation实例）**保存 **执行器链List interceptorsAndDynamicMethodMatchers**，依次进行调用
    1. [ReflectiveMethodInvocation#proceed()](#ReflectiveMethodInvocation#proceed())
    2. [AspectJAroundAdvice#invoke](#AspectJAroundAdvice#invoke)
    3. …..其他几个增强器MethodInterceptor对象调用invoke()

# Spring Transaction

> 1. <font color='red'>APC</font> ：auto proxy creator 
>    1. 几个`@Enable*`注释同时公开mode和proxyTargetCl ass属性。需要注意的是，大多数这些功能最终都是共享一个APC*
> 2. JTA：Java Transaction API
> 3. ORM框架：
>    1. 绑定参数生成SQL
>    2. 获取连接执行SQL
>    3. 结果集映射
> 4. Spring事务：
>    1. 声明式事务（注解方式、XML配置文件方式）
>    2. 编程式事务（调用）
> 5. 事务控制
>    1. 事务基于同一个连接，设置<font color="#ff0000">自动提交（开、关）</font>、提交、回滚、获取Statement（执行SQL）
>    2. Transaction rolled back because it has been marked as rollback-onlyConnection
>    3. <del>新事务才有隔离级别和传播级别</del>
>    4. 事务同步管理器：TransactionSynchronizationManager
>       1. 确保**同一个事务**多次执行`dataSource.getConnection()`，返回同一个`Connection`

## 事务配置

1. 在事务方法添加`@Transactional`注解
2. 在配置类添加`@EnableTransactionManagement`注解（SpringBoot默认开启）
3. 容器中添加bean：`TransactionManager`——>`PlatformTransactionManager`——>`DataSourceTransactionManager`

## 源码解析

> @Transactional

```java
public @interface Transactional {

    @AliasFor("transactionManager")
    String value() default "";

    // 指定事务管理器，TransactionManager的子类bean name
    @AliasFor("value")
    String transactionManager() default "";

    // 事务的传播机制；@see org.springframework.transaction.interceptor.TransactionAttribute#getPropagationBehavior()
    Propagation propagation() default Propagation.REQUIRED;

    // 如果希望在参与具有不同隔离级别的现有事务时，隔离级别声明被拒绝，在TransactionManager将"validateExitingTransactions"标志切换为true。
    // 事务的隔离级别，用于REQUIRED 或 REQUIRES_NEW，因为它只应用于新启动的事务。
    Isolation isolation() default Isolation.DEFAULT;

    // 超时时间（s）。用于REQUIRED 或REQUIRES_NEW，因为它只应用于新启动的事务。默认-1
    int timeout() default TransactionDefinition.TIMEOUT_DEFAULT;

    boolean readOnly() default false;

    // 触发回滚的非受检异常（ RuntimeException and Error）；受检异常
    Class<? extends Throwable>[] rollbackFor() default {};
    String[] rollbackForClassName() default {};

    // 指定不触发事务回滚的异常Throwable子类
    Class<? extends Throwable>[] noRollbackFor() default {};
    String[] noRollbackForClassName() default {};
}
```

### 开启事务

> @EnableTransactionManagement

```java
@Import(TransactionManagementConfigurationSelector.class)
public @interface EnableTransactionManagement {
    // ★ 创建Cglib代理（true），默认创建JDK代理（false），仅当mode=AdviceMode.PROXY时适用
    // ★ 该设置会影响容器中的所有代理bean
	boolean proxyTargetClass() default false;

    // 默认值AdviceMode.PROXY，只允许通过代理拦截呼叫。同一个类中的本地调用不能以这种方式被拦截
    // AdviceMode.ASPECTJ拦截
	AdviceMode mode() default AdviceMode.PROXY;

    // 指示在特定连接点应用多个通知Advisor时,Transaction的执行顺序。
	int order() default Ordered.LOWEST_PRECEDENCE;
}
```

#### TransactionManagementConfigurationSelector

1. 给IOC容器中添加BeanDefinition
    1. 默认使用PROXY模式，注册AutoProxyRegistrar和ProxyTransactionManagementConfiguration

```java
public class TransactionManagementConfigurationSelector extends AdviceModeImportSelector<EnableTransactionManagement> {
    
    protected String[] selectImports(AdviceMode adviceMode) {
        switch (adviceMode) {
            case PROXY:
                // ★ 返回待注册的bean：AutoProxyRegistrar、ProxyTransactionManagementConfiguration
                return new String[]{AutoProxyRegistrar.class.getName(),ProxyTransactionManagementConfiguration.class.getName()};
            case ASPECTJ:
                return new String[] {determineTransactionAspectClass()};
            default:
                return null;
        }
    }
    
    private String determineTransactionAspectClass() {
        //  注解：org.springframework.transaction.annotation.Transactional和javax.transaction.Transactional
        return (ClassUtils.isPresent("javax.transaction.Transactional", getClass().getClassLoader()) ?
                // JTA 的 AspectJ 事务管理 @Configuration 类的名称。
                TransactionManagementConfigUtils.JTA_TRANSACTION_ASPECT_CONFIGURATION_CLASS_NAME :
                // AspectJ 事务管理 @Configuration 类的名称。
                TransactionManagementConfigUtils.TRANSACTION_ASPECT_CONFIGURATION_CLASS_NAME);
    }
}
```

#### AutoProxyRegistrar

1. 注册 InfrastructureAdvisorAutoProxyCreator.class——>实现AOP代理创建类：AbstractAutoProxyCreator

```java
public class AutoProxyRegistrar implements ImportBeanDefinitionRegistrar {
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
        boolean candidateFound = false;
        // 获取指定类的全部注解
        Set<String> annTypes = importingClassMetadata.getAnnotationTypes();
        // 遍历配置类的注解
        for (String annType : annTypes) {
            AnnotationAttributes candidate = AnnotationConfigUtils.attributesFor(importingClassMetadata, annType);
            if (candidate == null) {
                continue;
            }
            Object mode = candidate.get("mode");
            Object proxyTargetClass = candidate.get("proxyTargetClass");
            // 获取 @EnableTransactionManagement的配置
            if (mode != null && proxyTargetClass != null && AdviceMode.class == mode.getClass() && Boolean.class == proxyTargetClass.getClass()) {
                candidateFound = true;
                if (mode == AdviceMode.PROXY) {
                    // ★ 注册 InfrastructureAdvisorAutoProxyCreator.class——>实现AOP代理创建类：AbstractAutoProxyCreator
                    AopConfigUtils.registerAutoProxyCreatorIfNecessary(registry);
                    if ((Boolean) proxyTargetClass) {
                        // 开启Cglib代理
                        AopConfigUtils.forceAutoProxyCreatorToUseClassProxying(registry);
                        return;
                    }
                }
            }
        }
    }
}
```

#### ProxyTransactionManagementConfiguration
> 1. Advisor = PointCut + Advice
> 2. 事务切面增强器：BeanFactoryTransactionAttributeSourceAdvisor = PointCut（TransactionAttributeSourcePointcut =  TransactionAttributeSource() + ClassFilter(类过滤器)） + Advice（ TransactionInterceptor 实现了MethodInterceptor的增强器）

```java
@Configuration(proxyBeanMethods = false)
@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
public class ProxyTransactionManagementConfiguration extends AbstractTransactionManagementConfiguration {
    @Bean
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    // 注册事务属性解析器
    public TransactionAttributeSource transactionAttributeSource() {
        return new AnnotationTransactionAttributeSource();
    }

    @Bean
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    // 注册事务拦截器
    public TransactionInterceptor transactionInterceptor(TransactionAttributeSource transactionAttributeSource) {
        TransactionInterceptor interceptor = new TransactionInterceptor();
        interceptor.setTransactionAttributeSource(transactionAttributeSource);
        if (this.txManager != null) {
            interceptor.setTransactionManager(this.txManager);
        }
        return interceptor;
    }

    @Bean(name = TransactionManagementConfigUtils.TRANSACTION_ADVISOR_BEAN_NAME)
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    public BeanFactoryTransactionAttributeSourceAdvisor transactionAdvisor(TransactionAttributeSource transactionAttributeSource, TransactionInterceptor transactionInterceptor) {

        BeanFactoryTransactionAttributeSourceAdvisor advisor = new BeanFactoryTransactionAttributeSourceAdvisor();
        advisor.setTransactionAttributeSource(transactionAttributeSource);
        advisor.setAdvice(transactionInterceptor);
        if (this.enableTx != null) {
            advisor.setOrder(this.enableTx.<Integer>getNumber("order"));
        }
        return advisor;
    }
}
```

1. org.springframework.transaction.annotation.AbstractTransactionManagementConfiguration

```java
  @Configuration
  public abstract class AbstractTransactionManagementConfiguration implements ImportAware {
  
	  // @EnableTransactionManagement的属性
	  @Nullable
	  protected AnnotationAttributes enableTx;
  
	  // 默认事务管理器，通过TransactionManagementConfigurer配置
	  @Nullable
	  protected TransactionManager txManager;
  
	  // ★ 获取标注在配置类上的注解属性（importMetadata是标注@EnableTransactionManagement注解的配置类）
	  @Override
	  public void setImportMetadata(AnnotationMetadata importMetadata) {
		  this.enableTx = AnnotationAttributes.fromMap(
			  importMetadata.getAnnotationAttributes(EnableTransactionManagement.class.getName(), false));
		  if (this.enableTx == null) {
			  throw new IllegalArgumentException(
				  "@EnableTransactionManagement is not present on importing class " + importMetadata.getClassName());
		  }
	  }
  
	  // 注册事务事件监听器工厂
	  @Bean(name = TransactionManagementConfigUtils.TRANSACTIONAL_EVENT_LISTENER_FACTORY_BEAN_NAME)
	  @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	  public static TransactionalEventListenerFactory transactionalEventListenerFactory() {
		  return new TransactionalEventListenerFactory();
	  }
  
	  @Autowired(required = false)
	  void setConfigurers(Collection<TransactionManagementConfigurer> configurers) {
		  if (CollectionUtils.isEmpty(configurers)) {
			  return;
		  }
		  if (configurers.size() > 1. {
			  throw new IllegalStateException("Only one TransactionManagementConfigurer may exist");
		  }
		  TransactionManagementConfigurer configurer = configurers.iterator().next();
		  this.txManager = configurer.annotationDrivenTransactionManager();
	  }
  }
```

##### AnnotationTransactionAttributeSource
> TransactionAttributeSource
> 1. org.springframework.transaction.interceptor.NameMatchTransactionAttributeSource：根据方法名称动态配置事务属性，不同方法配置不同的事务属性
> 2. org.springframework.transaction.annotation.AnnotationTransactionAttributeSource：通过注解（如 `@Transactional`）来配置事务属性
> 3. org.springframework.transaction.interceptor.MatchAlwaysTransactionAttributeSource：适用于所有方法都采用相同的事务属性的场景，不进行方法名称或注解的匹配

> TransactionAttributeSource 提供 `TransactionAttribute getTransactionAttribute(Method method, @Nullable Class<?> targetClass)` 方法获取指定方法的TransactionAttribute（事务属性）

> 属性配置管理器

```java
public class AnnotationTransactionAttributeSource extends AbstractFallbackTransactionAttributeSource implements Serializable {
    private final Set<TransactionAnnotationParser> annotationParsers;
    // 设置注解解析器、设置事务注解方法只能是public
    public AnnotationTransactionAttributeSource(boolean publicMethodsOnly) {
        this.publicMethodsOnly = publicMethodsOnly;
        // ★ 配置属性解析器
        this.annotationParsers = Collections.singleton(new SpringTransactionAnnotationParser());
    }
}
```

###### SpringTransactionAnnotationParser

> 事务注解@Transactional属性解析器

```java
public class SpringTransactionAnnotationParser implements TransactionAnnotationParser, Serializable {

	@Override
	public boolean isCandidateClass(Class targetClass) {
		return AnnotationUtils.isCandidateClass(targetClass, Transactional.class);
	}
    
    // ★ 解析注解@Transactional的属性 ；
	protected TransactionAttribute parseTransactionAnnotation(AnnotationAttributes attributes) {
		RuleBasedTransactionAttribute rbta = new RuleBasedTransactionAttribute();

		Propagation propagation = attributes.getEnum("propagation");
		rbta.setPropagationBehavior(propagation.value());
		Isolation isolation = attributes.getEnum("isolation");
		rbta.setIsolationLevel(isolation.value());
		rbta.setTimeout(attributes.getNumber("timeout").intValue());
		rbta.setReadOnly(attributes.getBoolean("readOnly"));
		rbta.setQualifier(attributes.getString("value"));

		List<RollbackRuleAttribute> rollbackRules = new ArrayList<>();
		for (Class rbRule : attributes.getClassArray("rollbackFor")) {
			rollbackRules.add(new RollbackRuleAttribute(rbRule));
		}
		for (String rbRule : attributes.getStringArray("rollbackForClassName")) {
			rollbackRules.add(new RollbackRuleAttribute(rbRule));
		}
		for (Class rbRule : attributes.getClassArray("noRollbackFor")) {
			rollbackRules.add(new NoRollbackRuleAttribute(rbRule));
		}
		for (String rbRule : attributes.getStringArray("noRollbackForClassName")) {
			rollbackRules.add(new NoRollbackRuleAttribute(rbRule));
		}
		rbta.setRollbackRules(rollbackRules);

		return rbta;
	}
}
```

##### TransactionInterceptor

> 事务拦截：TransactionInterceptor

> 1. 事务拦截器，通过反射`invoke`调用目标方法
> 2. 继承抽象类：<font color='red'>TransactionAspectSupport</font>

###### 创建拦截器

```java
public class TransactionInterceptor extends TransactionAspectSupport implements MethodInterceptor, Serializable {
    // ★ 事务拦截器构造方法，创建对象
    public TransactionInterceptor(TransactionManager ptm, TransactionAttributeSource tas) {
        // 设置事务管理器
        setTransactionManager(ptm);
        // 设置事务属性配置
        setTransactionAttributeSource(tas);
    }
}
```
##### TransactionAttributeSourcePointcut
> 继承了PointCut，自定义切入点
```java
// 获取事务属性配置集合
protected abstract TransactionAttributeSource getTransactionAttributeSource();
// 根据类名#方法名判断，是否进行增强，加入事务
public boolean matches(Method method, Class<?> targetClass) {  
    TransactionAttributeSource tas = getTransactionAttributeSource();  
    return (tas == null || tas.getTransactionAttribute(method, targetClass) != null);  
}
```
### 目标方法增强

### 执行目标方法

1. org.springframework.aop.framework.**CglibAopProxy**.**DynamicAdvisedInterceptor**#`intercept`

```java
  public Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
	  // 获取增强链
	  List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
	  // ★ 执行调用
	  Object retVal = new CglibMethodInvocation(proxy, target, method, args, targetClass, chain, methodProxy).proceed();
	  // 处理返回值
	  retVal = processReturnType(proxy, target, method, retVal);
	  return retVal;
  }
  ```

2. org.springframework.aop.framework.CglibAopProxy.**CglibMethodInvocation**#`proceed`

```java
  public Object proceed() throws Throwable {
	  // 调用父类的proceed
	  return super.proceed();
  }
```

3. org.springframework.aop.framework.**ReflectiveMethodInvocation**#`proceed`

```java
  public Object proceed() throws Throwable {
	  // We start with an index of -1 and increment early.
	  if (this.currentInterceptorIndex == this.interceptorsAndDynamicMethodMatchers.size() - 1. {
		  // 执行完静态切入点，执行目标增强方法
		  return invokeJoinpoint();
	  }
	  // ★ 执行静态切入点：org.springframework.transaction.interceptor.TransactionInterceptor#invoke
	  return ((MethodInterceptor) interceptorOrInterceptionAdvice).invoke(this);
  }
```

#### 事务全局控制器（提交、回滚）

1. org.springframework.transaction.interceptor.**TransactionInterceptor**#`invoke`

   ```java
public class TransactionInterceptor extends TransactionAspectSupport implements MethodInterceptor, Serializable {
  @Override
  public Object invoke(MethodInvocation invocation) throws Throwable {
	  Class targetClass = (invocation.getThis() != null ? AopUtils.getTargetClass(invocation.getThis()) : null);
	  // // ★★  执行目标方法
	  return invokeWithinTransaction(invocation.getMethod(), targetClass, invocation::proceed);
  }
}
      ```

org.springframework.transaction.interceptor.**TransactionAspectSupport**#`invokeWithinTransaction`

```java
public abstract class TransactionAspectSupport implements BeanFactoryAware, InitializingBean {
  @Nullable
  protected Object invokeWithinTransaction(Method method, @Nullable Class targetClass, final TransactionAspectSupport.InvocationCallback invocation) throws Throwable {
	  // ★ 获取事务属性配置上下文
	  TransactionAttributeSource tas = getTransactionAttributeSource();
	  // 根据方法+类信息获取属性配置
	  final TransactionAttribute txAttr = (tas != null ? tas.getTransactionAttribute(method, targetClass) : null);
	  // ★ 获取事务管理器：确定用于给定事务的特定事务管理器。
	  final TransactionManager tm = determineTransactionManager(txAttr);
	  
	  if (this.reactiveAdapterRegistry != null && tm instanceof ReactiveTransactionManager) {
		  return txSupport.invokeWithinTransaction(method, targetClass, invocation, txAttr, (ReactiveTransactionManager) tm);
	  }

	  // PlatformTransactionManager
	  PlatformTransactionManager ptm = asPlatformTransactionManager(tm);
	  // 获取连接点（被增强的方法）
	  final String joinpointIdentification = methodIdentification(method, targetClass, txAttr);

	  // 不存在事务回调
	  if (txAttr == null || !(ptm instanceof CallbackPreferringPlatformTransactionManager)) {
		  // ★ 获取事务管理器：根据传播行为确定事务是否创建，返回事务对象
		  TransactionAspectSupport.TransactionInfo txInfo = createTransactionIfNecessary(ptm, txAttr,joinpointIdentification);
		  Object retVal;
		  try {
			  // ★★★ 执行事务增强方法：环绕增强：调用链中的下一个拦截器。这通常会导致调用目标对象。
			  retVal = invocation.proceedWithInvocation();
		  } catch (Throwable ex) {
			  // ★ 事务回滚：发生异常，触发事务回滚
			  completeTransactionAfterThrowing(txInfo, ex);
			  throw ex;
		  } finally {
			  // 清空事务信息
			  cleanupTransactionInfo(txInfo);
		  }

		  if (retVal != null && vavrPresent && TransactionAspectSupport.VavrDelegate.isVavrTry(retVal)) {
			  // Set rollback-only in case of Vavr failure matching our rollback rules...
			  TransactionStatus status = txInfo.getTransactionStatus();
			  if (status != null && txAttr != null) {
				  retVal = TransactionAspectSupport.VavrDelegate.evaluateTryFailure(retVal, txAttr, status);
			  }
		  }

		  // ★ 提交事务
		  commitTransactionAfterReturning(txInfo);
		  return retVal;
	  } 
	  // todo 存在事务回调
  }
}
```
##### 获取事务管理器
1. org.springframework.transaction.interceptor.TransactionAspectSupport#determineTransactionManager

```java
protected TransactionManager determineTransactionManager(@Nullable TransactionAttribute txAttr) {
  // Do not attempt to lookup tx manager if no tx attributes are set
  if (txAttr == null || this.beanFactory == null) {
	  return getTransactionManager();
  }

  // 获取指定的value属性或transactionManager属性，如果未设置，获取默认的事务管理器
  String qualifier = txAttr.getQualifier();
  if (StringUtils.hasText(qualifier)) {
	  return determineQualifiedTransactionManager(this.beanFactory, qualifier);
  }else if (StringUtils.hasText(this.transactionManagerBeanName)) {
	  return determineQualifiedTransactionManager(this.beanFactory, this.transactionManagerBeanName);
  } else {
	  // ★ 获取事务管理器
	  TransactionManager defaultTransactionManager = getTransactionManager();
	  if (defaultTransactionManager == null) {
		  defaultTransactionManager = this.transactionManagerCache.get(DEFAULT_TRANSACTION_MANAGER_KEY);
		  if (defaultTransactionManager == null) {
			  // bean工厂中获取默认管理器
			  defaultTransactionManager = this.beanFactory.getBean(TransactionManager.class);
			  // 加入缓存
			  this.transactionManagerCache.putIfAbsent(DEFAULT_TRANSACTION_MANAGER_KEY, defaultTransactionManager);
		  }
	  }
	  return defaultTransactionManager;
  }
}
```

##### 获取事务属性对象
1. org.springframework.transaction.interceptor.TransactionAspectSupport#createTransactionIfNecessary

```java
protected TransactionInfo createTransactionIfNecessary(@Nullable PlatformTransactionManager tm,
		@Nullable TransactionAttribute txAttr, final String joinpointIdentification) {
  // 如果没有指定名称，则应用方法标识作为事务名称。
  if (txAttr != null && txAttr.getName() == null) {
	  txAttr = new DelegatingTransactionAttribute(txAttr) {
		  @Override
		  public String getName() {
			  return joinpointIdentification;
		  }
	  };
  }

  TransactionStatus status = null;
  if (txAttr != null && tm != null) {
	  // ★ 获取事务对象TransactionStatus
	  status = tm.getTransaction(txAttr);
  }
  // 填充事务信息
  return prepareTransactionInfo(tm, txAttr, joinpointIdentification, status);
}
```

获取事务：org.springframework.transaction.support.AbstractPlatformTransactionManager#getTransaction

```java
public final TransactionStatus getTransaction(@Nullable TransactionDefinition definition) throws TransactionException {
	
	// 如果没有给出事务定义，则使用默认值。
	TransactionDefinition def = (definition != null ? definition : TransactionDefinition.withDefaults());
	
	Object transaction = doGetTransaction();
	boolean debugEnabled = logger.isDebugEnabled();
	
	// ★ 检测当前线程是否存在事务->检查传播行为，确定操作
	if (isExistingTransaction(transaction)) {
	 return handleExistingTransaction(def, transaction, debugEnabled);
	}
	
	// 检查超时时间是否配置正确，要求大于-1
	if (def.getTimeout() < TransactionDefinition.TIMEOUT_DEFAULT) {
	 throw new InvalidTimeoutException("Invalid transaction timeout", def.getTimeout());
	}
	
	// ★ 不存在事务->检查传播行为，开启新事务
	if (def.getPropagationBehavior() == TransactionDefinition.PROPAGATION_MANDATORY) {
	 // PROPAGATION_MANDATORY： 如果当前存在事务，则加⼊该事务；如果当前没有事务，则抛出异常。（mandatory：强制性）
	 throw new IllegalTransactionStateException("No existing transaction found for transaction marked with propagation 'mandatory'");
	}else if (def.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRED ||
		 def.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRES_NEW ||
		 def.getPropagationBehavior() == TransactionDefinition.PROPAGATION_NESTED) {
		 SuspendedResourcesHolder suspendedResources = suspend(null);
		 if (debugEnabled) {
			 logger.debug("Creating new transaction with name [" + def.getName() + "]: " + def);
		 }
		 try {
			// ★ 开启新事务
			 return startTransaction(def, transaction, debugEnabled, suspendedResources);
		 }
		 catch (RuntimeException | Error ex) {
			 resume(null, suspendedResources);
			 throw ex;
		 }
	}else {
	// Create "empty" transaction: no actual transaction, but potentially synchronization.
	if (def.getIsolationLevel() != TransactionDefinition.ISOLATION_DEFAULT && logger.isWarnEnabled()) {
	 logger.warn("Custom isolation level specified but no actual transaction initiated; " +
				 "isolation level will effectively be ignored: " + def);
	}
	boolean newSynchronization = (getTransactionSynchronization() == SYNCHRONIZATION_ALWAYS);
	return prepareTransactionStatus(def, null, true, newSynchronization, debugEnabled, null);
	}
}
```

org.springframework.jdbc.datasource.DataSourceTransactionManager#doGetTransaction

```java
protected Object doGetTransaction() {
	DataSourceTransactionObject txObject = new DataSourceTransactionObject();
	// 是否允许嵌套事务
	txObject.setSavepointAllowed(isNestedTransactionAllowed());
	// ★ 获取数据库连接对象Connection
	ConnectionHolder conHolder = (ConnectionHolder) TransactionSynchronizationManager.getResource(obtainDataSource());
	txObject.setConnectionHolder(conHolder, false);
	return txObject;
}
```

org.springframework.transaction.support.AbstractPlatformTransactionManager#startTransaction
```java
private TransactionStatus startTransaction(TransactionDefinition definition, Object transaction,  
       boolean debugEnabled, @Nullable SuspendedResourcesHolder suspendedResources) {  
  
    boolean newSynchronization = (getTransactionSynchronization() != SYNCHRONIZATION_NEVER);  
    DefaultTransactionStatus status = newTransactionStatus(  
          definition, transaction, true, newSynchronization, debugEnabled, suspendedResources);
	// ★ 开启事务，开启手动提交、设置超时时间、绑定资源到当前线程
    doBegin(transaction, definition);
    // 初始化和同步事务状态
    prepareSynchronization(status, definition);  
    return status;  
}
```

##### 执行目标方法

1. org.springframework.transaction.interceptor.TransactionAspectSupport.InvocationCallback

   ```java
      @FunctionalInterface
      protected interface InvocationCallback {
          @Nullable
          // ★ 执行回调，调用org.springframework.aop.framework.CglibAopProxy.CglibMethodInvocation#proceed
          Object proceedWithInvocation() throws Throwable;
      }
      ```

2. org.springframework.aop.framework.CglibAopProxy.CglibMethodInvocation#invokeJoinpoint

   ```java
      protected Object invokeJoinpoint() throws Throwable {
          if (this.methodProxy != null) {
              try {
                  // ★ 调用执行
                  return this.methodProxy.invoke(this.target, this.arguments);
              }
              catch (CodeGenerationException ex) {
                  logFastClassGenerationFailure(this.method);
              }
          }
          return super.invokeJoinpoint();
      }
      ```

3. org.springframework.cglib.proxy.MethodProxy#invoke

   ```java
      public Object invoke(Object obj, Object[] args) throws Throwable {
          init();
          FastClassInfo fci = fastClassInfo;
          // ★ 调用最终的目标方法
          return fci.f1.invoke(fci.i1. obj, args);
      }
      ```

##### 事务完成提交

> org.springframework.transaction.interceptor.TransactionAspectSupport#commitTransactionAfterReturning

```java
protected void commitTransactionAfterReturning(@Nullable TransactionInfo txInfo) {
    if (txInfo != null && txInfo.getTransactionStatus() != null) {
        if (logger.isTraceEnabled()) {
            logger.trace("Completing transaction for [" + txInfo.getJoinpointIdentification() + "]");
        }
        // ★ 执行事务提交
        txInfo.getTransactionManager().commit(txInfo.getTransactionStatus());
    }
}
```

> org.springframework.transaction.support.AbstractPlatformTransactionManager#commit

```java
public final void commit(TransactionStatus status) throws TransactionException {
	// 当前事务已提交或已回滚，不支持该操作
    if (status.isCompleted()) {  
       throw new IllegalTransactionStateException(  
             "Transaction is already completed - do not call commit or rollback more than once per transaction");  
    }  
    DefaultTransactionStatus defStatus = (DefaultTransactionStatus) status;
    // ★ 事务状态设置了本地回滚时，回滚事务；当调用了setRollbackOnly时，执行回滚操作
    if (defStatus.isLocalRollbackOnly()) {  
       if (defStatus.isDebug()) {  
          logger.debug("Transactional code has requested rollback");  
       }  
       processRollback(defStatus, false);  
       return;  
    }  
    // 如果发生全局回顾时，不提交事务 && 存在全局回滚标识，进行回滚
    if (!shouldCommitOnGlobalRollbackOnly() && defStatus.isGlobalRollbackOnly()) {  
       if (defStatus.isDebug()) {  
          logger.debug("Global transaction is marked as rollback-only but transactional code requested commit");  
       }  
       processRollback(defStatus, true);  
       return;  
    }  
    // ★ 处理提交
    processCommit(defStatus);  
}
```

> 执行时机提交操作：org.springframework.transaction.support.AbstractPlatformTransactionManager#processCommit
```java
private void processCommit(DefaultTransactionStatus status) throws TransactionException {  
    try {  
       boolean beforeCompletionInvoked = false;  
  
       try {  
          boolean unexpectedRollback = false;  
          prepareForCommit(status);
          // 调用事务提交前触发器
          triggerBeforeCommit(status);
          // 调用事务完成前触发器  
          triggerBeforeCompletion(status);  
          beforeCompletionInvoked = true;  
          // 释放SavePoint(存在保存点)
          if (status.hasSavepoint()) {  
             if (status.isDebug()) {  
                logger.debug("Releasing transaction savepoint");  
             }  
             unexpectedRollback = status.isGlobalRollbackOnly();  
             status.releaseHeldSavepoint();  
          }  else if (status.isNewTransaction()) {  
             if (status.isDebug()) {  
                logger.debug("Initiating transaction commit");  
             }  
             unexpectedRollback = status.isGlobalRollbackOnly();  
             // ★ 新事务，完成实际提交操作
             doCommit(status);  
          } else if (isFailEarlyOnGlobalRollbackOnly()) {  
             unexpectedRollback = status.isGlobalRollbackOnly();  
          }  
  
          // 存在全局回滚标识，违背处理，抛异常 
          if (unexpectedRollback) {  
             throw new UnexpectedRollbackException("Transaction silently rolled back because it has been marked as rollback-only");  
          }
       } catch (UnexpectedRollbackException ex) {  
          // 处理回滚异常，触发事务完成后动作
          triggerAfterCompletion(status, TransactionSynchronization.STATUS_ROLLED_BACK);  
          throw ex;  
       } catch (TransactionException ex) {  
          // 提交失败后触发回滚
          if (isRollbackOnCommitFailure()) {  
             doRollbackOnCommitException(status, ex);  
          } else { 
		     // 触发事务完成后动作，抛出异常
             triggerAfterCompletion(status, TransactionSynchronization.STATUS_UNKNOWN);  
          }  
          throw ex;  
       }catch (RuntimeException | Error ex) {  
          if (!beforeCompletionInvoked) {  
             triggerBeforeCompletion(status);  
          }
          doRollbackOnCommitException(status, ex);  
          throw ex;  
       }  

		// 触发提交后处理机制
       try {  
          triggerAfterCommit(status);  
       }  
       finally {  
          triggerAfterCompletion(status, TransactionSynchronization.STATUS_COMMITTED);  
       }  
    } finally {
	    // ★ 清空事务相关状态，开启自动提交
        cleanupAfterCompletion(status);  
    }  
}
```

> org.springframework.transaction.support.AbstractPlatformTransactionManager#cleanupAfterCompletion

```java
private void cleanupAfterCompletion(DefaultTransactionStatus status) {  
    status.setCompleted();
    // 如果开启了新的事务同步
    if (status.isNewSynchronization()) {  
       TransactionSynchronizationManager.clear();  
    }
    // 开启了新事务
    if (status.isNewTransaction()) {
	    // ★ 执行事务完成后清理操作
       doCleanupAfterCompletion(status.getTransaction());  
    }
    // 是否存在悬挂的事务，如果存在，恢复外层事务状态
    if (status.getSuspendedResources() != null) {  
       if (status.isDebug()) {  
          logger.debug("Resuming suspended transaction after completion of inner transaction");  
       }  
       Object transaction = (status.hasTransaction() ? status.getTransaction() : null);
       // 事务恢复
       resume(transaction, (SuspendedResourcesHolder) status.getSuspendedResources());  
    }  
}
```

> org.springframework.jdbc.datasource.DataSourceTransactionManager#doCleanupAfterCompletion

```java
protected void doCleanupAfterCompletion(Object transaction) {  
    DataSourceTransactionObject txObject = (DataSourceTransactionObject) transaction;  
  
    // 从当前线程移除数据库连接 
    if (txObject.isNewConnectionHolder()) {  
       TransactionSynchronizationManager.unbindResource(obtainDataSource());  
    }  
  
    // 重置连接  
    Connection con = txObject.getConnectionHolder().getConnection();  
    try {
	    // 如果手动关闭了事务自动提交，设置mustRestoreAutoCommit=true；此时，事务结束，还原事务自动提交
       if (txObject.isMustRestoreAutoCommit()) {  
          con.setAutoCommit(true);  
       }  
       DataSourceUtils.resetConnectionAfterTransaction( con, txObject.getPreviousIsolationLevel(), txObject.isReadOnly());  
    } catch (Throwable ex) {  
       logger.debug("Could not reset JDBC Connection after transaction", ex);  
    }  
    // 释放数据库连接
    if (txObject.isNewConnectionHolder()) {  
       if (logger.isDebugEnabled()) {  
          logger.debug("Releasing JDBC Connection [" + con + "] after transaction");  
       }  
       DataSourceUtils.releaseConnection(con, this.dataSource);  
    }  
  
    txObject.getConnectionHolder().clear();  
}
```

##### 事务异常回滚

> org.springframework.transaction.interceptor.TransactionAspectSupport#completeTransactionAfterThrowing

```java
protected void completeTransactionAfterThrowing(@Nullable TransactionInfo txInfo, Throwable ex) {
    if (txInfo != null && txInfo.getTransactionStatus() != null) {
        if (logger.isTraceEnabled()) {
            logger.trace("Completing transaction for [" + txInfo.getJoinpointIdentification() +
                         "] after exception: " + ex);
        }
        // ★ 判断指定异常ex是否回滚
        if (txInfo.transactionAttribute != null && txInfo.transactionAttribute.rollbackOn(ex)) {
            try {
                // ★ 执行事务回滚
                txInfo.getTransactionManager().rollback(txInfo.getTransactionStatus());
            }
            catch (TransactionSystemException ex2) {
                logger.error("Application exception overridden by rollback exception", ex);
                ex2.initApplicationException(ex);
                throw ex2;
            }
            catch (RuntimeException | Error ex2) {
                logger.error("Application exception overridden by rollback exception", ex);
                throw ex2;
            }
        } else {
            try {
                // ★ 异常类型不影响事务提交，执行事务提交
                txInfo.getTransactionManager().commit(txInfo.getTransactionStatus());
            } catch (TransactionSystemException ex2) {
                logger.error("Application exception overridden by commit exception", ex);
                ex2.initApplicationException(ex);
                throw ex2;
            }catch (RuntimeException | Error ex2) {
                logger.error("Application exception overridden by commit exception", ex);
                throw ex2;
            }
        }
    }
}
```
2. 处理异常回滚逻辑
```java
// org.springframework.transaction.support.AbstractPlatformTransactionManager#processRollback

private void processRollback(DefaultTransactionStatus status, boolean unexpected) {  
    try {  
        boolean unexpectedRollback = unexpected;  
  
        try {  
            // 触发执行完成前回调  
            triggerBeforeCompletion(status);  
            // 保存点回滚  
            if (status.hasSavepoint()) {
	            // 如果当前事务有保存点，也就是当前事务为单独的线程则会退到保存点
                status.rollbackToHeldSavepoint();  
            } else if (status.isNewTransaction()) {  
                // ★ 如果当前事务为独立的新事物，则直接回退 
                doRollback(status);  
            } else {  
                // 如果是外层事务存在事务  
                if (status.hasTransaction()) {  
                    // 设置手动回滚或 支持部分失败全局回滚  
                    if (status.isLocalRollbackOnly() || isGlobalRollbackOnParticipationFailure()) {  
                        // ★ 如果当前事务不是独立的事务，那么只能标记状态，等到事务链执行完毕后统一回滚
                        doSetRollbackOnly(status);  
                    } else {  
                        // 由事务发起者决定是否回滚  
                    }  
                } else {  
                    // 外层不存在事务，当前操作应该回滚，  
                    logger.debug("Should roll back transaction but cannot - no transaction available");  
                }  
                // 不是快速失败全局回滚  
                if (!isFailEarlyOnGlobalRollbackOnly()) {  
                    unexpectedRollback = false;  
                }  
            }  
        } catch (RuntimeException | Error ex) {  
            // 触发事务完成后操作  
            triggerAfterCompletion(status, TransactionSynchronization.STATUS_UNKNOWN);  
            throw ex;  
        }
        // 触发事务完成后操作  
        triggerAfterCompletion(status, TransactionSynchronization.STATUS_ROLLED_BACK);  
  
        // 设置了全局回滚标记，抛出  UnexpectedRollbackException 异常，触发全局回滚
        if (unexpectedRollback) {  
            throw new UnexpectedRollbackException("Transaction rolled back because it has been marked as rollback-only");  
        }  
    } finally {  
        // 清理事务信息  
        cleanupAfterCompletion(status);  
    }  
}
```

3. 事务调用TransactionManager执行数据库回滚

```java
// org.springframework.transaction.support.AbstractPlatformTransactionManager#doRollback
protected abstract void doRollback(DefaultTransactionStatus status) throws TransactionException;

// 执行JDBC事务回滚
// org.springframework.jdbc.datasource.DataSourceTransactionManager#doRollback
protected void doRollback(DefaultTransactionStatus status) {  
    DataSourceTransactionObject txObject = (DataSourceTransactionObject) status.getTransaction(); 
    // 获取连接器对象Connection
    Connection con = txObject.getConnectionHolder().getConnection();  
    try {
		// ★ 执行事务回滚
        con.rollback();  
    } catch (SQLException ex) {  
       throw translateException("JDBC rollback", ex);  
    }  
}
```

##### 事务完成后还原数据库连接


## 事务使用

### 注册TransactionInterceptor

```java
RuleBasedTransactionAttribute ruleBasedTransactionAttribute = new RuleBasedTransactionAttribute();
// 回滚规则：是否满足RollbackRuleAttribute的父类或 满足(ex instanceof RuntimeException || ex instanceof Error);回滚
ruleBasedTransactionAttribute.setRollbackRules(Collections.singletonList(new RollbackRuleAttribute(ClassNotFoundException.class)));
nameMap.put("transactionTest*", ruleBasedTransactionAttribute);

@Transaction(rollbackFor = RuntimeException.class)  等价于创建 一个RuleBasedTransactionAttribute的回滚规则，两个只有一个起作用
```

### A事务提交后，调用B方法的执行
[事务源码解析](https://blog.51cto.com/u_16213725/7410616)
[事务源码解析](https://juejin.cn/post/6844903977797025806#heading-2)
### Transaction rolled back because it has been marked as rollback-only
[事务内部抛出未被捕获的异常，导致事务标记被回滚，此时提交报错](https://blog.csdn.net/weixin_47872288/article/details/139267644)

# Spring MVC

## 组件

### Filter：@WebFilter

调用过滤器：

org.apache.catalina.core.StandardContextValve#invoke

```java
public final void invoke(Request request, Response response){
  Wrapper wrapper = request.getWrapper();
  // 调用过滤器
  wrapper.getPipeline().getFirst().invoke(request, response);
}

```

org.apache.catalina.core.StandardWrapperValve#invoke

```java
public final void invoke(Request request, Response response){
  // 获取一个Servlet处理Request
  Servlet servlet = null;
  servlet = wrapper.allocate();
  // 获取过滤器链
  ApplicationFilterChain filterChain = ApplicationFilterFactory.createFilterChain(request, wrapper, servlet);
  // 执行过滤器链
  filterChain.doFilter(request.getRequest(), response.getResponse());
  // 
}
```

org.apache.catalina.core.ApplicationFilterFactory#createFilterChain

```java
public static ApplicationFilterChain createFilterChain(ServletRequest request, Wrapper wrapper, Servlet servlet) {
    // servlet为空，直接返回
    if (servlet == null) return null;
    ApplicationFilterChain filterChain = (ApplicationFilterChain) req.getFilterChain();
    // 不存在直接创建
    if (filterChain == null) {
        filterChain = new ApplicationFilterChain();
        req.setFilterChain(filterChain);
    }
    // 转发类型 ：FORWARD、INCLUDE、REQUEST、ERROR等
    DispatcherType dispatcher = (DispatcherType) request.getAttribute(Globals.DISPATCHER_TYPE_ATTR);
    // 保存servlet
    filterChain.setServlet(servlet);
    // 匹配过滤器
    for (FilterMap filterMap : filterMaps) {
      // 请求类型匹配
      if (!matchDispatcher(filterMap, dispatcher)) continue;
      // 路径匹配
      if (!matchFiltersURL(filterMap, requestPath)) continue;
      // servlet name 匹配
      if (!matchFiltersServlet(filterMap, servletName)) continue;
      // 获取过滤器配置FilterConfig
      ApplicationFilterConfig filterConfig = (ApplicationFilterConfig)
              context.findFilterConfig(filterMap.getFilterName());
      filterChain.addFilter(filterConfig);
    }
     return filterChain;
}
```

过滤器执行 || 放行 || 执行servlet的service()方法：org.apache.catalina.core.ApplicationFilterChain#doFilter

```java
public void doFilter(ServletRequest request, ServletResponse response){
  // 调用过滤器链
  internalDoFilter(request,response);
}

private void internalDoFilter(ServletRequest request, ServletResponse response){
  if (pos < n) {
    ApplicationFilterConfig filterConfig = filters[pos++];
    Filter filter = filterConfig.getFilter();
    // 调用过滤器
    filter.doFilter(request, response, this);
  }
  // 调用servlet的filter方法
  servlet.service(request, response);
}
```

继承OncePerRequestFilter：保证一个请求只会经过同一个过滤器一次 && 扩展了跳过逻辑

org.springframework.web.filter.OncePerRequestFilter#doFilter

```java
public final void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain){
  // 跳过该过滤方法
	if (skipDispatch(httpRequest) || shouldNotFilter(httpRequest)) {
			filterChain.doFilter(request, response);
	}else if (hasAlreadyFilteredAttribute) {
	  // 过滤器已处理过，跳过
		if (DispatcherType.ERROR.equals(request.getDispatcherType())) {
			doFilterNestedErrorDispatch(httpRequest, httpResponse, filterChain);
			return;
		}
		filterChain.doFilter(request, response);
	}else {
	  // 设置 防二次进入 标识
		request.setAttribute(alreadyFilteredAttributeName, Boolean.TRUE);
		try {
		  // 执行过滤方法
			doFilterInternal(httpRequest, httpResponse, filterChain);
		}finally {
			request.removeAttribute(alreadyFilteredAttributeName);
		}
	}
}
```

普通过滤器：

```java
public class CustomizedFilter implements Filter {
    public void init(FilterConfig config) {  log.info("过滤器初始化"); }
    public void destroy() {   log.info("过滤器销毁");  }
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ServletException, IOException {
        response.setCharacterEncoding("utf-8");
        log.info("过滤器执行：:{}", request.getRemoteAddr());
        chain.doFilter(request, response);
    }
}
```

过滤器放行API：

```java
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain){
  // 调用过滤器链FilterChain的doFilter方法，遍历过滤器链
  chain.doFilter(request, response);
}
```

### Listener：@WebListener

### Servlet：@WebServlet

## 插件

### SpringMVC整合

> 1. web容器在启动的时候，会扫描每个jar包下的META-INF/services/javax.servlet.ServletContainerInitializer文件
> 2. 获取文件指定的类：SpringServletContainerInitializer
> 3. spring的应用启动后，会加载感兴趣的WebApplicationInitializer接口的下的所有组件；

```java
@HandlesTypes(WebApplicationInitializer.class)
public class SpringServletContainerInitializer implements ServletContainerInitializer {
    /*
     * webAppInitializerClasses：WebApplicationInitializer子类的集合
     * ServletContext：容器上下文
    */
    public void onStartup(@Nullable Set<Class> webAppInitializerClasses, ServletContext servletContext)
        throws ServletException {

        List<WebApplicationInitializer> initializers = new LinkedList<>();

        if (webAppInitializerClasses != null) {
            for (Class waiClass : webAppInitializerClasses) {
                if (!waiClass.isInterface() && !Modifier.isAbstract(waiClass.getModifiers()) &&
                    WebApplicationInitializer.class.isAssignableFrom(waiClass)) {
                    try {
                        // 将WebApplicationInitializer
                        initializers.add((WebApplicationInitializer)
                                         ReflectionUtils.accessibleConstructor(waiClass).newInstance());
                    }catch (Throwable ex) {
                        throw new ServletException("Failed to instantiate WebApplicationInitializer class", ex);
                    }
                }
            }
        }

        if (initializers.isEmpty()) {
            servletContext.log("No Spring WebApplicationInitializer types detected on classpath");
            return;
        }

        servletContext.log(initializers.size() + " Spring WebApplicationInitializers detected on classpath");
        AnnotationAwareOrderComparator.sort(initializers);
        for (WebApplicationInitializer initializer : initializers) {
            initializer.onStartup(servletContext);
        }
    }
}
```


| 问题                            | 解决   | 博客  |                                                                                                                                                                                    |
| ----------------------------- | ---- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| mybatis、spring、spring-boot的兼容 | 参考官网 |     | [mybatis-plus](https://github.com/baomidou/mybatis-plus/blob/3.0/CHANGELOG.md)<br>[spring-boot](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.7-Release-Notes) |
