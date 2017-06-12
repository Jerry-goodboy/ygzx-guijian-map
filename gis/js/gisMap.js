$(function () {
// 图层控制接口
var tucengAPI = "http://192.168.16.51:8888/gj-proj/rest/querydata/getSqlResult?json=";
var loadTuceng = {name:"map-layer",param:"",mode:"map"};

// 查询工程列表
var facilityGeoGroupAPI = "../app/system/facilityGeo/getFacilityGeoGroupForMap";
// 设施搜索接口
var sheshiSearchAPI = "http://10.128.141.191:6080/arcgis/rest/services/JSXM/JSXM/MapServer";
// 图层管理地图服务
var mapQueryBaseUrl = "http://10.128.141.191:6080/arcgis/rest/services/JSXM/JSXM/MapServer";

// 基础地图二维底图
var mapTileJCSJ = "http://10.128.101.221:6080/arcgis/rest/services/JCSJ/DX20170406/MapServer";
// 基础地图影像底图
var mapYX = "http://10.128.101.221:6080/arcgis/rest/services/JCSJ/YX20170406/MapServer";

// 每次换地图服务，必须修改下列参数，地图投影参考变换
/* create new Proj4Leaflet CRS: */
var crs = new L.Proj.CRS("EPSG:TJ90", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=82984.0462 +y_0=-4032478.47 +ellps=krass +units=m +no_defs", {
    origin: [-20015200, 30207300],
    resolutions: [
        66.1459656252646,
        26.458386250105836,
        13.229193125052918,
        5.291677250021167,
        2.6458386250105836,
        1.3229193125052918,
        0.5291677250021167,
        0.26458386250105836,
        0.13229193125052918
    ]
});

// 生成地图对象
var map = L.map('map', {
    crs: crs,
    zoomControl: true,
    attributionControl: false
});

map.zoomControl.setPosition("bottomright");

map.setView([38.99, 117.79], 2);

// 图层管理所显示的动态图层
var dynamicMapLayer;
// 图层管理高亮的点图层
var highlightMarker;
// 图层管理高亮的面图层
var highlightRect;

// 保存搜索结果项目编号的全局数组
var searchProjCodeArr = [];

// 加载底图
var layer = L.esri.tiledMapLayer({
    url: mapTileJCSJ,
    maxZoom: 7
}).addTo(map);

//全局方法
// 移除地图上所有底图之外的图层
 function clearMapLayers(){
   // 移除地图上所有底图之外的图层
    map.eachLayer(function(_layer){
        if(_layer != layer){
            map.removeLayer(_layer);
        }
    });
}

// 将所有的复选框取消选择
function unCheckBox() {
    // 将所有的复选框取消选择
    var tucengZTree = $.fn.zTree.getZTreeObj("id_ztree_tuceng");
    !!tucengZTree && tucengZTree.length != 0 ? tucengZTree.checkAllNodes(false):null;
}

// 绑定左侧侧边栏显示或者隐藏的按钮的点击事件
$(document).on("click", "#id_btn_menu_toggle", function (e) {
    var $this = $(this);
    if ($this.hasClass("fui-arrow-left")) {
        $this.removeClass("fui-arrow-left").addClass("fui-arrow-right");
        $("#id_content_menu").removeClass("menu-content-show");
    } else {
        $this.removeClass("fui-arrow-right").addClass("fui-arrow-left");
        $("#id_content_menu").addClass("menu-content-show");
    }
    return false;
});

// 绑定右侧侧边栏隐藏的按钮的点击事件
$(document).on("click", "#id_btn_attr_toggle", function (e) {
    $("#id_attr_popup").removeClass("attr-popup-show");
    return false;
});

// 绑定左侧侧边栏中按钮的点击事件，用来显示对应的面板和地图上的点位
$(document).on("click", ".menu-content-li", function (e) {

    var $this = $(this);

    if($this.hasClass("menu-content-li-clicked")){
        return false;
    }

    $this.addClass("menu-content-li-clicked")
        .siblings("li")
        .removeClass("menu-content-li-clicked");
    var dataContentId = $this.attr("data-content-id").trim();
    var $dataContentElement = $("#" + dataContentId);
    $dataContentElement
        .show()
        .siblings(".content-real-div")
        .hide();

    unCheckBox();
    // 移除地图上所有底图之外的图层
    clearMapLayers();

    $("#id_ul_search_list").empty();

    map.off("click");

    $("#id_attr_popup").removeClass("attr-popup-show");

    return false;
});

// 切换到二维底图
$(document).on("click", "#id_util_btn_2d", function (e) {
    if (layer) {
        map.removeLayer(layer);
    }
    layer = L.esri.tiledMapLayer({
        url: mapTileJCSJ,
        maxZoom: 7
    }).addTo(map);
    return false;
});

// 切换为影像底图
$(document).on("click", "#id_util_btn_yx", function (e) {
    if (layer) {
        map.removeLayer(layer);
    }
    layer = L.esri.tiledMapLayer({
        url: mapYX,
        maxZoom: 7
    }).addTo(map);
    return false;
});

// ztree 配置对象
var ztreeSetting = {
    view: {
        showIcon: false
    },
    check: {
        enable: true
    },
    data: {
        key: {
            name: "NAME"
            // children: "children",
            // name: "name",
            // title: "",
            // url: "url",
            // icon: "icon"
        },
        simpleData: {
            enable: true,
            idKey: "ID",
            pIdKey: "PID",
            rootPId: ""
        }
    },
    callback: {
        onCheck: zTreeOnCheck
    }
};

// 获取图层分组列表
$.ajax({
    url: "./test1.json",
    // url: tucengAPI + JSON.stringify(loadTuceng),
	type: 'Get',
    dataType: "json",
    success: function (data) {
        console.log(data);

        // 生成 图层控制 树形选择框
        $.fn.zTree.init($("#id_ztree_tuceng"), ztreeSetting, data);
    },
    error: function (error) {
        console.log(error);
    }
});

// 主要属性 需要显示的键名
var mainAttrsToShow = [
    "项目年度",
    "项目编号",
    "所在港区",
    "项目名称",
    "业主单位",
    "工作阶段",
    "建设内容",
    "建设起止年月",
    "项目总投资额",
    "投资来源",
    "去年已完成投资",
    "本年投资计划",
    "本年度项目形象进度",
    "新增生产力",
    "备注"
];
// 主要属性 需要显示的字段名
var mainTypesToShow = [
    "YEAR",
    "PROJ_CODE",
    "BELONG_TO",
    "PROJECT_NAME",
    "REPORT_ORG",
    "PLAN_STAGE",
    "BUILD_CONTENT",
    "START_END_DATE",
    "TOTAL_COST",
    "COST_FROM",
    "LASTYEAR_COST",
    "YEAR_COST",
    "PROGRESS_PLAN",
    "NEW_THROUGHPUT",
    "REMARK"
];
//部分值的转换方法
function formatterPartValue(name, value){
	if(name === 'BELONG_TO'){
		switch(value){
			case '1':
			  value = '东疆港区';
			  break;
			case '2':
			  value = '南疆港区';
			  break;
			case '3':
			  value = '北疆港区';
			  break;
			case '4':
			  value = '大港东部港区';
			  break;
			case '5':
			  value = '临港经济区';
			  break;
			case '6':
			  value = '散货物流中心区';
			  break;
			default:
			  value = '其他';
		}
	}
	if (name === 'COST_FROM'){
		switch(value){
			case '1':
			  value = '企业自有资金、银行贷款';
			  break;
			case '2':
			  value = '企业自有资金、银行贷款、政策返还';
			  break;
			case '3':
			  value = '银行贷款、自有资金';
			  break;
			case '4':
			  value = '自筹';
			  break;
			case '5':
			  value = '自有资金';
			  break;
			case '6':
			  value = '自有资金35%、银行贷款65%';
			  break;
			default:
			  value = '其他';
		}
	}
	if (name === 'PLAN_STAGE'){
		switch(value){
			case '1':
			  value = '新增新开工';
			  break;
			case '2':
			  value = '续建';
			  break;
			case '3':
			  value = '跨转新开工';
			  break;
			default:
			  value = '其他';
		}
	}//PLAN_STAGE
	return value;
}
//加载详细的工程信息并展示
function loadInfo(projectCode){
	var loadProject = {name:"map-project",param:projectCode,mode:"map"};

	// 获取图层分组列表
	$.ajax({
        url: "./test3.json",
		// url: tucengAPI + JSON.stringify(loadProject),
		type: 'Get',
		dataType: "json",
		success: function (data) {
            data = data[0];
			// 用于拼接HTML的临时数组
			var trtds = [];
			// 将属性值放入表格中
			for (var i = 0; i < mainAttrsToShow.length; i++) {
				trtds.push('<tr><td class="only-text-align" style="width: 50%;">');
				var mainAttrToShow = mainAttrsToShow[i];
				trtds.push(mainAttrToShow);
				trtds.push('</td><td>');
				var mainTypeToShow = formatterPartValue(mainAttrToShow, data[mainTypesToShow[i]]);
				trtds.push(mainTypeToShow);
				trtds.push('</td></tr>');
			}
			$("#id_table_attr_main").empty().append(trtds.join(""));
			$("#id_attr_popup").addClass("attr-popup-show");
		},
		error: function (error) {
			console.log(error);
		 }
	});
}

// ztree 插件 当选择框选中或者取消选择的时候回调该函数
function zTreeOnCheck(event, treeId, treeNode) {
    // 获取所有被选中的树形选择框节点
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    var nodes = treeObj.getCheckedNodes(true);

	// 需要显示的图层ID
    var layersIDs = [];
    // 需要显示的图层ID和过滤条件
    var layersDefs = {};

    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        // 当该节点不是父节点，并且有地图服务地址和过滤条件的时候执行
        if (!node.isParent && node.LAYER_ID && node.PROJECT_TYPE && node.FILTER) {
			 var layerIndex = $.inArray(node.LAYER_ID,layersIDs);
		     if(layerIndex == -1){
                layersIDs.push(node.LAYER_ID);
                layersDefs[node.LAYER_ID] = node.PROJECT_TYPE + "= '" + node.FILTER + "'";
            }else {
                var layerDef = layersDefs[node.LAYER_ID];
                // layerDef = layerDef.substring(0, layerDef.length - 1);
                layerDef += " OR " + node.PROJECT_TYPE + "= '" + node.FILTER + "'";
                layersDefs[node.LAYER_ID] = layerDef;
            }
        } else {
            if (!node.LAYER_ID) {
                console.log("LAYER_ID is null");
            }
            if (!node.PROJECT_TYPE) {
                console.log("PROJECT_TYPE is null");
            }
            if (!node.FILTER) {
                console.log("FILTER is null");
            }
		}
    }

    console.log(layersDefs);

    // 清除之前显示的动态图层
    if (dynamicMapLayer) {
        map.removeLayer(dynamicMapLayer);
    }

    // 清除之前高亮的点图层
    if (highlightMarker) {
        highlightMarker.disablePermanentHighlight();
        map.removeLayer(highlightMarker);
    }
    clearMapLayers();

    // 当所需要显示的图层ID数组长度不为0的时候执行
    if (layersIDs.length != 0) {
        // 加载动态图层，根据过滤条件显示动态图层
        dynamicMapLayer = L.esri.dynamicMapLayer({
            url: mapQueryBaseUrl,
            opacity: 1,
            layers: layersIDs,
            layerDefs: layersDefs
        }).addTo(map);

        // 临时解决方案，将地图定位在该中心点，并放大到该级别
        map.setView([38.99, 117.79], 2);

        // 为了保险起见，取消地图上所有的click事件
        map.off("click");
        // 监听地图上的click事件
        map.on("click", function (e) {
            mapClickCallback(e, layersIDs, "tuceng");
            return false;
        });
    }
}

