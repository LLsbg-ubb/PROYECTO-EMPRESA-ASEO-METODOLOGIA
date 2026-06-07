const { DataSource } = require('typeorm');
require('dotenv').config();
const Usuario = require('../entity/usuario.entity');
const Trabajador = require('../entity/trabajador.entity');
const ServicioRecurso = require('../entity/servicioRecurso.entity');
const ServicioEspecializacion = require('../entity/servicioEspecializacion.entity');
const Servicio = require('../entity/servicio.entity');
const ReporteTerreno = require('../entity/reporteTerreno.entity');
const Recurso = require('../entity/recurso.entity');
const Pago = require('../entity/pago.entity');
const Incidencia = require('../entity/incidencia.entity');
const Especializacion = require('../entity/especializacion.entity');
const Cliente = require('../entity/cliente.entity');
const AsignacionTrabajador = require('../entity/asignacionTrabajador.entity');
const AsignacionRecurso = require('../entity/asignacionRecurso.entity');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    Usuario,
    Trabajador,
    ServicioRecurso,
    ServicioEspecializacion,
    Servicio,
    ReporteTerreno,
    Recurso,
    Pago,
    Incidencia,
    Especializacion,
    Cliente,
    AsignacionTrabajador,
    AsignacionRecurso
  ],
});

module.exports = AppDataSource;