window.motivosProperties = {
    "Ir al trabajo":{
        color: "#3366cc"
    },
    "Regreso a casa":{
        color: "#ff9900"
    },
    "Desplazamientos de trabajo":{
        color: "#990099"
    },
    "Estudios":{
        color: "#dd4477"
    },
    "Visitas":{
        color: "#66aa00"
    },
    "Compras":{
        color: "#b82e2e"
    },
    "Paseo, turismo":{
        color: "#316395"
    },
    "Deporte":{
        color: "#994499"
    },
    "Comida":{
        color: "#22aa99"
    },
    "Otra actividad":{
        color: "#3b3eac"
    }
};

function hideRouteLayer(){
  window.map.removeLayer(window.layers.routes);
}


function getRouteStyle (feature){
  var motivo = feature.properties.ruta_motivo;

  // var opacity = (sharedRoute) ? 0.1:0.55;
  var opacity = 0.55;

  var color = window.motivosProperties[motivo] ? window.motivosProperties[motivo].color:"silver";

  return {
    color: color,
    opacity: opacity,
    weight: 3
  };
}

function buildRoutePopup(layer){
  var properties = layer.feature.properties;
  var suffix = null;

  var excluded = ["comment","the_geom","cartodb_id","the_geom_webmercator","created_at","updated_at","geojson", "date","gid"];

  var shareText = "Ruta para ";
  var bodyPreffix = "<br><br><b>Esta ruta es: </b>";

  var topItems = "";
  var bodyItems = bodyPreffix;
  var footItems = "<br>";


  for(var key in properties ){
    if( excluded.indexOf(key) < 0 ){
      switch(key){
        case "ruta_motivo":
        topItems += "<b>Motivo de la ruta: </b>" + properties[key];
        topItems += "<br><b>Fecha: </b>" + properties.date;

        shareText += properties[key];
        break;
        case "ruta_tiempo":
        topItems += "<br><b>Tiempo del recorrido (minutos): </b>" + properties[key];
        break;
        case "ruta_frecuencia":
        topItems += "<br><b>Frecuencia del recorrido: </b>" + properties[key];
        break;
        case "ruta_rapida":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Rápida y conectada";
        break;
        case "ruta_segura":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Segura";
        break;
        case "ruta_amigable":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Agradable y cómoda";
        break;
        case "ruta_neutral":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> La única que puedo tomar";
        break;
        case "ruta_multimodal":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Multimodal";
        break;
        case "ruta_bicipublica":
        if(properties[key])
        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Hecha en bicicleta pública";
        break;
        case "ruta_acompanantes":
        topItems += "<br><b>Número de personas que hacen este recorrido: </b>" + (properties[key] + 1);
        break;
        default:
        footItems += "<br><b>" + key + ":</b> " + properties[key];
        break;
      }
    }
  }

  bodyItems = (bodyItems===bodyPreffix) ? "":bodyItems;

  if(suffix) {
    return topItems + bodyItems + footItems + suffix;
  }

  footItems += getHtmlShareContent(shareText, "r", properties.gid);

  return topItems + bodyItems + footItems;
}

////////
////////
// FILTERS
function filterRoutes(routes){
  console.log("filtering routes", routes);

  window.layers.routes.eachLayer(function (layer) {
      layer.setStyle({stroke: routes.includes(layer.feature.properties.ruta_motivo)});
  });

  window.map.addLayer(window.layers.routes);
};

function cleanRoutesFilters(){
  window.layers.routes.eachLayer(function (layer) {
      layer.setStyle({stroke: true});
  });

  window.map.addLayer(window.layers.routes);
};
