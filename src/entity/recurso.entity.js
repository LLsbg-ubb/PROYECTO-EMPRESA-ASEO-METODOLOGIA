const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Recurso",
  tableName: "recursos",

  columns: {
    id_recurso: {
      primary: true,
      type: "int",
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    stock_disponible: {
      type: "int",
      default: 0,
    },
  },

  relations: {
    asignaciones: {
      target: "AsignacionRecurso",
      type: "one-to-many",
      inverseSide: "recurso",
    },

    incidenciasRecursos: {
      target: "IncidenciaRecurso",
      type: "one-to-many",
      inverseSide: "recurso",
    },
  },
});
