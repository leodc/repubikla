var drawZone, drawAux, zoneLayer;


window.hideZonesLayer = function(){
    window.map.removeLayer(zoneLayer);
};


function getZoneStyle(zoneProperties){
    return {
        stroke: true,
        color: "black",
        weight: 1,
        fillColor: "#1db360"
    };
}


function buildZonePopup(properties, suffix){
    var excluded = ["Comentario","the_geom","cartodb_id","the_geom_webmercator","created_at","updated_at","geojson", "date", "gid"];
    
    var topItems = "<b>Fecha: </b>" + properties.date;
    var bodyItems = "<br><br><b>Características de esta zona: </b>";
    var footItems = "<br>";
    
    for(var key in properties ){
        if( excluded.indexOf(key) < 0 ){
            switch(key){
                
                case "zona_agradable":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Agradable (paisaje urbano, ambiente, vegetación)";
                    break;
                case "zona_comercio":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Con concentración de comercios y servicios útiles";
                    break;
                case "zona_comoda":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Cómoda, con buen diseño de calles y mobiliario";
                    break;
                case "zona_conectada":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Bien conectada (diseño de cruces, fases semafóricas)";
                    break;
                case "zona_desagradable":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Desagradable, hostil";
                    break;
                case "zona_incomoda":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Incomoda, con mal diseño de calles y mobiliario";
                    break;
                case "zona_insegura": 
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Insegura (a nivel personal)";
                    break;
                case "zona_no_conectada":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Mal conectada";
                    break;
                case "zona_no_iluminada":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Mal iluminada";
                    break;
                case "zona_no_mantenimiento":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Mal mantenimiento (pavimento, instalaciones)";
                    break;
                case "zona_transito":
                    if(properties[key])
                        bodyItems += "<br><i class='fa fa-check-circle-o' aria-hidden='true'></i> Tránsito confuso y peligroso";
                    break;
                default:
                    footItems += "<br><b>" + key + ":</b> " + properties[key];
                    break;
            }
        }
    }
    
    if( properties["Comentario"] ){
        footItems += "<br><b>Comentario:</b> " + properties["Comentario"] + "<br>";
    }
    
    if(suffix) {
        return topItems + bodyItems + footItems + suffix;
    }
    
    var urlToShare = window.baseUrl + "?z=" + properties.gid;
    var urlTwitter = "https://twitter.com/intent/tweet?url=" + urlToShare;
    var urlFb = "https://www.facebook.com/sharer/sharer.php?u=" + urlToShare;
    
    footItems += "<p class='text-right' >";
    footItems += '<i class="fa fa-share-alt" aria-hidden="true" style="color: rgba(128,128,128,.5); font-weight:normal;">&nbsp;</i>';
    footItems += '<a href="' + urlTwitter + '" class="btn btn-xs btn-social-icon btn-twitter" style="color: white"><span class="fa fa-twitter"></span></a>';
    footItems += '<a href="' + urlFb + '" class="btn btn-xs btn-social-icon btn-facebook" style="color: white" onclick="javascript:window.open(this.href, \'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600\');return false;"><span class="fa fa-facebook"></span></a>';
    footItems += "</p>";
    
    return topItems + bodyItems + footItems;
}


window.paintZones = function(featureCollection){
    console.log("painting zones", featureCollection);
    
    var map = window.map;
    
    var sharedZone = Number(window.getUrlParameter('z'));
    
    zoneLayer = new L.layerGroup();
    window.layerControl.addOverlay(zoneLayer,"Zonas");
    
    var geojson;
    for(var i = 0; i < featureCollection.features.length; i++){
        geojson = featureCollection.features[i];
        
        var lngLat = geojson.geometry.coordinates[0];
        var latLng = [];
        
        for(var j = 0; j < lngLat.length; j++){
            latLng.push([lngLat[j][1],lngLat[j][0]]);
        }
        
        var polygon = L.polygon(latLng,getZoneStyle(geojson.properties)).addTo(zoneLayer);
        polygon.bindPopup(buildZonePopup(geojson.properties));
        
        if(sharedZone === Number(geojson.properties.gid)) {
            map.fitBounds(polygon.getBounds());
            map.addLayer(zoneLayer);
            
            polygon.bringToFront();
            polygon.openPopup();
        }
    }
};


window.insertedZone = function(geojson){
    if(geojson.properties.gid !== -1){
        cleanDraw();
        
        window.drawLayer.clearLayers();
        zoneLayer.addLayer(drawZone);
        window.map.addLayer(zoneLayer);
        
        drawZone.bindPopup(L.popup().setContent("Gracias! Ahora tu información forma parte de Repubikla.")).openPopup();
        drawZone.setStyle({
            dashArray: "none"
        });
        
        $("#dropdownTools").show(100);
        $("#buttonCancelDraw").hide(100);
        
        setTimeout(function(){
            drawZone.bindPopup(buildZonePopup(geojson.properties)).openPopup();
        }, 2500);
    }
};


