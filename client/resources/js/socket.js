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

window.downloadPoints = function(){
    socket.emit("downloadPoints");
};

window.downloadRoutes = function(){
    socket.emit("downloadRoutes");
};

window.downloadZones = function(){
    socket.emit("downloadZones");
};

socket.on("downloadPoints", function(geojson){
    sendFile(geojson, "repubikla-puntos.json");
});

socket.on("downloadRoutes", function(geojson){
    sendFile(geojson, "repubikla-rutas.json");
});

socket.on("downloadZones", function(geojson){
    sendFile(geojson, "repubikla-zonas.json");
});

function sendFile(geojson, filename){
    var text = JSON.stringify(geojson);
    
    var file = new File([text], filename, { type: "application/json;charset=utf-8" });
    saveAs(file);
}

/*global L saveAs File*/