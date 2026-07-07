const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Incidencia",
  tableName: "incidencias",

  columns: {
    id_incidencia: {
      primary: true,
      type: "int",
      generated: true,
    },

    tipo: {
      type: "varchar",
      length: 100,
    },

    prioridad: {
      type: "enum",
      enum: ["BAJA", "MEDIA", "ALTA", "CRITICA"],
    },

    descripcion: {
      type: "text",
    },

    solucion: {
      type: "text",
      nullable: true,
    },

    estado: {
      type: "enum",
      enum: ["ABIERTA", "RESUELTA"],
      default: "ABIERTA",
    },

    fecha_creacion: {
      type: "timestamp",
      createDate: true,
    },

    fecha_resolucion: {
      type: "timestamp",
      nullable: true,
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

    reportadaPor: {
      target: "Usuario",
      type: "many-to-one",
      joinColumn: {
        name: "reportada_por",
      },
    },

    recursosRequeridos: {
      target: "IncidenciaRecurso",
      type: "one-to-many",
      inverseSide: "incidencia",
      cascade: true,
    },
  },
});
