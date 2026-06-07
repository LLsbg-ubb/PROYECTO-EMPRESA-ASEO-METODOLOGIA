const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Pago",
  tableName: "pagos",

  columns: {
    id_pago: {
      primary: true,
      type: "int",
      generated: true,
    },

    monto: {
      type: "decimal",
      precision: 12,
      scale: 2,
    },

    fecha_pago: {
      type: "timestamp",
      nullable: true,
    },

    comprobante: {
      type: "varchar",
      length: 100,
      nullable: true,
    },

    estado: {
      type: "enum",
      enum: ["PENDIENTE", "PAGADO"],
      default: "PENDIENTE",
    },
  },

  relations: {
    servicio: {
      target: "Servicio",
      type: "one-to-one",
      joinColumn: {
        name: "id_servicio",
      },
    },
  },
});