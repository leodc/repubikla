var propertiesDelimiter = "/////";
var fieldDelimiter = "\":\"";

(function(exports){

  exports.buildProperties = function (commentLine){
    var fieldsList = commentLine.split(propertiesDelimiter);

    var properties = {};
    for( var i = 0; i < fieldsList.length; i++ ){
      var fields = fieldsList[i].split(fieldDelimiter);

      if( fields.length === 2 ){
        var key = fields[0].replace(/"/g,'').toLowerCase();
        while( key.slice(-1) === " " ){
          key = key.substring(0, key.length - 1);
        }

        var value = fields[1].replace(/"/g,'');

        properties[key] = value;
      }else if( fields.length === 1 ){
        if( fields[0] && fields[0].length > 0)
        properties["Comentario"] = fields[0];
      }
    }

    return properties;
  }

  exports.propertiesToline = function(properties){
    var line = [];
    var comment = "";
    var excluded = ["type", "date"];

    for( var key in properties ){
      if( key === "Comentario" ){
        comment = properties[key];
        continue;
      }else if( excluded.indexOf(key) > -1 ) continue;

      line.push( "\"" + key + fieldDelimiter + properties[key] + "\"");
      line.push(propertiesDelimiter);
    }

    if( comment.length > 0 ){
      line.push(comment);
    }else{
      line.pop();
    }

    return line.join("");
  }

  exports.parseFrecuencia = function(target){
    switch (target) {
      case 1:
        return "Una vez al mes";
      case 2:
        return "Dos veces al mes";
      case 3:
        return "Tres veces al mes";
      case 4:
        return "Una vez por semana";
      case 5:
        return "Dos veces por semana";
      case 6:
        return "Tres veces por semana";
      case 7:
        return "Cuatro veces por semana";
      case 8:
        return "Cinco veces por semana";
      case 9:
        return "Seis veces por semana";
      case 10:
        return "Siete veces por semana";
      case 11:
        return "Dos veces al día";
      case 12:
        return "Tres veces al día";
      case 13:
        return "Cuatro veces al día";
      default:
        console.error("Error: frecuency not found - ", target);
        return "";
    }
  }

})(typeof exports === "undefined"? this["featuresUtils"]={}: exports);
