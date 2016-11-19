// dependencies
var gjv = require("geojson-validation");
var cartoDB = require("cartodb");
var config = require('config');
var routesUtils = require("./utils/routesUtils.js");


var sql = new cartoDB.SQL({user: config.get('user'), api_key: config.get('api_key')});


var getPoints = function(callback){
    sql.execute("SELECT ST_X(the_geom) as lng, ST_Y(the_geom) as lat,comment,cartodb_id as id,date,type FROM puntos").done(function(data) {
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


var getRoutes = function(callback){
    sql.execute("SELECT *,ST_AsGeoJSON(the_geom) as geojson FROM rutas").done(function(data) {
        
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
            properties.ruta_motivo = routesUtils.parseMotivo(json.ruta_motivo);
            properties.ruta_frecuencia = routesUtils.parseFrecuencia(json.ruta_frecuencia);
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


var getZones = function(callback){
    sql.execute("SELECT *,ST_AsGeoJSON(the_geom) as geojson FROM zonas").done(function(data) {
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


var getRoutesDf = function(res){
    sql.execute("SELECT *,ST_AsGeoJSON(the_geom) as geojson FROM rutas WHERE ST_Contains((SELECT the_geom from dfcontorno), the_geom)").done(function(data) {
        
        var propertiesValues = ["ruta_tiempo","ruta_rapida","ruta_segura","ruta_amigable","ruta_neutral","ruta_acompanantes","ruta_bicipublica","ruta_multimodal","cartodb_id"];
        var features = [];
        var properties;
        var json;
        for(var i = 0; i < data.rows.length; i++){
            json = data.rows[i];
            properties = buildProperties(json.comment);
            properties.ruta_motivo = routesUtils.parseMotivo(json.ruta_motivo);
            properties.ruta_frecuencia = routesUtils.parseFrecuencia(json.ruta_frecuencia);
            properties.date = json.created_at.substring(0,10);
            
            for( var j = 0; j < propertiesValues.length; j++){
                properties[propertiesValues[j]] = json[propertiesValues[j]];
            }
            
            features.push({
                "type": "Feature",
                "geometry": JSON.parse(json.geojson),
                "properties": properties
            });
        }
        
        res.status(200).send(features);
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


function propertiesToline(properties){
    console.log(properties);
    
    var delimiter = "/////";
    var field_delimiter = "\":\"";
    
    var line = [];
    var comment = "";
    var excluded = ["type", "date"];
    
    for( var key in properties ){
        console.log(key);
        if( key === "Comentario" ){
            comment = properties[key];
            continue;
        }else if( excluded.indexOf(key) > -1 ) continue;
        
        line.push( "\"" + key + field_delimiter + properties[key] + "\"");
        line.push(delimiter);
    }

    if( comment.length > 0 ){
        line.push(comment);
    }else{
        line.pop();
    }

    return line.join("");
}


function insertPoint(point, callback){
    console.log("inserting point");
    
    if(gjv.valid(point)){
        var geojson = point;
        var comment = propertiesToline(geojson.properties);
        
        
        var query = "INSERT INTO puntos(the_geom,date,type,comment) VALUES (ST_SetSRID(ST_GeomFromGeoJSON('";
    	query += JSON.stringify(geojson.geometry) + "'),4326),'" + geojson.properties.date + "','" + geojson.properties.type + "','" + comment + "')";
    	query += " RETURNING cartodb_id";
    	console.log(query);
    	
    	sql.execute(query).done(function(data) {
            geojson.properties.gid = data.rows[0].cartodb_id;
            
            console.log("inserted point", geojson.properties.gid);
            callback(geojson);
        }).error(function(info){
            console.log("error inserting point", info);
            geojson.properties.gid = -1;
            
            callback(geojson);
        });
        
    }
}


function insertRoute(route, callback){
    console.log("inserting route");
    
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
        
        var comment = propertiesToline(properties);
        
        var query = "INSERT INTO rutas(the_geom,ruta_motivo,ruta_tiempo,ruta_frecuencia,ruta_acompanantes,ruta_rapida,ruta_segura,ruta_amigable,ruta_neutral,ruta_bicipublica,ruta_multimodal,comment) VALUES ";
        query += "(ST_SetSRID(ST_GeomFromGeoJSON('" + JSON.stringify(route.geometry) + "'),4326),'" + ruta_motivo + "'," + ruta_tiempo + "," + ruta_frecuencia + "," + ruta_acompanantes + "," + values.join(",");
        query += ",'" + comment + "')";
    	query += " RETURNING cartodb_id";
    	
    	geojson.properties = propertiesAux;
    	
    	sql.execute(query).done(function(data) {
            geojson.properties.gid = data.rows[0].cartodb_id;
            
            callback(geojson);
        }).error(function(info){
            console.log("error inserting route", info);
            geojson.properties.gid = -1;
            
            callback(geojson);
        });
    }
}


function insertZone(zone, callback){
    console.log("inserting zone", zone);
    
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
        
        var comment = propertiesToline(properties);
        
        var query = "INSERT INTO zonas(the_geom, zona_agradable,zona_comercio,zona_comoda,zona_conectada,zona_desagradable,zona_incomoda,zona_insegura,zona_no_conectada,zona_no_iluminada,zona_no_mantenimiento,zona_transito,comment) VALUES ";
        query += "(ST_SetSRID(ST_GeomFromGeoJSON('" + JSON.stringify(zone.geometry) + "'),4326)," + values.join(",");
        query += ",'" + comment + "')";
    	query += " RETURNING cartodb_id";
    	
    	geojson.properties = propertiesAux;
    	sql.execute(query).done(function(data) {
            geojson.properties.gid = data.rows[0].cartodb_id;
            
            callback(geojson);
        }).error(function(info){
            console.log("error inserting zone", info);
            geojson.properties.gid = -1;
            
            callback(geojson);
        });
    }
}


module.exports = {
    getPoints: getPoints,
    getRoutes: getRoutes,
    getZones: getZones,
    getRoutesDf: getRoutesDf,
    insertPoint: insertPoint,
    insertRoute: insertRoute,
    insertZone: insertZone
};