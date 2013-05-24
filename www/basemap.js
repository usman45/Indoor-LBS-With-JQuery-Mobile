// API key for http://openlayers.org. Please get your own at
// http://bingmapsportal.com/ and use that instead.
var apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";

// initialize map when page ready
var map;

// set up projections
// World Geodetic System 1984 projection (lon/lat)
var WGS84 = new OpenLayers.Projection("EPSG:4326");

// WGS84 Google Mercator projection (meters)
var WGS84_google_mercator = new OpenLayers.Projection("EPSG:900913");

var init = function (onSelectFeatureFunction) {

    var vector = new OpenLayers.Layer.Vector("Vector Layer", {});

    var sprintersLayer = new OpenLayers.Layer.Vector("Sprinters", {
        styleMap: new OpenLayers.StyleMap({
            externalGraphic: "resources/img/empty_trash.png",
            graphicOpacity: 1.0,
            graphicWidth: 16,
            graphicHeight: 26,
            graphicYOffset: -26
        })
    });

    var sprinters = getFeatures();
    sprintersLayer.addFeatures(sprinters, geojson_layer);

    var selectControl = new OpenLayers.Control.SelectFeature(sprintersLayer, {
        autoActivate:true,
        onSelect: onSelectFeatureFunction});

    var geolocate = new OpenLayers.Control.Geolocate({
        id: 'locate-control',
        geolocationOptions: {
            enableHighAccuracy: false,
            maximumAge: 0,
            timeout: 7000
        }
    });

    // geoJSON Layer
     var geojson_layer = new OpenLayers.Layer.Vector("GeoJSON", {
        projection: WGS84,
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.HTTP({
            url: "geoJSON.js",
            format: new OpenLayers.Format.GeoJSON()
        })
    });

    // create map
    map = new OpenLayers.Map({
        div: "map",
        theme: null,
        projection: WGS84_google_mercator,
        displayProjection: WGS84,
        numZoomLevels: 18,
        controls: [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            }),
            geolocate,
            selectControl
        ],
        layers: [
            new OpenLayers.Layer.OSM("OpenStreetMap", null, {
                transitionEffect: 'resize'
            }),
            new OpenLayers.Layer.Bing({
                key: apiKey,
                type: "Road",
                // custom metadata parameter to request the new map style - only useful
                // before May 1st, 2011
                metadataParams: {
                    mapVersion: "v1"
                },
                name: "Bing Road",
                transitionEffect: 'resize'
            }),
            new OpenLayers.Layer.Bing({
                key: apiKey,
                type: "Aerial",
                name: "Bing Aerial",
                transitionEffect: 'resize'
            }),
            new OpenLayers.Layer.Bing({
                key: apiKey,
                type: "AerialWithLabels",
                name: "Bing Aerial + Labels",
                transitionEffect: 'resize'
            }),
            vector,
            geojson_layer,
            sprintersLayer
        ],
        zoom: 16
    });
    //Set center on Otaniemi
    map.setCenter(new OpenLayers.LonLat(24.827, 60.186).transform(
                                                                    new OpenLayers.Projection(WGS84),
                                                                    map.getProjectionObject()
                                                                    ));
    var style = {
        fillOpacity: 0.1,
        fillColor: '#000',
        strokeColor: '#f00',
        strokeOpacity: 0.6
    };
    geolocate.events.register("locationupdated", this, function(e) {
        vector.removeAllFeatures();
        vector.addFeatures([
            new OpenLayers.Feature.Vector(
                e.point,
                {},
                {
                    graphicName: 'cross',
                    strokeColor: '#f00',
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pointRadius: 10
                }
            ),
            new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                    e.position.coords.accuracy / 2,
                    50,
                    0
                ),
                {},
                style
            )
        ]);
        map.zoomToExtent(vector.getDataExtent());
    });

    function getFeatures() {
        var features = {
            "type": "FeatureCollection",
            "features": 
                [
                    {"geometry": {"type": "Point", "coordinates": [2761700, 8441900]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB120140355", "unknown_4": "0", "housing_type": "039", "unknown_2": "1", "unknown_3": "90", "waste_point": "1", "unknown_1": "paino", "timestamp": "2013-02-20 04:35:09", "realized_volume": "4", "realized_amount": "1", "container_type": "syväsäiliö", "volume": "4 m3", "no_of_bin": "1", "address": "JÄMERÄNTAIVAL 3 A - C", "y": "6674975.45676261", "x": "25490920.2266159", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.838496312082057, 60.189041842697094]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB120134329", "unknown_4": "0", "housing_type": "039", "unknown_2": "1", "unknown_3": "160", "waste_point": "1", "unknown_1": "paino", "timestamp": "2013-02-20 04:41:01", "realized_volume": "8", "realized_amount": "2", "container_type": "syväsäiliö", "volume": "4 m3", "no_of_bin": "1", "address": "JÄMERÄNTAIVAL 11", "y": "6675145.66435623", "x": "25491039.5635832", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.839400768435855, 60.19005039319976]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB120134329", "unknown_4": "0", "housing_type": "039", "unknown_2": "1", "unknown_3": "200", "waste_point": "2", "unknown_1": "paino", "timestamp": "2013-02-20 04:38:33", "realized_volume": "6", "realized_amount": "1", "container_type": "syväsäiliö", "volume": "6 m3", "no_of_bin": "1", "address": "JÄMERÄNTAIVAL 11", "y": "6675257.90990849", "x": "25491090.0172298", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.6764096374036, 60.22306061090451]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB120353362", "unknown_4": "0", "housing_type": "119", "unknown_2": "1", "unknown_3": "470", "waste_point": "1", "unknown_1": "paino", "timestamp": "2013-02-20 05:06:21", "realized_volume": "4", "realized_amount": "1", "container_type": "etukontti", "volume": "4 m3", "no_of_bin": "1", "address": "KUNINKAANTIE 2 A", "y": "6678968.89255432", "x": "25482065.3951843", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.719324459966533, 60.22217978283005]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB140559182", "unknown_4": "0", "housing_type": "511", "unknown_2": "1", "unknown_3": "210", "waste_point": "1", "unknown_1": "paino", "timestamp": "2013-02-20 05:00:20", "realized_volume": "8", "realized_amount": "1", "container_type": "etukontti", "volume": "8 m3", "no_of_bin": "1", "address": "VANHA TURUNTIE 14", "y": "6678859.86837247", "x": "25484443.4697213", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.67440601541675, 60.22214182581639]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB120995814", "unknown_4": "0", "housing_type": "119", "unknown_2": "1", "unknown_3": "240", "waste_point": "1", "unknown_1": "paino", "timestamp": "2013-02-20 05:13:30", "realized_volume": "4", "realized_amount": "1", "container_type": "etukontti", "volume": "4 m3", "no_of_bin": "1", "address": "FALLÅKER 2", "y": "6678867.07202431", "x": "25481953.8425467", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.70521719328952, 60.24672803245561]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB120611389", "unknown_4": "0", "housing_type": "521", "unknown_2": "1", "unknown_3": "150", "waste_point": "3", "unknown_1": "paino", "timestamp": "2013-02-20 05:18:42", "realized_volume": "8", "realized_amount": "1", "container_type": "etukontti", "volume": "8 m3", "no_of_bin": "1", "address": "PEHTORINKUJA 3", "y": "6681598.33236394", "x": "25483673.7886506", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.396955859136536, 60.17166132313089]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB160013424", "unknown_4": "0", "housing_type": "011", "unknown_2": "1", "unknown_3": "480", "waste_point": "1", "unknown_1": "paino", "timestamp": "2013-02-20 05:45:47", "realized_volume": "8", "realized_amount": "1", "container_type": "etukontti", "volume": "8 m3", "no_of_bin": "1", "address": "VOLSINTIE 596", "y": "6673351.07829124", "x": "25466524.9269619", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.490366568186417, 60.22827613861524]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB160040109", "unknown_4": "0", "housing_type": "719", "unknown_2": "1", "unknown_3": "170", "waste_point": "1", "unknown_1": "paino", "timestamp": "2013-02-20 05:29:46", "realized_volume": "8", "realized_amount": "1", "container_type": "etukontti", "volume": "8 m3", "no_of_bin": "1", "address": "WESTERKULLANTIE 60", "y": "6679615.05125954", "x": "25471758.7818466", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.441651942141633, 60.13081143034905]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB160011015", "unknown_4": "0", "housing_type": "511", "unknown_2": "1", "unknown_3": "260", "waste_point": "1", "unknown_1": "paino", "timestamp": "2013-02-20 05:55:09", "realized_volume": "8", "realized_amount": "1", "container_type": "etukontti", "volume": "8 m3", "no_of_bin": "1", "address": "GESTERBYNKAARI 3", "y": "6668778.08741638", "x": "25468967.5032332", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.442958706458246, 60.13204980084851]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB160011015", "unknown_4": "0", "housing_type": "511", "unknown_2": "1", "unknown_3": "70", "waste_point": "4", "unknown_1": "paino", "timestamp": "2013-02-20 05:58:07", "realized_volume": "4", "realized_amount": "1", "container_type": "etukontti", "volume": "4 m3", "no_of_bin": "1", "address": "GESTERBYNKAARI 3", "y": "6668915.44354188", "x": "25469041.2941253", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.44304141880561, 60.1322667620566]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB160011015", "unknown_4": "0", "housing_type": "511", "unknown_2": "1", "unknown_3": "170", "waste_point": "3", "unknown_1": "paino", "timestamp": "2013-02-20 06:01:11", "realized_volume": "8", "realized_amount": "1", "container_type": "etukontti", "volume": "8 m3", "no_of_bin": "1", "address": "GESTERBYNKAARI 3", "y": "6668939.57684429", "x": "25469046.0947273", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.44041002288483, 60.132799165069144]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB160011028", "unknown_4": "0", "housing_type": "511", "unknown_2": "1", "unknown_3": "70", "waste_point": "1", "unknown_1": "paino", "timestamp": "2013-02-20 06:04:17", "realized_volume": "4", "realized_amount": "1", "container_type": "etukontti", "volume": "4 m3", "no_of_bin": "1", "address": "GESTERBYNKAARI 3", "y": "6669000.12857009", "x": "25468900.3552227", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.43794458079244, 60.125999359237994]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB160016120", "unknown_4": "0", "housing_type": "999", "unknown_2": "1", "unknown_3": "110", "waste_point": "1", "unknown_1": "paino", "timestamp": "2013-02-20 06:11:00", "realized_volume": "8", "realized_amount": "1", "container_type": "etukontti", "volume": "8 m3", "no_of_bin": "1", "address": "TORITIE", "y": "6668243.71312285", "x": "25468756.8940207", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.40694080477275, 60.09367389695346]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB160010142", "unknown_4": "0", "housing_type": "039", "unknown_2": "1", "unknown_3": "400", "waste_point": "1", "unknown_1": "paino", "timestamp": "2013-02-20 07:09:38", "realized_volume": "8", "realized_amount": "1", "container_type": "etukontti", "volume": "8 m3", "no_of_bin": "1", "address": "EDIKSENTIE 1", "y": "6664657.36051309", "x": "25467001.1898101", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.4375275398835, 60.121883278240944]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB160010883", "unknown_4": "0", "housing_type": "511", "unknown_2": "1", "unknown_3": "340", "waste_point": "3", "unknown_1": "paino", "timestamp": "2013-02-20 06:17:38", "realized_volume": "4", "realized_amount": "1", "container_type": "etukontti", "volume": "4 m3", "no_of_bin": "1", "address": "KIRKKOTALLINTIE 6", "y": "6667785.33085611", "x": "25468729.8085224", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                    {"geometry": {"type": "Point", "coordinates": [24.386722568137202, 60.09101937182978]}, "type": "Feature", "properties": {"unload_place_name": "Ämmässuo", "agreement_no": "BB160010375", "unknown_4": "0", "housing_type": "039", "unknown_2": "1", "unknown_3": "390", "waste_point": "1", "unknown_1": "paino", "timestamp": "2013-02-20 07:16:11", "realized_volume": "8", "realized_amount": "1", "container_type": "etukontti", "volume": "8 m3", "no_of_bin": "1", "address": "HARJU 2", "y": "6664371.88428347", "x": "25465873.4902888", "measured": "punnittu", "waste_fraction": "Sekajäte", "unload_place_code": "188705"}}, 
                ]    
        };

        var reader = new OpenLayers.Format.GeoJSON();

        return reader.read(features);
    }

    /*
       * Add the maker on the map
       * place: the place name of the event
       * longitude & latitude: the lon lat coordinates of the place
       * content: the content of the maker popup
       * i: index of the place
       */
      function addMarker(place, longitude, latitude, content, i) {
          var size = new OpenLayers.Size(32,32);
          var offset = new OpenLayers.Pixel(-(size.w/2),-size.h);
          var icon = new OpenLayers.Icon("../resources/img/marker.png",size,offset);
          var lonlat = new OpenLayers.LonLat(longitude, latitude).transform(new OpenLayers.Projection("EPSG:4326"),map.getProjectionObject());
      
          var contentSize = new OpenLayers.Size(250,100);
      
          var anchorSize = new OpenLayers.Size(32,32);
          var anchorOffset = new OpenLayers.Pixel(-(size.w/2),-size.h);
          var anchor=new OpenLayers.Icon("../resources/img/marker.png",anchorSize,anchorOffset);
      
          // create new popup
          popups[i] = new OpenLayers.Popup.FramedCloud(place, lonlat, contentSize, content, anchor, false);
      
      // add popup on map
          map.addPopup(popups[i]);
      // hide popup
          popups[i].hide();
      
          var marker = new OpenLayers.Marker(lonlat,icon);
      
          // add touchstart event on the marker
          marker.events.register("touchstart", marker, function(e){
                                 // show or hide popup
                                 popups[i].toggle();
                                 })
      
          // add the marker to the marker layer
          markers.addMarker(marker);
      }

};
