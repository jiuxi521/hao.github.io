---
title: Dynamic Proxy
createTime: 2024/10/24 16:39:59
permalink: /article/vdqaayyo/
---
# 动态代理
## 底层实现
1. JDK代理要求被代理类必须实现接口，代理类是接口的实现类，同时继承了Proxy（保存了InterceptorHandler属性）
```java
// 被代理类父接口
public interface UserService(){String getName(String key);}
// 被代理类
public class UserServiceImpl(){String getName(String key){return key;}}}
// 代理类
public class JdkProxy extends Proxy implements UserService {
	// 继承自Proxy
	protected InvocationHandler h;
	// 实现父接口的getName()，使用代理对象h调用
	@Override
	public String getName(String key) {  
		return (String) h.invoke(this, getName, new Object[]{key});   
	}
}
```

2. Cglib无需接口，代理类继承被代理类，代理类(保存MethodInterceptor属性)重写待增强方法，调用h的invoke方法进行增强
```java
// 被代理类
public class UserServiceImpl { public String getName(String key) {return key;}}
// 代理类
public class CglibProxyDemo extends UserServiceImpl {
	// 代理属性
	MethodInterceptor h;
	// 构造方法：设置代理属性
	public CglibProxyDemo(MethodInterceptor h) {this.h = h;}
	// 继承自被代理类的方法
	@Override
	public String getName(String key) {  
		return (String) h.intercept(this, getName, new Object[]{key}, getNameProxy);   
	}
}
```

## 使用案例
- JDK代理
```java
UserService proxyInstance = (UserService) Proxy.newProxyInstance(JdkProxyTest.class.getClassLoader(), new Class[]{UserService.class}, new java.lang.reflect.InvocationHandler() {  
    @Override  
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {  
        System.out.println("before invoke");  
        Object returnValue = method.invoke(UserServiceImpl.class.newInstance(), args);  
        System.out.println("after invoke");  
        return returnValue;  
    }  
});
```
- Cglib代理
```java
UserService userService = (UserService) Enhancer.create(UserService.class, new MethodInterceptor() {  
	@Override  
	public Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {  
		System.out.println("invoke before");  
		// 第一种 需要进行方法的反射调用  
        // Object invoke = method.invoke(UserService.class.newInstance(), args);  
		// 第二种 避免方法的反射调用  
		Object invoke = methodProxy.invoke(UserService.class.newInstance(), args);  
		// 第三种 避免方法的反射调用  
		// Object invoke = methodProxy.invokeSuper(proxy, args);  
		System.out.println("invoke after");  
		return invoke;  
	}  
});
```
## JDK动态代理

> 1. JDK的代理类没有经过源码、编译阶段，而是<font color='red'>使用ASM动态生成字节码文件</font>，加载到内存

### 使用

1. 待增强类接口
```java
public interface UserService {
	String getName(String key);
}
```

2. 待增强目标类
```java
public class UserServiceImpl implements UserService {
	@Override
	public String getName(String key) {
		System.out.println("invoke getName method");
		return "浩子你好" + "  " + key;
	}
}
```

3. 创建代理类
```java
// 创建代理，指定回调方法InvocationHandler#invoke
UserService proxyInstance = (UserService) Proxy.newProxyInstance(JdkProxyTest.class.getClassLoader(), new Class[]{UserService.class}, new java.lang.reflect.InvocationHandler() {
	@Override
	public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
		System.out.println("before invoke");
		// 使用Method#invoke方法执行调用   {UserServiceImpl.class.newInstance()：待增强目标类的实例,args : 方法参数}
		Object returnValue = method.invoke(UserServiceImpl.class.newInstance(), args);
		System.out.println("after invoke");
		return returnValue;
	}
});
System.out.println(proxyInstance.getName("实际调用"));

// 获取代理类名，可使用arthas获取代理类文件
// System.out.println(proxy.getClass());
// System.in.read();
```

#### Demo

