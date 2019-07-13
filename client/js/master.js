$(function(){
  // $("#loadingModal").modal("show");

  var mapConfig = {
    view: [24.59, -103.14],
    zoom: 5,
    locate: true,
    hash: true,
    layerControl: {
      collapsed: false
    },
    sidebar: {
      v1: {
        ids: ["sidebarFilter", "sidebarDownload", "sidebarAbout", "sidebarIndicators"],
        options: {
          // autoPan: false
        },
        afterCloseCallback: function(e){
          $(".btn-nav").removeClass("btn-selected");
          $(".btn-nav").addClass("btn-link text-secondary");
        }
      }
    },
    legend: {
      html: `
      <div class="accordion" id="legendContent">
        <div class="card">
          <div class="card-header p-0" id="headingOne">
            <h2 class="mb-0">
              <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne" style="color:#1FB261;font-weight:bolder;">
                Puntos
              </button>
            </h2>
          </div>

          <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#legendContent">
            <div class="card-body">
              <i class="point-dark-red">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Incidente vial<br>
              <i class="point-dark-red">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Asalto<br>
              <i class="point-red">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Robo de bicicleta en estacionamiento<br>
              <i class="point-red">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Robo de bicicleta estacionada en la calle<br>
              <i class="point-black">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Bicicleta blanca<br><i class="point-lightred">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Cruce peligroso<br>
              <i class="point-lightred">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Diseño urbano peligroso<br>
              <i class="point-lightred">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Condiciones peligrosas<br>
              <i class="point-purple">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Comercio/Servicio Bikefriendly<br>
              <i class="point-purple">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Colectivo/Punto de encuentro<br>
              <i class="point-orange">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Vehículos estacionados en carril confinado<br>
              <i class="point-orange">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Vehículos en movimiento en carril confinado<br>
              <i class="point-orange">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Comercio en carril confinado<br>
              <i class="point-orange">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Invasión recurrente de banqueta<br>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header p-0" id="headingTwo">
            <h2 class="mb-0">
              <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo" style="color:#1FB261;font-weight:bolder;">
                Rutas
              </button>
            </h2>
          </div>
          <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#legendContent">
            <div class="card-body">
            <i style="background-color:#3366cc;">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Ir al trabajo<br>
            <i style="background-color:#ff9900;">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Regreso a casa<br>
            <i style="background-color:#990099;">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Desplazamientos de trabajo<br>
            <i style="background-color:#dd4477;">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Estudios<br>
            <i style="background-color:#66aa00;">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Visitas<br>
            <i style="background-color:#b82e2e;">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Compras<br>
            <i style="background-color:#316395;">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Paseo, turismo<br>
            <i style="background-color:#994499;">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Deporte<br>
            <i style="background-color:#22aa99;">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Comida<br>
            <i style="background-color:#3b3eac;">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;Otra actividad<br>
            </div>
          </div>
        </div>
      </div>
      `
    }
  }

  buildMap(mapConfig);

  createLayers();

  loadData(function(auxCounter){
    if( auxCounter == 3){
      if( getUrlParameter("feature") ){
        var aux = getUrlParameter("feature").split("-");

        var paddingX = 0;
        for (var key in sidebars) {
          if(sidebars[key].isVisible()){
            paddingX = $("#" + key).width();
            break;
          }
        }

        if( aux[0] == "p" ){
          for (var marker of markerList) {
            if(marker.data.gid == +aux[1]){
              map.fitBounds(L.latLngBounds([marker.position]), {paddingTopLeft: [paddingX, 0]});
              L.popup().setLatLng(marker.position).setContent(marker.data.popup).openOn(map);
            }
          }
        }else if (aux[0] == "r") {
          window.layers.routes.eachLayer(function(layer){
            if( layer.feature.properties.gid == +aux[1] ){
              map.fitBounds(layer.getBounds(), {paddingTopLeft: [paddingX, 0]});

              layer.bindPopup(buildRoutePopup(layer)).openPopup();
            }
          });
        }else if (aux[0] == "z") {
          window.layers.zones.eachLayer(function(layer){
            if( layer.feature.properties.gid == +aux[1] ){
              window.layers.zones.addTo(map);

              map.fitBounds(layer.getBounds(), {paddingTopLeft: [paddingX, 0]});
              layer.bindPopup(buildZonePopup(layer)).openPopup();
            }
          });
        }
      }

      $("#loadingModal").modal("hide");
    }
  });

  showSidebar("sidebarAbout");

  $("select").chosen();

});

