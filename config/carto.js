// dependencies
var gjv = require("geojson-validation");
var cartoDB = require("cartodb");
var featuresUtils = require("../client/js/features/utils");

var sql = new cartoDB.SQL({user: process.env.CARTO_USER, api_key: process.env.CARTO_API_KEY});

function execute(geojson, query, callback){
  sql.execute(query).done(function(data) {
    geojson.properties.gid = data.rows[0].cartodb_id;

    console.log("inserted " + JSON.stringify(geojson));

    callback(null, geojson);
  }).error(function(info){
    geojson.properties.gid = -1;

    console.log("error inserting " + geojson.geometry.type, info);

    callback({error: "can't insert " + geojson.geometry.type, details: info}, geojson);
  });
}


function insertPoint(point, callback){
  if(gjv.valid(point)){
    var geojson = point;
    var comment = featuresUtils.propertiesToline(geojson.properties);

    var query = "INSERT INTO puntos(the_geom,date,type,comment) VALUES (ST_SetSRID(ST_GeomFromGeoJSON('";
    query += JSON.stringify(geojson.geometry) + "'),4326),'" + geojson.properties.date + "','" + geojson.properties.type + "','" + comment + "')";
    query += " RETURNING cartodb_id";

    execute(geojson, query, callback);
  }
}


function insertRoute(route, callback){
  if(gjv.valid(route)){
    var geojson = route;
    var properties = geojson.properties;
    var propertiesAux = {};

    for( var key in properties ){
      propertiesAux[key] = properties[key];
    }

    var ruta_motivo = properties.ruta_motivo;
    var ruta_frecuencia = properties.ruta_frecuencia;
    var ruta_tiempo = properties.ruta_tiempo;
    var ruta_acompanantes = properties.ruta_acompanantes;

    delete properties.ruta_tiempo;
    delete properties.ruta_frecuencia;
    delete properties.ruta_motivo;
    delete properties.ruta_acompanantes;
    delete properties.date;


    var catalog = ["ruta_rapida","ruta_segura","ruta_amigable","ruta_neutral","ruta_bicipublica","ruta_multimodal"];
    var values = [];

    for( var i = 0; i < catalog.length; i++){
      key = catalog[i];

      if( route.properties[key] ){
        values.push("true");
      }else{
        values.push("false");
      }

      delete properties[key];
    }

    var comment = featuresUtils.propertiesToline(properties);

    var query = "INSERT INTO rutas(the_geom,ruta_motivo,ruta_tiempo,ruta_frecuencia,ruta_acompanantes,ruta_rapida,ruta_segura,ruta_amigable,ruta_neutral,ruta_bicipublica,ruta_multimodal,comment) VALUES ";
    query += "(ST_SetSRID(ST_GeomFromGeoJSON('" + JSON.stringify(route.geometry) + "'),4326),'" + ruta_motivo + "'," + ruta_tiempo + "," + ruta_frecuencia + "," + ruta_acompanantes + "," + values.join(",");
    query += ",'" + comment + "')";
    query += " RETURNING cartodb_id";

    geojson.properties = propertiesAux;

    execute(geojson, query, callback);
  }
}


function insertZone(zone, callback){
  if(gjv.valid(zone)){
    var geojson = zone;
    var properties = geojson.properties;
    var propertiesAux = {};

    for( var key in properties ){
      propertiesAux[key] = properties[key];
    }

    delete properties.date;

    var catalog = ["zona_agradable","zona_comercio","zona_comoda","zona_conectada","zona_desagradable","zona_incomoda","zona_insegura","zona_no_conectada","zona_no_iluminada","zona_no_mantenimiento","zona_transito"];
    var values = [];

    for( var i = 0; i < catalog.length; i++){
      key = catalog[i];

      if( zone.properties[key] ){
        values.push("true");
      }else{
        values.push("false");
      }

      delete properties[key];
    }

    var comment = featuresUtils.propertiesToline(properties);

    var query = "INSERT INTO zonas(the_geom, zona_agradable,zona_comercio,zona_comoda,zona_conectada,zona_desagradable,zona_incomoda,zona_insegura,zona_no_conectada,zona_no_iluminada,zona_no_mantenimiento,zona_transito,comment) VALUES ";
    query += "(ST_SetSRID(ST_GeomFromGeoJSON('" + JSON.stringify(zone.geometry) + "'),4326)," + values.join(",");
    query += ",'" + comment + "')";
    query += " RETURNING cartodb_id";

    geojson.properties = propertiesAux;

    execute(geojson, query, callback);
  }
}


module.exports = {
  insertPoint: insertPoint,
  insertRoute: insertRoute,
  insertZone: insertZone
};