1. 创建回调接口
```java
// {proxy:代理对象;method:目标方法;args:方法参数}
public interface InvocationHandler {
	Object invoke(Object proxy, Method method, Object[] args) throws Throwable;
}
```

2. 底层源码Demo
```java
public class JdkProxyDemo implements UserService {
	static Method getName;

	static {
		try {
			getName = UserService.class.getMethod("getName", String.class);
		} catch (NoSuchMethodException e) {
			throw new UndeclaredThrowableException(e);
		}
	}
	// 代理对象
	InvocationHandler h;

	public JdkProxyDemo(InvocationHandler h) {
		this.h = h;
	}

	// 增强类的方法
	@Override
	public String getName(String key) {
		try {
			return (String) h.invoke(this, getName, new Object[]{key});
		} catch (RuntimeException | Error e) {
			throw e;
		} catch (Throwable e) {
			throw new UndeclaredThrowableException(e);
		}
	}
}

```

3. 执行Demo
```java
JdkProxyDemo jdkProxyDemo = new JdkProxyDemo(new InvocationHandler() {
	@Override
	public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
		System.out.println("before invoke");
		Object returnValue = method.invoke(UserServiceImpl.class.newInstance(), args);
		System.out.println("after invoke");
		return returnValue;
	}
});
System.out.println(jdkProxyDemo.getName("啦啦啦"));
```

### 源码剖析

1. 继承`Proxy`类
    1. 继承Proxy的`InvocationHandler h`对象
    2. 重写父类构造方法
        1. Proxy类的构造方法
            ```java
			protected Proxy(InvocationHandler h) {
				Objects.requireNonNull(h);
				this.h = h;
			}
			```

        2. 代理类的构造方法
			```java
			public $Proxy0(InvocationHandler invocationHandler) {
				super(invocationHandler);
			}
			```

2. 通过`Class#getMethod`获取方法实例
```java
public final class $Proxy0 extends Proxy implements UserService {
	private static Method m0,m2,m3,m3;
	static {
		try {
			// 默认重写的方法
			m0 = Class.forName("java.lang.Object").getMethod("hashCode", new Class[0]);
			m1 = Class.forName("java.lang.Object").getMethod("equals", Class.forName("java.lang.Object"));
			m2 = Class.forName("java.lang.Object").getMethod("toString", new Class[0]);

			// 接口方法
			m3 = Class.forName("aop.jdk.UserService").getMethod("getName", Class.forName("java.lang.String"));
		} catch (NoSuchMethodException noSuchMethodException) {
			throw new NoSuchMethodError(noSuchMethodException.getMessage());
		} catch (ClassNotFoundException classNotFoundException) {
			throw new NoClassDefFoundError(classNotFoundException.getMessage());
		}
	}
}
```

3. 默认重写了equals、hashcode、toString方法
```java
public final class $Proxy0 extends Proxy implements UserService {
	public final boolean equals(Object object) {
		try {
			return (Boolean)this.h.invoke(this, m1. new Object[]{object});
		} catch (Error | RuntimeException throwable) {
			throw throwable;
		}catch (Throwable throwable) {
			throw new UndeclaredThrowableException(throwable);
		}
	}

	public final String toString() {
		try {
			return (String)this.h.invoke(this, m2, null);
		}catch (Error | RuntimeException throwable) {
			throw throwable;
		} catch (Throwable throwable) {
			throw new UndeclaredThrowableException(throwable);
		}
	}

	public final int hashCode() {
		try {
			return (Integer)this.h.invoke(this, m0, null);
		}catch (Error | RuntimeException throwable) {
			throw throwable;
		}catch (Throwable throwable) {
			throw new UndeclaredThrowableException(throwable);
		}
	}
}
```

4. 实现父接口UserService#getName的方法
```java
public final class $Proxy0 extends Proxy implements UserService {
	public final String getName(String string) {
		try {
			return (String)this.h.invoke(this, m3, new Object[]{string});
		}catch (Error | RuntimeException throwable) {
			throw throwable;
		}catch (Throwable throwable) {
			throw new UndeclaredThrowableException(throwable);
		}
	}
}
```

