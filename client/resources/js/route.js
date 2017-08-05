window.motivosProperties = {
    "Ir al trabajo":{
        color: "#3366cc"
    },
    "Regreso a casa":{
        color: "#ff9900"
    },
    "Desplazamientos de trabajo":{
        color: "#990099"
    },
    "Estudios":{
        color: "#dd4477"
    },
    "Visitas":{
        color: "#66aa00"
    },
    "Compras":{
        color: "#b82e2e"
    },
    "Paseo, turismo":{
        color: "#316395"
    },
    "Deporte":{
        color: "#994499"
    },
    "Comida":{
        color: "#22aa99"
    },
    "Otra actividad":{
        color: "#3b3eac"
    }
};


var drawRoute, drawAux, routeLayer;


window.hideRouteLayer = function(){
    window.map.removeLayer(routeLayer);
};

function getRouteStyle (motivo, sharedRoute){
    var opacity = (sharedRoute) ? 0.1:0.55;
    
    return {
        color: window.motivosProperties[motivo].color,
        opacity: opacity,
        weight: 3
    };
}

function buildRoutePopup(properties, suffix){
    var excluded = ["comment","the_geom","cartodb_id","the_geom_webmercator","created_at","updated_at","geojson", "date","gid"];
    
    var bodyPreffix = "<br><br><b>Esta ruta es: </b>";
    
    var topItems = "";
    var bodyItems = bodyPreffix;
    var footItems = "<br>";
    
    
    for(var key in properties ){
        if( excluded.indexOf(key) < 0 ){
            switch(key){
                case "ruta_motivo":
                    topItems += "<b>Motivo de la ruta: </b>" + properties[key];
                    topItems += "<br><b>Fecha: </b>" + properties.date;
                    break;
                case "ruta_tiempo":
                    topItems += "<br><b>Tiempo del recorrido (minutos): </b>" + properties[key];
                    break;
                case "ruta_frecuencia":
                    topItems += "<br><b>Frecuencia del recorrido: </b>" + properties[key];
                    break;
                case "ruta_rapida":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Rápida y conectada";
                    break;
                case "ruta_segura":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Segura";
                    break;
                case "ruta_amigable":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Agradable y cómoda";
                    break;
                case "ruta_neutral": 
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> La única que puedo tomar";
                    break;
                case "ruta_multimodal":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Multimodal";
                    break;
                case "ruta_bicipublica":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Hecha en bicicleta pública";
                    break;
                case "ruta_acompanantes":
                    topItems += "<br><b>Número de personas que hacen este recorrido: </b>" + (properties[key] + 1);
                    break;
                default:
                    footItems += "<br><b>" + key + ":</b> " + properties[key];
                    break;
            }
        }
    }
    
    bodyItems = (bodyItems===bodyPreffix) ? "":bodyItems;
    
    if(suffix) {
        return topItems + bodyItems + footItems + suffix;
    }
    
    
    var urlToShare = window.baseUrl + "?r=" + properties.gid;
    var urlTwitter = "https://twitter.com/intent/tweet?url=" + urlToShare;
    var urlFb = "https://www.facebook.com/sharer/sharer.php?u=" + urlToShare;
    
    footItems += "<p class='text-right' >";
    footItems += '<i class="fa fa-share-alt" aria-hidden="true" style="color: rgba(128,128,128,.5); font-weight:normal;">&nbsp;</i>';
    footItems += '<a href="' + urlTwitter + '" class="btn btn-xs btn-social-icon btn-twitter" style="color: white"><span class="fa fa-twitter"></span></a>';
    footItems += '<a href="' + urlFb + '" class="btn btn-xs btn-social-icon btn-facebook" style="color: white" onclick="javascript:window.open(this.href, \'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600\');return false;"><span class="fa fa-facebook"></span></a>';
    footItems += "</p>";
    
    return topItems + bodyItems + footItems;
}


