// Start with the map page
window.location.replace(window.location.href.split("#")[0] + "#mappage");
var selectedFeature = null;
// fix height of content
function fixContentHeight() {
    var footer = $("div[data-role='footer']:visible"),
        content = $("div[data-role='content']:visible:visible"),
        viewHeight = $(window).height(),
        contentHeight = viewHeight - footer.outerHeight();

    if ((content.outerHeight() + footer.outerHeight()) !== viewHeight) {
        contentHeight -= (content.outerHeight() - content.height() + 1);
        content.height(contentHeight);
    }

    if (window.map && window.map instanceof OpenLayers.Map) {
        map.updateSize();
    } else {
        // initialize map
        init(function(feature) { 
            selectedFeature = feature; 
            $.mobile.changePage("#popup", "pop"); 
        });
        initLayerList();
    }
}

// one-time initialisation of button handlers 

$("#plus").live('click', function(){
    map.zoomIn();
});

$("#minus").live('click', function(){
    map.zoomOut();
});

$("#locate").live('click',function(){
    var control = map.getControlsBy("id", "locate-control")[0];
    if (control.active) {
        control.getCurrentLocation();
    } else {
        control.activate();
    }
});

//fix the content height AFTER jQuery Mobile has rendered the map page
$('#mappage').live('click',function (){
    fixContentHeight();
});
    
$(window).bind("orientationchange resize pageshow", fixContentHeight);

//popup list view
$('#popup').live('pageshow',function(event, ui){
    var li = "";
    for(var attr in selectedFeature.attributes){
        li += "<li><div style='width:50%;float:left'>" + attr + "</div><div style='width:50%;float:right'>" 
        + selectedFeature.attributes[attr] + "</div></li>";
    }
    $("ul#details-list").empty().append(li).listview("refresh");
});

// Search feature JS
$('#searchpage').live('pageshow',function(event, ui){
    $('#query').bind('change', function(e){
        $('#search_results').empty();
        if ($('#query')[0].value === '') {
            return;
        }
        $.mobile.showPageLoadingMsg();

        // Prevent form send
        e.preventDefault();
		
		// The app uses Geonames to search places 
        var searchUrl = 'http://ws.geonames.org/searchJSON?featureClass=P&maxRows=10';
        searchUrl += '&name_startsWith=' + $('#query')[0].value;
        $.getJSON(searchUrl, function(data) {
            $.each(data.geonames, function() {
                var place = this;
                $('<li>')
                    .hide()
                    .append($('<h2 />', {
                        text: place.name
                    }))
                    .append($('<p />', {
                        html: '<b>' + place.countryName + '</b> ' + place.fcodeName
                    }))
                    .appendTo('#search_results')
                    .click(function() {
                        $.mobile.changePage('#mappage');
                        var lonlat = new OpenLayers.LonLat(place.lng, place.lat);
                        map.setCenter(lonlat.transform(gg, sm), 13);
                    })
                    .show();
            });
            $('#search_results').listview('refresh');
            $.mobile.hidePageLoadingMsg();
        });
    });
    // only listen to the first event triggered
    $('#searchpage').die('pageshow', arguments.callee);
});

//Layers page-list related JS
function initLayerList() {
    $('#layerspage').page();
    $('<li>', {
            "data-role": "list-divider",
            text: "Base Layers"
        })
        .appendTo('#layerslist');
    var baseLayers = map.getLayersBy("isBaseLayer", true);
    $.each(baseLayers, function() {
        addLayerToList(this);
    });

    $('<li>', {
            "data-role": "list-divider",
            text: "Overlay Layers"
        })
        .appendTo('#layerslist');
    var overlayLayers = map.getLayersBy("isBaseLayer", false);
    $.each(overlayLayers, function() {
        addLayerToList(this);
    });
    $('#layerslist').listview('refresh');
    
    map.events.register("addlayer", this, function(e) {
        addLayerToList(e.layer);
    });
}
//Adding new layer to the main view of the app
function addLayerToList(layer) {
    var item = $('<li>', {
            "data-icon": "check",
            "class": layer.visibility ? "checked" : ""
        })
        .append($('<a />', {
            text: layer.name
        })
            .click(function() {
                $.mobile.changePage('#mappage');
                if (layer.isBaseLayer) {
                    layer.map.setBaseLayer(layer);
                } else {
                    layer.setVisibility(!layer.getVisibility());
                }
            })
        )
        .appendTo('#layerslist');
    layer.events.on({
        'visibilitychanged': function() {
            $(item).toggleClass('checked');
        }
    });
}

