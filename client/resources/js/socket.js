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
  socket.emit("insertPoint", geojson, (geojsonResponse)=>{
    window.insertedPoint(geojsonResponse);
  });
};

window.insertRoute = function(geojson){
  socket.emit("insertRoute", geojson, (geojsonResponse)=>{
    window.insertedRoute(geojsonResponse);
  });
};

window.insertZone = function(geojson){
  socket.emit("insertZone", geojson, (geojsonResponse)=>{
    window.insertedZone(geojsonResponse);
  });
};

window.downloadData = function(buttonID, dataType){
  var type = "shp";
  
  $("#" + buttonID).button("loading");

  var filename = "repubikla-" + dataType + ".json";
  var eventName = buttonID;

  socket.emit(eventName, type, (geojson)=>{
    sendFile(geojson, filename);
    $("#" + buttonID).button("reset");
  });
}

function sendFile(geojson, filename){
  var text = JSON.stringify(geojson);
  var file = new File([text], filename, { type: "application/json;charset=utf-8" });
  saveAs(file);
}

function downloadCsv(filename, csvContent){
  var blob = new Blob([csvContent], {type: "text/plain;charset=utf-8"});
  saveAs(blob, filename + ".csv");
}

/*global $ moment L saveAs File*/
