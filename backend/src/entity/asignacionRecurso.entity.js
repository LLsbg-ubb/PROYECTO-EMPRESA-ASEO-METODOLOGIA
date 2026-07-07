const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "AsignacionRecurso",
  tableName: "asignaciones_recursos",

  columns: {
    id_asignacion_recurso: {
      primary: true,
      type: "int",
      generated: true,
    },

    cantidad: {
      type: "int",
    },
  },

  relations: {
    servicio: {
      target: "Servicio",
      type: "many-to-one",
      joinColumn: {
        name: "id_servicio",
      },
    },

    recurso: {
      target: "Recurso",
      type: "many-to-one",
      joinColumn: {
        name: "id_recurso",
      },
    },
  },
});