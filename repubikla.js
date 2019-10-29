//dependencies
var express = require("express");
var app = express();
var http = require("http").Server(app);
var path = require("path");
var io = require("socket.io")(http);
var carto = require("./config/carto");
var ejs = require("ejs");

//setup
app.set("port", process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, "client")));
app.set("view engine", "ejs");

console.log(process.env.CARTO_API_QUERY_HOST);

// routing
app.get("/", function (req, res) {
  res.render("index", { CARTO_API_QUERY_HOST: process.env.CARTO_API_QUERY_HOST });
});

// sockets
io.on('connection', function(socket){

  socket.on("insertPoint", carto.insertPoint);

  socket.on("insertRoute", carto.insertRoute);

  socket.on("insertZone", carto.insertZone);

});

//start
http.listen(app.get("port"), function(){
  console.log("repubikla on port " + app.get("port"));
});