#### ASM

> 1. 使用ASM插件：Java源文件——>ASM文件——>调用ASM文件的 `静态代理类.dump()`方法，获取字节码文件【字节数组`byte[]`】
> 2. ★ 通过ClassLoader加载字节码文件，返回类加载器对象——>通过`loadClass(类的全限定名)`获取类的Class对象——>通过Class对象的`getDeclaredConstructor(参数类型列表.class)`获取构造方法——>通过Constructor构造方法对象的`newInstance(参数列表)`获取类实例——>通过实例调用实例方法

```java
public static void main(String[] args) throws Exception {

    File file = new File("E:\\coder\\spring-web\\target\\classes\\aop\\$Proxy0123.class");
    byte[] b;
    try (FileInputStream inputStream = new FileInputStream(file)) {
        b = new byte[(int) file.length()];
        inputStream.read(b);
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
    // 通过ClassLoader加载字节码文件，返回类加载器对象
    ClassLoader classLoader = new ClassLoader() {
        @Override
        protected Class<?> findClass(String name) throws ClassNotFoundException {
            return super.defineClass(name, b,
                                     0, b.length);
        }
    };
    // 包名.类名
    String name = "aop.$Proxy0123";
    // 通过loadClass(类的全限定名)获取类的Class对象
    Class<?> $Proxy0123 = classLoader.loadClass(name);
    // 通过Class对象的getDeclaredConstructor(参数类型列表.class)获取构造方法
    Constructor<?> declaredConstructor = $Proxy0123.getDeclaredConstructor(InvocationHandler.class);
    // 通过Constructor构造方法对象的newInstance(参数列表)获取类实例
    SuperA proxy = (SuperA) declaredConstructor.newInstance(new InvocationHandler() {
        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            System.out.println("before invoke");
            System.out.println(" invoke");
            return null;
        }
    });
    // 通过实例调用实例方法
    proxy.getName();
}
```

#### 反射优化

> 1. JDk > 16次之后，才会将方法执行器：sun.reflect.NativeMethodAccessorImpl（需要代理执行）转为 sun.reflect.GeneratedMethodAccessor2（不需要代理执行）;
> 2. JDK一个类只有一个增强类；Cglib一个类会有两个增强类：FastClass的子类

1. 反射调用：NativeMethodAccessorImpl
```java
class NativeMethodAccessorImpl extends MethodAccessorImpl {
	private final Method method;
	
	@Override
	public Object invoke(Object object, Object[] objectArray) throws IllegalArgumentException, InvocationTargetException {
		// 通过反射调用
		return NativeMethodAccessorImpl.invoke0(this.method, object, objectArray);
	}

	// native方法，执行调用
	private static native Object invoke0(Method var0, Object var1. Object[] var2);
}
```

2. 直接调用：GeneratedMethodAccessor2
```java
public class GeneratedMethodAccessor2 extends MethodAccessorImpl {
	/*
	 * Loose catch block
	 */
	public Object invoke(Object object, Object[] objectArray) throws InvocationTargetException {
		char c = ((Byte) objectArray[0]).byteValue();
		MethodInvoke methodInvoke = (MethodInvoke) object;
		// 直接执行方法调用
		methodInvoke.getName((int) c);
		return null;
	}
}
```

## Cglib动态代理

### 使用

1. 待增强子类
```java
public class UserService {
	public String getName(String key) {
		System.out.println("getName invoke");
		return "getName invoke returnValue" + "  : " + key;
	}
}
```

2. 获取增强对象
```java
UserService userService = (UserService) Enhancer.create(UserService.class, new org.springframework.cglib.proxy.MethodInterceptor() {
	@Override
	public Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
		System.out.println("invoke before");

		// 第一种 需要进行方法的反射调用
		// Object invoke = method.invoke(UserService.class.newInstance(), args);
		// 第二种 避免方法的反射调用
		// Object invoke = methodProxy.invoke(UserService.class.newInstance(), args);
		// 第三种 避免方法的反射调用
		Object invoke = methodProxy.invokeSuper(proxy, args);

		System.out.println("invoke after");
		return invoke;
	}
});
System.out.println(userService.getName("略略略"));
```