//Draws route on the map, not working ATM
$('#directions').live('pageshow',function(event, ui){
    navpts=[];
    navlinks=[];
    var nodes;
    var routingTarget=false;

    function drawRoute() {
        var node;
        node=routingTarget;
        navLayer.removeAllFeatures();
        if(!node) return;       
        while(node.src) {
            if(node.floor=='main'+activeFloor) {
            navLayer.addFeatures([
                        //new OpenLayers.Feature.Vector(node.pt,{},{graphicName:'cross',strokeColor:'#ff0000',strokeWidth:1,pointRadius:4}),
                        new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([node.src.pt,node.pt]),{},{strokeColor:'#ff0000',strokeWidth:2})
            ]);
            }
            node=node.src;
        }
    }
    function showRoute(first,last) {
        var i,j;
            pts,links;
            llProj,mapProj;
            node1,node2,dist;
            edge=[];
            nodes=[];

        llProj=new OpenLayers.Projection('EPSG:4326');
        mapProj=map.getProjectionObject();

        for(i in navpts) {
            if(!navpts.hasOwnProperty(i)) continue;
            pts=navpts[i];
            for(j=0;j<pts.length;j+=4) {
                nodes[i+' '+pts[j]]={visited:0,target:0,dist:0,src:false,floor:i,name:pts[j+1],pt:new OpenLayers.Geometry.Point(pts[j+3],pts[j+2]).transform(llProj,mapProj),lat:pts[j+2],lon:pts[j+3],access:[]};
            }
        }

        for(i in navlinks) {
            if(!navlinks.hasOwnProperty(i)) continue;
            links=navlinks[i];
            for(j=0;j<links.length;j+=3) {
                node1=nodes[i+' '+links[j+1]];
                node2=nodes[i+' '+links[j+2]];
                dist=node1.pt.distanceTo(node2.pt);
                node1.access.push([node2,dist]);
                node2.access.push([node1,dist]);
            }
        }

        for(i in navpts) {
            if(!navpts.hasOwnProperty(i)) continue;
            pts=navpts[i];
            for(j=0; j<pts.length; j+=4) {
                if(pts[j+1]==first) {
                    node=nodes[i+' '+pts[j]];
                    node.visited=2;
                    edge.push(node);
                }
                if(pts[j+1]==last) {
                    node=nodes[i+' '+pts[j]];
                    node.target=1;
                }
            }
        }

        var pos,node,next,n;
        while(edge.length>0) {
            pos=0;
            for(i=1; i<edge.length; i++) {
                if(edge[i].dist<edge[pos].dist) pos=i;
            }
            node=edge[pos];
    //      alert('pos '+pos);
    //      alert(node.name+' '+node.visited);
            for(i=0; i<node.access.length; i++) {
                next=node.access[i];
                n=next[0];
    //          alert(n.name+' '+n.visited);
                if(n.visited==0) {
                    n.visited=1;
                    n.dist=node.dist+next[1];
                    n.src=node;
                    edge.push(n);
                } else if(n.visited==1) {
                    if(n.dist>node+dist+next[1]) {
                        n.dist=node.dist+next[1];
                        n.src=node;
                    }
                }
            }
    /*
                    navLayer.addFeatures([
                                  new OpenLayers.Feature.Vector(node.pt,{},{graphicName:'cross',strokeColor:'#ff0000',strokeWidth:1,pointRadius:4}),
                                  new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([node.src.pt,node.pt]),{},{strokeColor:'#ff0000',strokeWidth:2})
                    ]);
    */
            if(node.target) {
                routingTarget=node;
                drawRoute();
                break;
            }

            node.visited=2;
            edge.splice(pos,1);
        }
    //    map.zoomToExtent(navLayer.getDataExtent());
    }
});