function cleanDraw(){
    $(".zoneCheckData").prop('checked', false);
    $("#newZoneComment").val("");
    $(".newZoneValue").val("");
    $(".addedRow").remove();
}


$(function(){
    $("#drawZone").click(function(){
        window.startDraw("zone");
        
        var map = window.map;
        
        window.hidePruneCluster();
        window.hideRouteLayer();
        map.removeLayer(zoneLayer);
        
    	L.drawLocal.draw.handlers.polygon.tooltip.start = "Inicia el dibujo con un clic.";
    	L.drawLocal.draw.handlers.polygon.tooltip.cont = "Da clic para continuar el dibujo.";
    	L.drawLocal.draw.handlers.polygon.tooltip.end = "Da clic en el nimer punto para terminar el dibujo.";
    
    	drawAux = new L.Draw.Polygon(map, {
			shapeOptions: {
                color: 'black'
            },
            allowIntersection: false,
            drawError: {
                color: '#e1e100',
                message: '<strong>Error:<strong> No puedes continuar tu dibujo en ese punto.'
            },
		});
		
		drawAux.enable();
        
    	map.on('draw:created', function (e) {
    	    if( e.layerType !== "polygon" ){
                return;
            }
            
            window.drawLayer.clearLayers();
    		drawZone = L.polygon(e.layer.getLatLngs()).addTo(window.drawLayer);
    		drawZone.enableEdit();
    		drawZone.setStyle({
    		    dashArray: "5, 5"
    		});
    		
            $("#zonesDataDialog").modal("show");
    	});
    });
    
    
    $('#formZoneData').validate({
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
            var newZoneData = {
                date: moment().format("YYYY-MM-DD")
            };
            
            if( $("#newZoneagradable").is(":checked")){
                newZoneData.zona_comercio = true;
            }
            if( $("#newZonedesagradable").is(":checked")){
                newZoneData.zona_agradable = true;
            }
            if( $("#newZonecomoda").is(":checked")){
                newZoneData.zona_desagradable = true;
            }
            if( $("#newZoneincomoda").is(":checked")){
                newZoneData.zona_comoda = true;
            }
            if( $("#newZonecomercios").is(":checked")){
                newZoneData.zona_incomoda = true;
            }
            if( $("#newZoneconectada").is(":checked")){
                newZoneData.zona_conectada = true;
            }
            if( $("#newZoneno_conectada").is(":checked")){
                newZoneData.zona_no_conectada = true;
            }
            if( $("#newZoneinsegura").is(":checked")){
                newZoneData.zona_insegura = true;
            }
            if( $("#newZoneno_iluminada").is(":checked")){
                newZoneData.zona_no_iluminada = true;
            }
            if( $("#newZonetransito").is(":checked")){
                newZoneData.zona_transito = true;
            }
            if( $("#newZoneno_mantenimiento").is(":checked")){
                newZoneData.zona_no_mantenimiento = true;
            }
            
            var comment = $("#newZoneComment").val();
            if( comment !== null && comment.length > 0 ){
                newZoneData["Comentario"] = comment;
            }
            
            var customValues = $("input.newZoneValue[type='text']");
            var key, value;
            for( var i = 0; i < customValues.length; i = i + 2 ){
                key = customValues[i].value;
                value = customValues[i+1].value;
                
                if(key.length > 0 && value.length > 0 ){
                    newZoneData[key] = value;
                }
            }
            
            var html = "<div style='margin-top: 5px;'><button class='btn btn-primary btn-sm' data-save-text='Guardando...' id='submitZone'>Aceptar</button>&nbsp;<button class='btn btn-default btn-sm' data-toggle='modal' data-target='#zonesDataDialog'>Modificar datos</button></div>";
            
            var style = getZoneStyle(newZoneData);
            
            var popup = L.popup({
                    closeOnClick: false,
                    closeButton: false
                }).setContent(buildZonePopup(newZoneData, html));
            
            drawZone.setStyle(style);
            window.map.fitBounds(drawZone.getBounds());
            
            
            $("#zonesDataDialog").modal("hide");
            
            // wait for fitBound animation to end...
            setTimeout(function(){
                drawZone.bindPopup(popup).openPopup();
                
            	$("#submitZone").click(function(evt){
            	    $(this).button('save');
            	    
            	    var geojson = drawZone.toGeoJSON();
    
                    for(var key in newZoneData ){
                        geojson.properties[key] = newZoneData[key];
                    }
                    
                    window.insertZone(geojson);
                });
            }, 300);
        }
    });
    
    $("#submitZoneData").click(function(){
        $('#formZoneData').submit();
    });
});


window.cancelNewZone = function(){
    drawAux.disable();
    $("#zonesDataDialog").modal("hide");
    cleanDraw();
};



/* global $ L moment*/