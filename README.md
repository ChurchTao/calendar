# <font color="#F68736" face="微软雅黑">移动端H5日历组件</font>




## 配置和使用方法

__DOM结构__

一个`div`即可

```html
<div id="calendar"></div>
```

__初始化__

以下代码是最简单的用法，更多复杂用法请参考`calendar_showcase`[源码下载](https://github.com/sunzunlu/MobileCalendar)

```js
var calendar = new Calendar({
    // 日历容器
    container: "#calendar",
    // 点击日期事件
    onItemClick: function(item) {
        var defaultDate = item.date;
    }
});
```

__参数说明__

| 参数 | 参数类型  | 说明  |
| :------------- |:-------------:|:-------------|
| container | string或HTMLElement | `必选` Calendar容器的css选择器，例如“#calendar”。默认为`#calendar` |
| pre |   string或HTMLElement  | `可选` 前一个月按钮的css选择器或HTML元素。默认`.pre`  |
| next |  string或HTMLElement  | `可选`后一个月按钮的css选择器或HTML元素。默认`.next`  |
| backToToday | string或HTMLElement | `可选` 返回今天按钮的css选择器或HTML元素。默认`.backToToday`  |
| dataRequest | Function | `可选` 回调函数，绑定业务数据。例如：某天有日程，则会在对应日期上标识出一个小红点或者其他标识，默认传入数据格式：data=`[{"date":"2018-04-18"},{"date":"2018-04-17"},{"date":"2018-04-16"}]`  |
| onItemClick | Function | `必选` 回调函数，当你点击或轻触某日期 300ms后执行。回调日期结果：`2018-04-07` |
| swipeCallback | Function | `可选` 回调函数，滑块释放时如果触发slider向后(左、上)切换则执行  |
| template | Function或String | `可选`，元素渲染的模板，可以是一个模板字符串，也可以是一个函数，为函数时，确保返回模板字符串，默认组件内置模板 |
| isDebug | Boolean | `可选`是否开启调试模式，默认`false` |


# API

生成的`calendar`对象可以调用如下API

```js
var calendar = new Calendar(...);
```

### refresh()

会销毁清空日历容器中的数据重新进行渲染。默认传入参数为空，刷新当前月份的日历数据。

```js
calendar.refresh();
```

同时也可以手动传入某个日期渲染日历数据，例如：渲染出`2020-08-08`的日历如下：

```js
calendar.refresh({
    year: "2020",
    month: "08",
    day: "08"
});
```

__参数说明__

| 参数 | 参数类型  | 说明  |
| :------------- |:-------------:|:-------------|
| {} | object | `必选` 日期对象必须传入以下格式：{year:"2018",month:"04",day:"08"}  |

### slidePrev()

`切换为上一个月`，与组件内部传入参数`pre`作用一样，该API支持Promise异步成功回调里处理自己的业务逻辑。

```js
calendar.slidePrev().then(...).then(...);
```

### slideNext()

`切换为下一个月`，与组件内部传入参数`next`作用一样，该API支持Promise异步成功回调里处理自己的业务逻辑。

```js
calendar.slideNext().then(...).then(...);
```

### addActiveStyleFordate()

`给特定日期新增选中激活样式`,比如：把日期`2018-08-21`标记位已选中状态。

```js
calendar.addActiveStyleFordate("2018-08-21");
```
__参数说明__

| 参数 | 参数类型  | 说明  |
| :------------- |:-------------:|:-------------|
| "2018-08-21" | String | `必选` 日期格式必须符合以下格式：2018-08-21  |

### refreshData()

会获取整个月的日历数据（`6 * 7 = 42`方格的日期），可根据该API自行个性化开发自己的日历组件，例如：

```js
calendar.refreshData({
    year: "2018",
    month: "04",
    day: "08"
},
function(output, data) {
    console.log("==某个月的日历渲染数据：==" + JSON.stringify(data));
    console.log("==组件自带模板==" + output);
});

```
`输出日历数据格式：`
```js
[{"day":25,"lunar":"初九","date":"2018-03-25","isforbid":"0"}]
```

`输出内置组件模板格式：`
```html
<div class="em-calendar-item  isforbid0"date="2018-03-25"><span class="day">25</span><p class="lunar">初九</p></div>
```