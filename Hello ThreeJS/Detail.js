var mtid;//机床id
var status = "POWEROFF";//机床状态
var run_rate_eff;//设备运行效率
var total_utilize_rate_eff;//设备利用效率
var fault_rate_eff;//设备故障效率
var tabledata = [];//全局变量,机床详细信息
var effdata = [];//全局变量,机床效率信息
var piedata_run;//全局变量，扇形图数据
var piedata_idle;
var piedata_alarm;
var initLoad = true;//是否是首次加载
tabledata = [{"name":"program","aliax":"程序名","value":"O0010"},
    {"name":"ABS","aliax":"绝对坐标","value":"Y:189.1745,X:0,C:0,B:0,Z:396.847,"},
    {"name":"ip","aliax":"IP","value":"172.19.123.98"},
    {"name":"toolno","aliax":"当前刀号","value":"13"},
    {"name":"s1speed","aliax":"实际转速","value":"0"},
    {"name":"longo_part_count","aliax":"longo_part_count","value":""},
    {"name":"feed_ovr","aliax":"F倍率","value":"175"},
    {"name":"s1load","aliax":"主轴负载","value":"83{ITEM}0"},
    {"name":"api_status","aliax":"连接状态","value":"1"},
    {"name":"block","aliax":"当前行内容","value":"0"},
    {"name":"online_status","aliax":"连接状态","value":"1"},
    {"name":"mato_code","aliax":"设备编码","value":"JGZX-0024"},
    {"name":"alarm","aliax":"报警","value":"UNAVAILABLE"},
    {"name":"feed_commanded","aliax":"设定F值","value":"0"},
    {"name":"onlinestatus","aliax":"开机状态","value":"ONLINE"},
    {"name":"mode","aliax":"操作模式","value":"MEMORY"},
    {"name":"longo_part_all_count","aliax":"longo_part_all_count","value":""},
    {"name":"REL","aliax":"相对坐标","value":"Y:190.5871,X:-0.9964,C:0,B:0,Z:393.1617,"},
    {"name":"status","aliax":"运行状态","value":"ALARMING"},
    {"name":"mato_name","aliax":"设备名称","value":"Vi40_JGZX-0024"},
    {"name":"programcommon","aliax":"程序注释","value":"()"},
    {"name":"mato_id","aliax":null,"value":"1516698120171019"},
    {"name":"DIST","aliax":"剩余偏移量","value":"Y:0,X:0,C:0,B:0,Z:0,"},
    {"name":"longo_run_times","aliax":"longo_run_times","value":""},
    {"name":"longo_cut_times","aliax":"切削时长","value":""},
    {"name":"alarmstatus","aliax":"报警状态","value":"ALARMING"},
    {"name":"sspeedovr","aliax":"主轴倍率","value":"100"},
    {"name":"estop","aliax":"急停","value":""},
    {"name":"MACH","aliax":"机械坐标","value":"Z:0,Y:250,X:13.2421,C:0,B:0,"},
    {"name":"longo_use_part_count","aliax":"longo_use_part_count","value":""},
    {"name":"line","aliax":"当前行号","value":"10"},
    {"name":"chanalarm","aliax":"通道报警","value":""},
    {"name":"program_header","aliax":"程序头","value":""},
    {"name":"tool_id","aliax":"刀具ID","value":"UNAVAILABLE"},
    {"name":"longo_mode","aliax":"操作模式","value":"MEMORY"},
    {"name":"path_feedrate","aliax":"实际进给","value":"0.56897"},
    {"name":"longo_online_times","aliax":"开机时长","value":""},
    {"name":"longo_only_run_times","aliax":"longo_only_run_times","value":""},
    {"name":"svalue_cmd","aliax":"S设定值","value":"0"},
    {"name":"execution","aliax":"程序状态","value":"RESET"},
    {"name":"pos1","aliax":"pos1","value":"X{ROW}MACH{ROW}0{ROW}MM"},
    {"name":"pos2","aliax":"pos2","value":"X{ROW}ABS{ROW}84.72{ROW}MM"},
    {"name":"pos3","aliax":"pos3","value":"U{ROW}REL{ROW}97.8262{ROW}MM"},
    {"name":"pos4","aliax":"pos4","value":"Z{ROW}MACH{ROW}105.2335{ROW}MM"},
    {"name":"pos5","aliax":"pos5","value":"X{ROW}DIST{ROW}0{ROW}MM"},
    {"name":"matotype","aliax":"设备类型","value":"FANUC 30I"}];
//    effdata = [{"RUN":200800,"IDLE":106400,"ALARM":0,"RUNEFF":64.94,"IDLEEFF":34.41,"ALARMEFF":0}];
//刷新事件

var timerOut = setInterval("datasFresh()", 5000);

