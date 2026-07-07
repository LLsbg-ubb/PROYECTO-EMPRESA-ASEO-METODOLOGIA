const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "AsignacionTrabajador",
  tableName: "asignaciones_trabajadores",

  columns: {
    id_asignacion: {
      primary: true,
      type: "int",
      generated: true,
    },

    fecha_asignacion: {
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

    asignadoPor: {
      target: "Usuario",
      type: "many-to-one",
      joinColumn: {
        name: "asignado_por",
      },
    },
  },
});