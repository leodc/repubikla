function buildMap(config){
  window.layers = {};

  // base map
  var map = L.map("map", config.mapOptions).setView(config.view, config.zoom);

  if(config.dialog){
    buildDialogControl(map, config.dialog);
  }

  if(config.sidebar){
    buildSidebar(map, config.sidebar);
  }

  if(config.panes){
    for(var key in config.panes){
      map.createPane(key);
      map.getPane(key).style.zIndex = config.panes[key];
    }
  }

  if(config.hash){
    var hash = new L.Hash(map);
  }

  if(config.legend){
    buildLegend(map, config.legend);
  }

  // base layers & control
  var layerControl = config.groupedLayers ? buildBaseLayersAndControl(map, config.layerControl):buildSimpleLayerControl(map, config.layerControl);

  map._addNewLayer = function(layer, options){
    if(options.initOnView){
      map.addLayer(layer);
    }

    if(options.controlLabel){
      layerControl.publishLayer(layer, options.controlLabel);
    }

    window.layers[options.id] = layer;
  }

  map.addCustomLayer = function(options){
    var layer = options.layer;
    delete options.layer;

    map._addNewLayer(layer, options);
  };

  map.createWmsLayer = function(options){
    var service = options.wmsOptions.service;

    var wmsOptions = {
      transparent: true,
      format: "image/png",
      opacity: .8
    }
    for(var key in options.wmsOptions){
      wmsOptions[key] = options.wmsOptions[key];
    }
    if(options.cql_filter){
      wmsLayer.setParams({cql_filter: options.cql_filter});
      delete options.cql_filter;
    }

    delete options.wmsOptions.service;
    delete options.wmsOptions;

    var wmsLayer = L.tileLayer.wms(service, wmsOptions);

    map._addNewLayer(wmsLayer, options);
  };


  // minOpacity - the minimum opacity the heat will start at
  // maxZoom - zoom level where the points reach maximum intensity (as intensity scales with zoom), equals maxZoom of the map by default
  // max - maximum point intensity, 1.0 by default
  // radius - radius of each "point" of the heatmap, 25 by default
  // blur - amount of blur, 15 by default
  // gradient - color gradient config, e.g. {0.4: 'blue', 0.65: 'lime', 1: 'red'}
  map.createHeatmapLayer = function(options){
    var heat = L.heatLayer([], options).addTo(map);
    if(options.data){
      heat.setLatLngs(options.data);
      delete options.data;
    }

    map._addNewLayer(heat, options);
  }

  map.createLayer = function(options){
    var layer = L.geoJSON(null, options);

    if(options.popup){
      layer.bindPopup(options.popup.content, options.popup.options);
    }

    if(options.dataUrl){
      $.getJSON(options.dataUrl, function(data){
        layer.addData(data);
      });
    }

    if(options.data){
      layer.addData(options.data);
    }

    map._addNewLayer(layer, options);
  }

  $(window).on("resize", function(){
    map.invalidateSize();
  });

  map.geoJSONtoWkt=function(geojson){
    var wkt = geojson.geometry.type.toUpperCase();

    wkt += " ((";
    for(var batchCoordinates of geojson.geometry.coordinates[0]){
      wkt += "(";
      for(var coordinates of batchCoordinates){
        wkt += coordinates[0] + " " + coordinates[1] + ",";
      }
      wkt = wkt.slice(0,-1) + "),";
    }
    wkt = wkt.slice(0,-1) + "))";

    return wkt;
  }


  if(config.drawControl){
    addDrawControl(map, config);
  }

  window.map = map;

  // options
  if(config.maxBounds){
    var corner1 = L.latLng(config.maxBounds[1], config.maxBounds[0]);
    var corner2 = L.latLng(config.maxBounds[3], config.maxBounds[2]);

    var maxBounds = L.latLngBounds(corner1, corner2);
    map.fitBounds( maxBounds );
    map.setMaxBounds( maxBounds );
  }

  if(config.locate){
    addLocateButton(map, "topleft");
  }
}

function addDrawControl(map, config){
  var layerId = config.drawControl.layerId;
  window.layers[layerId] = new L.FeatureGroup().addTo(map);

  if(config.drawControl.popup){
    window.layers[layerId].bindPopup(config.drawControl.popup, {maxHeight: "300", minWidth: "100"});
  }

  var drawControl = new L.Control.Draw({
    edit: {
      featureGroup: window.layers[layerId]
    },
    draw: {
      polygon: false,
      polyline: false,
      rectangle: false,
      circle: false
    }
  });

  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, function (e) {
    var type = e.layerType, layer = e.layer;

    config.drawControl.drawAction(layer);
  });
}