#### Demo

1. 创建回调接口
```java
public interface MethodInterceptor extends org.springframework.cglib.proxy.MethodInterceptor {
	Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) throws Throwable;
}
```

2. 创建增强类
```java
public class CglibProxyDemo extends UserService {
	static Method getName;
	static MethodProxy getNameProxy;

	static {
		try {
			// note 此处是目标类的方法，而非代理类的方法
			getName = UserService.class.getMethod("getName", String.class);
			// note 凡是L开头全包名路径结尾都需要加分号
			// note {目标类，代理类，()V指方法的参数类型和返回值 ，子类重写的父类方法，自类对父类方法的原生调用}
			getNameProxy = MethodProxy.create(UserService.class, CglibProxyDemo.class, "(Ljava/lang/String;)Ljava/lang/String;", "getName", "getNameSuper");
		} catch (NoSuchMethodException e) {
			throw new UndeclaredThrowableException(e);
		}
	}

	MethodInterceptor methodInterceptor;

	public CglibProxyDemo(MethodInterceptor methodInterceptor) {
		this.methodInterceptor = methodInterceptor;
	}

	@Override
	public String getName(String key) {
		try {
			return (String) methodInterceptor.intercept(this, getName, new Object[]{key}, getNameProxy);
		} catch (Throwable e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * 父类方法的原生调用
	 */
	public String getNameSuper(String key) throws Throwable {
		return super.getName(key);
	}
}
```

3. 执行Demo
```java
CglibProxyDemo cglibProxyDemo = new CglibProxyDemo(new MethodInterceptor() {
	@Override
	public Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
		System.out.println("invoke before");

		// 第一种 需要进行方法的反射调用
		// Object invoke = method.invoke(UserService.class.newInstance(), args);
		// 第二种 避免方法的反射调用
		//  Object invoke = methodProxy.invoke(UserService.class.newInstance(), args);
		// 第三种 避免方法的反射调用
		Object invoke = methodProxy.invokeSuper(proxy, args);

		System.out.println("invoke after");
		return invoke;
	}
});
System.out.println(cglibProxyDemo.getName("哈哈哈"));
```

### 源码剖析

#### 底层源码

