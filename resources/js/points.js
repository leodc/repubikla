var id_survey = "survey",
	id_notification = "notification",
	id_text = "notification_text",
	id_confirm = "dialog-confirm";

$(function(){
	buildDialogs();

	L.drawLocal.draw.handlers.marker.tooltip.start = "Da clic donde quieras posicionar el marcador.";

	var drawControl = new L.Control.Draw();

	new L.Draw.Marker(map, {
		icon: L.icon({
			iconUrl: '../resources/img/icon/poi.png',
			iconRetinaUrl: '../resources/img/icon/poi@2x.png',
			iconSize: [32, 32],
			iconAnchor: [16, 32],
			popupAnchor: [-3, -76]
		})
	}).enable();

	map.on('draw:created', function (e) {
		var layer = e.layer;

		draw = L.marker(layer.getLatLng(), {draggable: true, clickable: true, icon: L.icon({
			iconUrl: '../resources/img/icon/poi.png',
			iconRetinaUrl: '../resources/img/icon/poi@2x.png',
			iconSize: [32, 32],
			iconAnchor: [16, 32],
			popupAnchor: [0, -32]
		}) }).addTo(map);

		map.panTo( draw.getLatLng() );

		$("#survey").dialog("open");

		draw.bindPopup("<p>Aún puedes modificar mi posición, solo dame clic y mueve tu mouse.</p>").openPopup()
	});

});


function insertHtml(){

	/*
		SURVEY
	*/
	var html = [
		"<div id='" + id_survey + "'>",
		"	<label for='motivo'>Esta marca indica:</label>",
		"	<select id='motivo'>",
		"		<option value='cruce'>Cruce peligroso</option>",
		"		<option value='diseno'>Diseño urbano peligroso</option>",
		"		<option value='condiciones'>Condiciones peligrosas</option>",
	        "               <option value='invasion'>Invasión de ciclovía o carril confinado</option>",
		"		<option value='suceso'>Suceso</option>",
	        "               <option value='bici_blanca'>Bicicleta blanca</option>",
	        "               <option value='bikefriendly'>Comercio/Servicio Bikefriendly</option>",
	        "               <option value='colectivo'>Colectivo/Punto de encuentro</option>",
		"	</select>",
		"	<select id='suceso_opciones'>",
		"		<option value='asalto'>Asalto</option>",
		"		<option value='accidente'>Accidente</option>",
		"		<option value='robo_estacionamiento'>Robo de bicicleta en estacionamiento</option>",
		"		<option value='robo_calle'>Robo de bicicleta estacionada en la calle</option>",
		"	</select>",
	    "    <select id='invasion_opciones'>",
		"		<option value='estacionados'>Vehículos estacionados</option>",
		"		<option value='movimiento'>Vehículos en movimiento</option>",
	    "        <option value='comercio'>Comercio</option>",
	    "        <option value='invasion_otro'>Otro</option>",
		"	</select><br><br>",
		"	<label for='fecha'>Fecha del suceso:</label>",
		"	<div id='fecha'></div><br>",
		"	<label for='comentario'>Comentario</label><br>",
		"	<textarea id='comentario' class='comment' rows='4'></textarea>",
		"	<div align='right'><button id='custom_survey_button' class='button'>Agregar campos personalizados</button></div>",
		"</div>",
		"<div id='survey_custom' title='Campos personalizados'>",
		"	<div style='width:50%;display:inline-block;'>Identificador</div><div style='width:50%;display:inline-block;'>&nbsp;&nbsp;Valor</div>",
		"	<ul id='survey_custom_list'>",
		"	</ul>",
		"	<div align='right'><button id='button_agregar_custom' class='button'>Agregar</button></div>",
		"</div>"
	];

	/*
		NOTIFICATION
	*/
	html.push("<div id='" + id_notification + "'><p id='" + id_text + "'>Guardando...</p></div>");

	/*
		CONFIRM
	*/
	html.push("<div id='" + id_confirm + "'><p>El marcador y toda su información se eliminaran, ¿deseas continuar?</p></div>");

	$("body").append(html.join(""));
}


