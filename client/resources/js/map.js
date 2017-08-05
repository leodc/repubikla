function initMap(id){
    buildLegend();
    
    /* Basemap Layers */
    
    // mapbox
    var mapboxTiles = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v8/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaW1sZW8iLCJhIjoiT0tfdlBSVSJ9.Qqzb4uGRSDRSGqZlV6koGg",{
        attribution: 'Repubikla | Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Tiles thanks to © <a href="http://mapbox.com">Mapbox</a>'
    });
    
    // mapbox satellite streets
    var mapboxSatelliteTiles = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaW1sZW8iLCJhIjoiT0tfdlBSVSJ9.Qqzb4uGRSDRSGqZlV6koGg",{
        attribution: 'Repubikla | Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Tiles thanks to © <a href="http://mapbox.com">Mapbox</a>'
    });
    
    // mapquest
    var mapQuestTiles = MQ.mapLayer();
    
    
    var map = L.map(id, {
        center: [20,0],
        zoom: 3,
        minZoom: 3,
        maxZoom: 18,
        layers: mapQuestTiles, mapboxTiles,
        editable: true
    });
    
    var collapse = ( $(window).width() < 768 ) ? true:false;
    
    window.layerControl = L.control.layers({"Mapbox Tiles": mapboxTiles, "MapQuest Tiles": mapQuestTiles, "Mapbox Satellite": mapboxSatelliteTiles}, {}, {collapsed: collapse}).addTo(map);
    window.drawLayer = L.featureGroup().addTo(map);
    
    // Initialise the draw control and pass it the FeatureGroup of editable layers (but not to the map)
    new L.Control.Draw({
        edit: {
            featureGroup: window.drawLayer
        }
    });

    map.on("popupclose", function(){
        if(window.routeShared){
            window.routeShared = false;
            window.drawRoutes();
        }
    });
    
    // locate
    L.control.locate({
        strings: {
            title: "Encuéntrame",
            popup: ""
        }
    }).addTo(map);
    
    // search
    new L.Control.GeoSearch({
        provider: new L.GeoSearch.Provider.OpenStreetMap(),
        showMarker: false
    }).addTo(map);
    
    // legend
    L.easyButton({
        states: [
            {
                stateName: 'Leyenda',
                icon:      '<b>L</b>',
                title:     'Leyenda',
                onClick: function(btn, map) {
                    $('#legendDialog').modal('show');
                }
            }
        ]
    }).addTo(map);
    
    return map;
}

function buildLegend(){
    var html = "";
    
    
    html += "<div class='panel-group' id='legendAccordion'>";
    
    // point accordion
    html += "  <div class='panel panel-default'>";
    html += "    <div class='panel-heading bg-primary'>";
    html += "      <h4 class='panel-title'>";
    html += "        <a data-toggle='collapse' data-parent='#legendAccordion' href='#collapse1'>";
    html += "        Puntos</a>";
    html += "      </h4>";
    html += "    </div>";
    html += "    <div id='collapse1' class='panel-collapse collapse in'>";
    html += "      <div class='panel-body'>";
    
    var record, type, key;
    for( var i = 0; i < window.pointDictionary.length; i++){
        record = window.pointDictionary[i];
        type = window.getPointCategory(record);
        html += "<i class='" + type +  "' >&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;" + record + "<br>";
    }
    
    html += "       </div>";
    html += "    </div>";
    html += "  </div>";
    
    // route accordion
    html += "  <div class='panel panel-default'>";
    html += "    <div class='bg-primary panel-heading'>";
    html += "      <h4 class='panel-title'>";
    html += "        <a data-toggle='collapse' data-parent='#legendAccordion' href='#collapse2'>";
    html += "        Rutas</a>";
    html += "      </h4>";
    html += "    </div>";
    html += "    <div id='collapse2' class='panel-collapse collapse'>";
    html += "      <div class='panel-body'>";

    for(key in window.motivosProperties){
        record = window.motivosProperties[key];
        
        html += "<i style='background-color:" + record.color + ";' >&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;" + key + "<br>";
    }
    
    html += "      </div>";
    html += "    </div>";
    html += "  </div>";
    
    // zone accordion
    /*
    html += "  <div class='panel panel-default'>";
    html += "    <div class='panel-heading'>";
    html += "      <h4 class='panel-title'>";
    html += "        <a data-toggle='collapse' data-parent='#legendAccordion' href='#collapse3'>";
    html += "        Zonas</a>";
    html += "      </h4>";
    html += "    </div>";
    html += "    <div id='collapse3' class='panel-collapse collapse'>";
    html += "      <div class='panel-body'>";
    html += "      </div>";
    html += "    </div>";
    html += "  </div>";
    */
    html += "</div>";
    
    $("#legendContent").html(html);
}


function userLocationView(map){
    
    if(window.getUrlParameter('p') || window.getUrlParameter('r') || window.getUrlParameter('z')) return;
    
    // set view
    map.locate({setView: true, maxZoom: 17});
    
    // on error
    map.on('locationerror', function(error){
        $.notify("No pudimos encontrar tu ubicación.", "info");
    });
    
}


$(function(){
    window.baseUrl = "https://repubikla.herokuapp.com/";
    
    var map = initMap("map");
    window.map = map;
    
    // Map bounds
    map.setMaxBounds(L.latLngBounds([85, -180], [-85, 180]));

    // resize control
    $(window).resize(function() {
        map.invalidateSize();
    });
    
    userLocationView(map);
});


/*global $ L MQ*/