const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Cliente",
  tableName: "clientes",

  columns: {
    id_cliente: {
      primary: true,
      type: "int",
      generated: true,
    },
    rut: {
      type: "varchar",
      length: 12,
      unique: true,
    },
    razon_social: {
      type: "varchar",
      length: 150,
    },
    nombre_contacto: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    telefono: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    correo: {
      type: "varchar",
      length: 150,
      nullable: true,
    },
    direccion: {
      type: "text",
      nullable: true,
    },
    comuna: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    ciudad: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    fecha_creacion: {
      type: "timestamp",
      createDate: true,
    },
  },

  relations: {
    servicios: {
        target: "Servicio",
        type: "one-to-many",
        inverseSide: "cliente",
    },
  },
});