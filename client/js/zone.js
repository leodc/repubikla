function getZoneStyle(zoneProperties){
  return {
    stroke: true,
    color: "black",
    weight: 1,
    fillColor: "#1db360"
  };
}


function buildZonePopup(layer){
  var properties = layer.feature.properties;
  var suffix = null;

  var excluded = ["Comentario","the_geom","cartodb_id","the_geom_webmercator","created_at","updated_at","geojson", "date", "gid"];

  var topItems = "<b>Fecha: </b>" + properties.date;
  var bodyItems = "<br><br><b>Características de esta zona: </b>";
  var footItems = "<br>";

  for(var key in properties ){
    if( excluded.indexOf(key) < 0 ){
      switch(key){

        case "zona_agradable":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Agradable (paisaje urbano, ambiente, vegetación)";
        break;
        case "zona_comercio":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Con concentración de comercios y servicios útiles";
        break;
        case "zona_comoda":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Cómoda, con buen diseño de calles y mobiliario";
        break;
        case "zona_conectada":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Bien conectada (diseño de cruces, fases semafóricas)";
        break;
        case "zona_desagradable":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Desagradable, hostil";
        break;
        case "zona_incomoda":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Incomoda, con mal diseño de calles y mobiliario";
        break;
        case "zona_insegura":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Insegura (a nivel personal)";
        break;
        case "zona_no_conectada":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Mal conectada";
        break;
        case "zona_no_iluminada":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Mal iluminada";
        break;
        case "zona_no_mantenimiento":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Mal mantenimiento (pavimento, instalaciones)";
        break;
        case "zona_transito":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Tránsito confuso y peligroso";
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

  footItems += getHtmlShareContent("texto", "z", properties.gid);

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
