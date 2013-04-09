Ext.ns('App');

navpts=[];
navlinks=[];

/**
 * The model for the geonames records used in the search
 */
Ext.regModel('Geonames', {
    fields: ['countryName', 'toponymName', 'name', 'lat', 'lng']
});

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
//                              new OpenLayers.Feature.Vector(node.pt,{},{graphicName:'cross',strokeColor:'#ff0000',strokeWidth:1,pointRadius:4}),
							  new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([node.src.pt,node.pt]),{},{strokeColor:'#ff0000',strokeWidth:2})
		]);
		}
		node=node.src;
	}
}

function showRoute(first,last) {
    var i,j;
    var pts,links;
    var llProj,mapProj;
	var node1,node2,dist;
	var edge=[];

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
        for(j=0;j<pts.length;j+=4) {
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
		for(i=1;i<edge.length;i++) {
			if(edge[i].dist<edge[pos].dist) pos=i;
		}
		node=edge[pos];
//		alert('pos '+pos);
//		alert(node.name+' '+node.visited);
		for(i=0;i<node.access.length;i++) {
			next=node.access[i];
			n=next[0];
//			alert(n.name+' '+n.visited);
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

/**
 * Custom class for the Routing 
 */
App.RouteFormPopupPanel = Ext.extend(Ext.Panel, {
	id: 'routePanel',
    map: null,
    floating: true,
    modal: true,
    centered: true,
    hideOnMaskTap: true,
    width: Ext.is.Phone ? undefined : 400,
    height: Ext.is.Phone ? undefined : 400,
    scroll: false,
    layout: 'fit',
    fullscreen: Ext.is.Phone ? true : undefined,
    url: 'http://ws.geonames.org/searchJSON?',
    errorText: 'Sorry, we had problems communicating with geonames.org. Please try again.',
    errorTitle: 'Communication error',
    maxResults: 6,
    featureClass: "P",
    
    createStore: function(){
        this.store = new Ext.data.Store({
            model: 'Geonames',
            proxy: {
                type: 'scripttag',
                timeout: 5000,
                listeners: {
                    exception: function(){
                        this.hide();
                        Ext.Msg.alert(this.errorTitle, this.errorText, Ext.emptyFn);
                    },
                    scope: this
                },
                url: this.url,
                reader: {
                    type: 'json',
                    root: 'geonames'
                }
            }
        });
    },
    
    doSearch: function(searchfield, evt){
        var q = searchfield.getValue();
        this.store.load({
            params: {
                featureClass: this.featureClass,
                maxRows: this.maxResults,
                name_startsWith: encodeURIComponent(q)
            }
        });
    },
    
    onItemTap: function(dataView, index, item, event){
        var record = this.store.getAt(index);
        var lon = record.get('lng');
        var lat = record.get('lat');
        var lonlat = new OpenLayers.LonLat(lon, lat);
                                      map.setCenter(lonlat.transform(
                                                                     new OpenLayers.Projection("EPSG:4326"),
                                                                     map.getProjectionObject()
                                                                     ),16);
        //this.hide("pop");
    },
    
    initComponent: function(){
        this.createStore();
        this.resultList = new Ext.List({
            scroll: 'vertical',
            cls: 'searchList',
            loadingText: "Searching ...",
            store: this.store,
            itemTpl: '<div>{name} ({countryName})</div>',
            listeners: {
                itemtap: this.onItemTap,
                scope: this
            }
        });
        this.formContainer = new Ext.form.FormPanel({
            scroll: false,
            items: [{
                xtype: 'button',
                cls: 'close-btn',
                ui: 'decline-small',
                text: 'Close',
                handler: function(){
                    this.hide();
                },
                scope: this 
            }, {
                xtype: 'fieldset',
                scroll: false,
                title: 'Find your way',
                items: [{
                    xtype: 'searchfield',
                    label: 'From',
                        id: 'routeFromText',
                    placeHolder: 'Current Location',
                    listeners: {
                        action: this.doSearch,
                        scope: this
                    }

                },
                    

                {
                xtype: 'searchfield',
                label: 'To',
                        id: 'routeToText',
                placeHolder: 'Target Location',
                listeners: {
                action: this.doSearch,
                scope: this
                            }
                },
                {
                xtype: 'button',
                text: 'Get Route',
                cls: 'demobtn',
                        handler:function() {
                        showRoute(Ext.getCmp('routeFromText').getValue(),Ext.getCmp('routeToText').getValue());
						Ext.getCmp('routePanel').hide();
                        }
                },
                this.resultList
                    ]
                    }]

                                                });
        this.items = [{
            xtype: 'panel',
            layout: 'fit',
            items: [this.formContainer]
        }];
        App.RouteFormPopupPanel.superclass.initComponent.call(this);
        
    }
});

App.LayerList = Ext.extend(Ext.List, {
    
    map: null,
    
    createStore: function(){
        Ext.regModel('Layer', {
            fields: ['id', 'name', 'visibility', 'zindex']
        });
        var data = [];
        Ext.each(this.map.layers, function(layer){
            if (layer.displayInLayerSwitcher === true) {
                var visibility = layer.isBaseLayer ? (this.map.baseLayer == layer) : layer.getVisibility();
                data.push({
                    id: layer.id,
                    name: layer.name,
                    visibility: visibility,
                    zindex: layer.getZIndex()
                });
            }
        });
        return new Ext.data.Store({
            model: 'Layer',
            sorters: 'zindex',
            data: data
        });
    },
    
    initComponent: function(){
        this.store = this.createStore();
        this.itemTpl = new Ext.XTemplate(
            '<tpl if="visibility == true">', 
                '<img width="20" src="img/check-round-green.png">', 
            '</tpl>', 
            '<tpl if="visibility == false">', 
                '<img width="20" src="img/check-round-grey.png">', 
            '</tpl>', 
            '<span class="gx-layer-item">{name}</span>'
        );
        this.listeners = {
            itemtap: function(dataview, index, item, e){
                var record = dataview.getStore().getAt(index);
                var layer = this.map.getLayersBy("id", record.get("id"))[0];
                if (layer.isBaseLayer) {
                    this.map.setBaseLayer(layer);
                }
                else {
                    layer.setVisibility(!layer.getVisibility());
                }
                record.set("visibility", layer.getVisibility());
            }
        };
        this.map.events.on({
            "changelayer": this.onChangeLayer,
            scope: this
        });
        App.LayerList.superclass.initComponent.call(this);
    },

    findLayerRecord: function(layer){
        var found;
        this.store.each(function(record){
            if (record.get("id") === layer.id) {
                found = record;
            }
        }, this);
        return found;
    },
    
    onChangeLayer: function(evt){
        if (evt.property == "visibility") {
            var record = this.findLayerRecord(evt.layer);
            record.set("visibility", evt.layer.getVisibility());
        }
    }
    
});
Ext.reg('app_layerlist', App.LayerList);
