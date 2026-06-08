const AppDataSource = require("../config/db");

const Servicio = require("../entity/servicio.entity");
const Usuario = require("../entity/usuario.entity");
const Cliente = require("../entity/cliente.entity");

class ServicioService {
    constructor() {
        this.serviciosRepository = AppDataSource.getRepository(Servicio);
        this.usuariosRepository = AppDataSource.getRepository(Usuario);
        this.clientesRepository = AppDataSource.getRepository(Cliente);
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
}

module.exports = new ServicioService();