
"use strict";

var demo = {
	calendar: {},
	refresh: function(options){
		this.calendar.refresh(options);
	},
	init: function() {
		//Date��prototype ���Կ��������������Ժͷ�����
		Date.prototype.Format = function(fmt){
			var o = {
				"M+": this.getMonth()+1,
				"d+": this.getDate(),
				"H+": this.getHours(),
				"m+": this.getMinutes(),
				"s+": this.getSeconds(),
				"S+": this.getMilliseconds()
			};
			//��Ϊdate.getFullYear()�����Ľ����number���͵�,����Ϊ���ý������ַ����ͣ����������ַ�����
			if(/(y+)/.test(fmt)){
				//��һ�֣������ַ������ӷ���+����date.getFullYear()+""����һ�����ַ�������Խ�number����ת�����ַ�����
				fmt=fmt.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length));
			}
			for(var k in o){
				if (new RegExp("(" + k +")").test(fmt)){
					//�ڶ��֣�ʹ��String()���ͽ���ǿ����������ת��String(date.getFullYear())�����ָ�������⡣
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(String(o[k]).length)));
				}
			}
			return fmt;
		};
		var self = this;
		// ��ʼ������

		var calendar = new Calendar({
			mode: 'multiply',
			// mode: 'single',
			// swiper��������
			container: "#calendar",
			// ��һ�½ڵ�
			pre: ".pre",
			// ��һ�½ڵ�
			next: ".next",
			// �ص�����
			backToToday: ".backToday",
			// ҵ�����ݸı�
			dataRequest: function(currdate, callback, _this) {
				// ���ճ̰���
				var data = [];
				callback && callback(data);
			},
			// ��������¼�
			onItemClick: function(item) {
				console.log(item);
				console.log(item.checkedList);
			},
			// �����ص�
			swipeCallback: function(item) {
				console.log(item)
				var defaultDate = item.date;
				refreshMonthBox(item.month,item.action)
			},
			// ����
			isDebug: false,
			checkedList: [
                '2019-12-11',
                '2019-12-12'
			],
            tipsList: [
				{date:'2019-12-25',class:'hdjr_tip',text:'��'},
				{date:'2019-12-27',class:'hdjr_tip',text:'��'}
			],
			// �ӽ��������ѡ��
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
				html+='<div class="month-box-item index'+i+'">'+(trueMonth)+'��</div>'
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
				html+='<div class="month-box-item index'+i+'">'+monthList[i]+'��</div>'
			}
			monthBox.innerHTML = html;
			setTimeout(function () {
				monthBox.querySelector('.month-box-item.index'+curIndex).classList.add('active');
			},100)
        }
        initMonthBox();

	}
}

// ��ʼ��
demo.init();