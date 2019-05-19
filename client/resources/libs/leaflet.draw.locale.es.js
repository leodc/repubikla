L.drawLocal = {
  draw: {
    toolbar: {
      buttons: {
        polyline:"Dibujar línea",
        polygon:"Dibujar polígono",
        rectangle:"Dibujar rectángulo",
        circle:"Dibujar círculo",
        marker:"Dibujar marcador"
      },
      actions: {
        title: "Cancelar dibujo",
        text: "Cancelar"
      },
      finish: {
        title: "Finalizar dibujo",
        text: "Finalizar"
      },
      undo: {
        title: "Eliminar último punto dibujado",
        text: "Eliminar último punto"
      }
    },

    handlers: {
      circle: {
      tooltip: {
        start: "Haz click y arrastra para dibujar un círculo"
      },
      radius: "Radio"
    },
    circlemarker: {
      tooltip: {
        start: "Haz click en el mapa para agregar el marcador"
      }
    },
    marker: {
      tooltip: {
        start: "Haz click en el mapa para agregar el marcador"
      }
    },
    polygon: {
      error: "<strong>Error:</strong>",
      tooltip: {
        start: "Haz click para empezar a dibujar el polígono",
        cont: "Haz click para continuar el polígono",
        end: "Haz click en el primer punto para terminar el dibujo"
      }
    },
    polyline: {
      error: '<strong>Error:</strong> las líneas no deben cruzarse',
      tooltip: {
        start: "Haz click para empezar a dibujar la línea",
        cont: "Haz click para continuar la línea",
        end: "Haz click en el último punto para terminar"
      }
    },
    rectangle: {
      tooltip: {
        start: "Haz click y arrastra para dibujar un rectángulo"
      }
    },
    simpleshape: {
      tooltip: {
        end: "Suelta el ratón para terminar el dibujo"
      }
    }
    }
  },
  edit: {
    toolbar: {
      actions: {
        save: {
          title: "Guardar cambios",
          text: "Guardar"
        },
        cancel: {
          title: "Cancelar y descartar cambios",
          text: "Cancelar"
        },
        clearAll: {
          title: "Eliminar todos los objetos dibujados",
          text: "Eliminar todo"
        }
      },
      buttons: {
        edit: "Editar",
        editDisabled: "No hay capas que editar",
        remove: "Eliminar",
        removeDisabled: "No hay capas que eliminar"
      }
    },
    handlers: {
      edit: {
        tooltip: {
          text: "Arrastra el marcador a la posición deseada",
          subtext: "Haz click en cancelar para deshacer los cambios"
        }
      },
      remove: {
        tooltip: {
          text: "Haz click en un objeto dibujado para eliminarlo"
        }
      }
    }
  }
};
