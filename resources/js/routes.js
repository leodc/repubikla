var id_survey = "survey",
	id_notification = "notification",
	id_text = "notification_text",
	id_confirm = "dialog-confirm",
	popup;

$(function(){
	buildDialogs();

	L.drawLocal.draw.handlers.polyline.tooltip.start = "Inicia el dibujo con un clic.";
	L.drawLocal.draw.handlers.polyline.tooltip.cont = "Da clic para continuar el dibujo.";
	L.drawLocal.draw.handlers.polyline.tooltip.end = "Da clic en el ultimo punto para terminar el dibujo.";

	var drawControl = new L.Control.Draw();

	$("#start_draw").click(function(event){
		new L.Draw.Polyline(map, {
			shapeOptions: {
                color: 'black'
            }
		}).enable();
	});

	map.on('draw:created', function (e) {
		draw = e.layer;

		map.addLayer(draw);
		draw.options.editing || (draw.options.editing = {});
		draw.editing.enable();

		map.fitBounds( draw.getBounds(), { paddingBottomRight: L.point(500, 0)} );
		
		$("#survey").dialog("open");

		popup = L.popup()
			.setLatLng( draw.getBounds().getCenter() )
			.setContent('<p>Si deseas eliminar un punto da clic sobre el o arrastralo a la posición deseada para modificar tu dibujo.</p>')
			.openOn(map);
	});

	$( "#frecuencia_slider" ).slider({
		range: "max",
		min: 1,
		max: 13,
		value: 1,
		slide: function( event, ui ) {
			$( "#frecuencia" ).val( getSliderText(ui.value) );
		}
	});

	$("#tiempo, #solo").keydown(function (e) {
		if ( (e.keyCode == 65 && e.ctrlKey === true) || (e.keyCode >= 35 && e.keyCode <= 39)) { return;}
		if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
			e.preventDefault();
		}
	});
	$( "#tiempo, #solo" ).spinner({ min: 0 });

	$("#solo").val("0");

});


function insertHtml(){

	/*
		SURVEY
	*/
	var html = [
		"<div id='" + id_survey + "'>",
		"	<label for='motivo'>¿Cúal fue el motivo principal del recorrido?</label>",
		"	<select id='motivo'>",
		"		<option value='ir_trabajo'>Ir al trabajo</option>",
		"		<option value='casa'>Regreso a casa</option>",
		"		<option value='trabajo'>Desplazamientos de trabajo</option>",
		"		<option value='estudios'>Estudios</option>",
		"		<option value='visita'>Visitas</option>",
		"		<option value='compras'>Compras</option>",
		"		<option value='turismo'>Paseo, turismo</option>",
		"		<option value='deporte'>Deporte</option>",
        "        <option value='comida'>Comida</option>",
        "        <option value='otra'>Otra actividad</option>",
		"	</select><br><br>",
		"	<label for='tiempo'>Tiempo del recorrido (minutos)</label>",
		"	<input id='tiempo'><br><br>",
		"	<label for='frecuencia'>Frecuencia del recorrido: </label>",
		"	<input type='text' id='frecuencia' readonly style='border:0; color:#83A440; font-weight:bold; width: 300px; background-color: transparent;'>",
		"	<div id='frecuencia_slider'></div><br>",
		"	Califica esta ruta, en su mayoría es:<br>",
		"	<input type='checkbox' id='calificacion_1'><label for='calificacion_1'>Rápida y conectada</label><br>",
		"	<input type='checkbox' id='calificacion_2'><label for='calificacion_2'>Segura</label><br>",
		"	<input type='checkbox' id='calificacion_3'><label for='calificacion_3'>Agradable y cómoda</label><br>",
		"	<input type='checkbox' id='calificacion_4'><label for='calificacion_4'>La única que puedo tomar</label><br><br>",
		"	<label for='solo'>Número de personas con las que haces este recorrido: </label>",
		"	<input id ='solo' style='width:100px;'><br><br>",
        "    <input type='checkbox' id='transporte'><label for='transporte'>Usé transporte público antes o después de la ruta.</label><br>",
        "    <input type='checkbox' id='publica'><label for='publica'>Hice la ruta en bicicleta pública.</label><br><br>",
        "    <label for='comentario'>Comentario:</label><br>",
        "    <textarea id='comentario' class='comment' rows='4'></textarea>",
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
	html.push("<div id='" + id_confirm + "'><p>Esto eliminara el dibujo, ¿deseas continuar?</p></div>");

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
		resizable: false,
    	width: 518,
    	height: 596,
    	position: { my: "right-11%", at: "right-5%", of: "body" },
		buttons: [
			{
				text: "Guardar dibujo",
				click: function() {
					guardar();
				}
			},
			{
				text: "Cancelar dibujo",
				click: function() {
					$("#" + id_confirm ).dialog("open");
				}
			}
		],
		open: function (event, ui) {
			clean();
			$("#start_draw").hide();
		},
		close: function(event, ui){
			clean();
			$("#survey_custom").dialog("close");
			$("#start_draw").show();
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
					$( this ).dialog( "close" );
					$( "#" + id_survey ).dialog( "close" );
					map.removeLayer(draw);
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
}


/*
	CLEAN
*/
function clean(){
	$("#comentario").val("");
	$("#survey_custom_list").html("");
	$("#modificar_ruta").blur();
	$( "#frecuencia" ).val( getSliderText($( "#frecuencia_slider" ).slider( "value" )) );
    $("#motivo").val("ir_trabajo");
    $("#tiempo").val("15");
    $("#frecuencia_slider").slider( "option", "value", 1 );
    $("#calificacion_1").prop("checked", false);
    $("#calificacion_2").prop("checked", false);
    $("#calificacion_3").prop("checked", false);
    $("#calificacion_4").prop("checked", false);
    $("#publica").prop("checked", false);
    $("#transporte").prop("checked", false);
    $("#solo").val("0");
    $("#comentario").val("");

    map.closePopup( popup );
}


function toMultilineString(){
	var matrix = [];
	matrix[0] = draw.getLatLngs();

	var multiLine = L.multiPolyline(matrix);

	return multiLine.toGeoJSON().geometry
}


/*
		SAVE
*/
function guardar(){

	/*
		BUILD MULTILINESTRING	
	*/
	
	$("#" + id_notification).dialog("open");

	/*
		BUILD QUERY
	*/
	var options = getOptionsString();
	var query = [];
	query.push("https://" + sql.subdomain + ".cartodb.com/api/v2/sql?q=");
	query.push("INSERT INTO rutas");
	query.push("(the_geom, ruta_motivo,ruta_tiempo,ruta_frecuencia,ruta_rapida,ruta_segura,ruta_amigable,ruta_neutral,ruta_acompanantes,ruta_bicipublica,ruta_multimodal,comment) VALUES ");
	query.push("(ST_SetSRID(ST_GeomFromGeoJSON('");
	query.push(JSON.stringify( toMultilineString() ));
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
		map.removeLayer(draw);

		if( tags.length > 0 ){
			var query = "../servlets/tags.php?tags=" + tags.join();
			$.get(query, function(data){});
		}
	}).fail(function(){
		/*
				HANDLE ERROR
		*/
	});


	$
}

