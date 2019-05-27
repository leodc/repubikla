function getZoneStyle(zoneProperties){
  return {
    stroke: true,
    color: "black",
    weight: 1,
    fillColor: "#1db360"
  };
}

function hideZonesLayer(){
  window.map.removeLayer(window.layers.zones);
}


function buildZonePopup(layer){
  var properties = layer.feature.properties;
  var suffix = null;

  var excluded = ["Comentario","the_geom","cartodb_id","the_geom_webmercator","created_at","updated_at","geojson", "date", "gid"];

  var shareText = "Esta zona es...";
  var topItems = "<b>Fecha: </b>" + properties.date;
  var bodyItems = "<br><br><b>Características de esta zona: </b>";
  var footItems = "<br>";

  for(var key in properties ){
    if( excluded.indexOf(key) < 0 ){
      switch(key){

        case "zona_agradable":
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Agradable (paisaje urbano, ambiente, vegetación)";

        shareText += " agradable,";
        break;
        case "zona_comercio":
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Con concentración de comercios y servicios útiles";
        shareText += " contiene servicios útiles,";
        break;
        case "zona_comoda":
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Cómoda, con buen diseño de calles y mobiliario";
        shareText += " cómoda,";
        break;
        case "zona_conectada":
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Bien conectada (diseño de cruces, fases semafóricas)";
        shareText += " conectada,";
        break;
        case "zona_desagradable":
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Desagradable, hostil";
        shareText += " desagradable,";
        break;
        case "zona_incomoda":
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Incomoda, con mal diseño de calles y mobiliario";
        shareText += " incomoda,";
        break;
        case "zona_insegura":
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Insegura (a nivel personal)";
        shareText += " insegura,";
        break;
        case "zona_no_conectada":
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Mal conectada";
        shareText += " mal conectada,";
        break;
        case "zona_no_iluminada":
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Mal iluminada";
        shareText += " mal iluminada,";
        break;
        case "zona_no_mantenimiento":
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Mal mantenimiento (pavimento, instalaciones)";
        shareText += " sin mantenmiento,";
        break;
        case "zona_transito":
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Tránsito confuso y peligroso";
        shareText += " con tránsito confuso y peligroso,";
        break;
        default:
        footItems += "<br><b>" + key + ":</b> " + properties[key];
        break;
      }
    }
  }

  if( properties["Comentario"] ){
    footItems += "<br><b>Comentario:</b> " + properties["Comentario"] + "<br>";
  }

  if(suffix) {
    return topItems + bodyItems + footItems + suffix;
  }

  footItems += getHtmlShareContent(shareText, "z", properties.gid);

  return topItems + bodyItems + footItems;
}

////////
////////
// FILTERS
function filterZones(zones){
  console.log("filtering zones", zones);

  var style, properties, i;
  window.layers.zones.eachLayer(function (layer) {
      style = {
          fill: false,
          stroke: false
      };

      properties = layer.feature.properties;

      propertySearch:
      for( i = 0; i < zones.length; i++){
          if( properties[zones[i]] ){
              style.fill = true;
              style.stroke = true;

              break propertySearch;
          }
      }

      layer.setStyle(style);
  });

  window.map.addLayer(window.layers.zones);
};


function cleanZonesFilters(zones){
  console.log("filtering zones", zones);
  var style = {
      fill: true,
      stroke: true
  };
  window.layers.zones.eachLayer(function (layer) {
      layer.setStyle(style);
  });

  window.map.addLayer(window.layers.zones);
};
