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
