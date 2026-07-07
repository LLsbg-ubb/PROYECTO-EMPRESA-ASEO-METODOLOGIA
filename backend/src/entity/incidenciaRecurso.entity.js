const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "IncidenciaRecurso",
  tableName: "incidencias_recursos",

  columns: {
    id_incidencia_recurso: {
      primary: true,
      type: "int",
      generated: true,
    },

    cantidad_requerida: {
      type: "int",
      default: 1,
    },

    observacion: {
      type: "text",
      nullable: true,
    },
  },

  relations: {
    incidencia: {
      target: "Incidencia",
      type: "many-to-one",
      joinColumn: {
        name: "id_incidencia",
      },
      onDelete: "CASCADE",
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
