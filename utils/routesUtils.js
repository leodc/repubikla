var motivosId =    ["ir_trabajo", "casa", "trabajo", "estudios", "visita", "compras", "turismo", "deporte", "comida", "otra"];
var motivosText =  ["Ir al trabajo", "Regreso a casa", "Desplazamientos de trabajo", "Estudios", "Visitas", "Compras", "Paseo, turismo", "Deporte", "Comida", "Otra actividad"];

function parseMotivo(expression){
    
    /**
    var indexAux = motivosId.indexOf(expression);
    if(indexAux > -1){
        return motivosText[indexAux];
    }
    
    indexAux = motivosText.indexOf(expression);
    if(indexAux > -1){
        return motivosId[indexAux];
    }
    
    return "";
    */
    
    return expression;
}


function parseFrecuencia(target){
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


module.exports = {
    parseMotivo: parseMotivo,
    parseFrecuencia: parseFrecuencia
};