1. 动态代理增强类：`UserService$$EnhancerByCGLIB$$3c55c846`
    1. 加载静态常量
		```java
		public class UserService$$EnhancerByCGLIB$$3c55c846 extends UserService implements Factory {
			static{
				// 增强类
				Class<?> clazz = Class.forName("aop.cglib.UserService$$EnhancerByCGLIB$$3c55c846");
				Class<?> clazz2 = Class.forName("java.lang.Object");
				// Object类的equals、toString、hashCode、clone
				Method[] methodArray = ReflectUtils.findMethods(new String[]{"equals", "(Ljava/lang/Object;)Z", "toString", "()Ljava/lang/String;", "hashCode", "()I", "clone", "()Ljava/lang/Object;"},clazz2.getDeclaredMethods());
				CGLIB$equals$1$Method = methodArray[0];
				CGLIB$equals$1$Proxy = MethodProxy.create(clazz2, clazz, "(Ljava/lang/Object;)Z", "equals", "CGLIB$equals$1");
				CGLIB$toString$2$Method = methodArray[1];
				CGLIB$toString$2$Proxy = MethodProxy.create(clazz2, clazz, "()Ljava/lang/String;", "toString", "CGLIB$toString$2");
				CGLIB$hashCode$3$Method = methodArray[2];
				CGLIB$hashCode$3$Proxy = MethodProxy.create(clazz2, clazz, "()I", "hashCode", "CGLIB$hashCode$3");
				CGLIB$clone$4$Method = methodArray[3];
				CGLIB$clone$4$Proxy = MethodProxy.create(clazz2, clazz, "()Ljava/lang/Object;", "clone", "CGLIB$clone$4");
		
				// 获取待增强类 UserService
				clazz2 = Class.forName("aop.cglib.UserService");
				// 获取待增强方法 Method：getName
				getName = ReflectUtils.findMethods(new String[]{"getName", "(Ljava/lang/String;)Ljava/lang/String;"}, clazz2.getDeclaredMethods())[0];
				// 获取增强方法的代理对象 MethodProxy
				getNameProxy = MethodProxy.create(clazz2, clazz, "(Ljava/lang/String;)Ljava/lang/String;", "getName", "CGLIB$getName$0");
			}
		}
		```

    2. 重写父类的getName()方法、获取父类的getName()的调用方法
		```java
		public final String getName(String string) {
			try {
				return (String) CGLIB$CALLBACK_0.intercept(this, getName, new Object[]{string}, getNameProxy);
			} catch (Throwable e) {
				throw new RuntimeException(e);
			}
		}
		```
		```java
		final String CGLIB$getName$0(String string) {
			return super.getName(string);
		}
		```

    3. 创建findMethodProxy
		```java
		public static MethodProxy CGLIB$findMethodProxy(Signature signature) {
			String string = ((Object) signature).toString();
			switch (string.hashCode()) {
				case -676316478: {
					if (!string.equals("getName(Ljava/lang/String;)Ljava/lang/String;")) break;
					return getNameProxy;
				}
				case -508378822: {
					if (!string.equals("clone()Ljava/lang/Object;")) break;
					return CGLIB$clone$4$Proxy;
				}
				case 1826985398: {
					if (!string.equals("equals(Ljava/lang/Object;)Z")) break;
					return CGLIB$equals$1$Proxy;
				}
				case 1913648695: {
					if (!string.equals("toString()Ljava/lang/String;")) break;
					return CGLIB$toString$2$Proxy;
				}
				case 1984935277: {
					if (!string.equals("hashCode()I")) break;
					return CGLIB$hashCode$3$Proxy;
				}
			}
			return null;
		}
		```

2. 免代理增强类：`methodProxy.invoke(UserService.class.newInstance(),args)`
```java
public class UserService$$FastClassByCGLIB$$798f8891 extends FastClass {
	// 根据签名获取方法的 Index
	@Override
	public int getIndex(Signature signature) {
		String string = ((Object) signature).toString();
		switch (string.hashCode()) {
			case -676316478: {
				if (!string.equals("getName(Ljava/lang/String;)Ljava/lang/String;")) break;
				return 0;
			}
			case 1826985398: {
				if (!string.equals("equals(Ljava/lang/Object;)Z")) break;
				return 1.                     }
			case 1913648695: {
				if (!string.equals("toString()Ljava/lang/String;")) break;
				return 2;
			}
			case 1984935277: {
				if (!string.equals("hashCode()I")) break;
				return 3;
			}
		}
		return -1；        
	}
	/**
	 * 创建实例
	 */
	public Object newInstance(int n, Object[] objectArray) throws InvocationTargetException {
		if (n == 0) {
			return new UserService();
		}
	}
}
```

3. 免代理增强类：`methodProxy.invoke(proxy,args)`
	```java
	public class UserService$$EnhancerByCGLIB$$3c55c846$$FastClassByCGLIB$$28ea653c extends FastClass {
		public int getIndex(Signature signature) {
			String string = ((Object) signature).toString();
			switch (string.hashCode()) {
				case -1870561232: {
					if (!string.equals("CGLIB$findMethodProxy(Lorg/springframework/cglib/core/Signature;)Lorg/springframework/cglib/proxy/MethodProxy;")) break;
					return 9;
				}
				case -988317324: {
					if (!string.equals("newInstance([Ljava/lang/Class;[Ljava/lang/Object;[Lorg/springframework/cglib/proxy/Callback;)Ljava/lang/Object;")) break;
					return 5;
				}
				case -676316478: {
					if (!string.equals("getName(Ljava/lang/String;)Ljava/lang/String;")) break;
					return 4;
				}
			}
			return -1.             }
	}
	```

