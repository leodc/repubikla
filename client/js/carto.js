var CARTO = "https://repubikla.carto.com:443/api/v2/sql?q=";

function getPoints(bounds, callback){
  var query = "SELECT ST_X(the_geom) as lng, ST_Y(the_geom) as lat,comment,cartodb_id as id,date,type FROM puntos";
  if(bounds){
    query += " WHERE the_geom @ ST_MakeEnvelope(" + bounds.getWest() + "," + bounds.getNorth() + "," + bounds.getEast() + ", " + bounds.getSouth() + ", 4326)";
  }

  $.getJSON( CARTO + query, function(data) {
    var json;
    var properties;

    var featureCollection = {
      "type": "FeatureCollection",
      "features": []
    };

    for(var i = 0; i < data.rows.length; i++){
      try{
        json = data.rows[i];
        properties = buildProperties(json.comment);
        properties.type = json.type;
        properties.date = json.date.substring(0,10);
        properties. gid = json.id;

        featureCollection.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [json.lng, json.lat]
          },
          "properties": properties
        });
      }catch(err){
        console.log("error", err);
      }
    }

    callback(featureCollection);
  });
};


function getRoutes(bounds, callback){
  var query = "SELECT *,ST_AsGeoJSON(the_geom) as geojson FROM rutas";
  if(bounds){
    query += " WHERE the_geom @ ST_MakeEnvelope(" + bounds.getWest() + "," + bounds.getNorth() + "," + bounds.getEast() + ", " + bounds.getSouth() + ", 4326)";
  }

  $.getJSON( CARTO + query, function(data) {
    var propertiesValues = ["ruta_tiempo","ruta_rapida","ruta_segura","ruta_amigable","ruta_neutral","ruta_acompanantes","ruta_bicipublica","ruta_multimodal"];
    var properties;
    var json;

    var featureCollection = {
      "type": "FeatureCollection",
      "features": []
    };

    for(var i = 0; i < data.rows.length; i++){
      json = data.rows[i];
      properties = buildProperties(json.comment);

      //properties.ruta_motivo = routesUtils.parseMotivo(json.ruta_motivo);
      properties.ruta_motivo = json.ruta_motivo;

      properties.ruta_frecuencia = parseFrecuencia(json.ruta_frecuencia);
      properties.date = json.created_at.substring(0,10);
      properties.gid = json.cartodb_id;

      for( var j = 0; j < propertiesValues.length; j++){
        properties[propertiesValues[j]] = json[propertiesValues[j]];
      }

      featureCollection.features.push({
        "type": "Feature",
        "geometry": JSON.parse(json.geojson),
        "properties": properties
      });

    }

    callback(featureCollection);
  });
};


function getZones(bounds, callback){
  var query = "SELECT *,ST_AsGeoJSON(the_geom) as geojson FROM zonas";
  if(bounds){
    query += " WHERE the_geom @ ST_MakeEnvelope(" + bounds.getWest() + "," + bounds.getNorth() + "," + bounds.getEast() + ", " + bounds.getSouth() + ", 4326)";
  }

  $.getJSON( CARTO + query, function(data) {
    var propertiesValues = ["zona_agradable","zona_comercio","zona_comoda","zona_conectada","zona_desagradable","zona_incomoda","zona_insegura","zona_no_conectada","zona_no_iluminada","zona_no_mantenimiento","zona_transito", "cartodb_id"];
    var properties;
    var json;

    var featureCollection = {
      "type": "FeatureCollection",
      "features": []
    };

    for(var i = 0; i < data.rows.length; i++){
      json = data.rows[i];
      properties = buildProperties(json.comment);
      properties.date = json.created_at.substring(0,10);
      properties.gid = json.cartodb_id;

      for( var j = 0; j < propertiesValues.length; j++){
        properties[propertiesValues[j]] = json[propertiesValues[j]];
      }

      featureCollection.features.push({
        "type": "Feature",
        "geometry": JSON.parse(json.geojson),
        "properties": properties
      });
    }

    callback(featureCollection);
  });
};

function buildProperties(comment_line){
  var delimiter = "/////";
  var field_delimiter = "\":\"";

  var fields_list = comment_line.split(delimiter);

  var properties = {};
  for( var i = 0; i < fields_list.length; i++ ){
    var fields = fields_list[i].split(field_delimiter);

    if( fields.length === 2 ){
      var key = fields[0].replace(/"/g,'').toLowerCase();
      while( key.slice(-1) === " " ){
        key = key.substring(0, key.length - 1);
      }

      var value = fields[1].replace(/"/g,'');

      properties[key] = value;
    }else if( fields.length === 1 ){
      if( fields[0] && fields[0].length > 0)
      properties["Comentario"] = fields[0];
    }
  }

  return properties;
}

function parseFrecuencia(target){
  switch (target) {
    case 1:
    return "Una vez al mes";
    case 2:
    return "Dos veces al mes";
    case 3:
    return "Tres veces al mes";
    case 4:
    return "Una vez por semana";
    case 5:
    return "Dos veces por semana";
    case 6:
    return "Tres veces por semana";
    case 7:
    return "Cuatro veces por semana";
    case 8:
    return "Cinco veces por semana";
    case 9:
    return "Seis veces por semana";
    case 10:
    return "Siete veces por semana";
    case 11:
    return "Dos veces al día";
    case 12:
    return "Tres veces al día";
    case 13:
    return "Cuatro veces al día";
    default:
    console.error("Error: frecuency not found - ", target);
    return "";
  }
}
