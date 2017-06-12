 var gisNgModule = angular.module('gisNgModule',['ngResource', 'toaster','ngCookies']);
 
var gisNgCtrl = gisNgModule.controller('GisNgController', function($rootScope, $scope) {
	
	/* create new Proj4Leaflet CRS:
	  1. Proj4 and WKT definitions can be found at sites like http://epsg.io, http://spatialreference.org/ or by using gdalsrsinfo http://www.gdal.org/gdalsrsinfo.html
	  2. Appropriate values to supply to the resolution and origin constructor options can be found in the ArcGIS Server tile server REST endpoint (ex: https://tiles.arcgis.com/tiles/qHLhLQrcvEnxjtPr/arcgis/rest/services/OS_Open_Background_2/MapServer).
	  3. The numeric code within the first parameter (ex: `27700`) will be used to project the dynamic map layer on the fly
	  */
	  crs = new L.Proj.CRS("EPSG:TJ90", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=82984.0462 +y_0=-4032478.47 +ellps=krass +units=m +no_defs", {
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

	  var map = L.map('map', {
	    crs: crs
	  }).setView([39.00, 117.79],4);

	  // 基础地图二维底图
	  var mapTileJCSJ = "http://10.128.101.221:6080/arcgis/rest/services/JCSJ/DX20170406/MapServer";
	  // 基础地图影像底图
	  var mapYX = "http://10.128.101.221:6080/arcgis/rest/services/JCSJ/YX20170406/MapServer";

	  var layer = L.esri.tiledMapLayer({
	    url: mapTileJCSJ,
	    maxZoom: 10,
	    minZoom: 1
	  }).addTo(map);
	  
	  
	  window.setTimeout(function(){
		  map.invalidateSize();
	  },1000);

	  $(document).on("click", "#id_btn_erwei", function (e) {
	      if (layer) {
	          map.removeLayer(layer);
	      }
	      layer = L.esri.tiledMapLayer({
	          url: mapTileJCSJ,
	          maxZoom: 10,
	          minZoom: 1
	      }).addTo(map);

	      return false;
	  });

	  $(document).on("click", "#id_btn_yingxiang", function (e) {
	      if (layer) {
	          map.removeLayer(layer);
	      }
	      layer = L.esri.tiledMapLayer({
	          url: mapYX,
	          maxZoom: 10,
	          minZoom: 1
	      }).addTo(map);

	      return false;
	  });
	

}); 
