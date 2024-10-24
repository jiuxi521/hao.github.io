---
title: Vue
createTime: 2024/10/24 16:40:00
permalink: /article/bz36p5zs/
---
### Vue
1. 功能
	1. 双向绑定
	2. 组件复用和组件绑定
2. [原生HTML引入Vue组件](https://gitee.com/ma-hao-chinese/vue-test/blob/master/simple/html/example.html)
3. [Vue的单文件组件](https://gitee.com/ma-hao-chinese/vue-test/blob/master/hello/src/components/Button.vue)
4. 创建Vue工程：`vue create vue-test`
5. [组件向外暴露属性](https://gitee.com/ma-hao-chinese/vue-test/blob/master/hello/src/components/HelloWorld.vue)
6. 模板语法
	1. `\{\{\}\}`:文件插值
	2. 单向绑定：v-bind:property=""   或  :property=""
	3. 双向绑定：v-modal=""
	4. 事件绑定：v-on:click="method" 或 @click="js表达式"
	5. 解析html标签：v-html=""
	6. 遍历集合：v-for="(user,index) in userList"

### Axios

### Vue-Router

### MockJS

### Vuex
1. 全局一个store对象，保存了state（状态、变量池） + mutations（<font color="#ff0000">同步</font>操作变量的API）+ getter（获取对变量操作、筛选后的变量状态）+ actions（<font color="#ff0000">异步</font>调用mutation API的API）
	1. 异步：组件调用dispatch执行action，最终通过commit到mutation来对state进行修改，最终渲染到组件上
	2. 同步：组件直接调用mutation对state进行修改，最终渲染到组件上
2. ![image.png|500](https://raw.gitmirror.com/jiuxi521/typora/master/202404162005480.png)

### 跨域问题


### Token认证
JWT(Json Web Token)


### 学习问题

| 问题                                                                                                 | 博客                                                                                    | 笔记                                                                                                                                |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 前端框架vue中@的用法                                                                                       | [node.js及npm、vue等js类框架中@的用法](https://www.cnblogs.com/eminer/articles/17027507.html)   |                                                                                                                                   |
| export、export default、import的用法                                                                    | [Javascript模块导入导出详解](https://www.jb51.net/article/270910.htm)                         |                                                                                                                                   |
| Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension. | [创建package.json文件](https://www.cnblogs.com/77dd/p/14484758.html)                      | 1. 使用npm init -y初始化项目，生成一个pakeage.json文件 <br>2. 在pakeage.json文件中添加"type": "module"                                                |
| nodejs中的`__dirname`、`__filename`                                                                   | [`__dirname和__filename`](https://blog.csdn.net/qq_14820093/article/details/135938706) | 引用自`path`包，获取文化和目录的路径                                                                                                             |
| require和import的区别                                                                                  | # [require和import的区别](https://www.cnblogs.com/wenxuehai/p/14246989.html)              | 1. require用于引入module.exports = {}的值，类似赋值操作<br>2. import是将被引入文件加载，作为API调用                                                          |
| cjs和js文件的区别                                                                                        |                                                                                       | 在Node.js中，`.js` 文件可以使用CommonJS模块系统（`require` 和 `module.exports`）或ECMAScript模块系统（使用`import`和`export`）。cjs是为了与使用ECMAScript的js文件进行区分 |
| Vue.use()使用                                                                                        | [Vue.use()使用](https://blog.csdn.net/sunyctf/article/details/127706967)                | 1. Vue.use()用于注册插件，该插件返回一个对象（有一个install函数）或 本身就是一个函数，函数接收Vue对象作为第一个参数；<br>2. 插件的功能：注册一个全局的属性或方法等                                  |