function buildSimpleLayerControl(map, options){
  // base layers
  var cartoLightLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var cartoDarkLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
    attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'
  }).addTo(map);

  var control = L.control.layers({"CARTO Light": cartoLightLayer, "CARTO Dark": cartoDarkLayer, "Wikimedia": wikimedia}, {}, options).addTo(map);
  control.publishLayer = function(layer, options){
    control.addOverlay(layer, options.text);
  }

  return control;
}


function buildBaseLayersAndControl(map, options){
  var layerControlOptions = {
    collapsed: ($("html").width() < 768)
  };

  if(options){
    for(var key in options){
      layerControlOptions[key] = options[key];
    }
  }

  // base layers
  var cartoLightLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var cartoDarkLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
    attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'
  }).addTo(map);

  var control = L.control.groupedLayers({"CARTO Light": cartoLightLayer, "CARTO Dark": cartoDarkLayer, "Wikimedia": wikimedia}, {}, layerControlOptions).addTo(map);

  control.publishLayer = function(layer, options){
    if(options.colorBox){
      options.text = "<i style='background:{0};width:18px;height:18px;float:left;margin-right:8px;opacity:0.7;'></i>".format(options.colorBox) + options.text;
    }

    if(options.colorRange){
      options.text += " <br><span class='float-left mr-1'>{0}:</span>".format(options.variable);
      for(var color of options.colorRange){
        options.text += "<i style='background:{0};width:18px;height:18px;float:left;opacity:0.7;'></i>".format(color);
      }
      options.text += "<span class='ml-1'>{0}</span>".format(options.maxValue) + "<br>";
    }

    if(options.additionalDiv){
      options.text += "<br><div id='{0}'></div><div class='clearfix'></div>".format(options.additionalDiv);
    }

    control.addOverlay(layer, options.text, options.group);

    if(options.group == ""){
      $(".leaflet-control-layers-group-label").each(function(index){
        if($(this).text() == ""){
          $(this).replaceWith('<div class="leaflet-control-layers-separator" style=""></div>');
        }
      });
    }
  }

  return control;
}

function buildSidebar(map, options){
  var sidebar;
  if(options.v1){
    var sidebars = {};

    for (var id of options.v1.ids) {
      sidebar = L.control.sidebar(id, options.v1.options);

      map.addControl(sidebar);

      sidebars[id] = sidebar;
    }

    if (options.v1.afterCloseCallback){
      $(".close").on("click", options.v1.afterCloseCallback);
    }

    window.sidebars = sidebars;
  }else if (options.v2) {
    sidebar = L.control.sidebar(options.v2.options).addTo(map);

    if( ($("html").width() < 768) ){
      // fix zoom buttons on small devices
      $(".leaflet-left").css("padding-left", "35px");
    }

    sidebar.on("opening", function(e){
      window.sidebarOpen = true;
    });

    sidebar.on("closing", function(e){
      window.sidebarOpen = false;
    });

    map.openSidebar = function(section){
      sidebar.open(section);
    };
  }

  return sidebar;
}

function addLocateButton(map, position){
  L.control.locate({
    icon: "fas fa-location-arrow",
    position: position,
    strings: {
      title: "Mostrar mi ubicación",
      metersUnit: "metros",
      feetUnit: "pies",
      popup: "Estás en un radio de {distance} {unit} desde este punto",
      outsideMapBoundsMsg: "Parece que estas fuera de los límites del mapa."
    }
  }).addTo(map);
}

function buildDialogControl(map, dialogConfig){
  var dialogOptions = {
    initOpen: dialogConfig.initOpen
  };

  var dialog = L.control.dialog(dialogOptions).setContent(dialogConfig.content).addTo(map);
  var location = dialogConfig.location ? dialogConfig.location:[1, 45];
  dialog.setLocation( location );

  if(dialogConfig.onOpen){
    map.on("dialog:opened", dialogConfig.onOpen);
  }

  map.showDialog = function(){
    dialog.open();
  }
}


function buildLegend(map, options){
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += options.html;

    return div;
  };

  legend.addTo(map);
}
