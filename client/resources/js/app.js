$(function(){
    $("#chargingDialog").modal('show');
    $.validator.addMethod("idName", function(value, element) {
        return this.optional(element) || /^[$A-Z_][0-9A-Z_$]*$/i.test(value);
    }, "El identificador contiene caracteres no permitidos.");

    var today = moment();
    function cb(date) {
        $('#newPointDate').html(date.format('YYYY-MM-DD'));
    }

    cb( today );
    $('#fecha').daterangepicker({
        "parentEl": "#modalPoint",
        "locale": {
            format: 'YYYY-MM-DD',
            "applyLabel": "Aplicar",
            "cancelLabel": "Cancelar",
            "daysOfWeek": [
                "Do",
                "Lu",
                "Ma",
                "Mi",
                "Ju",
                "Vi",
                "Sa"
            ],
            "monthNames": [
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre"
            ],
            "firstDay": 1
        },
        todayHighlight: true,
        singleDatePicker: true,
        showDropdowns: true,
        maxDate: today,
        setDate: today
    }, cb);

    $("#fecha").bind("updateDate", function(){
        cb(today);
    });

    $(".addCustomRow").click(function(e){
        e.preventDefault();

        var name = (Math.random() * 100000).toString();

        var html = "";
        html += '<tr class="addedRow">';
        html += '<td>';
        html += '    <div class="form-group">';
        html += '        <div class="input-group">';
        html += '            <input class="form-control input-sm ' + $(this).attr("additional-class") + '" name="' + name + '" data-rule-idName="true" type="text" data-rule-minlength="3" data-rule-maxlength="25" data-msg-minlength="Muy corto" data-msg-maxlength="Muy largo">';
        html += '        </div>';
        html += '    </div>';
        html += '</td>';
        html += '<td>';
        html += '    <div class="form-group">';
        html += '        <div class="input-group">';
        html += '            <input class="form-control input-sm ' + $(this).attr("additional-class") + '" type="text">';
        html += '        </div>';
        html += '    </div>';
        html += '</td>';
        html += '</tr>';

        $("#" + $(this).attr("target")).append(html);
    });

    $('#frequencyNewRoute').slider({
        tooltip: "hide"
    });

    $("#frequencyNewRoute").on("slide", function(slideEvt) {
        $("#frequencyNewRouteSliderLabel").text(getSliderText(slideEvt.value));
    });

    $('[data-toggle=confirmation]').confirmation({
        rootSelector: '[data-toggle=confirmation]'
    });

    $("textarea").keydown(function(e){
        if ( (e.keyCode == 13 && !e.shiftKey) || (e.keyCode == 50 && e.shiftKey) || (e.keyCode == 39 && !e.shiftKey)){
            e.preventDefault();
        }
    });


    $(".downloadButtons").click(function(evt){
        var target = $(this).attr("data-target");
        var filename = $(this).attr("data-file-name");

        $.get( target , function (geojson) {
            var text = JSON.stringify(geojson);

            var file = new File([text], filename, { type: "application/json;charset=utf-8" });
            saveAs(file);
        });


    });
    window.apiBaseUrl="http://www.dadevop.com:22345/api/v1";
});

window.startDraw = function(type){
    window.drawType = type;
    $("#dropdownTools").hide(100);
    $("#buttonCancelDraw").show(100);
};

window.endDraw = function(){
    $("#dropdownTools").show(100);
    $("#buttonCancelDraw").hide(100);

    window.drawLayer.clearLayers();
    window.showPruneCluster();

    if( window.drawType === "marker" ){
        window.cancelNewPoint();
    } else if( window.drawType === "polygon" ){
        window.cancelNewZone();
    } else if( window.drawType === "polyline" ){
        window.cancelNewRoute();
    }

    window.drawType = "";
};

function getSliderText(currentValue){
    switch(currentValue){
        case 1: return "Una vez al mes";
        case 2: return "Dos veces al mes";
        case 3: return "Tres veces al mes";
        case 4: return "Una vez por semana";
        case 5: return "Dos veces por semana";
        case 6: return "Tres veces por semana";
        case 7: return "Cuatro veces por semana";
        case 8: return "Cinco veces por semana";
        case 9: return "Seis veces por semana";
        case 10: return "Siete veces por semana";
        case 11: return "Dos veces al día";
        case 12: return "Tres veces al día";
        case 13: return "Cuatro veces al día";
        default: return "";
    }
}

/*global $ moment L saveAs File*/
