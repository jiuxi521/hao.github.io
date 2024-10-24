---
title: JavaScript
createTime: 2024/10/24 16:40:00
permalink: /article/pi5qrvyk/
---
# 可选链运算符（`?.`）

1. 可选链运算符（?.）允许读取位于连接对象链深处的属性的值，而不必明确验证链中的每个引用是否有效（不是null，也不是undefined）。
```javascript
obj.val?.prop
obj.val?.[expr]
obj.func?.(args)
```

# 空值合并运算符

1. 空值合并运算符（??）是一个逻辑运算符，当左侧的操作数为 null 或者 undefined 时，返回其右侧操作数，否则返回左侧操作数。
    1. 逻辑或运算符（||）：逻辑或运算符会**在左侧操作数为假值时返回右侧操作数**；
    2. 假值：null、undefined、''、0、NAN
```javascript
let x = undefined ?? 1. // x = 1
let x = null ?? 1. // x = 1
let x = '' ?? 1. // x = ''
let x = 0 ?? 1. // x = 0
```

# 逻辑空赋值（??=）

1. 逻辑空赋值运算符（x ??= y）仅在 x 是空值（null 或 undefined）时对其赋值。
```javascript
expr1 ??= expr2 // expr1为空值（null 或 undefined）时对其赋值。
```

# 数组遍历
1. arr.forEach((value,index,arr)=>{})
    1. 遍历表达式
2. arrays.map(item=> item.attr)
    1. 映射表达式
3. arrays.filter(item=> 布尔表达式)
    1. 过滤表达式
4. arrays.reduce((item1,item2)=>(item1 + item2),初始值)
    1. 归纳表达式
5. arrays.every(布尔表达式)
    1. 是否都满足要求
6. arrays.some(布尔表达式)
    1. 是否存在一条数据满足要求
7. arrays.reduceRight(accumulator)
    1. 从右往左执行累加器

# 集合属性
[数组、集合遍历](https://blog.csdn.net/weixin_39987434/article/details/130869691)
```javascript
// keys()方法：默认遍历器，其值为集合中的所有键名。
// values()方法：默认遍历器，其值为集合中的所有值。
// entries()方法：默认遍历器，其值为所有成员的键值对。
const arr = ["A", "B", "C"];
// key是索引，val是元素
console.log([...arr.keys()]); // [0, 1. 2]
console.log([...arr.values()]); // ["A", "B", "C"]
console.log([...arr.entries()]); // [[0, "A"],[1. "B"],[2, "C"]]

const set = new Set(arr);
console.log([...set.keys()]); // ["A", "B", "C"]
console.log([...set.values()]); // ["A", "B", "C"]
// key和value一致
console.log([...set.entries()]); // [["A", "A"],["B", "B"],["C", "C"]]

const map = new Map().set("name", "Tom").set("age", 19);
console.log([...map.keys()]); // ["name", "age"]
console.log([...map.values()]); // ["Tom", 19]
console.log([...map.entries()]); // [["name", "Tom"],["age", 19]]
```
