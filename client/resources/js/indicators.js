function getTopDangerous(){
  $("#chargingDialog").modal('show');

  hideZonesLayer();
  hideRouteLayer();

  var maxResultSize = 10;
  var acceptedTypes = ["Incidente vial"];
  var bufferSize = Number($("#topBufferSize").val()/1000) || 0.02;

  incidentes = {
    type: "FeatureCollection",
    features: getPointsInView(acceptedTypes)
  }

  var pointBuffer, cluster, clusters = [];
  for(var feature of incidentes.features){
    pointBuffer = turf.buffer(feature, bufferSize, {units: "kilometers"});
    cluster = turf.within(incidentes, turf.featureCollection([pointBuffer]));

    clusters.push({
      cluster: cluster,
      feature: feature
    });
  }

  clusters.sort(function(a, b){
    return b.cluster.features.length - a.cluster.features.length;
  });

  // remove duplicates
  var counted = [];
  var result = turf.featureCollection([]);
  for(var i = 0; i < clusters.length && result.features.length < maxResultSize; i++){
    cluster = clusters[i];

    if(counted.indexOf(cluster.feature.properties._index) < 0){
      counted.push(cluster.feature.properties._index);

      cluster.feature.properties._index = result.features.length+1;
      cluster.feature.properties.counter = cluster.cluster.features.length;
      result.features.push(cluster.feature);

      for(var feature of cluster.cluster.features){
        counted.push(feature.properties._index);
      }
    }
  }

  // get info
  reverseGeocoding(result, 0, function(result){
    var html = "indice, numero_incidentes, calle_1, calle_2, codigo_postal, limite_velocidad, limite_velocidad_unidades, latitud, longitud\n";
    for(var i = 0; i < result.features.length; i++){
      feature = result.features[i];

      html += (i+1) + ", " +
        feature.properties.counter + ", " +
        feature.properties.calle_1 + ", " +
        (feature.properties.calle_2 ? feature.properties.calle_2:"-") + ", " +
        feature.properties.codigo_postal + ", " +
        (feature.properties.limite_velocidad ? feature.properties.limite_velocidad:"") + ", " +
        (feature.properties.limite_velocidad_unidades ? feature.properties.limite_velocidad_unidades:"") + ", " +
        feature.geometry.coordinates[1] + ", " +
        feature.geometry.coordinates[0] + "\n";
    }

    $("#resultTopDangerous").html(html);

    // update map
    setPointFilters(acceptedTypes);

    indicatorsLayer.clearLayers();
    indicatorsLayer.addData(result);

    $("#downloadTopDangerous").removeClass("hidden");
    $("#chargingDialog").modal('hide');
  });
}

function reverseGeocoding(featureCollection, index, callback){
  if(index < featureCollection.features.length){
    var url = "https://www.mapquestapi.com/geocoding/v1/reverse?key=ZJanp0xBDpPMOLftzxBrG1tzmNtsjPWF&location=" + featureCollection.features[index].geometry.coordinates[1] + "," + featureCollection.features[index].geometry.coordinates[0];
    var options = "&includeRoadMetadata=true&includeNearestIntersection=true";

    $.getJSON(url + options, function(data){
      var feature = featureCollection.features[index];
      var info = data.results[0].locations[0];

      if(info.nearestIntersection){
        // feature.geometry.coordinates[0] = info.nearestIntersection.latLng.longitude;
        // feature.geometry.coordinates[1] = info.nearestIntersection.latLng.latitude;
        feature.properties.calle_2 = info.nearestIntersection.streetDisplayName;
      }

      if(info.roadMetadata){
        feature.properties.limite_velocidad = info.roadMetadata.speedLimit;
        feature.properties.limite_velocidad_unidades = info.roadMetadata.speedLimitUnits;
      }

      feature.properties.calle_1 = info.street;
      feature.properties.codigo_postal = info.postalCode;
    }).always(function() {
      reverseGeocoding(featureCollection, ++index, callback);
    });
  }else{
    callback(featureCollection);
  }
}

function downloadTopDangerousResults(){
  downloadCsv("cruces_top_incidentes_repubikla", $("#resultTopDangerous").html());
}

function clearIndicators(){
  indicatorsLayer.clearLayers();
  $("#resultTopDangerous").html("");

  $("#cleanFilters").trigger("click");
  $("#downloadTopDangerous").addClass("hidden");
}