$(function () {
    setAttribute_div_another_val();//设置空属性

    mtid = get_url_parameter('mtid');//获取url中的id参数
    setTreeTableThread();//设置三种状态的空白表格
    initGroupData();//获取效率和总时长
    loadMTData(mtid);
    runFunction();//各种效率

});

//数据刷新
function datasFresh() {
    // setTreeTableThread();//设置三种状态的空白表格
    initGroupData();//获取效率和总时长
    loadMTData(mtid);
    runFunction();//各种效率
}

//电子看板详细信息,获取tabledata
function loadMTData(id) {
    //没有采集服务器的话，不会往下进行
    $.ajax({
        type: "POST",
        url: "/getEBorderDataForEboardDetail.action",
        data: {
            "id": id,
        },
        async: false,
        cache: false,
        success: function (data) {
            if (!(data.length == 0 || data[0].name == undefined || data[0].name == null)) {
                tabledata = data;//存入数据
                setLeftVal(tabledata);
            } else {
                setLeftVal_null();//获取不到信息时，从url中获取数据
            }
            setAttribute_div_another_val(tabledata)//设置机床属性信息
            status = getValueByKey("status", tabledata);//设置机床状态，全局变量
            if (status == "" || status == null || status == 'undefined') {
                status = "POWEROFF";//设置机床状态，全局变量
            }
            // setLeftVal(tabledata);

            if (initLoad) {
                //绘制三种状态表格
                initTableDetail("RUNNING");//请求表格数据
                initTableDetail("IDLE");//请求表格数据
                initTableDetail("ALARM");//请求表格数据
            }
            // addTableAttributeData();//机床各种属性,数据使用全局变量tabledata;
            // status = getValueByKey("status", tabledata);

            initLoad = false;//加载之后置为false，表明已经加载过
        },
        error: function () {
            //出错的时候使用模拟数据
            setAttribute_div_another_val(tabledata)//设置机床属性信息
        }
    });
}

//    "status":status
//根据id和运行状态status获取数据,放在loadMTData()方法中，使得全部变量先被赋值，再被使用
function initTableDetail(table_status) {

    var tb_id = changeTypeId(table_status);

    $.ajax({
        type: "POST",
        url: "/getDetailLastHoursByTypeAndId.action",
        data: {
            "mtid": mtid,
            "status": table_status
        },

        success: function (data) {
            var double = [];
            for (var key in data) {
                double.push(data[key].efficiency);
            }
            addTableData(tb_id, double);//为三个状态表添加数据
        },
        error: function () {

            var doubleData = [];
            addTableData(tb_id, doubleData);//为三个状态表添加数据

        }
    });

}

//获取效率和总时长
function initGroupData() {
    $.ajax({
        type: "POST",
        url: "/getDetailLastHoursGroupStatus.action",
        data: {
            "mtid": mtid,
        },
        async: false,
        cache: false,
        success: function (data) {

            effdata = data;//给全局变量赋值
            progress_bar(effdata[0].RUNEFF, "#009900", "progress_run");//进度条
            progress_bar(effdata[0].IDLEEFF, "#f39c12", "progress_idle");//进度条
            progress_bar(effdata[0].ALARMEFF, "#ee1414", "progress_alarm");//进度条
            //判断扇形图数据是否发生了变化,发生变化再重新绘制
            if (piedata_run != effdata[0].RUNEFF && piedata_idle != effdata[0].IDLEEFF && piedata_alarm != effdata[0].ALARMEFF) {
                piedata_run = effdata[0].RUNEFF;
                piedata_idle = effdata[0].IDLEEFF;
                piedata_alarm = effdata[0].ALARMEFF;
                pieChart(effdata[0]);//绘制扇形图
            }
            // pieChart(effdata[0]);//绘制扇形图
            progress_text("run", effdata[0].RUNEFF, effdata[0].RUN);
            progress_text("idle", effdata[0].IDLEEFF, effdata[0].IDLE);
            progress_text("alarm", effdata[0].ALARMEFF, effdata[0].ALARM);
        },
        error: function () {

        }
    });

}

