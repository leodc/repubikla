window.pointDictionary = [
  "Incidente vial",
  "Asalto",
  "Robo de bicicleta en estacionamiento",
  "Robo de bicicleta estacionada en la calle",
  "Bicicleta blanca",
  "Cruce peligroso",
  "Diseño urbano peligroso",
  "Condiciones peligrosas",
  "Comercio/Servicio Bikefriendly",
  "Colectivo/Punto de encuentro",
  "Vehículos estacionados en carril confinado",
  "Vehículos en movimiento en carril confinado",
  "Comercio en carril confinado",
  "Invasión recurrente de banqueta"
];

var categorys = ["point-dark-red", "point-red", "point-black", "point-lightred", "point-purple", "point-orange", "point-other"];
var colors = ["#b82e2e", "#dc3912", "#000000", "#ff9900", "#990099", "#FF6347", "#C0C0C0"]

function hidePruneCluster(){
  window.map.removeLayer(layers.points);
};

function showPruneCluster(){
  window.map.addLayer(layers.points);
};

/**
* Marker popup
* */
function buildPointPopup(properties, suffix){
  var html = "<b>" + properties.type + "</b><br>";
  html += "<span style='color: gray'>" + properties.date + "</span><br>";

  var excluded = ["type", "date", "georef", "lng", "lat", "x", "y", "c", "gid"];

  for( var key in properties ){
    if( excluded.indexOf(key) < 0 ){
      if(isUrl(properties[key])){
        html += '<br><b>' + key + ':</b> <a href="' + properties[key] + '" target=_blank>' + properties[key] + '</a>';
        continue;
      }else if ( /fuente[0-9]*/i.test(key) && properties[key].charAt(0) === "@"){
        html += '<br><b>' + key + ':</b> <a href="https://twitter.com/' + properties[key] + '" target=_blank>' + properties[key] + '</a>';
        continue;
      }
      html += "<br><b>" + key + ":</b> " + properties[key];
    }
  }

  if(suffix) {
    return html + suffix;
  }

  var text = properties.type + "%20" + properties.date;
  html += getHtmlShareContent(text, "p", properties.gid);

  return html;
}

function getPointCategory(type){
  var darkred = ["Incidente vial", "Asalto"];
  var red = ["Robo de bicicleta en estacionamiento", "Robo de bicicleta estacionada en la calle"];
  var black = ["Bicicleta blanca"];
  var lightred = ["Cruce peligroso", "Diseño urbano peligroso", "Condiciones peligrosas"];
  var purple = ["Comercio/Servicio Bikefriendly", "Colectivo/Punto de encuentro"];
  var orange = ["Vehículos estacionados en carril confinado", "Vehículos en movimiento en carril confinado", "Comercio en carril confinado", "Invasión recurrente de banqueta"];

  if( darkred.indexOf(type) > - 1 ){
    return "point-dark-red";
  }else if( red.indexOf(type) > - 1 ){
    return "point-red";
  }else if( black.indexOf(type) > - 1 ){
    return "point-black";
  }else if( lightred.indexOf(type) > - 1 ){
    return "point-lightred";
  }else if( purple.indexOf(type) > - 1 ){
    return "point-purple";
  }else if( orange.indexOf(type) > - 1 ){
    return "point-orange";
  }else {
    return "point-other";
  }

}

