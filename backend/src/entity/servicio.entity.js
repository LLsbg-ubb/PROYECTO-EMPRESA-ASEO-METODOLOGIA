const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Servicio",
  tableName: "servicios",

  columns: {
    id_servicio: {
      primary: true,
      type: "int",
      generated: true,
    },

    nombre_servicio: {
      type: "varchar",
      length: 150,
    },

    direccion_servicio: {
      type: "text",
    },

    fecha_inicio_programada: {
      type: "timestamp",
    },

    fecha_fin_programada: {
      type: "timestamp",
    },

    fecha_inicio_real: {
      type: "timestamp",
      nullable: true,
    },

    fecha_fin_real: {
      type: "timestamp",
      nullable: true,
    },

    estado: {
      type: "enum",
      enum: [
        "PENDIENTE",
        "ASIGNADO",
        "EN_PROCESO",
        "FINALIZADO",
        "CERRADO",
        "CANCELADO",
      ],
      default: "PENDIENTE",
    },

    semaforo: {
      type: "enum",
      enum: ["VERDE", "AMARILLO", "ROJO"],
      default: "VERDE",
    },

    contrato_confirmado: {
      type: "boolean",
      default: false,
    },

    observaciones: {
      type: "text",
      nullable: true,
    },

    fecha_creacion: {
      type: "timestamp",
      createDate: true,
    },
  },

  relations: {
    cliente: {
      target: "Cliente",
      type: "many-to-one",
      joinColumn: {
        name: "id_cliente",
      },
      inverseSide: "servicios",
    },

    creadoPor: {
      target: "Usuario",
      type: "many-to-one",
      joinColumn: {
        name: "creado_por",
      },
      inverseSide: "serviciosCreados",
    },

    supervisor: {
      target: "Usuario",
      type: "many-to-one",
      joinColumn: {
        name: "id_supervisor",
      },
    },

    asignacionesTrabajadores: {
      target: "AsignacionTrabajador",
      type: "one-to-many",
      inverseSide: "servicio",
    },

    asignacionesRecursos: {
      target: "AsignacionRecurso",
      type: "one-to-many",
      inverseSide: "servicio",
    },

    reportes: {
      target: "ReporteTerreno",
      type: "one-to-many",
      inverseSide: "servicio",
    },

    incidencias: {
      target: "Incidencia",
      type: "one-to-many",
      inverseSide: "servicio",
    },

    pago: {
      target: "Pago",
      type: "one-to-one",
      inverseSide: "servicio",
    },

    especializacionesRequeridas: {
      target: "ServicioEspecializacion",
      type: "one-to-many",
      inverseSide: "servicio",
    },

    recursosRequeridos: {
      target: "ServicioRecurso",
      type: "one-to-many",
      inverseSide: "servicio",
    }
  }
});