function buildDialogs(){

	insertHtml();

	/*
		DIALOGS
	*/
	$("#" + id_survey).dialog({
		dialogClass: "dialog-survey",
		autoOpen: false,
	    closeOnEscape: true,
	    resizable: false,
	    width: 450,
	    position: { my: "right-11%", at: "right-5%", of: "body" },
	    show: {
	        duration: 300
	      },
	    buttons: {
	        "Aceptar": function () {
	        	guardar();
	        },
	        "Cancelar": function () {
				$("#" + id_confirm ).dialog("open");
	        }
	    },
	    open: function (event, ui) {
	        $("#suceso_opciones").hide();
	        $("#invasion_opciones").hide();
	        $("#suceso_opciones").val("asalto");
	        $("#invasion_opciones").val("estacionados");
	        $("#motivo").val("cruce");
	        $("#comentario").val("");
	        $('.popover').remove();

	        var myDate = new Date();
	        var prettyDate = myDate.getFullYear() + '-' + (myDate.getMonth() + 1) + '-' +
	            myDate.getDate();
	        $("#fecha").val(prettyDate);
	    },
	    close: function(event, ui){
	    	$("#survey_custom_list").html("");
	        $("#survey_custom").dialog("close");

	    	new L.Draw.Marker(map, {
				icon: L.icon({
					iconUrl: '../resources/img/icon/poi.png',
					iconRetinaUrl: '../resources/img/icon/poi@2x.png',
					iconSize: [32, 32],
					iconAnchor: [16, 32],
					popupAnchor: [-3, -76]
				})
			}).enable();
	    }
	});

	$("#survey_custom").dialog({
		autoOpen: false,
		width: 300,
		position: {my: "left-312 top-20", at: "left top", of: "#survey", collision: "none"}
	});

	$("#" + id_notification ).dialog({
		dialogClass: "dialog-notification",
		autoOpen: false,
		resizable: false,
    	width: 300,
    	height: 80,
    	modal: true
	});

	$("#" + id_confirm ).dialog({
		dialogClass: "dialog-notification",
		autoOpen: false,
		resizable: false,
    	width: 300,
    	height: 150,
    	modal: true,
    	buttons: [
			{
				text: "Si",
				click: function() {
					map.removeLayer(draw);
		            $("#survey_custom").dialog("close");
		            $( "#" + id_survey ).dialog( "close" );
		            $( this ).dialog( "close" );
				}
			},
			{
				text: "No",
				click: function() {
					$( this ).dialog( "close" );
				}
			}
		]
	});


	/*
		LISTENERS
	*/

	$("#custom_survey_button").click(function(evt){
		$("#survey_custom").dialog("open");
	});

	$("#button_agregar_custom").click(function(evt){
		$("#survey_custom_list").append("<li><input type='text' name='key' class='custom_input custom_key_id'> = <input type='text' name='value' class='custom_input custom_value_id'></li>");

		$(".custom_value_id").bind("keypress", function(evt){
			var regex = new RegExp("^[a-zA-Z0-9-:_/ @]+$");
			var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
			if (!regex.test(key)) {
				event.preventDefault();
				return false;
			}
		});

		$(".custom_key_id").bind("keypress", function(evt){
			var regex = new RegExp("^[a-zA-Z0-9-:_/@]+$");
			var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
			if (!regex.test(key)) {
				event.preventDefault();
				return false;
			}
		});
	});

	$("#motivo").change(function(){
	    if( $("#motivo").val() == "suceso" ){
	        $("#invasion_opciones").hide();
	        $("#suceso_opciones").show(500);
	        $("#motivo").width("100px");
	    }else if( $("#motivo").val() == "invasion" ){
	        $("#suceso_opciones").hide();
	        $("#invasion_opciones").show(500);
	    }else{
	        $("#suceso_opciones").hide();
	        $("#invasion_opciones").hide();
	        $("#motivo").width("auto");
	    }
	});


	/*
		DATE PICKER
	*/
	$.datepicker.regional['es'] = {
		closeText: 'Cerrar',
		prevText: '<Ant',
		nextText: 'Sig>',
		currentText: 'Hoy',
		monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
		monthNamesShort: ['Ene','Feb','Mar','Abr', 'May','Jun','Jul','Ago','Sep', 'Oct','Nov','Dic'],
		dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
		dayNamesShort: ['Dom','Lun','Mar','Mié','Juv','Vie','Sáb'],
		dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
		weekHeader: 'Sm',
		dateFormat: 'yy-mm-dd',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''
	};

	$("#fecha").datepicker( $.datepicker.regional['es']);
	$("#fecha").datepicker( "option", "maxDate", 0 );
}