function setCustomMarker(){
  var pi2 = Math.PI * 2;

  L.Icon.MarkerCluster = L.Icon.extend({
    options: {
      iconSize: new L.Point(44, 44),
      className: 'prunecluster leaflet-markercluster-icon'
    },

    createIcon: function () {
      var e = document.createElement('canvas');
      this._setIconStyles(e, 'icon');
      var s = this.options.iconSize;
      e.width = s.x;
      e.height = s.y;
      this.draw(e.getContext('2d'), s.x, s.y);
      return e;
    },

    createShadow: function () {
      return null;
    },

    draw: function(canvas, width, height) {
      var start = 0;
      for (var i = 0, l = colors.length; i < l; ++i) {

        var size = this.stats[i] / this.population;


        if (size > 0) {
          canvas.beginPath();
          canvas.moveTo(22, 22);
          canvas.fillStyle = colors[i];
          var from = start + 0.14,
          to = start + size * pi2;

          if (to < from) {
            from = start;
          }
          canvas.arc(22,22,22, from, to);

          start = start + size*pi2;
          canvas.lineTo(22,22);
          canvas.fill();
          canvas.closePath();
        }

      }

      canvas.beginPath();
      canvas.fillStyle = 'white';
      canvas.arc(22, 22, 18, 0, Math.PI*2);
      canvas.fill();
      canvas.closePath();

      canvas.fillStyle = '#555';
      canvas.textAlign = 'center';
      canvas.textBaseline = 'middle';
      canvas.font = 'bold 12px sans-serif';

      canvas.fillText(this.population, 22, 22, 40);
    }
  });
}


function buildPruneCluster(){
  var pruneCluster = new PruneClusterForLeaflet();
  pruneCluster.Cluster.Size = 10;

  setCustomMarker();

  pruneCluster.BuildLeafletClusterIcon = function(cluster) {
    var e = new L.Icon.MarkerCluster();

    e.stats = cluster.stats;
    e.population = cluster.population;

    return e;
  };

  pruneCluster.BuildLeafletCluster = function(cluster, position) {
    var m = new L.Marker(position, {
      icon: pruneCluster.BuildLeafletClusterIcon(cluster)
    });

    m.on("click", function() {
      // Compute the  cluster bounds (it's slow : O(n))
      var markersArea = pruneCluster.Cluster.FindMarkersInArea(cluster.bounds);
      var b = pruneCluster.Cluster.ComputeBounds(markersArea);

      if (b) {
        var bounds = new L.LatLngBounds(new L.LatLng(b.minLat, b.maxLng),new L.LatLng(b.maxLat, b.minLng));

        var zoomLevelBefore = pruneCluster._map.getZoom();
        var zoomLevelAfter = pruneCluster._map.getBoundsZoom(bounds, false, new L.Point(20, 20, null));

        // If the zoom level doesn't change
        if (zoomLevelAfter === zoomLevelBefore) {
          // Send an event for the LeafletSpiderfier
          pruneCluster._map.fire("overlappingmarkers", {
            cluster: pruneCluster,
            markers: markersArea,
            center: m.getLatLng(),
            marker: m
          });

          pruneCluster._map.setView(position, zoomLevelAfter);
        }
        else {
          pruneCluster._map.fitBounds(bounds);
        }
      }
    });

    return m;
  };

  pruneCluster.addPointToLayer = function(geojson){
    marker = new PruneCluster.Marker(geojson.geometry.coordinates[1], geojson.geometry.coordinates[0]);
    marker.data.icon = L.divIcon({className: "leaflet-div-icon-point " + window.getPointCategory(geojson.properties.type)});
    marker.data.popup = buildPointPopup(geojson.properties);

    this.RegisterMarker(marker);
    this.ProcessView();
  };

  return pruneCluster;
}


////////
////////
// FILTERS
function filterPoints(show){
    console.log("filtering points", show);

    var marker;
    for(var i = 0; i < window.markerList.length; i++){
        marker = window.markerList[i];
        marker.filtered = (show.indexOf(marker.data.type) < 0);
    }

    window.layers.points.ProcessView();
    showPruneCluster();
};

function cleanPointsFilters(){
    for(var i = 0; i < window.markerList.length; i++){
        window.markerList[i].filtered = false;
    }

    window.layers.points.ProcessView();
    showPruneCluster();
};


////////
////////
// INDICATORS
// @types -> array, null for all
function getPointsInView(acceptedTypes){
  var features = [];

  var mapBounds = map.getBounds();
  var counter = 0;
  for( var marker of markerList ){
    if(acceptedTypes && acceptedTypes.indexOf(marker.data.type) < 0){
        continue;
    }

    if(mapBounds.contains(L.latLng(marker.position))){
      features.push({
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [marker.position.lng, marker.position.lat]
        },
        "properties": {
          "_index": counter++
        }
      });
    }
  }

  return features;
}
