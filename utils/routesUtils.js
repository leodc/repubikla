var motivosId =    ["ir_trabajo", "casa", "trabajo", "estudios", "visita", "compras", "turismo", "deporte", "comida", "otra"];
var motivosText =  ["Ir al trabajo", "Regreso a casa", "Desplazamientos de trabajo", "Estudios", "Visitas", "Compras", "Paseo, turismo", "Deporte", "Comida", "Otra actividad"];

function parseMotivo(expression){
    var indexAux = motivosId.indexOf(expression);
    if(indexAux > -1){
        return motivosText[indexAux];
    }
    
    indexAux = motivosText.indexOf(expression);
    if(indexAux > -1){
        return motivosId[indexAux];
    }
    
    return "";
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
        case 8:
            return "Dos veces por semana";
        case 12:
            return "Tres veces por semana";
        case 16:
            return "Cuatro veces por semana";
        case 20:
            return "Cinco veces por semana";
        case 24:
            return "Seis veces por semana";
        case 30:
            return "Siete veces por semana";
        case 60:
            return "Dos veces al día";
        case 90:
            return "Tres veces al día";
        case 120:
            return "Cuatro veces al día";
        default:
            return "";
    }
}


module.exports = {
    parseMotivo: parseMotivo,
    parseFrecuencia: parseFrecuencia
};