//采集服务器不存在的时候
function setLeftVal_null() {
    var mstatus = get_url_parameter('mtstatus');
    var mstatusName = '关机';//默认关机
    var bgcolor = "#d2d6de";//默认关机颜色
    var icon = "icon-off";//默认关机
    if (mstatus == 'RUNNING') {
        mstatusName = '运行';
        bgcolor = "#009900";
        icon = "icon-play";
    } else if (mstatus == 'ALARM') {
        mstatusName = '报警';
        bgcolor = "#ee1414";
        icon = "icon-warning-sign";
    } else if (mstatus == 'ALARMING') {
        mstatusName = '报警';
        bgcolor = "#ee1414";
        icon = "icon-warning-sign";
    } else if (mstatus == 'POWEROFF') {
        mstatusName = '关机';
        bgcolor = "#d2d6de";
        icon = "icon-off";
    } else if (mstatus == 'IDLE') {
        mstatusName = '空闲';
        bgcolor = "#f39c12";
        icon = "icon-pause";
    } else {
        mstatusName = mstatus;
    }
    $(".mttype").html(get_url_parameter('mttype'));//设置机床类型
    $(".mtip span").html(get_url_parameter('mtip'));//设置机床ip
    $(".mtcode span").html(get_url_parameter('mtcode'));//设置机床编码
    $(".mtstatus span").html(mstatusName);//设置机床状态
    $(".left").css({"background-color": bgcolor,});//修改背景颜色
    $(".left .mtstatus i").attr("class", icon);//修改图标
}

//设置左侧信息
function setLeftVal(data) {


    var status = getValueByKey("status", data);
    var alarmstatus = getValueByKey("alarmstatus", data);
    var mstatus = "";
    if (status == "IDLE" && alarmstatus != "UNAVAILABLE" && alarmstatus != "" && typeof (alarmstatus) != "undefined" && alarmstatus != null) {
        mstatus = "ALARM";
    } else {
        mstatus = status;
    }
    var mstatusName;
    var bgcolor = "#d2d6de";//默认关机颜色
    var icon = "icon-off";//默认关机
    if (mstatus == 'RUNNING') {
        mstatusName = '运行';
        bgcolor = "#009900";
        icon = "icon-play";
    } else if (mstatus == 'ALARM') {
        mstatusName = '报警';
        bgcolor = "#ee1414";
        icon = "icon-warning-sign";
    } else if (mstatus == 'ALARMING') {
        mstatusName = '报警';
        bgcolor = "#ee1414";
        icon = "icon-warning-sign";
    } else if (mstatus == 'POWEROFF') {
        mstatusName = '关机';
        bgcolor = "#d2d6de";
        icon = "icon-off";
    } else if (mstatus == 'IDLE') {
        mstatusName = '空闲';
        bgcolor = "#f39c12";
        icon = "icon-pause";
    } else {
        mstatusName = mstatus;
    }
    $(".mttype").html(getValueByKey("mtypename", data));//设置机床类型
    $(".mtip span").html(getValueByKey("ip", data));//设置机床ip
    $(".mtcode span").html(getValueByKey("mato_code", data));//设置机床编码
    $(".mtstatus span").html(mstatusName);//设置机床状态
    $(".left").css({"background-color": bgcolor,});//修改背景颜色
    $(".left .mtstatus i").attr("class", icon);//修改图标"status_duration"

    var tDuration = getValueByKey("status_duration", data);
    if (tDuration != "") {
        tDuration = getHour(tDuration);
    }

    $(".left .mtStatusDuration span").html(tDuration);//修改持续时间
}


function getHour(value) {
    var restNuber = (value / 3600).toString();
    //获取到小时
    var hour = Math.floor(restNuber);
    var min = 00;
    var ss = 00;
    if (restNuber.indexOf(".") > 0) {
        var hourMin = restNuber.replace(restNuber.substring(0, restNuber.indexOf(".")), '0');
        var restMin = (hourMin * 60).toString();
        min = Math.floor(hourMin * 60);
        if (restMin.indexOf(".") > 0) {
            var minSS = restMin.replace(restMin.substring(0, restMin.indexOf(".")), '0');
            ss = Math.round(minSS * 60);
        }
    }
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (min < 10) {
        min = "0" + min;
    }
    if (ss < 10) {
        ss = "0" + ss;
    }
    // console.log (hour+":"+min+":"+ss);
    return hour + ":" + min + ":" + ss;

}

//设置表头
function setTreeTableThread() {
    addTableThread(changeTypeId("RUNNING"));
    addTableThread(changeTypeId("IDLE"));
    addTableThread(changeTypeId("ALARMING"));
}

//根据状态返回对应id
function changeTypeId(table_status) {
    var tb_id = "";
    switch (table_status) {
        case "RUNNING":
            tb_id = "run";
            break;
        case "IDLE":
            tb_id = "idle";
            break;
        case "ALARMING":
            tb_id = "alarm";
            break;
        case "ALARM":
            tb_id = "alarm";
            break;
    }
    return tb_id;
}

