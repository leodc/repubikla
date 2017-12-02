var map, drawLayer, layerControl, indicatorsLayer, sidebars = {};
var layersLoaded = 0;
function initMap(id){
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

    map = L.map(id, {
        center: [20,0],
        zoom: 3,
        minZoom: 3,
        maxZoom: 18,
        layers: mapQuestTiles, mapboxTiles, mapboxSatelliteTiles,
        editable: true
    });

    layerControl = L.control.layers({"Mapbox Tiles": mapboxTiles, "MapQuest Tiles": mapQuestTiles, "Mapbox Satellite": mapboxSatelliteTiles}, {}, {collapsed:false}).addTo(map);

    drawLayer = L.featureGroup().addTo(map);
    indicatorsLayer = L.geoJSON().bindPopup(function(layer){
      var html = "Incidentes reportados: " + layer.feature.properties.counter;
      html += "<br>Posición en el top: " + layer.feature.properties._index;


      return html;
    }).addTo(map);

    map.on("popupclose", function(){
        if(window.routeShared){
            window.routeShared = false;
            window.drawRoutes();
        }
    });

    map.on("click", function(){
      layerControl.collapse();
    })


    // locate
    var locateControl = L.control.locate({
        strings: {
            title: "Encuéntrame",
            popup: ""
        },
        icon: "fa fa-location-arrow"
    });

    // search
    var geosearchControl = new L.Control.GeoSearch({
        provider: new L.GeoSearch.Provider.OpenStreetMap(),
        showMarker: false
    });

    // sidebars

    var sidebarOptions = {autoPan: false};
    sidebars.filters = L.control.sidebar("sidebarFilter", sidebarOptions);
    sidebars.downloads = L.control.sidebar("sidebarDownload", sidebarOptions);
    sidebars.about = L.control.sidebar("sidebarAbout", sidebarOptions);
    sidebars.indicators = L.control.sidebar("sidebarIndicators", sidebarOptions);

    // legend
    var legendControl = L.easyButton({
        states: [
            {
                stateName: 'Leyenda',
                icon:      '<b>L</b>',
                title:     'Leyenda',
                onClick: function(btn, map) {
                    hideSidebars();
                    $('#legendDialog').modal('show');
                }
            }
        ]
    });

    var drawControl = buildDrawControl();


    for(var key in sidebars){
      map.addControl(sidebars[key]);
    }

    map.addControl(locateControl);
    map.addControl(drawControl);
    map.addControl(geosearchControl);
    map.addControl(legendControl);

    sidebars.about.show();
}

