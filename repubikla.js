//dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var cartodb = require("./cartoDB");
var path = require('path');
var io = require('socket.io')(http);

//setup
app.set('port', process.env.PORT || 22345);
app.use(express.static(path.join(__dirname, 'client'))); //make resources public


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
    
    socket.on("downloadPoints", function(type){
        cartodb.getPoints(function(featureCollection){
            socket.emit("downloadPoints", featureCollection);
        });
    });
    
    socket.on("downloadRoutes", function(type){
        cartodb.getRoutes(function(featureCollection){
            socket.emit("downloadRoutes", featureCollection);
        });
    });
    
    socket.on("downloadZones", function(type){
        cartodb.getZones(function(featureCollection){
            socket.emit("downloadZones", featureCollection);
        });
    });
    
    
    socket.on("insertPoint", function(geojson){
        cartodb.insertPoint(geojson, function(geojsonResponse){
            socket.emit("insertedPoint", geojsonResponse);
        });
    });
    
    socket.on("insertRoute", function(geojson){
        cartodb.insertRoute(geojson, function(geojsonResponse){
            socket.emit("insertedRoute", geojsonResponse);
        });
    });
    
    socket.on("insertZone", function(geojson){
        cartodb.insertZone(geojson, function(geojsonResponse){
            socket.emit("insertedZone", geojsonResponse);
        });
    });
    
});

//start
http.listen(app.get('port'), function(){
  console.log('repubikla on port ' + app.get('port'));
});