//状态表格表头
function addTableThread(type) {
    //表头
    var myDate = new Date();//获取当前时间
    var now_hour = myDate.getHours() + 1;//获取小时数
    var th_array = new Array();
//        now_hour = 23;
    var i_hour;
    for (var i = now_hour; i < 24; i++) {
        if (i < 10) i_hour = "0" + i + ":00"
        else i_hour = i + ":00";
        // if(i==0) i_hour="24PM";
        th_array.push(i_hour)
    }
    for (var i = 0; i < now_hour; i++) {
        if (i < 10) i_hour = "0" + i + ":00"
        else i_hour = i + ":00";
        // if(i==0) i_hour="24PM";
        th_array.push(i_hour)
    }

    var thread = document.getElementById(type + "_thead_id");
    var th_content = "<TR>"
    for (var i = 0; i < th_array.length; i++) {
        var th_value = th_array[i];
        if (("N/A") == (th_value) || (undefined) == (th_value) || "UNAVAILABLE" == th_value) {
            th_content += "<TH class=\"thstyle\"> </TH>";
        } else {
            th_content += "<TH class=\"thstyle\">" + th_value + "</TH>";
        }
    }
    th_content += "</TR>";
    if (thread != null) {
        thread.innerHTML = th_content;
    }
    //建立空白表格
    addTableData(type, []);
}

//状态表格
function addTableData(type, doubleArrData) {

    var array = new Array();
    array = doubleArrData;


    var a_length = array.length;
    if (a_length < 24) {
        for (var i = 0; i < (24 - a_length); i++) {
            array.push("N/A")
        }
    }
    var tb = document.getElementById(type + "_tbody_id");
    var content = "<TR>"
    for (var i = 0; i < 24; i++) {
        if (array[i] == undefined || array[i] == null || array[i] == "N/A") {
            content += "<TD class=\"tdstyle\"> </TD>";
        } else {
            content += "<TD class=\"tdstyle_" + type + "_color\">" + array[i] + " </TD>";
        }
    }
    content += "</TR>";
    if (tb != null) {
        tb.innerHTML = content;
    }

}

//设置进度条前面显示的数值
function progress_text(id, text, time) {
    //数据为null置为0;
    ((text == undefined) || (text == null) || (text == "") || (text == "null")) ? text = 0 : text;
    ((time == undefined) || (time == null) || (time == "") || (time == "null")) ? time = 0 : time;
    $("#" + id + "_pro_text_id").html(text + " %");
    var time_value;
    if (time == 0) {
        time = 0;
        time_value = "00:00:00";
    } else {
        /*time_value = formatNum(time/3600)+":";
        time_value += formatNum((time-parseInt(time/3600)*3600)/60)+":";
        time_value += formatNum((time-parseInt(time/3600))*3600-)%1000);*/
        //转为毫秒
        var times = time * 1000;
        var hours = parseInt((times % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((times % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = (times % (1000 * 60)) / 1000;
        time_value = formatNum(hours) + ":";
        time_value += formatNum(minutes) + ":";
        time_value += formatNum(seconds);
    }
    $("#" + id + "_pro_time_id").html(time_value);
}

//小于十的数字在前面加0
function formatNum(num) {
    var result;
    if (num < 10) {
        result = "0" + parseInt(num);
    } else {
        result = parseInt(num);
    }
    return result;
}

//创建进度条
function progress_bar(value, color, id) {
    //数据为null置为0;
    if (value == undefined || value == null || value == "") value = 0;
    var res = value;
    var bg_color = color;
    var progress = "<div class='progress progress-striped'> "
        + "<div class='progress-bar progress-bar-success'" +
        "role='progressbar' aria-valuenow='50' " +
        "aria-valuemin='0' aria-valuemax='100' " +
        //            "style='color: #0e0e0e;background-color:"+bg_color+";text-align: left;width:" + res.toFixed(2) + "%'>" + res.toFixed(2) +
        "style='color: #0e0e0e;background-color:" + bg_color + ";text-align: left;width:" + res + "%'>" + res +
        "%</div> </div>";
    $("#" + id).html(progress);
}


//绘制扇形图
function pieChart(data2) {
    var trendchart1 = echarts.init(document.getElementById("pieChart"));
    var data = [{
        value: (data2.RUNEFF == undefined || data2.RUNEFF == null || data2.RUNEFF == "") ? 0.00 : data2.RUNEFF,
        name: '运行'
    }, {
        value: (data2.IDLEEFF == undefined || data2.IDLEEFF == null || data2.IDLEEFF == "") ? 0.00 : data2.IDLEEFF,
        name: '空闲'
    }, {
        value: (data2.ALARMEFF == undefined || data2.ALARMEFF == null || data2.ALARMEFF == "") ? 0.00 : data2.ALARMEFF,
        name: '报警'
    }
        /*, {
            value: data2.POWEROFF,
            name: '关机'
        }*/
    ];
    option = {
        backgroundColor: '#fff',
        title: {
//                text: '运行状态统计',
            text: '',
            x: 'center',
            y: 'center',
            textStyle: {
                fontWeight: 'normal',
                fontSize: 16
            }
        },
        tooltip: {
            show: false,
            trigger: 'item',
            // formatter: "{b}: {c} ({d}%)",
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        series: [{
            type: 'pie',
            selectedMode: 'single',
            radius: ['20%', '75%'],
//                color: color,//颜色设置
            color: ['#009900', '#f39c12', '#ee1414', '#d2d6de'],//运行，空闲，报警，关机
            itemStyle: {
                normal: {
                    label: {
                        show: true,
                        // formatter: '{b} : \n{c} ({d}%)'
                        formatter: '{b} : {c} ({d}%)'
                    },
                    labelLine: {show: true}
                }
            },
            data: data
        }]
    };
    trendchart1.setOption(option);
}

//根据key在集合数组中查找value
function getValueByKey(key, data) {
    try {
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                if (key == data[i].name) {
                    if (data[i].value == null) {
                        return "";
                    }
                    return data[i].value;
                }
            }
        }
    } catch (e) {
        return "";
    }
}

//根据key在集合数组中删除value
function deleteValueByKey(key, data) {
    try {
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                if (key == data[i].name) {
                    data.splice(i, 1);
                }
            }
        }
    } catch (e) {
    }
}

//根据key在集合数组中查找aliax
function getAliaxByKey(key, data) {
    try {
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                if (key == data[i].name) {
                    return data[i].aliax;
                }
            }
        }
    } catch (e) {
        return "";
    }
}

