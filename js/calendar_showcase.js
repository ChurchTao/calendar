/**
 * 作者： 孙尊路
 * 创建时间： 2018/08/21 13:27:09
 * 版本： [1.0, 2018/08/21]
 * 版权： 江苏国泰新点软件有限公司
 * 描述：  日历组件示例
 */

"use strict";

var customBiz = {
	init: function() {
		var self = this;
		// 初始化日历

		var calendar = new Calendar({
			// mode: 'multiply',
			mode: 'single',
			// swiper滑动容器
			container: "#calendar",
			// 上一月节点
			pre: ".pre",
			// 下一月节点
			next: ".next",
			// 回到今天
			backToToday: ".backToday",
			// 业务数据改变
			dataRequest: function(currdate, callback, _this) {
				// 无日程安排
				var data = [];
				callback && callback(data);
			},
			// 点击日期事件
			onItemClick: function(item) {
				console.log(item.checkedList);
				var defaultDate = item.date;
				// 设置标题
				setTitle(defaultDate);
			},
			// 滑动回调
			swipeCallback: function(item) {
				var defaultDate = item.date;
				var changeNum = 0;
				if (item.action=="next"){
					changeNum=1;
				} else {
                    changeNum=-1
				}
				refreshMonthBox(item,changeNum)
				
				// 动态新增点击样式
				// calendar.addActiveStyleFordate(defaultDate);
				
			},
			// 调试
			isDebug: false,
			checkedList: [
                '2019-12-11',
                '2019-12-12'
			],
            tipsList: [
				{date:'2019-12-25',class:'hdjr_tip',text:'吉'},
				{date:'2019-12-27',class:'hdjr_tip',text:'吉'}
			]
		});
		var monthBox = document.querySelector('.top-month-box');

		function initMonthBox() {
			var html = '';
            var curMonth = new Date().getMonth() + 1;
            for (var i = 0; i < 5; i++) {
            	var trueMonth;
            	if (curMonth+i>12){
            		trueMonth = curMonth + i - 12;
				} else {
            		trueMonth = curMonth + i
				}
            	if (i==0) {
                    html+='<div class="month-box-item active">'+(trueMonth)+'月</div>'
				}  else {
                    html+='<div class="month-box-item">'+(trueMonth)+'月</div>'
                }
            }
            monthBox.innerHTML = html;
        }
		function refreshMonthBox(date,changeNum) {

        }
        initMonthBox();

	}
}

// 初始化
customBiz.init();