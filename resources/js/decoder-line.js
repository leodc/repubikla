var FILE_NAME_LINESTRING = "repubikla-rutas.geojson",
    GEOMETRY_TYPE_LINESTRING = "LineString",
    PREFIX_GEOM_TEXT_LINESTRING = "MULTILINESTRING((";


function saveRutasGeoJSON() {
    $.get("https://repubikla.cartodb.com/api/v2/sql?q=select%20*,ST_AsText(the_geom)%20as%20the_geom_text%20from%20public.rutas", function (data) {

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
                features.push(buildGeoJSONRutas(geoJSON));
            }

            var blob = new Blob([JSON.stringify(geoJSON_array)], { type: "application/json;charset=utf-8" });
            saveAs(blob, FILE_NAME_LINESTRING);
        });
    });
}


function buildGeoJSONRutas(geoJSON_data){
    var object = {};
    var geometry = {};
    var properties = {};
    
    //Default
    object.type = "Feature";

    //Geometry
    geometry.type = GEOMETRY_TYPE_LINESTRING;
    geometry.coordinates = getCoordsRutas(geoJSON_data.the_geom_text);


    //Properties
    properties.type = geoJSON_data.type;
    properties.date = getDateDMY(geoJSON_data.created_at);
    
    //Ruta Properties
    properties.ruta_acompanantes = geoJSON_data.ruta_acompanantes;
    properties.ruta_amigable = geoJSON_data.ruta_amigable;
    properties.ruta_bicipublica = geoJSON_data.ruta_bicipublica;
    properties.ruta_frecuencia = geoJSON_data.ruta_frecuencia;
    properties.ruta_motivo = geoJSON_data.ruta_motivo;
    properties.ruta_multimodal = geoJSON_data.ruta_multimodal;
    properties.ruta_neutral = geoJSON_data.ruta_neutral;
    properties.ruta_rapida = geoJSON_data.ruta_rapida;
    properties.ruta_segura = geoJSON_data.ruta_segura;
    properties.ruta_tiempo = geoJSON_data.ruta_tiempo;
    
    //Personalized properties
    buildPropertiesRutas(properties, geoJSON_data.comment);

    //Build
    object.geometry = geometry;
    object.properties = properties;

    return object;
}


function buildPropertiesRutas(properties, comment_line){
    var delimiter = "/////";
    var field_delimiter = "\":\"";

    var fields_list = comment_line.split(delimiter);

    for( var i = 0; i < fields_list.length; i++ ){
        var fields = fields_list[i].split(field_delimiter);

        if( fields.length === 2 ){
            var key = fields[0].replace(/"/g,'');
            var value = fields[1].replace(/"/g,'');

            properties[key] = value;
        }else if( fields.length === 1 ){
            properties.comment = fields[0];
        }
    }
}


function getCoordsRutas(the_geom_text){
    var coords = [];
    var text_aux = the_geom_text.replace(PREFIX_GEOM_TEXT_LINESTRING,'').replace("))",''); ////-103.364756246459 20.6804738863084,-103.364756246459 20.6804738863084

    var aux = text_aux.split(",");
    for (var i = 0; i < aux.length; i ++ ){
        var array_aux = aux[i].split(" ");
        coords.push([parseFloat(array_aux[0]),parseFloat(array_aux[1])]);
    }

    return coords;
}


function getDateDMY(date){
    return date.substring(0, 10);
}
