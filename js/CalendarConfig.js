
"use strict";

var demo = {
	calendar: {},
	refresh: function(options){
		this.calendar.refresh(options);
	},
	init: function() {
		//Date的prototype 属性可以向对象添加属性和方法。
		Date.prototype.Format = function(fmt){
			var o = {
				"M+": this.getMonth()+1,
				"d+": this.getDate(),
				"H+": this.getHours(),
				"m+": this.getMinutes(),
				"s+": this.getSeconds(),
				"S+": this.getMilliseconds()
			};
			//因为date.getFullYear()出来的结果是number类型的,所以为了让结果变成字符串型，下面有两种方法：
			if(/(y+)/.test(fmt)){
				//第一种：利用字符串连接符“+”给date.getFullYear()+""，加一个空字符串便可以将number类型转换成字符串。
				fmt=fmt.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length));
			}
			for(var k in o){
				if (new RegExp("(" + k +")").test(fmt)){
					//第二种：使用String()类型进行强制数据类型转换String(date.getFullYear())，这种更容易理解。
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(String(o[k]).length)));
				}
			}
			return fmt;
		};
		var self = this;
		// 初始化日历

		var calendar = new Calendar({
			mode: 'multiply',
			// mode: 'single',
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
				console.log(item);
				console.log(item.checkedList);
			},
			// 滑动回调
			swipeCallback: function(item) {
				console.log(item)
				var defaultDate = item.date;
				refreshMonthBox(item.month,item.action)
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
			],
			// 从今日起可以选中
			startDate: new Date().Format("yyyy-MM-dd")
		});
		this.calendar = calendar;

		var monthBox = document.querySelector('.top-month-box');
		var monthList = [];
		var nowMonth = 0;
		var curIndex = 0;
		function initMonthBox() {
			var html = '';
            var curMonth = new Date().getMonth() + 1;
			nowMonth = curMonth;
            for (var i = 0; i < 5; i++) {
            	var trueMonth;
            	if (curMonth+i>12){
            		trueMonth = curMonth + i - 12;
				} else {
            		trueMonth = curMonth + i
				}
				monthList.push(trueMonth);
				html+='<div class="month-box-item index'+i+'">'+(trueMonth)+'月</div>'
            }
            monthBox.innerHTML = html;
			setTimeout(function () {
				monthBox.querySelector('.month-box-item.index'+curIndex).classList.add('active');
			},100)
        }
		function refreshMonthBox(monthStr,action) {
			var month = parseInt(monthStr);
			if (month==nowMonth) return;
			var index = monthList.indexOf(month);
			if (index > -1 ){
				nowMonth = monthList[index];
			} else {
				if (action=='next'){
					monthList = monthList.slice(1);
					monthList.push(month);
				}
				if (action=='prev'){
					monthList = [month].concat(monthList.slice(0,monthList.length-1));
				}
				nowMonth = month;
			}
			var html="";
			for (var i = 0; i < monthList.length; i++) {
				if (monthList[i]==nowMonth) {
					curIndex = i;
				}
				html+='<div class="month-box-item index'+i+'">'+monthList[i]+'月</div>'
			}
			monthBox.innerHTML = html;
			setTimeout(function () {
				monthBox.querySelector('.month-box-item.index'+curIndex).classList.add('active');
			},100)
        }
        initMonthBox();

	}
}

// 初始化
demo.init();