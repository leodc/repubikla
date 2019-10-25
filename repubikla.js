//dependencies
var express = require("express");
var app = express();
var http = require("http").Server(app);
var path = require("path");
var io = require('socket.io')(http);
var carto = require("./config/carto");

//setup
app.set("port", process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, "client")));
app.set("view engine", "pug");

// routing
app.get("/", function (req, res) {
  res.render("index");
});

// sockets
io.on('connection', function(socket){

  socket.on("insertPoint", carto.insertPoint);

  socket.on("insertRoute", function(geojson, callback){
    carto.insertRoute(geojson, function(geojsonResponse){
      callback(geojsonResponse);
    });
  });

  socket.on("insertZone", function(geojson, callback){
    carto.insertZone(geojson, function(geojsonResponse){
      callback(geojsonResponse);
    });
  });

});

//start
http.listen(app.get("port"), function(){
  console.log("repubikla on port " + app.get("port"));
});