//计算各种效率
function runFunction() {
    var end_date = new Date();//取前一天的时间
    var start_date = new Date(new Date() - 24 * 60 * 60 * 1000);//取前一天的时间
    init_run_rate_ajax(formatDate(start_date), formatDate(end_date));
    init_total_utilize_rate_ajax(formatDate(start_date), formatDate(end_date));
    init_fault_rate_ajax(formatDate(start_date), formatDate(end_date));
}

//需要初始化执行的请求,设备运行效率
function init_run_rate_ajax(start_date, end_date) {
    $.ajax({
        url: "/selectMachineRunData",
        type: 'get',
        data: {"resourceId": mtid, "startDate": start_date, "endDate": end_date, "effiType": "运行效率"},
        dataType: 'json',
        success: function (data) {
            //设备运行效率
            if (data.barResult.length > 0) {
                run_rate_eff = data.barResult[0]["total"];
            } else {
                run_rate_eff = 0;
            }
            $("#run_rate_eff").html(run_rate_eff + "%");
            controlSignal(run_rate_eff, '.run_rate_eff_ul');//实现信号
        },
        error: function () {
        }
    });
}

//需要初始化执行的请求,设备利用率
function init_total_utilize_rate_ajax(start_date, end_date) {
    $.ajax({
        url: "/selectTotalUtilization",
        type: 'get',
        data: {"resourceId": mtid, "startDate": start_date, "endDate": end_date, "effiType": "总利用率"},
        dataType: 'json',
        success: function (data) {
            //设备利用率
            if (data.barResult.length > 0) {
                total_utilize_rate_eff = data.barResult[0]["total"];
            } else {
                total_utilize_rate_eff = 0;
            }
            $("#total_utilize_rate_eff").html(total_utilize_rate_eff + "%");
            controlSignal(total_utilize_rate_eff, '.total_utilize_rate_eff_ul');//实现信号
        },
        error: function () {
        }
    });
}

//需要初始化执行的请求,设备故障效率
function init_fault_rate_ajax(start_date, end_date) {
    $.ajax({
        url: "/selectFaultRate",
        type: 'get',
        data: {"resourceId": mtid, "startDate": start_date, "endDate": end_date, "effiType": "故障率"},
        dataType: 'json',
        success: function (data) {
//                var fault_rate_eff;//设备故障效率
            if (data.barResult.length > 0) {
                fault_rate_eff = data.barResult[0]["total"];
            } else {
                fault_rate_eff = 0;
            }
            $("#fault_rate_eff").html(fault_rate_eff + "%");
            controlSignal(fault_rate_eff, '.fault_rate_eff_ul');//实现信号
        },
        error: function () {
        }
    });
}

