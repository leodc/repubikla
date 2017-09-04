//dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var cartodb = require("./cartoDB");
var path = require('path');
var io = require('socket.io')(http);

//setup
app.set('port', process.env.PORT || 22345);
app.use(express.static(path.join(__dirname, 'client')));


//sockets
io.on('connection', function(socket){

    cartodb.getPoints(function(featureCollection){
        socket.emit("getPoints", featureCollection);
    });

    cartodb.getRoutes(function(featureCollection){
        socket.emit("getRoutes", featureCollection);
    });

    cartodb.getZones(function(featureCollection){
        socket.emit("getZones", featureCollection);
    });

    socket.on("downloadPoints", function(type, callback){
        cartodb.getPoints(function(featureCollection){
            callback(featureCollection);
        });
    });

    socket.on("downloadRoutes", function(type, callback){
        cartodb.getRoutes(function(featureCollection){
            callback(featureCollection);
        });
    });

    socket.on("downloadZones", function(type, callback){
        cartodb.getZones(function(featureCollection){
            callback(featureCollection);
        });
    });

    socket.on("insertPoint", function(geojson, callback){
        cartodb.insertPoint(geojson, function(geojsonResponse){
            callback(geojsonResponse);
        });
    });

    socket.on("insertRoute", function(geojson, callback){
        cartodb.insertRoute(geojson, function(geojsonResponse){
            callback(geojsonResponse);
        });
    });

    socket.on("insertZone", function(geojson, callback){
        cartodb.insertZone(geojson, function(geojsonResponse){
            callback(geojsonResponse);
        });
    });

});

//start
http.listen(app.get('port'), function(){
  console.log('repubikla on port ' + app.get('port'));
});