// convert an LatLngBounds (Leaflet) to extent (ArcGIS)
function boundsToExtent(bounds) {
    bounds = L.latLngBounds(bounds);
    return {
        'xmin': bounds.getSouthWest().lng,
        'ymin': bounds.getSouthWest().lat,
        'xmax': bounds.getNorthEast().lng,
        'ymax': bounds.getNorthEast().lat,
        'spatialReference': {
            'wkid': 4326
        }
    };
}

function mapClickCallback(e, layersIDs, type) {

    // 将经纬度坐标点转换为T90坐标点
    var T90Point = crs.project(e.latlng);

    // 删除之前的高亮点图层
    if (highlightMarker) {
        highlightMarker.disablePermanentHighlight();
        map.removeLayer(highlightMarker);
    }

    if (highlightRect) {
        map.removeLayer(highlightRect);
    }

    // 获取当前的地图边界，并转换为arcgis所识别的extend范围
    var extent = boundsToExtent(map.getBounds());
    // 返回当前地图容器的大小，单位为像素
    var size = map.getSize();

    // 将经纬度坐标点转换为T90坐标点
    var maxArr = crs.project(L.latLng(extent.ymax, extent.xmax));
    var minArr = crs.project(L.latLng(extent.ymin, extent.xmin));

    // 构建请求arcgis rest API所需要的请求链接，该API用来识别鼠标选中的要素
    var visibleLayer = 1;
    if(layersIDs.length == 1){
        visibleLayer = layersIDs[0];
    }else if(layersIDs.length > 1){
        visibleLayer = layersIDs.join(",");
    }
    var queryStr = "/identify?sr=53004&layers=visible:";
    queryStr += visibleLayer;
    queryStr += "&tolerance=10&returnGeometry=true&imageDisplay=";
    queryStr += size.x;
    queryStr += ",";
    queryStr += size.y;
    queryStr += ",96&mapExtent=";
    queryStr += minArr.x;
    queryStr += ",";
    queryStr += minArr.y;
    queryStr += ",";
    queryStr += maxArr.x;
    queryStr += ",";
    queryStr += maxArr.y;
    queryStr += "&geometry=";
    queryStr += T90Point.x;
    queryStr += ",";
    queryStr += T90Point.y;
    queryStr += "&geometryType=esriGeometryPoint&f=json";

    // 构建完整的请求地址
    var queryStrUrl = mapQueryBaseUrl + queryStr;

    //发送请求
    $.ajax({
        url: queryStrUrl,
        dataType: "json",
        success: function (data) {

            // 如果当前数据结果的长度大于0执行
            if (data["results"].length > 0) {

                // 获取地图数据属性
                var attributes = data["results"][0]["attributes"];

                if (    ($.inArray(attributes["项目编号"], searchProjCodeArr) != -1
                        && type == "search")
                        || type == "tuceng") {
                    // 将arcgis 地图格式 转换为 geoJSON的格式
                    var geoJSON = L.esri.Util.arcgisToGeoJSON(data["results"][0]);

                    var geometryType = geoJSON["geometry"]["type"];
                    var rings = geoJSON["geometry"]["coordinates"];

                    // 根据点线面类型来进行判断执行坐标参考的转换
                    switch (geometryType) {
                        case "Point":
                            var arcgisPoint = L.point(rings[0], rings[1]);
                            var LatLngPoint = crs.unproject(arcgisPoint);
                            geoJSON["geometry"]["coordinates"][0] = LatLngPoint.lng;
                            geoJSON["geometry"]["coordinates"][1] = LatLngPoint.lat;
                            break;
                    }

                    // 根据点线面类型来生成对应的高亮图层
                    switch (geometryType) {
                        case "Point":
                            highlightMarker = L.marker([
                                geoJSON["geometry"]["coordinates"][1],
                                geoJSON["geometry"]["coordinates"][0]
                            ], {highlight: "permanent"}).setOpacity(0).addTo(map);

                            highlightRect = L.esri.dynamicMapLayer({
                                url: mapQueryBaseUrl,
                                opacity: 1,
                                layers: [7],
                                layerDefs: {7: "项目编号 in ('" + attributes["项目编号"] + "')"}
                            }).addTo(map);

                            var $currProjectEle = $('[data-project-code=' + attributes["项目编号"] + ']');

                            if($currProjectEle.length > 0){

                                $currProjectEle
                                .addClass("li-search-list-active")
                                .siblings('.li-search-list')
                                .removeClass("li-search-list-active");

                                var offsetObj = $currProjectEle.offset();
                                var scrollOffsetTop = offsetObj["top"] - 200;

                                $(".content-real-box").scrollTop(scrollOffsetTop);
                            }

                            break;
                    }

                    console.log(attributes);
                    //展示属性
                    loadInfo(attributes["项目编号"]);
                    map.setView(e.latlng);
                }
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}

// 获取查询字符串的参数
var query = location.search.substring(1);
var values = query.split("&");
var pos = values[0].indexOf('=');
var paramname = values[0].substring(0, pos);

var value = values[0].substring(pos+1);

function hideLeftAndRightPanel() {
    $("#id_attr_popup").removeClass("attr-popup-show");

    var $this = $("#id_btn_menu_toggle");
    if ($this.hasClass("fui-arrow-left")) {
        $this.removeClass("fui-arrow-left").addClass("fui-arrow-right");
        $("#id_content_menu").removeClass("menu-content-show");
    }
    $("#id_btn_guiji_ok").removeClass("disabled");
    $("#id_btn_guiji_cancel").addClass("disabled");
    $("#id_btn_guiji_play").addClass("disabled");
    $("#id_btn_guiji_pause").addClass("disabled");
}

var searchFacilityMapLayer;
var searchFacilityHighlightMarker;

function searchFacility(json) {

    unCheckBox();
    clearMapLayers();

    // 清除之前显示的动态图层
    if (searchFacilityMapLayer) {
        map.removeLayer(searchFacilityMapLayer);
    }

    // 清除之前高亮的点图层
    if (searchFacilityHighlightMarker) {
        searchFacilityHighlightMarker.disablePermanentHighlight();
        map.removeLayer(searchFacilityHighlightMarker);
    }

    var layersIDs = [];
    var layersDefs = {};

    layersIDs.push(1);
    layersDefs[1] = json;

    // 加载动态图层，根据过滤条件显示动态图层
    searchFacilityMapLayer = L.esri.dynamicMapLayer({
        url: mapQueryBaseUrl,
        opacity: 1,
        layers: layersIDs,
        layerDefs: layersDefs
    }).addTo(map);

    window.searchFacilityMapLayer = searchFacilityMapLayer;

    console.log(layersIDs);
    console.log(layersDefs);

    hideLeftAndRightPanel();

    // 临时解决方案，将地图定位在该中心点，并放大到该级别
    map.setView([38.99, 117.79], 1);

    // 为了保险起见，取消地图上所有的click事件
    map.off("click");

    // 监听地图上的click事件
    map.on("click", function (e) {
        mapClickCallback(e, layersIDs, "search");
        return false;
    });
}

    $(document).on("click", "#id_btn_search_sheshi", function (e) {
        searchFacilityWithEvent(e);
        return false;
    });

    $("#id_input_search_sheshi").keydown(function(e){
        if(e.which == 13){
            searchFacilityWithEvent(e);
        }
    });

    function searchFacilityWithEvent(e) {
        var facilityCode = $("#id_input_search_sheshi").val();
        if(facilityCode && facilityCode.length != 0){
            var loadProject = {"name":"map-project-name","param":facilityCode,"mode":"map"};

            // 获取图层分组列表
            $.ajax({
                url: "./test2.json",
                // url: tucengAPI + JSON.stringify(loadProject),
                type: 'Get',
                dataType: "json",
                success: function (data) {

                    var searchStrArr = [];

                    var projectNameArr = [];

                    if(data.length > 0){
                        for(var i =0; i < data.length; i++){
                            projectNameArr.push("'" + data[i]["PROJECT_NAME"] + "'");
                        }
                    }

                    var projectNameStr = projectNameArr.join(",");
                    projectNameStr = "项目名称 in (" + projectNameStr + ")";

                    var query = L.esri.query({
                        url:mapQueryBaseUrl + '/1'
                    });

                    query.where(projectNameStr).bounds(function(error, latLngBounds, response){
                        console.log(response["features"]);

                        var features = response["features"];
                        searchProjCodeArr = [];

                        for (var i = 0; i < features.length; i++) {

                            var attributes = features[i]["attributes"];
                            var geometry = features[i]["geometry"];

                            searchProjCodeArr.push(attributes["项目编号"]);

                            var arcgisPoint = L.point(geometry["x"], geometry["y"]);
                            var LatLngPoint = crs.unproject(arcgisPoint);

                            searchStrArr.push('<li class="li-search-list" data-lat="');
                            searchStrArr.push(LatLngPoint.lat);
                            searchStrArr.push('" data-lan="');
                            searchStrArr.push(LatLngPoint.lng);
                            searchStrArr.push('" data-project-code="');
                            searchStrArr.push(attributes["项目编号"]);
                            searchStrArr.push('">');
                            searchStrArr.push(attributes["项目名称"]);
                            searchStrArr.push('</li>');

                            $("#id_ul_search_list").empty().append(searchStrArr.join(""));

                            $(".li-search-list").off("click");
                            $(".li-search-list").on("click", function (e) {

                                // var projectName = $(this).text().trim();
                                var lat = $(this).attr("data-lat").trim();
                                var lan = $(this).attr("data-lan").trim();
                                var projectCode = $(this).attr("data-project-code").trim();

                                // 移除点要素高亮的效果图层
                                if (highlightMarker) {
                                    highlightMarker.disablePermanentHighlight();
                                    map.removeLayer(highlightMarker);
                                }

                                highlightMarker =   L.marker([lat,lan], {highlight: "permanent"})
                                                    .setOpacity(0).addTo(map);

                                if (highlightRect) {
                                    map.removeLayer(highlightRect);
                                }

                                highlightRect = L.esri.dynamicMapLayer({
                                    url: mapQueryBaseUrl,
                                    opacity: 1,
                                    layers: [7],
                                    layerDefs: {7: "项目编号 in ('" + projectCode + "')"}
                                }).addTo(map);

                                map.setView([lat, lan]);

                                $(this)
                                .addClass("li-search-list-active")
                                .siblings('.li-search-list')
                                .removeClass("li-search-list-active");

                                loadInfo(projectCode);

                                return false;
                            });

                        }

                    });

                    searchFacility(projectNameStr);

                    var $btnMenuToggle = $("#id_btn_menu_toggle");
                    if ($btnMenuToggle.hasClass("fui-arrow-right")) {
                        $btnMenuToggle.removeClass("fui-arrow-right").addClass("fui-arrow-left");
                        $("#id_content_menu").addClass("menu-content-show");
                        $(".menu-content-li").removeClass("menu-content-li-clicked");
                        $("[data-content-id='id_content_search_list']").addClass("menu-content-li-clicked");
                        $(".content-real-div").hide();
                        $("#id_content_search_list").show();
                    }

                },
                error: function (error) {
                    console.log(error);
                 }
            });

        }
    }

});