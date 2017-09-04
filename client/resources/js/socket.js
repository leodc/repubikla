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

    //shpwrite.zip(geojson);
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
}

function sendFile(geojson, filename){
    var text = JSON.stringify(geojson);

    var file = new File([text], filename, { type: "application/json;charset=utf-8" });
    saveAs(file);
}

/*global $ moment L saveAs File*/