window.paintRoutes = function(featureCollection){
    console.log("painting routes", featureCollection);
    
    var map = window.map;
    var sharedRoute = Number(window.getUrlParameter('r'));
    
    routeLayer = new L.FeatureGroup();
    window.layerControl.addOverlay(routeLayer,"Rutas");
    
    var geojson;
    for(var i = 0; i < featureCollection.features.length; i++){
        geojson = featureCollection.features[i];
        
        if( !window.motivosProperties[geojson.properties.ruta_motivo] ){
            continue;
        }
        
        var lngLat = geojson.geometry.coordinates[0];
        var latLng = [];
        
        for(var j = 0; j < lngLat.length; j++){
            latLng.push([lngLat[j][1],lngLat[j][0]]);
        }
        
        var polyline = L.polyline(latLng, getRouteStyle(geojson.properties.ruta_motivo, sharedRoute)).addTo(routeLayer);
        polyline.bindPopup(buildRoutePopup(geojson.properties));
        
        if(sharedRoute === Number(geojson.properties.gid)) {
            map.fitBounds(polyline.getBounds());
            map.addLayer(routeLayer);
            
            polyline.bringToFront();
            polyline.openPopup();
            polyline.setStyle({
                opacity: 1
            });
            
            var popupListener = function(){
               routeLayer.setStyle({
                    opacity: 0.55
                });
                
                routeLayer.off();
            };
            
            routeLayer.on("popupclose", popupListener);
        }
    }
};


window.insertedRoute = function(geojson){
    
    if(geojson.properties.gid > -1 ){
        cleanDraw();
        
        window.drawLayer.clearLayers();
        routeLayer.addLayer(drawRoute);
        window.map.addLayer(routeLayer);
        
        
        drawRoute.bindPopup(L.popup().setContent("Gracias! Ahora tu información forma parte de Repubikla.")).openPopup();
        drawRoute.setStyle({
            dashArray: "none"
        });
        
        $("#dropdownTools").show(100);
        $("#buttonCancelDraw").hide(100);
        
        setTimeout(function(){
            drawRoute.bindPopup(buildRoutePopup(geojson.properties)).openPopup();
        }, 2500);
    }
};


function cleanDraw(){
    $("#timeNewRoute").val("30");
    $("#frequencyNewRoute").slider('setValue', 4, true, true);
    $(".routeCheckData").prop('checked', false);
    $("#newRouteCompanions").val("0");
    $("#newRouteComment").val("");
    $(".newRouteValue").val("");
    $(".addedRow").remove();
}


