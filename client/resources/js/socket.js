/*global io*/
var socket = io();


socket.on("getPoints", function (featureCollection) {
    window.paintPoints(featureCollection);
});

socket.on("getRoutes", function (featureCollection) {
    window.paintRoutes(featureCollection);
});

socket.on("getZones", function (featureCollection) {
    window.paintZones(featureCollection);
});

window.insertPoint = function(geojson){
    socket.emit("insertPoint", geojson);
};

window.insertRoute = function(geojson){
    socket.emit("insertRoute", geojson);
};

window.insertZone = function(geojson){
    socket.emit("insertZone", geojson);
};

socket.on("insertedZone", function (geojson) {
    window.insertedZone(geojson);
});

socket.on("insertedPoint", function (geojson) {
    window.insertedPoint(geojson);
});

socket.on("insertedRoute", function (geojson) {
    window.insertedRoute(geojson);
});

var type = "shp";

window.downloadPoints = function(){
    socket.emit("downloadPoints", type);
};

window.downloadRoutes = function(){
    
    
    socket.emit("downloadRoutes", type);
    
    
};

window.downloadZones = function(){
    socket.emit("downloadZones", type);
};

socket.on("downloadPoints", function(geojson){
    sendFile(geojson, "repubikla-puntos.json");
});


socket.on("downloadRoutes", function(geojson){
    //shpwrite.zip(geojson);
    sendFile(geojson, "repubikla-rutas.json");
    
    /*
    
    var url = "https://ogre.adc4gis.com/convertJson";
    var key = "json";
    var data = JSON.stringify(geojson);
    
    var form = $('<form></form>').attr('action', url).attr('method', 'post');
    
    // Add the one key/value
    form.append($("<input></input>").attr('type', 'hidden').attr('name', key).attr('value', data));
    form.append($("<input></input>").attr('type', 'hidden').attr('name', "outputName").attr('value', "repubikla-rutas.zip"));
    
    //send request
    form.appendTo('body').submit().remove();
    */
    
    /*
    
    $.post("https://ogre.adc4gis.com/convertJson", {json: JSON.stringify(geojson), outputName:"repubikla-rutas"}, function(result){
        
        console.log(result);
        
        
    });
    */
});

socket.on("downloadZones", function(geojson){
    sendFile(geojson, "repubikla-zonas.json");
});

function sendFile(geojson, filename){
    var text = JSON.stringify(geojson);
    
    var file = new File([text], filename, { type: "application/json;charset=utf-8" });
    saveAs(file);
}

/*global $ moment L saveAs File*/