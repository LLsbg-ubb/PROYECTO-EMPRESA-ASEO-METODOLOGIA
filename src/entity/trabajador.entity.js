const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Trabajador",
  tableName: "trabajadores",

  columns: {
    id_trabajador: {
      primary: true,
      type: "int",
      generated: true,
    },
    fecha_contratacion: {
      type: "date",
    },
    estado: {
      type: "enum",
      enum: ["DISPONIBLE", "ASIGNADO", "INACTIVO"],
      default: "DISPONIBLE",
    },
  },

  relations: {
    usuario: {
      target: "Usuario",
      type: "one-to-one",
      joinColumn: {
        name: "id_usuario",
      },
      inverseSide: "trabajador",
    },

    especializaciones: {
      target: "Especializacion",
      type: "many-to-many",
      joinTable: {
        name: "trabajador_especializacion",
        joinColumn: {
          name: "id_trabajador",
        },
        inverseJoinColumn: {
          name: "id_especializacion",
        },
      },
    },

    asignaciones: {
      target: "AsignacionTrabajador",
      type: "one-to-many",
      inverseSide: "trabajador",
    },

    reportes: {
      target: "ReporteTerreno",
      type: "one-to-many",
      inverseSide: "trabajador",
    },
  }
});