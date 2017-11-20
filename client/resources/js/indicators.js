
function getTopDangerous(){
  hideZonesLayer();
  hideRouteLayer();

  var maxResultSize = 10;

  var acceptedTypes = ["Incidente vial"];

  var incidentes = {
    type: "FeatureCollection",
    features: getPointsInView(acceptedTypes)
  }

  var pointBuffer, cluster, clusters = [];
  for(var feature of incidentes.features){
    pointBuffer = turf.buffer(feature, 0.020, {units: "kilometers"});

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

  var html = "indice, numero_incidentes, latitud, longitud\n";
  for(var i = 0; i < result.features.length; i++){
    feature = result.features[i];
    html += (i+1) + ", " + feature.properties.counter + ", " + feature.geometry.coordinates[1] + ", " + feature.geometry.coordinates[0] + "\n";
  }

  $("#resultTopDangerous").html(html);
  // update map
  setPointFilters(acceptedTypes);

  indicatorsLayer.clearLayers();
  indicatorsLayer.addData(result);
}


function clearIndicators(){
  indicatorsLayer.clearLayers();
  $("#resultTopDangerous").html("");

  $("#cleanFilters").trigger("click");
}
