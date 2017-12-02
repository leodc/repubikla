var FILE_NAME_ZONE = "repubikla-zonas.geojson",
    GEOMETRY_TYPE_ZONE = "Polygon",
    PREFIX_GEOM_TEXT_ZONE = "MULTIPOLYGON(((";

    /*
        Entry example:
        {"zona_agradable":false,"zona_comercio":false,"zona_comoda":false,"zona_conectada":false,"zona_desagradable":true,
        "zona_incomoda":false,"zona_insegura":false,"zona_no_conectada":false,"zona_no_iluminada":false,"zona_no_mantenimiento":true,
        "zona_transito":true,"comment":"",
        "the_geom":"0106000020E61000000100000001030000000100000005000000921F134685CB58C0D7A86448CE6C3340931F139A5ECB58C02EBB1E6A406B3340931F1392D0CA58C0EDF19DBDFC6B3340931F136A07CB58C0FB481F6EAA6D3340921F134685CB58C0D7A86448CE6C3340",
        "cartodb_id":4,"created_at":"2015-04-18T22:59:56Z","updated_at":"2015-04-18T22:59:56Z",
        "the_geom_webmercator":"0106000020110F0000010000000103000000010000000500000023268684F30E65C1DF4A7DF5B7D24041B76E73ACD20E65C110340EA951D140411738E40B5A0E65C1BA9C4941FBD14041756111A0880E65C1CA1BAD377ED3404123268684F30E65C1DF4A7DF5B7D24041",
        "the_geom_text":"MULTIPOLYGON(((-99.1800093828918 19.4250226255179,-99.1776490389587 19.4189516377475,-99.1689801394225 19.4218252668961,-99.1723275362731 19.4283818079357,-99.1800093828918 19.4250226255179)))"}
    */

function saveZoneGeoJSON() {
    $.get("https://repubikla.cartodb.com/api/v2/sql?q=select%20*,ST_AsText(the_geom)%20as%20the_geom_text%20from%20public.zonas", function (data) {

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
                features.push(buildGeoJSONZone(geoJSON));
            }

            var blob = new Blob([JSON.stringify(geoJSON_array)], { type: "application/json;charset=utf-8" });
            saveAs(blob, FILE_NAME_ZONE);
        });
    });
}


function buildGeoJSONZone(geoJSON_data){
    var object = {};
    var geometry = {};
    var properties = {};
    
    //Default
    object.type = "Feature";

    //Geometry
    geometry.type = GEOMETRY_TYPE_ZONE;
    geometry.coordinates = getCoordsZone(geoJSON_data.the_geom_text);


    //Properties
    properties.type = geoJSON_data.type;
    properties.date = getDateDMY(geoJSON_data.created_at);
    
    //Ruta Properties
    properties.zona_agradable = geoJSON_data.zona_agradable;
    properties.zona_comercio = geoJSON_data.zona_comercio;
    properties.zona_comoda = geoJSON_data.zona_comoda;
    properties.zona_conectada = geoJSON_data.zona_conectada;
    properties.zona_desagradable = geoJSON_data.zona_desagradable;
    properties.zona_incomoda = geoJSON_data.zona_incomoda;
    properties.zona_insegura = geoJSON_data.zona_insegura;
    properties.zona_no_conectada = geoJSON_data.zona_no_conectada;
    properties.zona_no_iluminada = geoJSON_data.zona_no_iluminada;
    properties.zona_no_mantenimiento = geoJSON_data.zona_no_mantenimiento;
    properties.zona_transito = geoJSON_data.zona_transito;
    
    //Personalized properties
    buildPropertiesZone(properties, geoJSON_data.comment);

    //Build
    object.geometry = geometry;
    object.properties = properties;

    return object;
}


function buildPropertiesZone(properties, comment_line){
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


function getCoordsZone(the_geom_text){
    //MULTIPOLYGON(((-99.1800093828918 19.4250226255179,-99.1776490389587 19.4189516377475,-99.1689801394225 19.4218252668961,-99.1723275362731 19.4283818079357,-99.1800093828918 19.4250226255179)))
    var coords = [];
    var text_aux = the_geom_text.replace(PREFIX_GEOM_TEXT_ZONE,'').replace(")))",'');

    //-99.1800093828918 19.4250226255179,-99.1776490389587 19.4189516377475,-99.1689801394225 19.4218252668961,-99.1723275362731 19.4283818079357,-99.1800093828918 19.4250226255179
    var aux = text_aux.split(",");

    //["-99.1800093828918 19.4250226255179"],["-99.1776490389587 19.4189516377475"],["-99.1689801394225 19.4218252668961"],["-99.1723275362731 19.4283818079357"],["-99.1800093828918 19.4250226255179"]
    var array_aux;
    var coords_level = [];
    for (var i = 0; i < aux.length; i ++ ){
        array_aux = aux[i].split(" ");
        coords_level.push([parseFloat(array_aux[0]),parseFloat(array_aux[1])]);
    }

    coords.push(coords_level);

    console.log(coords);
    return coords;
}


function getDateDMY(date){
    return date.substring(0, 10);
}