//控制信号强度
function controlSignal(value, selfId) {
    // var value = Number(values);
    $(selfId + '.self.box li').css('background-color', 'rgba(0,0,0,0.5)');
    // var value = 55
    if (0 < value && value <= 20) {
        $(selfId + '.self.box ul li:lt(1)').css('background', 'limegreen');
    } else if (20 < value && value <= 40) {
        $(selfId + '.self.box ul li:lt(1)').css('background', 'limegreen');
        $(selfId + '.self.box ul li:lt(2)').css('background', 'limegreen');
    }
    else if (40 < value && value <= 60) {
        $(selfId + '.self.box ul li:lt(1)').css('background', 'limegreen');
        $(selfId + '.self.box ul li:lt(2)').css('background', 'limegreen');
        $(selfId + '.self.box ul li:lt(3)').css('background', 'limegreen');
    }
    else if (60 < value && value <= 80) {
        $(selfId + '.self.box ul li:lt(1)').css('background', 'limegreen');
        $(selfId + '.self.box ul li:lt(2)').css('background', 'limegreen');
        $(selfId + '.self.box ul li:lt(3)').css('background', 'limegreen');
        $(selfId + '.self.box ul li:lt(4)').css('background', 'limegreen');
    }
    else if (80 < value && value <= 100) {
        $(selfId + '.self.box ul li:lt(1)').css('background', 'limegreen');
        $(selfId + '.self.box ul li:lt(2)').css('background', 'limegreen');
        $(selfId + '.self.box ul li:lt(3)').css('background', 'limegreen');
        $(selfId + '.self.box ul li:lt(4)').css('background', 'limegreen');
        $(selfId + '.self.box ul li:lt(5)').css('background', 'limegreen');
    }
    else {

    }

}


//格式化时间
function formatDurationTime(value) {
    var restNuber = (value / 3600).toString();
    //获取到小时
    var hour = Math.floor(restNuber);
    var min = 00;
    var ss = 00;
    if (restNuber.indexOf(".") > 0) {
        var hourMin = restNuber.replace(restNuber.substring(0, restNuber.indexOf(".")), '0');
        var restMin = (hourMin * 60).toString();
        min = Math.floor(hourMin * 60);
        if (restMin.indexOf(".") > 0) {
            var minSS = restMin.replace(restMin.substring(0, restMin.indexOf(".")), '0');
            ss = Math.round(minSS * 60);
        }
    }
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (min < 10) {
        min = "0" + min;
    }
    if (ss < 10) {
        ss = "0" + ss;
    }
    // console.log (hour+":"+min+":"+ss);
    return hour + ":" + min + ":" + ss;
}