/*
	CLEAN
*/
function clean(){
	$("#comentario").val("");
	$('#comercios, #agradable, #desagradable, #comoda, #incomoda, #conectada, #no_conectada, #insegura, #no_iluminada, #transito, #no_mantenimiento').attr('checked', false);
	$("#survey_custom_list").html("");
}


/*
		SAVE
*/
function guardar(){

	$("#" + id_notification).dialog("open");

	/*
		BUILD QUERY
	*/
	var options = getOptionsString();
	var query = [];
	query.push("https://" + sql.subdomain + ".cartodb.com/api/v2/sql?q=");
	query.push("INSERT INTO puntos");
	query.push("(the_geom,date,type,comment) VALUES ");
	query.push("(ST_SetSRID(ST_GeomFromGeoJSON('");
	query.push(JSON.stringify(draw.toGeoJSON().geometry));
	query.push("'),4326),");
	query.push(options)
	query.push(")&api_key=" + sql.key);


	/*
			POST CALL
	*/
	$.post( query.join("") ).done(function(){
		$("#" + id_text ).html("¡ Gracias !");
		/*
			TIMEOUT FOR DIALOG CLOSE
		*/
		setTimeout( function () {
		        $('#' + id_notification).dialog('close'); 
		        $("#" + id_text ).html("Guardando...");
		    }, 2000 
		);
		$("#survey").dialog("close");

		if( tags.length > 0 ){
			var query = "../servlets/tags.php?tags=" + tags.join();
			$.get(query, function(data){});
		}

		map.removeLayer(draw);
	}).fail(function(){
		/*
				HANDLE ERROR
		*/
	});
}

function getOptionsString(){
	tags = [];
    var options = {};

    options.fecha = "'" + $("#fecha").val() + "'";
    options.type = "'" + getType( $("#motivo").val() ) + "'";
    
    var text = [];
    var aux;
    if($("#survey_custom").dialog( "isOpen" )){
	    var custom_fields = $(".custom_input");
	    var count = custom_fields.length;
		for( var i = 0; i < count; i = i+2){

			if( custom_fields[i].value.length > 0 ){
				if( i !== 0 ){
					text.push("/////");
				}

				aux = custom_fields[i].value.replace('"', "'");
				aux = aux.replace(","," ");
				text.push('"' + aux + '":');
				text.push('"' + custom_fields[i + 1].value.replace('"', "'") + '"');

				tags.push(aux);
			}

		}

		var comment = encodeURI($("#comentario").val());
		if( comment.length > 0 ){
			if( count > 0 ){
				text.push("/////");
			}
			text.push(comment.replace('"', "'"));
		}
	}else{
		text.push($("#comentario").val().replace('"', "'"));
	}

	options.comment = text.join("");

	var query = [];
	query.push(options.fecha + ",");
	query.push(options.type + ",");
	query.push("'" + encodeURI(options.comment) + "'");

    return query.join("");
}

function getType(val) {
    if ("cruce" == val) {return "Cruce peligroso";}
    if ("diseno" == val) {return "Diseño urbano peligroso";}
    if ("condiciones" == val) {return "Condiciones peligrosas";}
    if ("bici_blanca" == val) {return "Bicicleta blanca";}
    if ("invasion" == val) {
    	var aux = $("#invasion_opciones").val();
        if( aux == "estacionados" ) {
            return "Vehículos estacionados en carril confinado";
        }
        if( aux == "movimiento" ) {
            return "Vehículos en movimiento en carril confinado";
        }
        if( aux == "comercio" ) {
            return "Comercio en carril confinado";
        }
        if( aux == "invasion_otro" ) {
            return "Invasión de carril confinado";
        }
    }
    if ("suceso" == val) {
    	var aux = $("#suceso_opciones").val();
        if ( aux == "asalto") {return "Asalto";}
        if ( aux == "accidente") {return "Accidente";}
        if ( aux == "robo_estacionamiento") {return "Robo de bicicleta en estacionamiento";}
        if ( aux == "robo_calle") {return "Robo de bicicleta estacionada en la calle";}
    }
    if ("bikefriendly" == val) {
    	return "Comercio/Servicio Bikefriendly";
    }
    if ("colectivo" == val) {
    	return "Colectivo/Punto de encuentro";
    }
}