var id_survey = "survey",
	id_notification = "notification",
	id_text = "notification_text",
	id_confirm = "dialog-confirm",
	popup;

$(function(){
	buildDialogs();

	L.drawLocal.draw.handlers.polygon.tooltip.start = "Inicia el dibujo con un clic.";
	L.drawLocal.draw.handlers.polygon.tooltip.cont = "Da clic para continuar el dibujo.";
	L.drawLocal.draw.handlers.polygon.tooltip.end = "Da clic en el primer punto para terminar el dibujo.";

	var drawControl = new L.Control.Draw();

	$("#start_draw").click(function(event){
		new L.Draw.Polygon(map, {
			shapeOptions: {
                color: 'black'
            },
            allowIntersection: false,
            drawError: {
                color: '#e1e100',
                message: '<strong>Error:<strong> No puedes continuar tu dibujo en ese punto.'
            },
		}).enable();
	});

	map.on('draw:created', function (e) {
		draw = e.layer;

		map.addLayer(draw);
		draw.editing.enable();

		map.fitBounds( draw.getBounds(), { paddingBottomRight: L.point(500, 0)} );

		$("#survey").dialog("open");

		popup = L.popup()
			.setLatLng( draw.getBounds().getCenter() )
			.setContent('<p>Si deseas eliminar un punto da clic sobre el o arrastralo a la posición deseada para modificar tu dibujo.</p>')
			.openOn(map);
	});

});


function insertHtml(){

	/*
		SURVEY
	*/
	var html = [
		"<div id='" + id_survey + "'>",
		"	<label>¿Qué características quieres señalar de esta área?</label><br>",
	    "   <input type='checkbox' value='agradable' id='agradable'>",
	    "   <label for='agradable'>Agradable (paisaje urbano, ambiente, vegetación)</label><br>",
		"	<input type='checkbox' value='desagradable' id='desagradable'>",
	    "   <label for='desagradable'>Desagradable, hostil</label><br>",
	    "   <input type='checkbox' value='comoda' id='comoda'>",
	    "   <label for='comoda'>Cómoda, con buen diseño de calles y mobiliario</label><br>",
	    "   <input type='checkbox' value='incomoda' id='incomoda'>",
	    "   <label for='incomoda'>Incomoda, con mal diseño de calles y mobiliario</label><br>",
		"   <input type='checkbox' value='comercios' id='comercios'>",
	    "   <label for='comercios'>Con concentración de comercios y servicios útiles</label><br>",
	    "   <input type='checkbox' value='conectada' id='conectada'>",
	    "   <label for='conectada'>Bien conectada (diseño de cruces, fases semafóricas)</label><br>",
	    "   <input type='checkbox' value='no_conectada' id='no_conectada'>",
	    "   <label for='no_conectada'>Mal conectada</label><br>",
	    "   <input type='checkbox' value='insegura' id='insegura'>",
	    "   <label for='insegura'>Insegura (a nivel personal)</label><br>",
	    "   <input type='checkbox' value='no_iluminada' id='no_iluminada'>",
	    "   <label for='no_iluminada'>Mal iluminada</label><br>",
	    "   <input type='checkbox' value='transito' id='transito'>",
	    "   <label for='transito'>Tránsito confuso y peligroso</label><br>",
	    "   <input type='checkbox' value='no_mantenimiento' id='no_mantenimiento'>",
	    "   <label for='no_mantenimiento'>Mal mantenimiento (pavimento, instalaciones)</label><br><br>",
		"	<label for='comentario'>Comentario</label><br>",
		"	<textarea id='comentario' class='comment' rows='3'></textarea><br><br>",
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
    	width: 400,
    	height: 486,
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
	$('#comercios, #agradable, #desagradable, #comoda, #incomoda, #conectada, #no_conectada, #insegura, #no_iluminada, #transito, #no_mantenimiento').attr('checked', false);
	$("#survey_custom_list").html("");

	map.closePopup(popup);
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
	query.push("INSERT INTO zonas");
	query.push("(the_geom, zona_agradable,zona_comercio,zona_comoda,zona_conectada,zona_desagradable,zona_incomoda,zona_insegura,zona_no_conectada,zona_no_iluminada,zona_no_mantenimiento,zona_transito,comment) VALUES ");
	query.push("(ST_SetSRID(ST_GeomFromGeoJSON('");
	query.push(JSON.stringify(draw.toGeoJSON().geometry));
	query.push("'),4326),");
	query.push(options);
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

    options.zona_comercio = $('#comercios').is(':checked').toString();
    options.zona_agradable = $('#agradable').is(':checked').toString();
    options.zona_desagradable = $('#desagradable').is(':checked').toString();
    options.zona_comoda = $('#comoda').is(':checked').toString();
    options.zona_incomoda = $('#incomoda').is(':checked').toString();
    options.zona_conectada = $('#conectada').is(':checked').toString();
    options.zona_no_conectada = $('#no_conectada').is(':checked').toString();
    options.zona_insegura = $('#insegura').is(':checked').toString();
    options.zona_no_iluminada = $('#no_iluminada').is(':checked').toString();
    options.zona_transito = $('#transito').is(':checked').toString();
    options.zona_no_mantenimiento = $('#no_mantenimiento').is(':checked').toString();
    
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
	query.push(options.zona_agradable + ",");
	query.push(options.zona_comercio + ",");
	query.push(options.zona_comoda + ",");
	query.push(options.zona_conectada + ",");
	query.push(options.zona_desagradable + ",");
	query.push(options.zona_incomoda + ",");
	query.push(options.zona_insegura + ",");
	query.push(options.zona_no_conectada + ",");
	query.push(options.zona_no_iluminada + ",");
	query.push(options.zona_no_mantenimiento + ",");
	query.push(options.zona_transito + ",");
	query.push("'" + options.comment + "'");

    return query.join("");
}