//设置机床属性值
function setAttribute_div_another_val(tabledata) {

    set_grid_b("ABS");
    set_grid_b("REL");
    set_grid_b("MACH");
    set_grid_b("DIST");

    var data = tabledata;
    var data_length = 0;
    try {
        data_length = data.length;
    } catch (e) {

    }
    if (data_length > 0) {
        for (var i = 0; i < data.length; i++) {
            var data_name = data[i].name;
            if (data_name == "") {
                continue;
            }
            var class_attr = $("." + data_name);
            if (data_name == "ABS" || data_name == "REL" || data_name == "MACH" || data_name == "DIST") {
                var grid_val = data[i].value;
                var g_arr = grid_val.split(",");
                if (g_arr.length > 0) {
                    for (var j = 0; j < g_arr.length; j++) {
                        //空值不再进行判断
                        if (g_arr[j] == null || g_arr[j] == "") {
                            continue;
                        }
                        var j_g_arr = g_arr[j].split(":");
                        try {
                            $("." + data_name + "_" + j_g_arr[0]).html(j_g_arr[1]);
                        } catch (e) {
                        }
                    }
                }
            } else if (data_name == "feed_ovr" || data_name == "sspeedovr" || data_name == "s1load") {
                var class_val = $("." + data[i].name + "_val");
                //aliax为空不做处理
                if (!(data[i].aliax == null)) {
                    class_attr.html(data[i].aliax + ":");
                }
                if (data[i].value == null || data[i].value == "undefined" || data[i].value == "" || data[i].value == "UNAVAILABLE") {
                    class_val.html("");
                } else {
                    var val_tofixed = data[i].value;
                    if(val_tofixed.toString().indexOf('.') != -1){
                        val_tofixed = Number(val_tofixed).toFixed(2);
                    }
                    class_val.html(val_tofixed + "%");
                }
                class_val.css({
                    "border": "solid thin green !important",
                });
            }
            else if (data_name == "feed_commanded"|| data_name == "path_feedrate"|| data_name == "svalue_cmd") {
                var class_val = $("." + data[i].name + "_val");
                //aliax为空不做处理
                if (!(data[i].aliax == null)) {
                    class_attr.html(data[i].aliax + ":");
                }
                if (data[i].value == null || data[i].value == "undefined" || data[i].value == "" || data[i].value == "UNAVAILABLE") {
                    class_val.html("");
                } else {
                    var val_tofixed = data[i].value;
                    if(val_tofixed.toString().indexOf('.') != -1){
                        val_tofixed = Number(val_tofixed).toFixed(2);
                    }
                    class_val.html(val_tofixed);
                }
                class_val.css({
                    "border": "solid thin green !important",
                });
            }
            /**
             * Description：
             * 判断是否存在 pos
             * 如果存在，根据pos的值，写入坐标值
             * pos值示例
             * X{ROW}MACH{ROW}0{ROW}MM
             * 暂时屏蔽，目前java采集只采到了第一个字符X
             * Created by IDEA
             * @author wbc
             * @date 2018-11-1 0001
             * @time 下午 3:22
             */
            /*else if(data_name.toString().indexOf("pos") != -1){
                //根据{ROW}拆分字符串
                var pos_val = data[i].value;
                //空值和UNAVAILABLE不再处理
                if(pos_val == null || typeof pos_val == "undefined" || pos_val == "" || pos_val == "UNAVAILABLE" ){
                    continue;
                }
                var pos_arr = pos_val.split("{ROW}");
                var class_val = "";
                //pos的值:  X{ROW}MACH{ROW}0{ROW}MM
                if (pos_arr.length > 2) {
                    for (var j = 0; j < 1; j++) {
                        class_val += pos_arr[j];
                    }
                    $("." + class_val + "_val").html(pos_arr[2]);
                    if (pos_arr.length > 4){
                        $("." + class_val + "_val").html(pos_arr[2]+pos_arr[3]);
                    }
                }

            }*/
            /**
             * FANUC刀具寿命
             */
            else if (data_name == "toollife") {
                var class_val = $("." + data[i].name + "_val");

                try {
                    var data_val = data[i].value;
                    class_val.html(null_return (data_val));
                    $(".col-md-12.fanuc").css({"display":"block"});
                } catch (e) {
                }
                /*var data_arr = data_val.split(",");
                var result = "";
                for(var j=0;j<data_arr.length;j++){
                    var eval_arr = data_arr[j].split(":");
                    if(eval_arr.length >= 3){
                        result += (eval_arr[0]+":");
                        if(eval_arr[1] > eval_arr[2]){
                            result += "使用正常,";
                        }else{
                            result += "寿命到期,";
                        }
                    }
                }*/
            }
            /***
             * 刀补信息
             * marco_h601 marco_h605 marco_h682 marco_h623 marco_h625
             */
            else if (data_name.toString().indexOf("marco_h") != -1) {
                var class_val = $("." + data[i].name + "_val");
                //aliax为空不做处理
                if (!(data[i].aliax == null)) {
                    class_attr.html(data[i].aliax + ":");
                }
                try {
                    class_val.html(null_return (data[i].value));
                    $(".col-md-12.fanuc").css({"display":"block"});
                } catch (e) {
                }
            }
            else {
                var class_val = $("." + data[i].name + "_val");
                //aliax为空不做处理
                if (!(data[i].aliax == null)) {
                    class_attr.html(data[i].aliax + ":");
                }
                // class_val.html(data[i].value);

                if (data[i].value == null || data[i].value == "undefined" || data[i].value == "" || data[i].value == "UNAVAILABLE") {
                    //不显示报警，则显示 无报警
                    if (data_name == "alarm") {
                        class_val.html("无报警");
                    } else {
                        class_val.html("");
                    }
                } else {
                    class_val.html(data[i].value);
                }
                class_val.css({
                    "border": "solid thin green !important",
                });
            }
            /*//重庆齿轮
            //绝对坐标 pos1:Y pos2:X pos3:Z
            var cc_value = data[i].value;
            if (cc_value == null || cc_value == "undefined" || cc_value == "" || cc_value == "UNAVAILABLE"){
                cc_value = "";
            }
            var cc_class_val = "";
            if(data_name == "pos1"){
                cc_class_val = $(".ABS_Y");
            }
            else if(data_name == "pos2"){
                cc_class_val = $(".ABS_X");
            }
            else if(data_name == "pos3"){
                cc_class_val = $(".ABS_Z");
            }
            //相对坐标： pos4:X pos5:Z pos6 待定
            else if(data_name == "pos4"){
                cc_class_val = $(".REL_X");
            }
            else if(data_name == "pos5"){
                cc_class_val = $(".REL_Z");
            }
            else if(data_name == "pos6"){
                cc_class_val = $(".REL_Y");
            }
            try {
                cc_class_val.html(cc_value);
            } catch (e) {
            }
            //重庆齿轮  end*/
        }
    }

    //设置坐标和SF相关属性
    var grid_name = $(".grid_names").outerHeight();
    var f_h = $(".F_head");
    var f_c_t = $(".text_align.feed_commanded_total");
    var f_c = $(".feed_commanded");
    var f_c_v = $(".feed_commanded_val");

    var f_o_t = $(".text_align.feed_ovr_total");
    var f_o = $(".feed_ovr");
    var f_o_v = $(".feed_ovr_val");

    var p_f_t = $(".text_align.path_feedrate_total");
    var p_f = $(".path_feedrate");
    var p_f_v = $(".path_feedrate_val");

    var s_h = $(".S_head");
    var s_c_t = $(".text_align.svalue_cmd_total");
    var s_c = $(".svalue_cmd");
    var s_c_v = $(".svalue_cmd_val");

    var s_o_t = $(".text_align.sspeedovr_total");
    var s_o = $(".sspeedovr");
    var s_o_v = $(".sspeedovr_val");

    var s_l_t = $(".text_align.s1load_total");
    var s_l = $(".s1load");
    var s_l_v = $(".s1load_val");
    var css_lh = {
        "height": grid_name + "px",
        "line-height": grid_name + "px",
        "padding": "0px",
        "background-color": "#096BC3",
        "border": "solid thin rgb(210, 214, 222)",
        "border-radius": "3px",
        "font-size": "18px",
        "color": "white",
    };
    var css_lh_t = {
        "padding": "0px",
        // "background-color":"blue",
    };
    var css_lh_val = {
        "height": grid_name / 3 + "px",
        "line-height": grid_name / 3 + "px",
        "padding": "0px",
        "border": "solid thin rgb(210, 214, 222)",
        "border-radius": "3px",
    };
    f_h.css(css_lh);
    s_h.css(css_lh);

    f_c_t.css(css_lh_t);
    f_o_t.css(css_lh_t);
    s_c_t.css(css_lh_t);

    p_f_t.css(css_lh_t);
    s_o_t.css(css_lh_t);
    s_l_t.css(css_lh_t);

    f_c.css(css_lh_val);
    f_c_v.css(css_lh_val);

    s_c.css(css_lh_val);
    s_c_v.css(css_lh_val);

    f_o.css(css_lh_val);
    f_o_v.css(css_lh_val);

    s_o.css(css_lh_val);
    s_o_v.css(css_lh_val);

    p_f.css(css_lh_val);
    p_f_v.css(css_lh_val);

    s_l.css(css_lh_val);
    s_l_v.css(css_lh_val);
    //济南桥箱mazak添加刀具寿命展示
    jnqx_mazakCut();
    //只对立车1和立车2显示刀具和刀补信息
    try {
        var mato_code = getValueByKey("mato_code", data);
        if(!(mato_code == 3 || mato_code == 2)){
            $(".col-md-12.fanuc").css({"display":"none"});
        }
    } catch (e) {
    }
}

