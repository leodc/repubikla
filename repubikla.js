//dependencies
var express = require("express");
var app = express();
var http = require("http").Server(app);
var path = require("path");

//setup
app.set("port", process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, "client")));
app.set("view engine", "pug");

// routing
app.get("/", function (req, res) {
  res.render("index");
});

//start
http.listen(app.get("port"), function(){
  console.log("repubikla on port " + app.get("port"));
});
