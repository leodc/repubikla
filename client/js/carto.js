function getPoints(bounds, callback){
  var query = "SELECT ST_X(the_geom) as lng, ST_Y(the_geom) as lat,comment,cartodb_id as id,date,type FROM puntos";
  if(bounds){
    query += " WHERE the_geom @ ST_MakeEnvelope(" + bounds.getWest() + "," + bounds.getNorth() + "," + bounds.getEast() + ", " + bounds.getSouth() + ", 4326)";
  }

  $.getJSON( CARTO_API_QUERY_HOST + query, function(data) {
    var json;
    var properties;

    var featureCollection = {
      "type": "FeatureCollection",
      "features": []
    };

    for(var i = 0; i < data.rows.length; i++){
      try{
        json = data.rows[i];
        properties = featuresUtils.buildProperties(json.comment);
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

  $.getJSON( CARTO_API_QUERY_HOST + query, function(data) {
    var propertiesValues = ["ruta_tiempo","ruta_rapida","ruta_segura","ruta_amigable","ruta_neutral","ruta_acompanantes","ruta_bicipublica","ruta_multimodal"];
    var properties;
    var json;

    var featureCollection = {
      "type": "FeatureCollection",
      "features": []
    };

    for(var i = 0; i < data.rows.length; i++){
      json = data.rows[i];
      properties = featuresUtils.buildProperties(json.comment);

      //properties.ruta_motivo = routesUtils.parseMotivo(json.ruta_motivo);
      properties.ruta_motivo = json.ruta_motivo;

      properties.ruta_frecuencia = featuresUtils.parseFrecuencia(json.ruta_frecuencia);
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

  $.getJSON( CARTO_API_QUERY_HOST + query, function(data) {
    var propertiesValues = ["zona_agradable","zona_comercio","zona_comoda","zona_conectada","zona_desagradable","zona_incomoda","zona_insegura","zona_no_conectada","zona_no_iluminada","zona_no_mantenimiento","zona_transito", "cartodb_id"];
    var properties;
    var json;

    var featureCollection = {
      "type": "FeatureCollection",
      "features": []
    };

    for(var i = 0; i < data.rows.length; i++){
      json = data.rows[i];
      properties = featuresUtils.buildProperties(json.comment);
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