function set_grid_b(cs) {
    var l = $(".col-md-2.ABS.grid_abs").outerHeight();
    var x = $("." + cs + "_X");
    var y = $("." + cs + "_Y");
    var z = $("." + cs + "_Z");
    var c = $("." + cs + "_C");
    var b = $("." + cs + "_B");
    var css_b = {
        "height": l + "px",
        "border": "solid 1px rgb(210, 214, 222)",
        "padding": "0px",
    }
    x.css(css_b);
    y.css(css_b);
    z.css(css_b);
    c.css(css_b);
    b.css(css_b);

    var css_b_l = {
        "height": l + "px",
        "border": "solid 1px rgb(210, 214, 222)",
        "padding": "0px",
        "background": " #096BC3",
        "color": "white",
    }
    $(".H_H").css(css_b_l);
    $(".H_X").css(css_b_l);
    $(".H_Y").css(css_b_l);
    $(".H_Z").css(css_b_l);
    $(".H_C").css(css_b_l);
    $(".H_B").css(css_b_l);

    $("." + cs).css(css_b_l);

}
/**
 * Description：
 * 济南桥箱定制显示MAZAK刀具寿命
 * 只有MAZAK才显示别的不显示
 * Created by IDEA
 * @author wbc
 * @date 2018-11-1 0001
 * @time 下午 8:05
 */
function jnqx_mazakCut(){
    $.ajax({
        url: "/jnqx_getMazakCut",
        type: 'get',
        async: false,
        timeout : 2000, //超时时间设置，单位毫秒
        // data: {"username": username, "password": password},
        success: function (data) {
            //MAZAK设备ID
            // var MazakId = "1522201598954001";
            var MazakId = "1516698120171019";
            if(MazakId == get_url_parameter('mtid')){
                //如果该页没有MAZAK机床，就不再写入
                try {
                    $(".mazak_cut_val").html(data[0].PV);
                } catch (e) {

                }
            }else{
                //如果不是mazak，屏蔽显示
                $(".col-md-12.mazak").css({"display":"none"});
            }
        },
        error: function () {
            // alert("网络异常请联系管理员!")
            $(".col-md-12.mazak").css({"display":"none"});
        }
    });
}

/**
 * 不符合的值返回""
 * @param value
 */
function null_return (value){
    if(value == null || typeof value == "undefined" || value == "" || value == "UNAVAILABLE"){
        return "";
    }else{
        return value;
    }
}