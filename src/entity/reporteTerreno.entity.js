const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "ReporteTerreno",
  tableName: "reportes_terreno",

  columns: {
    id_reporte: {
      primary: true,
      type: "int",
      generated: true,
    },

    porcentaje_avance: {
      type: "int",
      nullable: true,
    },

    observaciones: {
      type: "text",
      nullable: true,
    },

    fecha_reporte: {
      type: "timestamp",
      createDate: true,
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

    trabajador: {
      target: "Trabajador",
      type: "many-to-one",
      joinColumn: {
        name: "id_trabajador",
      },
    },
  },
});