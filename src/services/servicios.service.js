const AppDataSource = require("../config/db");

const Servicio = require("../entity/servicio.entity");
const Usuario = require("../entity/usuario.entity");
const Cliente = require("../entity/cliente.entity");
const Trabajador = require("../entity/trabajador.entity");
const ServicioEspecializacion = require("../entity/servicioEspecializacion.entity");
const ServicioRecurso = require("../entity/servicioRecurso.entity");
const Recurso = require("../entity/recurso.entity");
const AsignacionTrabajador = require("../entity/asignacionTrabajador.entity");
const AsignacionRecurso = require("../entity/asignacionRecurso.entity");

class ServicioService {
    constructor() {
        this.serviciosRepository = AppDataSource.getRepository(Servicio);
        this.usuariosRepository = AppDataSource.getRepository(Usuario);
        this.clientesRepository = AppDataSource.getRepository(Cliente);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.servicioEspecializacionRepository = AppDataSource.getRepository(ServicioEspecializacion);
        this.servicioRecursoRepository = AppDataSource.getRepository(ServicioRecurso);
        this.recursoRepository = AppDataSource.getRepository(Recurso);
        this.asignacionTrabajadorRepository = AppDataSource.getRepository(AsignacionTrabajador);
        this.asignacionRecursoRepository = AppDataSource.getRepository(AsignacionRecurso);
    }

    /**
     * Obtiene todos los servicios registrados.
     * @returns {Promise<Servicio[]>}
     */
    async getAll() {
        return this.serviciosRepository.find({
            order: {
                nombre_servicio: "ASC"
            }
        });
    }

    /**
     * Obtiene un servicio por su ID.
     * @param {number} idServicio
     * @returns {Promise<Servicio | null>}
     */
    async getById(idServicio) {
        return this.serviciosRepository.findOne({
            where: {
                id_servicio: idServicio
            },
            relations: {
                cliente: true,
                creadoPor: true
            }
        });
    }

    /**
     * Crea un nuevo servicio.
     * @param {object} data
     * @returns {Promise<Servicio>}
     */
    async create(data) {
        let {
            id_cliente,
            nombre_servicio,
            direccion_servicio,
            fecha_inicio_programada,
            fecha_fin_programada,
            fecha_inicio_real,
            fecha_fin_real,
            contrato_confirmado,
            observaciones,
            creado_por
        } = data;

        if (!id_cliente || !nombre_servicio?.trim() || !fecha_inicio_programada || !fecha_fin_programada) {
            throw new Error("id_cliente, nombre_servicio, fecha_inicio_programada y fecha_fin_programada son obligatorios.");
        }

        const cliente = await this.clientesRepository.findOneBy({
                id_cliente: Number(id_cliente)
            });

        if (!cliente) {
            throw new Error("Cliente no encontrado.");
        }

        let usuario = null;

        if (creado_por) {
            usuario = await this.usuariosRepository.findOneBy({
                    id_usuario: Number(creado_por)
                });

            if (!usuario) {
                throw new Error("Usuario no encontrado.");
            }
        }

        observaciones ??= "Sin observaciones.";

        const servicio = this.serviciosRepository.create({
                nombre_servicio: nombre_servicio.trim(),
                direccion_servicio,
                fecha_inicio_programada,
                fecha_fin_programada,
                fecha_inicio_real,
                fecha_fin_real,
                contrato_confirmado,
                observaciones,
                cliente,
                creadoPor: usuario
            });

        return this.serviciosRepository.save(servicio);
    }

    /**
     * Actualiza un servicio existente.
     * @param {number} idServicio
     * @param {object} data
     * @returns {Promise<Servicio | null>}
     */
    async update(idServicio, data) {
        const servicio = await this.serviciosRepository.findOneBy({
                id_servicio: idServicio
            });

        if (!servicio) {
            return null;
        }

        const {
            nombre_servicio,
            direccion_servicio,
            fecha_inicio_programada,
            fecha_fin_programada,
            fecha_inicio_real,
            fecha_fin_real,
            estado,
            semaforo,
            contrato_confirmado,
            observaciones
        } = data;

        if (nombre_servicio !== undefined) {
            if (!nombre_servicio.trim()) {
                throw new Error("El nombre del servicio no puede estar vacío.");
            }

            servicio.nombre_servicio = nombre_servicio.trim();
        }

        if (direccion_servicio !== undefined) {
            servicio.direccion_servicio = direccion_servicio;
        }

        if (fecha_inicio_programada !== undefined) {
            servicio.fecha_inicio_programada = fecha_inicio_programada;
        }

        if (fecha_fin_programada !== undefined) {
            servicio.fecha_fin_programada = fecha_fin_programada;
        }

        if (fecha_inicio_real !== undefined) {
            servicio.fecha_inicio_real = fecha_inicio_real;
        }

        if (fecha_fin_real !== undefined) {
            servicio.fecha_fin_real = fecha_fin_real;
        }

        if (estado !== undefined) {
            servicio.estado = estado;
        }

        if (semaforo !== undefined) {
            servicio.semaforo = semaforo;
        }

        if (contrato_confirmado !== undefined) {
            servicio.contrato_confirmado = contrato_confirmado;
        }

        if (observaciones !== undefined) {
            servicio.observaciones =
                observaciones.trim()
                    ? observaciones
                    : "Sin observaciones.";
        }

        return this.serviciosRepository.save(servicio);
    }

