const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Usuario",
  tableName: "usuarios",

  columns: {
    id_usuario: {
      primary: true,
      type: "int",
      generated: true,
    },
    run: {
      type: "varchar",
      length: 12,
      unique: true,
    },
    nombres: {
      type: "varchar",
      length: 100,
    },
    apellido_paterno: {
      type: "varchar",
      length: 50,
    },
    apellido_materno: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    correo: {
      type: "varchar",
      length: 150,
      unique: true,
    },
    hash_contrasena: {
      type: "text",
    },
    rol: {
      type: "enum",
      enum: ["ADMINISTRATIVO", "SUPERVISOR", "TRABAJADOR"],
    },
    activo: {
      type: "boolean",
      default: true,
    },
    fecha_creacion: {
      type: "timestamp",
      createDate: true,
    },
  },

  relations: {
    trabajador: {
      target: "Trabajador",
      type: "one-to-one",
      inverseSide: "usuario",
    },

    serviciosCreados: {
      target: "Servicio",
      type: "one-to-many",
      inverseSide: "creadoPor",
    },

    incidenciasReportadas: {
      target: "Incidencia",
      type: "one-to-many",
      inverseSide: "reportadaPor",
    },

    asignacionesRealizadas: {
      target: "AsignacionTrabajador",
      type: "one-to-many",
      inverseSide: "asignadoPor",
    },
  },
});