function loadData(callback){
  var auxCounter = 0;


  getRoutes(function(data){
    window.layers.routes.addData(data);

    callback(++auxCounter);
  });

  getZones(function(data){
    window.layers.zones.addData(data);

    callback(++auxCounter);
  });

  getPoints(function(featureCollection){
    var pruneCluster = window.layers.points;

    var geojson, marker, coordinates, category;
    var markerList = [];
    for(var i = 0; i < featureCollection.features.length; i++){
      geojson = featureCollection.features[i];
      coordinates = geojson.geometry.coordinates;

      marker = new PruneCluster.Marker(coordinates[1], coordinates[0]);

      category = window.getPointCategory(geojson.properties.type);

      marker.data.icon = L.divIcon({className: "leaflet-div-icon-point " + category});
      marker.data.popup = buildPointPopup(geojson.properties);
      marker.data.gid = geojson.properties.gid;
      marker.category = categorys.indexOf(category);
      marker.data.type = geojson.properties.type;

      pruneCluster.RegisterMarker(marker);
      markerList.push(marker);
    }

    window.markerList = markerList;

    pruneCluster.ProcessView();

    callback(++auxCounter);
  });
}

function createLayers(){
  map.addCustomLayer({
    id: "points",
    layer: buildPruneCluster(),
    initOnView: true,
    controlLabel: {
      text: "Puntos"
    }
  });

  map.createLayer({
    id: "routes",
    initOnView: true,
    controlLabel: {
      text: "Rutas"
    },
    style: getRouteStyle,
    popup: {
      content: buildRoutePopup,
      options: {}
    }
  });

  map.createLayer({
    id: "zones",
    initOnView: false,
    controlLabel: {
      text: "Zonas"
    },
    style: getZoneStyle,
    popup: {
      content: buildZonePopup,
      options: {}
    }
  });

  map.createLayer({
    id: "indicators",
    initOnView: true
  });
}


function showSidebar(key){
  if( hideSidebars(key) ){
    // in case a sidebar is open we need to wait for the close animation to end before open the new sidebar
    setTimeout(function(){
      sidebars[key].show();
    }, 500);
  }else{
    sidebars[key].show();
  }

  $("#" + key + "Trigger").removeClass("btn-link text-secondary");
  $("#" + key + "Trigger").addClass("btn-selected");

  $("#" + key + "Trigger").blur();
}


function hideSidebars(sidebarToShow){
  for(var key in sidebars){
    if(sidebars[key].isVisible() && key != sidebarToShow){
      sidebars[key].hide();

      $("#" + key + "Trigger").removeClass("btn-selected");
      $("#" + key + "Trigger").addClass("btn-link text-secondary");
      return true;
    }
  }
}

function isUrl(s) {
  var isParagraph = s.substring(0, 6);
  if( ! /(ftp|http|https)/.test(isParagraph) ){
    return false;
  }

  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(s);
};

function getHtmlShareContent(twitterText, type, gid){
  var baseUrl = window.location.origin;
  var urlToShare = baseUrl + "/?feature=" + type + "-" + gid;

  var urlPrefix = "https://twitter.com/intent/tweet?text=" + twitterText + "&via=repubikla&url=";
  var urlFbPrefix = "https://www.facebook.com/sharer/sharer.php?u=";

  var html = "<p class='text-right'>";
  html += '<i class="fas fa-share-alt share-button" style="color: rgba(128,128,128,.5);">&nbsp;</i>';
  html += '<a href="' + urlPrefix + urlToShare + '"><i class="fab fa-twitter share-button"></i></a>';
  html += '<a href="' + urlFbPrefix + urlToShare + '" onclick="javascript:window.open(this.href, \'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600\');return false;"><i class="fab fa-facebook share-button"></i></a>';
  html += "</p>";

  return html;
}

function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
  sURLVariables = sPageURL.split('&'),
  sParameterName,
  i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};