function getOptionsString(){
	tags = [];
    var options = {};

    options.reason = $("#motivo").val();
    options.time = $("#tiempo").val();
    options.frequency = getSliderValue();
    options.fast = $("#calificacion_1").is(":checked").toString();
    options.secure = $("#calificacion_2").is(":checked").toString();
    options.pleasant = $("#calificacion_3").is(":checked").toString();
    options.unique =$("#calificacion_4").is(":checked").toString();
    options.people = $("#solo").val();
    options.publica = $("#publica").is(":checked").toString();
    options.transporte = $("#transporte").is(":checked").toString();

    
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

		var comment = $("#comentario").val();
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
	query.push("'" + options.reason + "',");
	query.push(options.time + ",");
	query.push(options.frequency + ",");
	query.push(options.fast + ",");
	query.push(options.secure + ",");
	query.push(options.pleasant + ",");
	query.push(options.unique + ",");
	query.push(options.people + ",");
	query.push(options.publica + ",");
	query.push(options.transporte + ",");
	query.push("'" + options.comment + "'");

    return query.join("");
}

function getSliderText( option ){
	if( option == 1) return "Una vez al mes";
	if( option == 2) return "Dos veces al mes";
	if( option == 3) return "Tres veces al mes";
	if( option == 4) return "Una vez por semana";
	if( option == 5) return "Dos veces por semana";
	if( option == 6) return "Tres veces por semana";
	if( option == 7) return "Cuatro veces por semana";
	if( option == 8) return "Cinco veces por semana";
	if( option == 9) return "Seis veces por semana";
	if( option == 10) return "Siete veces por semana";
	if( option == 11) return "Dos veces al día";
	if( option == 12) return "Tres veces al día";
	if( option == 13) return "Cuatro veces al día";
}

function getSliderValue(){
    var selected = $( "#frecuencia_slider" ).slider( "value" );
    if( selected < 5 ) return selected;

    var value;
    switch(selected){
    	case 5: value = 8;
    		break;
    	case 6: value = 12;
    		break;
    	case 7: value = 16;
    		break;
    	case 8: value = 20;
    		break;
    	case 9: value = 24;
    		break;
    	case 10: value = 30;
    		break;
    	case 11: value = 60;
    		break;
    	case 12: value = 90;
    		break;
    	case 13: value = 120;
    		break;
    }

    return value;
}