#### 调用流程
```java
public static void main(String[] args) {
	UserService$$EnhancerByCGLIB$$3c55c846 proxy = new UserService$$EnhancerByCGLIB$$3c55c846();
	proxy.setCallbacks(new Callback[]{new MethodInterceptor() {
		@Override
		public Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
			System.out.println("invoke before");
			// 第一种： 调用反射
			Object invoke = method.invoke(UserService.class.newInstance(), args);
			// 第二种： 不调用反射
			//                Object invoke = methodProxy.invoke(UserService.class.newInstance(), args);
			// 第三种： 不调用反射
			//                Object invoke = methodProxy.invokeSuper(proxy, args);
			System.out.println("invoke after");
			return invoke;
		}
	}});
	System.out.println(proxy.getName("啾啾啾"));
}
```

2. 不经过反射的调用
    1. org.springframework.cglib.proxy.**MethodProxy**#`invoke`
		```java
		public Object invoke(Object obj, Object[] args) throws Throwable {
			try {
				// ★ 初始化fastClassInfo
				init();
				FastClassInfo fci = fastClassInfo;
				// ★ 执行FastClass的调用
				return fci.f1.invoke(fci.i1. obj, args);
			}
			catch (InvocationTargetException ex) {
				throw ex.getTargetException();
			}
			catch (IllegalArgumentException ex) {
				if (fastClassInfo.i1 < 0)
					throw new IllegalArgumentException("Protected method: " + sig1);
				throw ex;
			}
		}
		```
    2. 初始化fastClassInfo：org.springframework.cglib.proxy.**MethodProxy**#`init`
		```java
		private void init() {
			if (fastClassInfo == null) {
				synchronized (initLock) {
					if (fastClassInfo == null) {
						CreateInfo ci = createInfo;
		
						FastClassInfo fci = new FastClassInfo();
						fci.f1 = helper(ci, ci.c1);
						fci.f2 = helper(ci, ci.c2);
						// 根据getIndex(Signature signature) 获取调用方法的索引
						fci.i1 = fci.f1.getIndex(sig1);
						fci.i2 = fci.f2.getIndex(sig2);
						fastClassInfo = fci;
						createInfo = null;
					}
				}
			}
		}
		```

    3. 执行FastClass的调用：
        1. `methodProxy.invoke(UserService.class.newInstance(), args)`：代理方法对目标方法的调用
			```java
                /**
                     * methodProxy.invoke(UserService.class.newInstance(),args) 发起调用
                     *
                     * @param index  方法索引
                     * @param object 对象
                     * @param args   方法调用参数
                     */
                @Override
                public Object invoke(int index, Object object, Object[] args) throws InvocationTargetException {
                    UserService userService = (UserService) object;
                    switch (index) {
                        case 0: {
                            // ★ 使用目标对象调用目标方法
                            return userService.getName((String) args[0]);
                        }
                        case 1. {
                            return userService.equals(args[0]);
                        }
                        case 2: {
                            return userService.toString();
                        }
                        case 3: {
                            return userService.hashCode();
                        }
                    }
                }
                ```

        2. `methodProxy.invokeSuper(proxy, args)`：代理方法对代理对象的调用
			```java
			public Object invoke(int index, Object object, Object[] args) throws InvocationTargetException {
				UserService$$EnhancerByCGLIB$$3c55c846 proxy = (UserService$$EnhancerByCGLIB$$3c55c846) object;
				switch (index) {
					case 4: {
						// 增强方法
						return proxy.getName((String) args[0]);
					}
					case 9: {
						return UserService$$EnhancerByCGLIB$$3c55c846.CGLIB$findMethodProxy((Signature) args[0]);
					}
					case 15: {
						// 目标方法
						return proxy.CGLIB$getName$0((String) args[0]);
					}               
					case 20: {
						UserService$$EnhancerByCGLIB$$3c55c846.CGLIB$STATICHOOK1();
						return null;
					}
				}
			}
			```