    /**
     * Elimina un servicio existente.
     * @param {number} idServicio
     * @returns {Promise<boolean>}
     */
    async delete(idServicio) {
        const servicio =
            await this.serviciosRepository.findOneBy({
                id_servicio: idServicio
            });

        if (!servicio) {
            return false;
        }

        await this.serviciosRepository.remove(servicio);

        return true;
    }

    async asignarServicio(idServicio, trabajadores, recursos, idSupervisor){
        if (!Array.isArray(trabajadores) || trabajadores.length === 0) {
            return null;
        }

        if (!Array.isArray(recursos)) {
            return null;
        }

        const servicio = await this.serviciosRepository.findOneBy({
                id_servicio: idServicio
            });

        if (!servicio) {
            return null;
        }

        if(!servicio.contrato_confirmado){
            return null;
        }

        if (servicio.fecha_inicio_real) {
            return null;
        }

        if (servicio.estado !== "PENDIENTE") {
            return null;
        }

        const especializacionesServicio = 
            await this.servicioEspecializacionRepository.find({
                where: {
                    id_servicio: idServicio,
                },
                 relations: {
                    especializacion: true,
                },
            });
        
        const especializacionesCubiertas = new Set();

        for (const idTrabajador of trabajadores) {

            const trabajador = await this.trabajadoresRepository.findOne({
                where: {
                    id_trabajador: idTrabajador,
                },
                relations: {
                    especializaciones: true,
                },
            });

            if (!trabajador) {
                return null;
            }

            if (trabajador.estado !== "DISPONIBLE") {
                return null;
            }

            let cumpleEspecializacion = false;

            for (const te of trabajador.especializaciones) {
                for (const se of especializacionesServicio) {

                    if (te.id_especializacion === se.id_especializacion) {
                        cumpleEspecializacion = true;

                        especializacionesCubiertas.add(te.id_especializacion);
                    }

                }
            }

            if (!cumpleEspecializacion) {
                return null;
            }

        }

        for (const se of especializacionesServicio) {

            if (!especializacionesCubiertas.has(se.id_especializacion)) {
                return null;
            }

        }

        const recursosServicio =
            await this.servicioRecursoRepository.find({
            where: {
                id_servicio: idServicio,
            },
        });

        for (const recurso of recursosServicio) {

            if (!recursos.includes(recurso.id_recurso)) {
                return null;
            }

        }
        
        for (const recursoServicio of recursosServicio) {

            const recurso = await this.recursoRepository.findOneBy({
                id_recurso: recursoServicio.id_recurso
            });

            if (!recurso) {
                return null;
            }

            if (recurso.stock_disponible < recursoServicio.cantidad_requerida) {
                return null;
            }

        }

        const supervisor = await this.usuariosRepository.findOneBy({
            id_usuario: idSupervisor,
        });

        if (!supervisor) {
            return null;
        }

        if (supervisor.rol !== "SUPERVISOR") {
            return null;
        }

        for (const idTrabajador of trabajadores) {

            const asignacion = this.asignacionTrabajadorRepository.create({
                servicio: {
                    id_servicio: idServicio,
                },

                trabajador: {
                    id_trabajador: idTrabajador,
                },

                asignadoPor: {
                    id_usuario: idSupervisor,
                 },
            });

            await this.asignacionTrabajadorRepository.save(asignacion);
        }

        for (const idTrabajador of trabajadores) {

            const trabajador = await this.trabajadoresRepository.findOneBy({
                id_trabajador: idTrabajador
            });

            trabajador.estado = "ASIGNADO";

            await this.trabajadoresRepository.save(trabajador);

        }

        for (const recursoServicio of recursosServicio) {

            const asignacionRecurso =
                this.asignacionRecursoRepository.create({

                    cantidad: recursoServicio.cantidad_requerida,

                    servicio: {
                        id_servicio: idServicio,
                    },

                    recurso: {
                        id_recurso: recursoServicio.id_recurso,
                    },

                 });

            await this.asignacionRecursoRepository.save(asignacionRecurso);
        }

        for (const recursoServicio of recursosServicio) {

            const recurso = await this.recursoRepository.findOneBy({
                id_recurso: recursoServicio.id_recurso,
            });

            recurso.stock_disponible = recurso.stock_disponible - recursoServicio.cantidad_requerida;

            await this.recursoRepository.save(recurso);
        }

        servicio.estado = "ASIGNADO";

        await this.serviciosRepository.save(servicio);

        return true;
    }
}

module.exports = new ServicioService();