function buildDrawControl(){
    L.drawLocal.draw.toolbar.buttons.polygon = 'Dibujar zona';
    L.drawLocal.draw.toolbar.buttons.marker = 'Dibujar punto';
    L.drawLocal.draw.toolbar.buttons.polyline = 'Dibujar ruta';

    L.drawLocal.draw.toolbar.actions.title = 'Cancelar dibujo';
    L.drawLocal.draw.toolbar.actions.text = 'Cancelar';

    L.drawLocal.draw.toolbar.undo.title = 'Eliminar último punto dibujado';
    L.drawLocal.draw.toolbar.undo.text = 'Eliminar último punto';

    L.drawLocal.draw.toolbar.finish.title = 'Finalizar dibujo';
    L.drawLocal.draw.toolbar.finish.text = 'Finalizar dibujo';

    L.drawLocal.draw.handlers.marker.tooltip.start = "Ahora solo da clic donde quieras posicionar el marcador";

    L.drawLocal.draw.handlers.polygon.tooltip.start = "Inicia el dibujo con un clic";
    L.drawLocal.draw.handlers.polygon.tooltip.cont = "Da clic para continuar el dibujo";
    L.drawLocal.draw.handlers.polygon.tooltip.end = "Da clic en el primer punto para terminar el dibujo";

    L.drawLocal.draw.handlers.polyline.error = "<b>Error:</b> no puedes continuar tu dibujo en este punto";
    L.drawLocal.draw.handlers.polyline.tooltip.start = "Inicia el dibujo con un clic";
    L.drawLocal.draw.handlers.polyline.tooltip.cont = "Da clic para continuar el dibujo";
    L.drawLocal.draw.handlers.polyline.tooltip.end = "Da clic en el ultimo punto para terminar el dibujo";


    var toolbarOptions = {
        position: 'topleft',
        draw: {
            polygon: {
                allowIntersection: false,
                drawError: {
                    color: '#b00b00',
                    timeout: 1000
                },
                shapeOptions: {
                    color: '#bada55'
                }
            },
            circle: false,
            rectangle: false
        },
        edit: {
            featureGroup: drawLayer,
            remove: false,
            edit: false
        }
    };

    map.on(L.Draw.Event.DRAWSTART, function(e){
        hideSidebars();
        drawLayer.clearLayers();

        window.hideZonesLayer();
        window.hideRouteLayer();
        window.hidePruneCluster();
    });

    map.on(L.Draw.Event.CREATED, function (e) {
        window.startDraw(e.layerType);

        if( e.layerType === "marker" ){
            drawPoint = L.marker(e.layer.getLatLng(), {draggable: true, clickable: true});
            drawPoint.on('dragend', function(e) {drawPoint.openPopup();}); // keep popup open

            drawLayer.addLayer(drawPoint);

            $('#pointDataDialog').modal('show');
        }else{
            e.layer.setStyle({dashArray: "5, 5"});
            e.layer.editing.enable();
            e.layer.addTo(drawLayer);

            window.map.fitBounds(e.layer.getBounds());

            var html = "Asegúrate que tu dibujo sea correcto, cuando estés listo presiona siguiente.";
            html += "<div align='center'><button class='btn btn-default btn-sm' id='nextButtonDraw'>Siguiente</button></div>";

            var popup = L.popup({
                    closeButton: false,
                    autoClose: false,
                    closeOnClick: false
                }).setContent(html);

            e.layer.bindPopup(popup).openPopup();

            // polygon || polyline
            if( e.layerType === "polygon" ){
                dialogToOpen = "#zonesDataDialog";
                drawZone = e.layer;
            }else{
                dialogToOpen = "#routeDataDialog";
                drawRoute = e.layer;
            }

            $("#nextButtonDraw").click(function(){
                $(dialogToOpen).modal("show");
            });
        }
    });

    return new L.Control.Draw(toolbarOptions);
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


function hideSidebars(sidebarToShow){
  for(var key in sidebars){
    if(sidebars[key].isVisible() && key != sidebarToShow){
      sidebars[key].hide();
      return true;
    }
  }
}


function showSidebar(key){
  // in case a sidebar is open we need to wait for the close animation to end before open the new sidebar
  var timeWait = hideSidebars(key) ? 500:0;

  setTimeout(function(){
    sidebars[key].show();
  }, timeWait);
}

$(function(){
    window.baseUrl = "https://repubikla.herokuapp.com/";

    initMap("map");
    buildLegend();

    // Map bounds
    map.setMaxBounds(L.latLngBounds([85, -180], [-85, 180]));

    // resize control
    $(window).resize(function() {
        map.invalidateSize();
    });

    userLocationView(map);

    $("#applyFilters").on("click", function(evt){

        var show = [];
        $.each($("#pointTypeFilter option:selected"), function(){
            show.push($(this).val());
        });

        window.filterPoints(show);

        show = [];
        $('#routeTypeFilter option:selected').each(function () {
            show.push($(this).val());
        });

        window.filterRoutes(show);

        show = [];
        $('#zoneTypeFilter option:selected').each(function () {
            show.push($(this).val());
        });

        window.filterZones(show);
    });

    $("#cleanFilters").on("click", function(evt){
        console.log("cleaning filters");

        window.clearFilterPoints();
        window.clearFilterRoutes();
        window.clearFilterZones();
        window.hideZonesLayer();
        window.hideRouteLayer();

        $("#pointTypeFilter, #routeTypeFilter, #zoneTypeFilter").selectpicker("deselectAll");
    });
});

/*global $ L MQ*/
