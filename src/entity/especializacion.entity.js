const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Especializacion",
  tableName: "especializaciones",

  columns: {
    id_especializacion: {
      primary: true,
      type: "int",
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
      unique: true,
    },
  },

  relations: {
    trabajadores: {
      target: "Trabajador",
      type: "many-to-many",
      inverseSide: "especializaciones",
    },
  }
});