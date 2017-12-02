var data_type = "POINT",
    FILE_NAME = "repubikla-puntos.geojson",
    FILE_NAME_CSV = "repubikla-puntos.csv",
    GEOMETRY_TYPE = "Point",
    PREFIX_GEOM_TEXT = "POINT(";


function saveGeoJSON() {
    $.get("https://repubikla.cartodb.com/api/v2/sql?q=select%20*,ST_AsText(the_geom)%20as%20the_geom_text%20from%20public.puntos", function (data) {

        $.getScript("resources/FileSaver.min.js", function (data_script, textStatus, jqxhr) {
            var rows = data.rows;

            var geoJSON;

            //FeatureCollection de salida
            var geoJSON_array = {};

            geoJSON_array.type = "FeatureCollection";
            geoJSON_array.features = [];
            var features = geoJSON_array.features;

            for (var i = 0; i < rows.length; i++) {
                geoJSON = rows[i];
                features.push(buildGeoJSON(geoJSON));
            }

            var blob = new Blob([JSON.stringify(geoJSON_array)], { type: "application/json;charset=utf-8" });
            saveAs(blob, FILE_NAME);
        });
    });
}


function saveCsv() {
    var delimiter = ",";
    var lineEnding = "\r\n";
    var aux;
    $.get("https://repubikla.cartodb.com/api/v2/sql?q=select%20*,ST_AsText(the_geom)%20as%20the_geom_text,ST_X(the_geom)%20as%20lng,ST_Y(the_geom)%20as%20lat%20from%20public.puntos", function (data) {
        var rows = data.rows;
        var headers = ["lat","lng","type","date","comment","fuente"];
        var csvData = [];
        
        for (var i = 0; i < rows.length; i++) {
            var commentHeaders = getCommentHeaders(rows[i].comment);
            
            for(var j = 0; j < commentHeaders.length; j++){
                aux = commentHeaders[j];
                if( headers.indexOf(commentHeaders[j]) < 0 ){
                    headers.push(aux);
                }
            }
        }
        
        $.getScript("resources/FileSaver.min.js", function (data_script, textStatus, jqxhr) {
            var geoJSON;
            var record;
            
            for (var i = 0; i < rows.length; i++) {
                geoJSON = buildGeoJSON(rows[i]);
                
                record = rows[i].lat + delimiter;
                record += rows[i].lng + delimiter;
                
                for(var j = 2; j < headers.length; j++){
                    if(geoJSON.properties[headers[j]]){
                        aux = geoJSON.properties[headers[j]].replace(/"/g, "'").replace(/\n/g,", ");
                        record += "\"" + aux + "\"";
                    }
                    
                    if( j < headers.length - 1){
                        record += delimiter;
                    }
                }
                record += lineEnding;
                csvData.push(record);
            }
            
            var dataFile = headers.join(",");
            dataFile += lineEnding;
            dataFile += csvData.join("");
            
            var blob = new Blob([dataFile], { type: "text/plain;charset=utf-8" });
            saveAs(blob, FILE_NAME_CSV);
        });
    });
}


function buildGeoJSON(geoJSON_data){
    var object = {};
    var geometry = {};
    var properties = {};
    
    //Default
    object.type = "Feature";

    //Geometry
    geometry.type = GEOMETRY_TYPE;
    geometry.coordinates = getCoords(geoJSON_data.the_geom_text);


    //Properties
    properties.type = geoJSON_data.type;
    properties.date = getDateDMY(geoJSON_data.date);
    buildProperties(properties, geoJSON_data.comment);

    //Build
    object.geometry = geometry;
    object.properties = properties;

    return object;
}


function buildProperties(properties, comment_line){
    var delimiter = "/////";
    var field_delimiter = "\":\"";

    var fields_list = comment_line.split(delimiter);

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
            properties.comment = fields[0];
        }
    }
}


function getCommentHeaders(comment_line){
    var delimiter = "/////";
    var field_delimiter = "\":\"";
    var key;
    var fields_list = comment_line.split(delimiter);
    
    var headers = [];
    for( var i = 0; i < fields_list.length; i++ ){
        var fields = fields_list[i].split(field_delimiter);

        if( fields.length === 2 ){
            key = fields[0];
            while( key.slice(-1) === " " ){
                key = key.substring(0, key.length - 1);
            }
            headers.push(key.replace(/"/g,'').toLowerCase());
        }
    }
    
    return headers;
}


function getCoords(the_geom_text){
    var coords = [];

    var str_split = the_geom_text.split(" ");

    var start = PREFIX_GEOM_TEXT.length;

    var lat = str_split[0].substring( start , str_split[0].length-1);
    var lng = str_split[1].substring(0, str_split[0].length - 2);

    coords.push(parseFloat(lat));
    coords.push(parseFloat(lng));

    return coords;
}


function getDateDMY(date){
    return date.substring(0, 10);
}

/* 
    global $
    global saveAs
    global Blob
*/