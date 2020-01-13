/**
 * @Description: Calender.js
 * @Version:     v1.0
 * @Author:      TJC
 */
window.innerCalendarUtil = window.innerCalendarUtil || (function (exports) {

    var class2type = {};

    exports.noop = function () {};

    exports.isFunction = function (value) {
        return exports.type(value) === 'function';
    };
    exports.isPlainObject = function (obj) {
        return exports.isObject(obj) && !exports.isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
    };
    exports.isArray = Array.isArray ||
        function (object) {
            return object instanceof Array;
        };
    exports.isWindow = function (obj) {
        return obj && obj === window;
    };
    exports.isObject = function (obj) {
        return exports.type(obj) === 'object';
    };
    exports.type = function (obj) {
        return(obj === null || obj === undefined) ? String(obj) : class2type[{}.toString.call(obj)] || 'object';
    };
    /**
     * extend �ϲ�������󣬿��Եݹ�ϲ�
     * @param {type} deep �Ƿ�ݹ�ϲ�
     * @param {type} target ���շ��صľ���target
     * @param {type} source �����֣����ȼ�������ߣ����Ҳ������󸲸ǵ�
     * @returns {Object} ���յĺϲ�����
     */
    exports.extend = function () {
        var args = [].slice.call(arguments);

        // Ŀ��
        var target = args[0] || {},
            // Ĭ��source��1��ʼ
            index = 1,
            len = args.length,
            // Ĭ�Ϸ����
            deep = false;

        if(typeof target === 'boolean') {
            // ������������
            deep = target;
            target = args[index] || {};
            index++;
        }

        if(!exports.isObject(target)) {
            // ȷ����չ��һ����object
            target = {};
        }

        for(; index < len; index++) {
            // source����չ
            var source = args[index];

            if(source && exports.isObject(source)) {
                for(var name in source) {
                    if(!Object.prototype.hasOwnProperty.call(source, name)) {
                        // ��ֹԭ���ϵ�����
                        continue;
                    }

                    var src = target[name];
                    var copy = source[name];
                    var clone,
                        copyIsArray;

                    if(target === copy) {
                        // ��ֹ��������
                        continue;
                    }

                    // ���������isPlainObject,ֻ��ͬ������ͨ��object�ŻḴ�Ƽ̳У������FormData֮���ģ����ߺ���ĸ���·��
                    if(deep && copy && (exports.isPlainObject(copy) || (copyIsArray = exports.isArray(copy)))) {
                        if(copyIsArray) {
                            copyIsArray = false;
                            clone = src && exports.isArray(src) ? src : [];
                        } else {
                            clone = src && exports.isPlainObject(src) ? src : {};
                        }

                        target[name] = exports.extend(deep, clone, copy);
                    } else if(copy !== undefined) {
                        // ���������ͨ��object��ֱ�Ӹ��ǣ�����FormData֮��ĻḲ��
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    return exports;
})({});
/**
 * �����������������
 */

(function () {
    "use strict";

    /**
     * ȫ����ЧĬ������
     * Ĭ�����ÿ������̶ȵļ�С����ʱ�Ĵ���
     */
    var defaultOptions = {
        // Ĭ�������������
        container: "#calendar",
        // swiper��������
        swiper: ".swiper-container",
        // Ĭ����ʾũ��
        isLunar: true,
        // Ĭ�Ͽ���ˮƽ�����л��·�
        isSwipeH: true,
        // Ĭ�Ͽ�����ֱ�����л��·�
        isSwipeV: true,
        // �����ص�
        swipeCallback: noop,
        // ��һ�½ڵ�
        pre: ".pre",
        // ��һ�»ص�
        preCallback: noop,
        // ��һ�½ڵ�
        next: ".next",
        // ��һ�»ص�
        nextCallback: noop,
        // ����ص�
        onItemClick: noop,
        // �Զ�������ģ��
        template: noop,
        // ҵ�����ݰ�
        dataRequest: noop,
        // �Ƿ�������
        isDebug: false,
        // ��ʾС��ǩ����������
        tipsList: [],
        checkedList:[],
        // ���ģʽ
        mode: 'single',
        // ��ѡ������ڿ�ʼʱ��
        startDate: '',
        // ��ѡ������ڽ���ʱ��
        endDate: ''
    };

    function noop() {}

    /**
     * �����Ĺ��캯��
     * @param {Object} options ���ò�������init�Լ�_initData��һ��
     * @constructor
     */
    function Calendar(options) {

        options = innerCalendarUtil.extend({}, defaultOptions, options);
        if(!this._selector(options.container)) {
            // ���쳣
            throw new Error("����������������Selector #id�����ڻ���Ϊ�գ�����ϸ��飡");
            return;
        }
        this.container = this._selector(options.container);

        this._initData(options);
    }

    Calendar.prototype = {
        checkedList: [],
        startDate: '',
        endDate: '',
        /**
         * ��ʼ�����ݵ�����ȡ������refreshDataʹ��
         * @param {Object} options ���ò���
         */
        _initData: function (options) {
            var self = this;
            this.options = options;

            // ��������DOM�ṹ��
            this.CreateDOMFactory(function () {
                // �������
                self._initParams();
            });
        },
        _initParams: function () {
            var self = this;
            self.checkedList = self.options.checkedList;
            self.nowYear = self.DateObj().getFullYear();
            self.nowMonth = self.tod(self.DateObj().getMonth() + 1);
            self.nowDay = self.tod(self.DateObj().getDate());
            // ��ǰ����
            self.currentDate = self.nowYear + "-" + self.nowMonth + "-" + self.nowDay;

            // ����ȫ�ֱ��� ����ũ��
            self.CalendarData = new Array(100);
            self.madd = new Array(12);
            self.tgString = "���ұ����켺�����ɹ�";
            self.dzString = "�ӳ���î������δ�����纥";
            self.numString = "һ�����������߰˾�ʮ";
            self.monString = "�������������߰˾�ʮ����";
            self.weekString = "��һ����������";
            self.sx = "��ţ������������Ｆ����";
            self.cYear, self.cMonth, self.cDay, self.TheDate;
            self.CalendarData = [0xA4B, 0x5164B, 0x6A5, 0x6D4, 0x415B5, 0x2B6, 0x957, 0x2092F, 0x497, 0x60C96, 0xD4A, 0xEA5, 0x50DA9, 0x5AD, 0x2B6, 0x3126E, 0x92E, 0x7192D, 0xC95, 0xD4A, 0x61B4A, 0xB55, 0x56A, 0x4155B, 0x25D, 0x92D, 0x2192B, 0xA95, 0x71695, 0x6CA, 0xB55, 0x50AB5, 0x4DA, 0xA5B, 0x30A57, 0x52B, 0x8152A, 0xE95, 0x6AA, 0x615AA, 0xAB5, 0x4B6, 0x414AE, 0xA57, 0x526, 0x31D26, 0xD95, 0x70B55, 0x56A, 0x96D, 0x5095D, 0x4AD, 0xA4D, 0x41A4D, 0xD25, 0x81AA5, 0xB54, 0xB6A, 0x612DA, 0x95B, 0x49B, 0x41497, 0xA4B, 0xA164B, 0x6A5, 0x6D4, 0x615B4, 0xAB6, 0x957, 0x5092F, 0x497, 0x64B, 0x30D4A, 0xEA5, 0x80D65, 0x5AC, 0xAB6, 0x5126D, 0x92E, 0xC96, 0x41A95, 0xD4A, 0xDA5, 0x20B55, 0x56A, 0x7155B, 0x25D, 0x92D, 0x5192B, 0xA95, 0xB4A, 0x416AA, 0xAD5, 0x90AB5, 0x4BA, 0xA5B, 0x60A57, 0x52B, 0xA93, 0x40E95];
            self.madd[0] = 0;
            self.madd[1] = 31;
            self.madd[2] = 59;
            self.madd[3] = 90;
            self.madd[4] = 120;
            self.madd[5] = 151;
            self.madd[6] = 181;
            self.madd[7] = 212;
            self.madd[8] = 243;
            self.madd[9] = 273;
            self.madd[10] = 304;
            self.madd[11] = 334;
            try {
              self.startDate=parseInt(self.options.startDate.replace(/-/g,''));
              self.endDate=parseInt(self.options.endDate.replace(/-/g,''));
            } catch (e) {
              self.startDate='';
              self.endDate='';
            }

            // ��������
            self.initEntry();

        },
        /**
         * ��ʼ������
         */
        initEntry: function (op) {
            var self = this;
            var options = innerCalendarUtil.extend({
                year: "",
                month: "",
                day: ""
            }, op);
            //console.log("�ϲ���"+JSON.stringify(options));
            // ��ȡǰһ���·�
            if(!options.year) {
                options.year = self.DateObj().getFullYear(); //Ĭ�ϲ���Ϊ"��ǰ��"
            } else {
                options.year = op.year;
            }
            if(!options.month) {
                options.month = self.tod(self.DateObj().getMonth() + 1); //Ĭ�ϲ���Ϊ"��ǰ��"
            } else {
                options.month = op.month;
            }

            var preYear = options.year;
            var m = options.month;
            var preMonth = parseInt(m) - parseInt(1);

            if(preMonth == 0) {
                preYear = options.year - 1;
                preMonth = 12;
            }
            preMonth = self.tom(preMonth);
            var preDay = self.tod("01");
            //if(self.options.isDebug) {
            if(self.options.isDebug) {
                console.log("(ǰ)��ʼ�������գ�" + preYear + "-" + preMonth + "-" + preDay);

            }

            // ������һ���·ݵ�����
            var outputs = [];
            self.refreshData({
                year: preYear,
                month: preMonth,
                day: preDay
            }, function (output) {
                outputs.push({
                    templ: output
                });

                // ��ʼ��Ĭ�ϵ�ǰ����
                var curYear = options.year || self.DateObj().getFullYear();
                var curMonth = options.month || self.tod(self.DateObj().getMonth() + 1);
                var curDay = options.day || self.tod(self.DateObj().getDate());
                //alert("Ĭ�϶Բ��ԣ�"+curYear+"-"+curMonth+"-"+curDay);
                self.curYear = options.year || self.DateObj().getFullYear();
                self.curMonth = options.month || self.tod(self.DateObj().getMonth() + 1);
                self.curDay = options.day || self.tod(self.DateObj().getDate());
                if(self.options.isDebug) {
                    console.log("(��)��ʼ�������գ�" + curYear + "-" + curMonth + "-" + curDay);
                }
                var inputObj = {
                    year: curYear,
                    month: curMonth,
                    day: curDay
                };
                // ���ɱ��·ݵ�����
                self.refreshData(inputObj, function (output1) {
                    outputs.push({
                        templ: output1
                    });
                    // ��Ⱦ����ģ��
                    var templ = self.SLIDER_ITEM_CONTAINER;

                    var html = "";
                    for(var i = 0; i < outputs.length; i++) {
                        html += Mustache.render(templ, outputs[i]);
                    }
                    document.querySelector(".swiper-wrapper").innerHTML = html;
                    // ��ʼ��swiper����
                    self._addEvent();
                });
            });
        },
        /**
         * ˢ���������������ڸ�ʽ�룺2017-07-01 ��2017-12-09
         */
        //refreshData: function(year, month, day, activeSlideNode) {
        refreshData: function (dateObj, callback) {
            var self = this;

            self.nowYear = parseInt(dateObj.year);
            self.nowMonth = self.tom(dateObj.month);
            self.nowDay = self.tod(dateObj.day);

            // ��ȡ����
            var tmptmp = new Date(Date.parse(self.nowYear + '/' + self.nowMonth + '/01'));
            var nowXingQiJi = tmptmp.getDay();
            //console.log("����"+nowXingQiJi);

            nowXingQiJi = parseInt(nowXingQiJi);
            if(nowXingQiJi == 0) {
                nowXingQiJi = 7;
            }
            // ������ݡ��·� �����·��е����������磺28��29��30��31�ȣ�
            var dayCount = self._judgeDaysByYearMonth(self.nowYear, self.nowMonth);
            // ������
            self.dayCount = dayCount;
            // �����ϵĴ洢��ʽ
            var fileInfo = {};
            // �µĴ洢��ʽ
            var tmpInfo = [];

            var preDayCount = self._judgeDaysByYearMonth(self.nowYear, parseInt(self.nowMonth - 1));
            //console.log("ǰһ����������" + preDayCount);
            preDayCount = parseInt(preDayCount);

            // ͷ�����ڼ���
            for(var i = 1; i < nowXingQiJi + 1; i++) {
                var preMonthDay = preDayCount - nowXingQiJi + i;
                var tmpName = 'day' + i;
                var lunar = 'lunar' + i;
                //�ա�ũ������������
                var y = parseInt(self.nowYear);
                var m = parseInt(self.nowMonth);
                m = -1 + m;
                if(m == 0) {
                    m = 12;
                    y = parseInt(self.nowYear - 1)
                }
                fileInfo[tmpName] = preMonthDay;
                fileInfo[lunar] = self._getLunar(preMonthDay, m, y);
                //  console.log("ũ����" + fileInfo[lunar]);
                //�洢ǰһ��������
                //console.log(self.nowYear + "-" + self.tom(parseInt(self.nowMonth - 1)) + "-" + self.tod(preMonthDay));
                tmpInfo.push({
                    day: preMonthDay, //��
                    lunar: self._getLunar(preMonthDay, m, y), //ũ��
                    date: y + "-" + self.tom(m) + "-" + self.tod(preMonthDay), //��������
                    isforbid: "0", //ǰһ���ºͺ�һ���²��ɵ��
                    tip: 'prev'
                });
                //console.log("��ݣ�" + self.nowYear);
                //console.log("�ϸ��µ����ݣ�\n" + JSON.stringify(tmpInfo)+"\n");
            }
            var daonale = 0;

            if(dayCount == '28') {
                daonale = 28 + nowXingQiJi;
                for(var index = nowXingQiJi + 1, indexindex = 1; index < (28 + nowXingQiJi + 1); index++, indexindex++) {
                    var tmpName = 'day' + index;
                    var lunar = 'lunar' + index;
                    fileInfo[tmpName] = indexindex;
                    fileInfo[lunar] = self._getLunar(indexindex);
                    //�洢��ǰ������
                    tmpInfo.push({
                        day: indexindex, //��
                        lunar: self._getLunar(indexindex), //ũ��
                        date: self.nowYear + "-" + self.tom(self.nowMonth) + "-" + self.tod(indexindex), //��������
                        isforbid: "1" //��ǰ�¿ɵ��
                    });
                    //  console.log(self.tom(parseInt(self.nowMonth)) + "�·ݣ�" + self.tod(indexindex));

                }
            }
            if(dayCount == '29') {
                daonale = 29 + nowXingQiJi;
                for(var index = nowXingQiJi + 1, indexindex = 1; index < (29 + nowXingQiJi + 1); index++, indexindex++) {
                    var tmpName = 'day' + index;
                    var lunar = 'lunar' + index;
                    fileInfo[tmpName] = indexindex;
                    fileInfo[lunar] = self._getLunar(indexindex);
                    //�洢��ǰ������
                    tmpInfo.push({
                        day: indexindex, //��
                        lunar: self._getLunar(indexindex), //ũ��
                        date: self.nowYear + "-" + self.tom(self.nowMonth) + "-" + self.tod(indexindex), //��������
                        isforbid: "1" //��ǰ�¿ɵ��
                    });
                    //console.log(self.tom(parseInt(self.nowMonth)) + "�·ݣ�" + self.tod(indexindex));

                }
            }
            if(dayCount == '30') {
                daonale = 30 + nowXingQiJi;
                for(var index = nowXingQiJi + 1, indexindex = 1; index < (30 + nowXingQiJi + 1); index++, indexindex++) {
                    var tmpName = 'day' + index;
                    var lunar = 'lunar' + index;
                    fileInfo[tmpName] = indexindex;
                    fileInfo[lunar] = self._getLunar(indexindex);
                    //�洢��ǰ������
                    tmpInfo.push({
                        day: indexindex, //��
                        lunar: self._getLunar(indexindex), //ũ��
                        date: self.nowYear + "-" + self.tom(self.nowMonth) + "-" + self.tod(indexindex), //��������
                        isforbid: "1"//��ǰ�¿ɵ��
                    });
                    //console.log(self.tom(parseInt(self.nowMonth)) + "�·ݣ�" + self.tod(indexindex));
                }
            }
            if(dayCount == '31') {
                daonale = 31 + nowXingQiJi;
                for(var index = nowXingQiJi + 1, indexindex = 1; index < (31 + nowXingQiJi + 1); index++, indexindex++) {
                    var tmpName = 'day' + index;
                    var lunar = 'lunar' + index;
                    fileInfo[tmpName] = indexindex;
                    fileInfo[lunar] = self._getLunar(indexindex);
                    //�洢��ǰ������
                    tmpInfo.push({
                        day: indexindex, //��
                        lunar: self._getLunar(indexindex), //ũ��
                        date: self.nowYear + "-" + self.tom(self.nowMonth) + "-" + self.tod(indexindex), //��������
                        isforbid: "1" //��ǰ�¿ɵ��
                    });
                    //console.log(self.tom(parseInt(self.nowMonth)) + "�·ݣ�" + self.tod(indexindex));
                }
            }
            // β�����ڼ���
            for(var index2 = daonale + 1, index3 = 1; index2 <= 42; index2++, index3++) {
                var tmpName = 'day' + index2;
                var lunar = 'lunar' + index2;
                //�ա�ũ������������
                var y2 = parseInt(self.nowYear);
                var m2 = parseInt(self.nowMonth) + parseInt(1);
                if(m2 == 13) {
                    m2 = 1;
                    y2 = parseInt(self.nowYear) + parseInt(1)
                }
                fileInfo[tmpName] = index3;
                fileInfo[lunar] = self._getLunar(index3, m2, y2);
                //�洢��ǰ������
                tmpInfo.push({
                    day: index3, //��
                    lunar: self._getLunar(index3, m2, y2), //ũ��
                    date: y2 + "-" + self.tom(m2) + "-" + self.tod(index3), //��������
                    isforbid: "0", //ǰһ�ºͺ�һ�²��ɵ��
                    tip: 'next'
                });
                //console.log("����һ���µ����ݣ�\n" + JSON.stringify(tmpInfo) + "\n");
                //console.log(self.tom(parseInt(self.nowMonth) + parseInt(1)) + "�·ݣ�" + self.tod(index3));
            }
            if(self.options.isDebug) {
                console.log("*********������ʽ********:\n" + JSON.stringify(tmpInfo) + "\n");
            }
            //this._render(fileInfo, tmpInfo, dateObj.activeSlideNode);
            this._render({
                fileInfo: fileInfo,
                tmpInfo: tmpInfo,
                activeSlideNode: dateObj.activeSlideNode,
            }, callback);
        },

        /**
         * ��ͼ����Ⱦ�����ݷ��룬�����ڲ�������
         */
        _render: function (dataObj, callback) {
            var self = this;
            // ��Ⱦ֮ǰ��ҵ��ajax������ʾ�������ճ̱��
            var dateStr = self.nowYear + "-" + self.nowMonth + "-";
            // ���������ӳ�300ms,���򻬶���ƫ��
            setTimeout(function () {
                self.options.dataRequest(dateStr, function (data) {
                    var res = data || [];
                    //��ҵ���
                    if(self.options.isDebug) {
                        console.log("*********ҵ�����ݣ�********:\n" + JSON.stringify(res) + "\n");
                    }
                    for(var k = 0; k < dataObj.tmpInfo.length; k++) {
                        var tipClassItem = self._isShowTips(dataObj.tmpInfo[k].date);
                        if (tipClassItem!=""){
                            dataObj.tmpInfo[k].showTips = tipClassItem.class;
                            dataObj.tmpInfo[k].tipsText = tipClassItem.text;
                        }

                        for (var j = 0; j < self.checkedList.length; j++) {
                            if (dataObj.tmpInfo[k].date==self.checkedList[j]){
                                dataObj.tmpInfo[k].isSelected = "1";
                            }
                        }
                        dataObj.tmpInfo[k].disabled = self._isDisAble(dataObj.tmpInfo[k].date)
                    }
                    //��ȫ֧���Զ����ⲿ����ģ��
                    var html = self.getThemeHtml(dataObj);

                    if(self.options.isDebug) {
                        console.log("*********����ģ��********:\n" + html + "\n");
                    }
                    if(typeof (callback) == "function") {
                        callback && callback(html, dataObj.tmpInfo);
                    }
                }, self);
            }, 100);
        },
        /**
         * ��ȡ����ģ��
         */
        getThemeHtml: function (dataObj) {
            var self = this;
            // ģ�弯��
            var html = "";
            // ģ����
            var template = "";
            // ��ǰ����
            var curr = self.currentDate;

            for(var i = 0, len = dataObj.tmpInfo.length; i < len; i++) {
                // �������ģ��Ϊ�գ���Ĭ����������ģ��
                var value = dataObj.tmpInfo[i];
                var templData = self.options.template(value, curr);
                if(!templData) {

                    //console.log("=======Ĭ����������ģ��=======");
                    // =======Ĭ����������ģ��=======
                    // ��һ�º���һ�²��ɵ��ģ��
                    if(value.isSelected=="1") {
                        // ���Ի���ҵ������
                        // template = '<div class="em-calendar-item em-calendar-active isforbid{{isforbid}} tip{{tip}}" date="{{date}}" ><div class="background-circle"></div><span class="tips {{showTips}}">{{tipsText}}</span><span class="day">{{day}}</span><p class="lunar">{{lunar}}</p><span class="dot dot-type1"></span></div>';
                        template = '<div class="em-calendar-item em-calendar-active isforbid{{isforbid}} tip{{tip}} {{disabled}}" date="{{date}}" ><div class="background-circle"></div><span class="tips {{showTips}}">{{tipsText}}</span><span class="day">{{day}}</span><p class="lunar">{{lunar}}</p></div>';
                    } else {
                        template = '<div class="em-calendar-item  isforbid{{isforbid}} tip{{tip}} {{disabled}}" date="{{date}}"><div class="background-circle"></div><span class="tips {{showTips}}">{{tipsText}}</span><span class="day">{{day}}</span><p class="lunar">{{lunar}}</p></div>';
                    }
                    html += Mustache.render(template, value);
                } else {
                    // console.log("=======�Զ��崫��=======");
                    // =======�Զ��崫��=======
                    html += Mustache.render(templData, value);
                }
            }

            return html;
        },
        /**
         * ����DOMԪ�ع���������ʽ�̶��ṹ�洢�������ⲿ��ͨ����ʽ�޸�
         */
        CreateDOMFactory: function (callback) {
            var self = this;
            // ͷ����ʽ
            self.HEADER_BAR = '<div class="em-calendar-container"><div class="em-week">\
							<span class="em-red">��</span>\
							<span>һ</span>\
							<span>��</span>\
							<span>��</span>\
							<span>��</span>\
							<span>��</span>\
							<span class="em-red">��</span>\
						</div>';

            self.HEADER = '<div class="swiper-container">\
							<div class="swiper-wrapper">';

            // �ײ���ʽ
            self.FOOTER = '</div>\
							</div>\
							</div>';

            // �������������ʽ
            self.SLIDER_ITEM_CONTAINER = '<div class="swiper-slide">\
									<div class="em-calendar-content">\
									<div class="em-calendar-wrapper">{{{templ}}}</div>\
								</div></div>';

            var output = self.HEADER_BAR + self.HEADER + self.FOOTER;
            self.container.innerHTML = output;

            // ִ�лص�
            callback && callback();
        },
        /*
         * JSON����ȥ��
         * @param: [array] json Array
         * @param: [string] Ψһ��key�������ݴ˼�������ȥ��
         */
        uniqueArray: function (array, key) {
            var result = [array[0]];
            for(var i = 1; i < array.length; i++) {
                var item = array[i];
                var repeat = false;
                for(var j = 0; j < result.length; j++) {
                    if(item[key] == result[j][key]) {
                        repeat = true;
                        break;
                    }
                }
                if(!repeat) {
                    result.push(item);
                }
            }
            return result;

        },
        _isShowTips: function (dateStr) {
            var self = this;
            for (var i = 0; i < self.options.tipsList.length; i++) {
                if (dateStr == self.options.tipsList[i].date){
                    return self.options.tipsList[i];
                }
            }
            return "";
        },
        _isDisAble: function (dateStr) {
            var self = this;
            try {
                var date = parseInt(dateStr.replace(/-/g,''));
                if (date<self.startDate || date>self.endDate){
                    return 'disabled';
                }
            } catch (e) {
                return "";
            }
            return "";
        },
        /**
         * �����¼�������
         * ��������ļ���
         * �����󻬡��һ��л����ȵ�
         */
        _addEvent: function () {
            var self = this;
            var onItemClick = self.options.onItemClick;
            var swipeCallback = self.options.swipeCallback;
            var preCallback = self.options.preCallback;
            var nextCallback = self.options.nextCallback;

            // ��¼��һ�º���һ�������
            var preMonthIndex = parseInt(self.curMonth) - parseInt(2);
            var preYearIndex = self.curYear;
            // ��¼��һ�º���һ�������
            var nextMonthIndex = parseInt(self.curMonth);
            var nextYearIndex = self.DateObj().getFullYear();
            var nextYear = self.curYear;
            var nextMonth;

            var count = 0;
            var currYearIndex = self.curYear;
            var currMonthIndex = parseInt(self.curMonth);
            var currDayIndex = self.curDay;
            // ����swiper �������
            self.mySwiper = new Swiper('.swiper-container', {
                loop: false,
                initialSlide: 1,
                speed: 150,
                prevButton: self.options.pre,
                nextButton: self.options.next,
                // ���Ӽ�������¼�
                onClick: function (swiper, e) {
                    // ���ڻ�ɫ���ֲ�����
                    var _this = e.target.parentNode;
                    // �������ֵ
                    var dateStr = _this.getAttribute('date');
                    // ũ�����ֵ
                    if(_this.querySelector('.lunar')) {
                        var lunarStr = _this.querySelector('.lunar').innerText.trim();
                    } else {
                        var lunarStr = "��ǩ";
                    }
                    // �ɵ������
                    if(!_this.classList.contains('isforbid0')) {
                        if(_this.getAttribute("date") && !_this.classList.contains('disabled')) {
                            if (self.options.mode == 'single'){
                                _this.classList.add('em-calendar-active');
                                self.sibling(_this, function (el) {
                                    el.classList.remove('em-calendar-active');
                                });
                                self.checkedList = [dateStr]
                            } else {
                                var index = self.checkedList.indexOf(dateStr);
                                if (index > -1){
                                    self.checkedList.splice(index,1);
                                    _this.classList.remove('em-calendar-active');
                                } else {
                                    self.checkedList.push(dateStr);
                                    _this.classList.add('em-calendar-active');
                                }
                            }
                        } else {
                            return;
                        }
                    } else {
                        // ���ɵ������
                        if(_this.classList.contains('tipprev')) {
                            // ǰ��
                            self.slidePrev().then(function () {
                                // ���ض������������������ʽ
                                // self.addActiveStyleFordate(dateStr);
                            });
                        } else if(_this.classList.contains('tipnext')) {
                            // ����
                            self.slideNext().then(function () {
                                // ���ض������������������ʽ
                                // self.addActiveStyleFordate(dateStr);
                            });

                        }
                    }
                    // ����ص�
                    onItemClick && onItemClick({
                            date: dateStr, //����
                            lunar: lunarStr, //ũ��
                            checkedList: self.checkedList
                    });

                },
                /**
                 * @description �·ݵ���
                 * @param {Object} swiper swiper����
                 */
                onSlideNextStart: function (swiper) {
                    count++;
                    if(count == "1") {
                        //alert("����1�������ܴ����ǵ�ǰ��");
                        //alert("����������"+self.nowYear+self.nowMonth);
                        currDayIndex = self.curDay;
                        currMonthIndex = parseInt(self.curMonth);
                    } else {
                        currMonthIndex = currMonthIndex + 1;
                        currDayIndex = "01";

                    }
                    if(currMonthIndex == "13") {
                        currYearIndex = parseInt(currYearIndex) + parseInt(1);
                        currMonthIndex = 1;
                    }
                    // ��������ģʽ
                    if(self.options.isDebug) {
                        console.log("currMonthIndex��" + currMonthIndex);
                        console.log("currYearIndex��" + currYearIndex);
                        console.log(">>>>>>" + self.nowYear + "-" + self.nowMonth + "-" + self.nowDay);
                    }
                    //alert("���ص�"+">>>>>>" + currYearIndex + "-" + currMonthIndex + "-" + self.nowDay);
                    //�ص�
                    swipeCallback && swipeCallback({
                        year: currYearIndex,
                        month: self.tom(currMonthIndex),
                        day: currDayIndex,
                        date: currYearIndex + "-" + self.tom(currMonthIndex) + "-" + currDayIndex,
                        dayCount: self.dayCount,
                        action: 'next'
                    });
                    /**
                     * @description ���
                     */
                    nextMonthIndex += parseInt(1);
                    if(nextMonthIndex == 13) {
                        nextYear = currYearIndex + 1;
                        nextMonthIndex = 1;
                    }
                    nextMonth = self.tom(nextMonthIndex);

                    if(self.options.isDebug) {
                        console.log("(��)��ʼ�������գ�" + nextYear + "-" + nextMonth + "-" + "01");
                    }

                    self.refreshData({
                        year: nextYear,
                        month: nextMonth,
                        day: "01"
                    }, function (output1) {
                        var outputs = [];
                        outputs.push({
                            templ: output1
                        });
                        // ��Ⱦ����ģ��
                        var templ = self.SLIDER_ITEM_CONTAINER;
                        var html = "";
                        for(var i = 0; i < outputs.length; i++) {
                            html += Mustache.render(templ, outputs[i]);
                        }
                        swiper.appendSlide(html);
                    });
                    // ������󻬶�ʱ��һ���·ǵ�ǰ�£�������Ⱦ1����ʽ
                    // if(self.tom(currMonthIndex) !== self.curMonth ) {
                    //     var chooseDom = document.querySelector('.swiper-slide-active .em-calendar-active')
                    //     if(chooseDom) {
                    //         chooseDom.classList.remove('em-calendar-active')
                    //     }
                    //     document.querySelector('.swiper-slide-active .isforbid1').classList.add('em-calendar-active')
                    //
                    // }

                },
                /**
                 * @description �·ݵݼ�
                 * @param {Object} swiper swiper����
                 */
                onSlidePrevStart: function (swiper) {
                    count--;
                    // if(count == "1") {
                    //     currDayIndex = self.curDay;
                    //     currMonthIndex = parseInt(self.curMonth);
                    // } else {
                        currMonthIndex = parseInt(currMonthIndex) - parseInt(1);
                        currDayIndex = "01";

                    // }
                    if(currMonthIndex == '0') {
                        currYearIndex = parseInt(currYearIndex) - parseInt(1);
                        currMonthIndex = 12;
                    }
                    // ��������ģʽ
                    if(self.options.isDebug) {
                        console.log("currMonthIndex��" + currMonthIndex);
                        console.log("currYearIndex��" + currYearIndex);
                        console.log("��ǰ" + self.nowYear + "-" + self.nowMonth + "�·�");
                    }

                    // ����ص�
                    swipeCallback && swipeCallback({
                        year: currYearIndex,
                        month: self.tom(currMonthIndex),
                        day: currDayIndex,
                        date: currYearIndex + "-" + self.tom(currMonthIndex) + "-" + currDayIndex,
                        dayCount: self.dayCount,
                        action: 'prev'
                    });

                    if(preMonthIndex == 0) {
                        preYearIndex--;
                        preMonthIndex = 12;
                    }
                    var preMonth = self.tom(preMonthIndex);
                    //console.log("ǰ�ӣ�" + preYearIndex + "-" + preMonth + "-" + "01");
                    //ejs.ui.toast("ǰ�ӣ�" + preYearIndex + "-" + preMonth + "-" + preDay);

                    preMonthIndex--;
                    // ˢ������

                    self.refreshData({
                        year: preYearIndex,
                        month: preMonth,
                        day: "01"
                    }, function (output1) {

                        var outputs = [];
                        outputs.push({
                            templ: output1
                        });
                        // ��Ⱦ����ģ��
                        var templ = self.SLIDER_ITEM_CONTAINER;
                        var html = "";
                        for(var i = 0; i < outputs.length; i++) {
                            html += Mustache.render(templ, outputs[i]);
                        }
                        swiper.prependSlide(html);
                    });

                }
            });

            // �ص�����
            if(self._selector(self.options.backToToday)) {
                self._selector(self.options.backToToday).addEventListener("touchstart", function () {
                    // �ⲿִ�лص�
                    var curYear = self.DateObj().getFullYear();
                    var curMonth = self.tod(self.DateObj().getMonth() + 1);
                    var curDay = self.tod(self.DateObj().getDate());
                    // ˢ��
                    self.refresh();

                });
            }
        },
        /**
         * @description ���ض���������ѡ�м�����ʽ
         * @param {Object} dateStr ���������� ,���磺��2018-08-20��
         */
        addActiveStyleFordate: function (dateStr) {
            var self = this;
            // ��ǰ���µĵ�����ڼ�ѡ�б��
            var clickactives = document.querySelector('.swiper-slide-active').querySelectorAll('.em-calendar-item');
            for(var i = 0; i < clickactives.length; i++) {
                if(clickactives[i].getAttribute("date") == dateStr) {
                    if (self.options.mode == 'single'){
                        clickactives[i].classList.add('em-calendar-active');
                        self.sibling(clickactives[i], function (el) {
                            el.classList.remove('em-calendar-active');
                        });
                        self.checkedList = [dateStr]
                    } else {
                        var index = self.checkedList.indexOf(dateStr);
                        if (index > -1){
                            self.checkedList.splice(index,1);
                            clickactives[i].classList.remove('em-calendar-active');
                        } else {
                            self.checkedList.push(dateStr);
                            clickactives[i].classList.add('em-calendar-active');
                        }
                    }
                }
            }
        },
        /**
         * ��ǰ����
         */
        slidePrev: function (options) {
            var self = this;
            return new Promise(function (resolve, reject) {
                self.mySwiper.slidePrev();
                return resolve(options);
            });
        },

        /**
         * ��󻬶�
         */
        slideNext: function (options) {
            var self = this;
            return new Promise(function (resolve, reject) {
                self.mySwiper.slideNext();
                return resolve(options);
            });
        },
        /**
         * �ⲿˢ��
         */
        refresh: function (options) {
            var self = this;
            // ����
            self.destroySwiper();
            // ����
            self.initEntry(options);

        },
        /**
         * ����swiper
         */
        destroySwiper: function () {
            var self = this;
            // ����
            self.mySwiper.destroy(true);
        },

        /**
         * ��ȡ��ǰũ��
         * @param {Object} currentday
         * @param {Object} month
         * @return {String} 
         */
        _getLunar: function (currentday, month, year) {
            var self = this;
            // �м���Ĭ�ϵ�ǰ��͵�ǰ�£���ͷ��Ҫ�������
            var yy = year || self.nowYear;
            var mm = month || self.nowMonth;
            var dd = currentday;
            return this._getLunarDay(yy, mm, dd);
        },
        /**
         * �������¼��㵱�µ�����
         * @param {Object} y
         * @param {Object} m
         */
        _judgeDaysByYearMonth: function (y, m) {
            var self = this;
            if(y == undefined || y == null) {
                throw "=====��ȡ��ǰ�·�����ʱ��ȱ��y������δ���壡=======";
            }
            if(m == undefined || m == null) {
                throw "=====��ȡ��ǰ�·�����ʱ��ȱ��m������δ���壡=======";
            }
            var y = parseInt(y);
            var m = parseInt(m);
            if(m == 0) {
                y--;
                m = 12;
            }
            if(m == 2) {
                if((y % 4 == 0 && y % 100 != 0) || (y % 400 == 0)) {
                    return '29';
                } else {
                    return '28';
                }
            } else {
                if(self._inArray(m, [1, 3, 5, 7, 8, 10, 12])) {
                    return '31';
                } else {
                    return '30';
                }
            }

        },

        /**
         * ����һ��ȫ����֤����֤����ĺϷ���
         * �����֤��ǿ���Ե�
         */
        _validate: function () {
            var flag = true;
            if(!this.options.container) {
                flag = false;
            }
            return flag;
        },
        _selector: function (el) {
            // �������
            return document.querySelector(el);
        },
        /**
         *  �ж�Ԫ�����������Ƿ����
         * @param {Object} str ���ֻ����ַ���Ԫ��
         * @param {Object} arr ��Ч����
         */
        _inArray: function (str, arr) {
            // �����������׳��쳣 
            if(!Array.isArray(arr)) {
                throw "arguments is not Array";
            }
            // �����Ƿ��������� 
            for(var i = 0, k = arr.length; i < k; i++) {
                if(str == arr[i]) {
                    return true;
                }
            }
            // ������������оͻ᷵��false 
            return false;
        },
        _getBit: function (m, n) {
            var self = this;
            // ũ��ת�� 
            return(m >> n) & 1;
        },
        _e2c: function () {
            var self = this;
            self.TheDate = (arguments.length != 3) ? new Date() : new Date(arguments[0], arguments[1], arguments[2]);
            var total, m, n, k;
            var isEnd = false;
            var tmp = self.TheDate.getYear();
            if(tmp < 1900) {
                tmp += 1900;
            }
            total = (tmp - 1921) * 365 + Math.floor((tmp - 1921) / 4) + self.madd[self.TheDate.getMonth()] + self.TheDate.getDate() - 38;

            if(self.TheDate.getYear() % 4 == 0 && self.TheDate.getMonth() > 1) {
                total++;
            }
            for(m = 0;; m++) {
                k = (self.CalendarData[m] < 0xfff) ? 11 : 12;
                for(n = k; n >= 0; n--) {
                    if(total <= 29 + self._getBit(self.CalendarData[m], n)) {
                        isEnd = true;
                        break;
                    }
                    total = total - 29 - self._getBit(self.CalendarData[m], n);
                }
                if(isEnd) break;
            }
            self.cYear = 1921 + m;
            self.cMonth = k - n + 1;
            self.cDay = total;
            if(k == 12) {
                if(self.cMonth == Math.floor(self.CalendarData[m] / 0x10000) + 1) {
                    self.cMonth = 1 - self.cMonth;
                }
                if(self.cMonth > Math.floor(self.CalendarData[m] / 0x10000) + 1) {
                    self.cMonth--;
                }
            }

        },

        _getcDateString: function () {
            var self = this;
            var tmp = "";
            /*��ʾũ���꣺�� �磺����(��)�� ��*/
            if(self.cMonth < 1) {
                // tmp += "(��)";
                // tmp += self.monString.charAt(-self.cMonth - 1);
            } else {
                // tmp += self.monString.charAt(self.cMonth - 1);
            }
            //tmp += "��";
            tmp += (self.cDay < 11) ? "��" : ((self.cDay < 20) ? "ʮ" : ((self.cDay < 30) ? "إ" : "��ʮ"));
            if(self.cDay % 10 != 0 || self.cDay == 10) {
                tmp += self.numString.charAt((self.cDay - 1) % 10);
            }
            return tmp;

        },
        _getLunarDay: function (solarYear, solarMonth, solarDay) {
            var self = this;
            //solarYear = solarYear<1900?(1900+solarYear):solarYear; 
            if(solarYear < 1921 || solarYear > 2080) {
                return "";
            } else {
                solarMonth = (parseInt(solarMonth) > 0) ? (solarMonth - 1) : 11;
                self._e2c(solarYear, solarMonth, solarDay);
                return self._getcDateString();
            }

        },
        /**
         * ��1,2,3,4,5��ʽ��01,02,03,04,05
         * @param {Object} m �·�ת��
         */
        tom: function (m) {
            if(parseInt(m) > 9) {
                m = "" + parseInt(m);
            } else {
                m = "0" + parseInt(m);
            }
            return m;
        },
        /**
         * ��1,2,3,4,5��ʽ��01,02,03,04,05
         * @param {Object} ��ת��
         */
        tod: function (d) {
            if(parseInt(d) > 9) {
                d = "" + parseInt(d);
            } else {
                d = "0" + parseInt(d);
            }
            return d;
        },
        /**
         * ��ȡСʱ�����ӡ���    ���磺18:09:00
         * @param {Object} format hh:mm ���00:00  hh:mm:ss ���00:00:00
         */
        getTime: function (format) {
            var self = this;
            var hh = self.DateObj().getHours();
            var mm = self.DateObj().getMinutes();
            var ss = self.DateObj().getSeconds();
            var timeStr = "";
            if("hh:mm" == format) {
                timeStr += hh + ":" + mm;
            } else if("hh:mm:ss" == format) {
                timeStr += hh + ":" + mm + ":" + ss;
            }
            return timeStr;
        },
        /**
         * ��ȡ����
         */
        DateObj: function (dateStr) {
            var dateObj;
            if(!dateStr) {
                //throw("������Ϸ����ڸ�ʽ��"+str);
                dateObj = new Date();
            } else {
                // ע�⣺���Ȱ�ʱ���(122891289)ת���ַ���Ȼ����в���
                var index = dateStr.toString().indexOf('-');
                if(index == "-1") {
                    // ����ʱ���
                    dateObj = new Date(dateStr);
                } else {
                    // ����������ʽʱ������мǲ�Ҫֱ�Ӵ�  new Date 2017-09-09 19:00:00��
                    dateObj = new Date(dateStr.replace(/-/g, '/'));
                }
            }
            return dateObj;
        },
        /**
         * @description ��ȡĳ��Ԫ�ص������ֵܽڵ�;���ﻹ�ǽ���ʹ�ÿ���ʵ�� ��ϲ����Ŀ��Բο�������루ԭ������Zepto,jquery ��silbling()��������
         * @param {Object} elem  ѡ�еĵ�ǰ�ڵ�
         * @param {Function} forCB  �����ص�ÿ���ֵܽڵ�
         * �÷����£�
         */
        sibling: function (elem, forCB) {
            var r = [];
            var n = elem.parentNode.firstChild;
            for(; n; n = n.nextSibling) {
                if(n.nodeType === 1 && n !== elem) {
                    if(forCB && typeof (forCB) == "function") {
                        forCB(n);
                    }
                }
            }
        },

    };

    window.Calendar = Calendar;
})();