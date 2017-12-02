/*Redes*/
!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

/*Busqueda*/
function buscar(){
    var value = $("#input_busqueda").val();

    if( value.length > 0 ){
        getGeoCode(value);
    }else{
        $("#input_busqueda").focus();
    }
}

function getGeoCode( query ){
    $("#notify").dialog("open");

    $.getJSON("http://nominatim.openstreetmap.org/search?format=json&",{q: query}, function(data) {
        var html = ["<li id='", "", "' class='result_busqueda'>", "","</li>"];

        if( data.length == 0 ){
            $("#results_list").html("<li>No se encontraron resultados</li>");
        }else{
            $("#results_list").empty();

            data.forEach(function(value){
                html[1] = value.osm_id;
                html[3] = value.display_name;

                $("#results_list").append(html.join(""));

                setListener(value.osm_id, value.boundingbox);
            });
        }
    }).done(function(){
        $("#notify").dialog("close");
        $("#results").dialog("open");
    });

}

function setListener( id, coords){
    $("#"+id).click(function(evt){
        map.fitBounds(L.latLngBounds([coords[0], coords[2]], [coords[1], coords[3]]));
    });
}


/*Main map*/
$(function() {

    sql = { }

    map = new L.Map('map', {
        center: [20,0],
        zoom: 3,
        minZoom: 3
    });

    L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {attribution: 'RepuBikla | Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'}).addTo(map);          //MAPQUEST TILE

    map.setMaxBounds(L.latLngBounds([85, -180], [-85, 180]));

    $("#results").dialog({
        dialogClass: "dialog-results",
        autoOpen: false,
        position: {my: "left top+10", at: "left bottom", of: "#top"},
        close: function(event, ui){
            $("#input_busqueda").blur();
        },
        show: {
            effect: "blind",
            duration: 500
        },
        hide: {
            effect: "blind",
            duration: 500
        }
    });

    $("body").append("<div id='notify'><span>Buscando...</span></div>");
    $("#notify").dialog({
        dialogClass: "dialog-notification",
        autoOpen: false,
        width: $( "#input_busqueda" ).width(),
        height: 30,
        position: {my: "left top", at: "left bottom", of: "#input_busqueda"},
        show: {
            effect: "blind",
            duration: 100
        },
        hide: {
            effect: "blind",
            duration: 100
        }
    });
    
    $(".defaultText").focus(function(srcc){
        if ($(this).val() == $(this)[0].title){
            $(this).removeClass("defaultTextActive");
            $(this).val("");
        }
    });
    
    $(".defaultText").blur(function(){
        if ($(this).val() == ""){
            $(this).addClass("defaultTextActive");
            $(this).val($(this)[0].title);
        }
    });
    
    $(".defaultText").blur();

});
