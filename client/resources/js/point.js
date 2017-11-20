window.pointDictionary = [
    "Incidente vial",
    "Asalto",
    "Robo de bicicleta en estacionamiento",
    "Robo de bicicleta estacionada en la calle",
    "Bicicleta blanca",
    "Cruce peligroso",
    "Diseño urbano peligroso",
    "Condiciones peligrosas",
    "Comercio/Servicio Bikefriendly",
    "Colectivo/Punto de encuentro",
    "Vehículos estacionados en carril confinado",
    "Vehículos en movimiento en carril confinado",
    "Comercio en carril confinado",
    "Invasión recurrente de banqueta"
];

var categorys = ["point-dark-red", "point-red", "point-black", "point-lightred", "point-purple", "point-orange", "point-other"];

var drawPoint, pruneCluster, addPointToLayer, markerList;

window.hidePruneCluster = function(){
    window.map.removeLayer(pruneCluster);
};

window.showPruneCluster = function(){
    window.map.addLayer(pruneCluster);
};


/**
 * Marker popup
 * */
function buildPointPopup(properties, suffix){
    var html = "<b>" + properties.type + "</b><br>";
    html += "<span style='color': gray>" + properties.date + "</span><br>";

    var excluded = ["type", "date", "georef", "lng", "lat", "x", "y", "c", "gid"];

    for( var key in properties ){
        if( excluded.indexOf(key) < 0 ){
            if(window.isUrl(properties[key])){
                html += '<br><b>' + key + ':</b> <a href="' + properties[key] + '" target=_blank>' + properties[key] + '</a>';
                continue;
            }else if ( /fuente[0-9]*/i.test(key) && properties[key].charAt(0) === "@"){
                html += '<br><b>' + key + ':</b> <a href="https://twitter.com/' + properties[key] + '" target=_blank>' + properties[key] + '</a>';
                continue;
            }
            html += "<br><b>" + key + ":</b> " + properties[key];
        }
    }

    if(suffix) {
        return html + suffix;
    }

    var text = properties.type + "%20" + properties.date;
    var urlToShare = window.baseUrl + "?p=" + properties.gid;

    var urlPrefix = "https://twitter.com/intent/tweet?text=" + text + "&via=repubikla&url=";
    var urlFbPrefix = "https://www.facebook.com/sharer/sharer.php?u=";

    html += "<p class='text-right'>";
    html += '<i class="fa fa-share-alt" aria-hidden="true" style="color: rgba(128,128,128,.5); font-weight:normal;">&nbsp;</i>';
    html += '<a href="' + urlPrefix + urlToShare + '" class="btn btn-xs btn-social-icon btn-twitter" style="color: white"><span class="fa fa-twitter"></span></a>';
    html += '<a href="' + urlFbPrefix + urlToShare + '" class="btn btn-xs btn-social-icon btn-facebook" style="color: white" onclick="javascript:window.open(this.href, \'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600\');return false;"><span class="fa fa-facebook"></span></a>';
    html += "</p>";

    return html;
}


/**
 * Marker style
 * */
window.getPointCategory = function(type){

    var darkred = ["Incidente vial", "Asalto"];
    var red = ["Robo de bicicleta en estacionamiento", "Robo de bicicleta estacionada en la calle"];
    var black = ["Bicicleta blanca"];
    var lightred = ["Cruce peligroso", "Diseño urbano peligroso", "Condiciones peligrosas"];
    var purple = ["Comercio/Servicio Bikefriendly", "Colectivo/Punto de encuentro"];
    var orange = ["Vehículos estacionados en carril confinado", "Vehículos en movimiento en carril confinado", "Comercio en carril confinado", "Invasión recurrente de banqueta"];

    if( darkred.indexOf(type) > - 1 ){
        return "point-dark-red";
    }else if( red.indexOf(type) > - 1 ){
        return "point-red";
    }else if( black.indexOf(type) > - 1 ){
        return "point-black";
    }else if( lightred.indexOf(type) > - 1 ){
        return "point-lightred";
    }else if( purple.indexOf(type) > - 1 ){
        return "point-purple";
    }else if( orange.indexOf(type) > - 1 ){
        return "point-orange";
    }else {
        return "point-other";
    }

};

