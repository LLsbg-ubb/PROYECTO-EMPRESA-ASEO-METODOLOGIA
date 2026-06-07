const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "ServicioEspecializacion",
  tableName: "servicio_especializacion",

  columns: {
    id_servicio: {
      primary: true,
      type: "int",
    },

    id_especializacion: {
      primary: true,
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

    especializacion: {
      target: "Especializacion",
      type: "many-to-one",
      joinColumn: {
        name: "id_especializacion",
      },
      onDelete: "CASCADE",
    },
  },
});