$(function(){        
    $("#drawRoute").click(function(evt){
        window.startDraw("route");
        
        var map = window.map;
        
        window.hidePruneCluster();
        window.hideZonesLayer();
        map.removeLayer(routeLayer);
        
        L.drawLocal.draw.handlers.polyline.tooltip.start = "Inicia el dibujo con un clic.";
        L.drawLocal.draw.handlers.polyline.tooltip.cont = "Da clic para continuar el dibujo.";
        L.drawLocal.draw.handlers.polyline.tooltip.end = "Da clic en el ultimo punto para terminar el dibujo.";
    
        drawAux = new L.Draw.Polyline(map, {
            shapeOptions: {
                color: 'black',
                dashArray: "5, 5"
            }
        });
        drawAux.enable();
        
        map.on('draw:created', function (e) {
            if( e.layerType !== "polyline" ){
                return;
            }
            
            window.drawLayer.clearLayers();
            drawRoute = L.polyline(e.layer.getLatLngs()).addTo(window.drawLayer);
            drawRoute.enableEdit();
            drawRoute.setStyle({
                dashArray: "5, 5"
            });
            
            var bounds = drawRoute.getBounds();
            window.map.fitBounds(bounds);
            
            var html = "Asegúrate que tu dibujo sea correcto, cuando estés listo presiona siguiente.";
            html += "<div align='center'><button class='btn btn-default btn-sm' id='nextButtonRoutes'>Siguiente</button></div>";
            
            var popup = L.popup({
                    closeButton: false,
                    autoClose: false,
                    closeOnClick: false
                }).setLatLng({lng: bounds.getCenter().lng, lat: bounds.getNorthWest().lat+0.00005})
                .setContent(html)
                .openOn(map);
            
            
            $("#nextButtonRoutes").click(function(){
                $("#routeDataDialog").modal("show");
            });
            
            /*
            var popupListener = function(){
                drawRoute.openPopup();
            };
            
            drawRoute.on("popupclose", popupListener);
            */
        });
    });
    
    $('#formRouteData').validate({
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
            var newRouteData = {
                ruta_motivo: $("#newRouteMotivo").val(),
                ruta_tiempo: $("#timeNewRoute").val(),
                ruta_frecuencia: $( "#frequencyNewRoute" ).slider( "getValue" ),
                ruta_acompanantes: Number($("#newRouteCompanions").val()),
                date: moment().format("YYYY-MM-DD")
            };
            
            if( $("#calificacion_1").is(":checked")){
                newRouteData.ruta_rapida = true;
            }
            if( $("#calificacion_2").is(":checked")){
                newRouteData.ruta_segura = true;
            }
            if( $("#calificacion_3").is(":checked")){
                newRouteData.ruta_amigable = true;
            }
            if( $("#calificacion_4").is(":checked")){
                newRouteData.ruta_neutral = true;
            }
            if( $("#publica").is(":checked")){
                newRouteData.ruta_bicipublica = true;
            }
            if( $("#transporte").is(":checked")){
                newRouteData.ruta_multimodal = true;
            }
            
            var comment = $("#newRouteComment").val();
            if( comment !== null && comment.length > 0 ){
                newRouteData["Comentario"] = comment;
            }
            
            var customValues = $("input.newRouteValue[type='text']");
            var key, value;
            for( var i = 0; i < customValues.length; i = i + 2 ){
                key = customValues[i].value;
                value = customValues[i+1].value;
                
                if(key.length > 0 && value.length > 0 ){
                    newRouteData[key] = value;
                }
            }
            
            var html = "<div style='margin-top: 5px;'><button class='btn btn-primary btn-sm' data-save-text='Guardando...' id='submitRoute'>Aceptar</button>&nbsp;<button class='btn btn-default btn-sm' data-toggle='modal' data-target='#routeDataDialog' onClick='console.log(\"asd\")'>Modificar datos</button></div>";
            
            var style = getRouteStyle(newRouteData.ruta_motivo);
            style.dashArray = "5, 5";
            
            var popup = L.popup({
                    closeOnClick: false,
                    closeButton: false
                }).setContent(buildRoutePopup(newRouteData, html));
            
            drawRoute.bindPopup(popup);
            drawRoute.setStyle(style);
            window.map.fitBounds(drawRoute.getBounds());
            
            $("#routeDataDialog").modal("hide");
            
            // wait for fitBound animation to end...
            setTimeout(function(){
                drawRoute.openPopup();
                
                $("#submitRoute").click(function(evt){
                    $(this).button('save');
                    
                    var geojson = drawRoute.toGeoJSON();
                    geojson.geometry.type = "MultiLineString";
                    
                    var coords = geojson.geometry.coordinates;
                    geojson.geometry.coordinates = [coords];
                    
                    for(var key in newRouteData ){
                        geojson.properties[key] = newRouteData[key];
                    }
                    
                    window.insertRoute(geojson);
                });
            }, 300);
            
        }
    });
    
    $("#submitRouteData").click(function(){
        $('#formRouteData').submit();
    });
});

window.cancelNewRoute = function(){
    drawAux.disable();
    $("#routeDataDialog").modal("hide");
    
    cleanDraw();
};

/* global $ L moment*/