function setCustomMarker(){

    var colors = [];
    var pi2 = Math.PI * 2;

    for(var i = 0; i < categorys.length; i++){
        colors.push( $("." + categorys[i]).css("background-color") );
    }

    L.Icon.MarkerCluster = L.Icon.extend({
        options: {
            iconSize: new L.Point(44, 44),
            className: 'prunecluster leaflet-markercluster-icon'
        },

        createIcon: function () {
            var e = document.createElement('canvas');
            this._setIconStyles(e, 'icon');
            var s = this.options.iconSize;
            e.width = s.x;
            e.height = s.y;
            this.draw(e.getContext('2d'), s.x, s.y);
            return e;
        },

        createShadow: function () {
            return null;
        },

        draw: function(canvas, width, height) {
            var start = 0;
            for (var i = 0, l = colors.length; i < l; ++i) {

                var size = this.stats[i] / this.population;


                if (size > 0) {
                    canvas.beginPath();
                    canvas.moveTo(22, 22);
                    canvas.fillStyle = colors[i];
                    var from = start + 0.14,
                        to = start + size * pi2;

                    if (to < from) {
                        from = start;
                    }
                    canvas.arc(22,22,22, from, to);

                    start = start + size*pi2;
                    canvas.lineTo(22,22);
                    canvas.fill();
                    canvas.closePath();
                }

            }

            canvas.beginPath();
            canvas.fillStyle = 'white';
            canvas.arc(22, 22, 18, 0, Math.PI*2);
            canvas.fill();
            canvas.closePath();

            canvas.fillStyle = '#555';
            canvas.textAlign = 'center';
            canvas.textBaseline = 'middle';
            canvas.font = 'bold 12px sans-serif';

            canvas.fillText(this.population, 22, 22, 40);
        }
    });
}


window.insertedPoint = function(geojson){
    console.log("inserted point", geojson);

    if( geojson.properties.gid !== -1){
        window.drawLayer.clearLayers();
        window.map.addLayer(pruneCluster);
        addPointToLayer(geojson);

        drawPoint.bindPopup(L.popup().setContent("Gracias! Ahora tu información forma parte de Repubikla.")).openPopup();

        $("#dropdownTools").show(100);
        $("#buttonCancelDraw").hide(100);

        setTimeout(function(){
            cancelNewPoint();
        }, 2500);
    }else{
        console.log("Error inserting point", geojson);
    }
};


$(function(){
    $('#formPointData').validate({
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function(form) {

            var newPointData = {
                type: $("#newPointMotivo").val(),
                date : $("#newPointDate").html()
            };

            var comment = $("#newPointComment").val();
            if( comment !== null && comment.length > 0 ){
                newPointData["Comentario"] = comment;
            }

            var customValues = $("input.newPointValue[type='text']");
            var key, value;
            for( var i = 0; i < customValues.length; i = i + 2 ){
                key = customValues[i].value;
                value = customValues[i+1].value;

                if(key !== null && key.length > 0){
                    newPointData[key] = value;
                }
            }

            $("#pointDataDialog").modal('hide');

            var html = "<div style='margin-top: 5px;'><button class='btn btn-primary btn-sm' data-save-text='Guardando...' id='submitPoint'>Aceptar</button>&nbsp;<button class='btn btn-default btn-sm' data-toggle='modal' data-target='#pointDataDialog'>Modificar datos</button></div>";

            var popup = L.popup({
                    closeOnClick: false,
                    closeButton: false
                }).setContent(buildPointPopup(newPointData, html));

            drawPoint.bindPopup(popup).openPopup();

            $("#submitPoint").click(function(evt){
                $(this).button('save');
                var geojson = drawPoint.toGeoJSON();

                for(var key in newPointData ){
                    geojson.properties[key] = newPointData[key];
                }

                console.log("inserting point", geojson);
                window.insertPoint(geojson);
            });

        }
    });

    $("#submitPointData").click(function(e){
        $('#formPointData').submit();
    });
});


