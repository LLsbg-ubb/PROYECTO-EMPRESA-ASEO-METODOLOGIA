const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "ServicioRecurso",
  tableName: "servicio_recurso",

  columns: {
    id_servicio: {
      primary: true,
      type: "int",
    },

    id_recurso: {
      primary: true,
      type: "int",
    },

    cantidad_requerida: {
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
      onDelete: "CASCADE",
    },

    recurso: {
      target: "Recurso",
      type: "many-to-one",
      joinColumn: {
        name: "id_recurso",
      },
      onDelete: "CASCADE",
    },
  },
});