window.paintPoints = function(featureCollection){
    console.log("Painting points", featureCollection);
    var map = window.map;

    var p = window.getUrlParameter("p");
    pruneCluster = new PruneClusterForLeaflet();
    pruneCluster.Cluster.Size = 10;

    setCustomMarker();

    pruneCluster.BuildLeafletClusterIcon = function(cluster) {
        var e = new L.Icon.MarkerCluster();

        e.stats = cluster.stats;
        e.population = cluster.population;

        return e;
    };


    pruneCluster.BuildLeafletCluster = function(cluster, position) {
        var m = new L.Marker(position, {
            icon: pruneCluster.BuildLeafletClusterIcon(cluster)
        });

        m.on('click', function() {
            // Compute the  cluster bounds (it's slow : O(n))
            var markersArea = pruneCluster.Cluster.FindMarkersInArea(cluster.bounds);
            var b = pruneCluster.Cluster.ComputeBounds(markersArea);

            if (b) {
                var bounds = new L.LatLngBounds(new L.LatLng(b.minLat, b.maxLng),new L.LatLng(b.maxLat, b.minLng));

                var zoomLevelBefore = pruneCluster._map.getZoom();
                var zoomLevelAfter = pruneCluster._map.getBoundsZoom(bounds, false, new L.Point(20, 20, null));

                // If the zoom level doesn't change
                if (zoomLevelAfter === zoomLevelBefore) {
                    // Send an event for the LeafletSpiderfier
                    pruneCluster._map.fire('overlappingmarkers', {
                        cluster: pruneCluster,
                        markers: markersArea,
                        center: m.getLatLng(),
                        marker: m
                    });

                    pruneCluster._map.setView(position, zoomLevelAfter);
                }
                else {
                    pruneCluster._map.fitBounds(bounds);
                }
            }
        });

        m.on('mouseover', function() {
            if( window.map.getZoom() > 9 ){
                var markers = pruneCluster.Cluster.FindMarkersInArea(cluster.bounds);
                for( var i = 0; i < markers.length; i++ ){
                    window.drawLayer.addLayer(L.marker(markers[i].position, {icon: markers[i].data.icon, opacity: 0.5, zIndexOffset: -100}));
                }
            }
        });

        m.on('mouseout', function() {
            window.drawLayer.clearLayers();
        });

        return m;
    };


    var geojson, marker, coordinates, category;
    markerList = [];
    for(var i = 0; i < featureCollection.features.length; i++){
        geojson = featureCollection.features[i];
        coordinates = geojson.geometry.coordinates;

        marker = new PruneCluster.Marker(coordinates[1], coordinates[0]);

        category = window.getPointCategory(geojson.properties.type);

        marker.data.icon = L.divIcon({className: "leaflet-div-icon-point " + category});
        marker.data.popup = buildPointPopup(geojson.properties);
        marker.category = categorys.indexOf(category);
        marker.data.type = geojson.properties.type;

        pruneCluster.RegisterMarker(marker);
        if(featureCollection.features[i].properties.gid === Number(p)){
            console.log("Centering ... " + p);

            map.setView([coordinates[1], coordinates[0]], 17);

            //To Do: if necesary decluster and open popup
            marker.data.popup = L.popup().setLatLng([coordinates[1], coordinates[0]]).setContent(buildPointPopup(geojson.properties)).openOn(map);
        }

        markerList.push(marker);
    }

    window.layerControl.addOverlay(pruneCluster,"Puntos");

    addPointToLayer = function(geojson){
        marker = new PruneCluster.Marker(geojson.geometry.coordinates[1], geojson.geometry.coordinates[0]);
        marker.data.icon = L.divIcon({className: "leaflet-div-icon-point " + window.getPointCategory(geojson.properties.type)});
        marker.data.popup = buildPointPopup(geojson.properties);

        pruneCluster.RegisterMarker(marker);
        pruneCluster.ProcessView();
    };


    $("#chargingDialog").modal("hide");

    if(window.getUrlParameter('r') || window.getUrlParameter('z')) return;

    map.addLayer((pruneCluster));
};

function cancelNewPoint(){
    $('#pointDataDialog').modal('hide');

    $("#newPointComment").val("");
    $('.newPointValue').val("");
    $(".addedRow").remove();
}

window.filterPoints = function(show){
    console.log("filtering points", show);

    var marker;
    for(var i = 0; i < markerList.length; i++){
        marker = markerList[i];
        marker.filtered = (show.indexOf(marker.data.type) < 0);
    }

    pruneCluster.ProcessView();
    window.showPruneCluster();
};

window.clearFilterPoints = function(){
    for(var i = 0; i < markerList.length; i++){
        markerList[i].filtered = false;
    }

    pruneCluster.ProcessView();
    window.showPruneCluster();
};


function setPointFilters(acceptedTypes){
  $("#pointTypeFilter").selectpicker("val", acceptedTypes);
  $("#applyFilters").trigger("click");
}


// @types -> array, null for all
function getPointsInView(acceptedTypes){
  var features = [];

  var mapBounds = map.getBounds();
  var counter = 0;
  for( var marker of markerList ){
    if(acceptedTypes && acceptedTypes.indexOf(marker.data.type) < 0){
        continue;
    }

    if(mapBounds.contains(L.latLng(marker.position))){
      features.push({
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [marker.position.lng, marker.position.lat]
        },
        "properties": {
          "_index": counter++
        }
      });
    }
  }

  return features;
}

/* global $ L PruneClusterForLeaflet PruneCluster*/
