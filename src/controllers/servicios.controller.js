const AppDataSource = require("../config/db");
const Servicio = require("../entity/servicio.entity");
const Usuario = require("../entity/usuario.entity");
const Cliente = require("../entity/cliente.entity");

const manejarErrorBaseDatos = require("../utils/manejarErrorBaseDatos");

const _serviciosRepository = AppDataSource.getRepository(Servicio);
const _usuariosRepository = AppDataSource.getRepository(Usuario);
const _clientesRepository = AppDataSource.getRepository(Cliente);

const serviciosController = {
    /**
     * Obtiene todos los servicios registrados.
     */
    getAllServicios: async (req, res) => {
        try {
            const servicios = await _serviciosRepository.find({
                order: {
                    nombre_servicio: "ASC"
                }
            });

            return res.status(200).json(servicios);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene un servicio por su ID.
     */
    getServicioPorId: async (req, res) => {
        try {
            const { id_servicio } = req.params;

            if (Number.isNaN(Number(id_servicio))) {
                return res.status(400).json({
                    error: "ID de servicio inválido."
                });
            }

            const servicio = await _serviciosRepository.findOne({
                where: {
                    id_servicio: Number(id_servicio)
                },
                relations: {
                    cliente: true,
                    creadoPor: true
                }
            });

            if (!servicio) {
                return res.status(404).json({
                    error: "Servicio no encontrado."
                });
            }

            return res.status(200).json(servicio);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Crea un nuevo servicio.
     */
    createServicio: async (req, res) => {
        try {
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
            } = req.body;

            if (
                !id_cliente ||
                !nombre_servicio?.trim() ||
                !fecha_inicio_programada ||
                !fecha_fin_programada
            ) {
                return res.status(400).json({
                    error: "id_cliente, nombre_servicio, fecha_inicio_programada y fecha_fin_programada son obligatorios."
                });
            }

            const cliente = await _clientesRepository.findOneBy({
                id_cliente: Number(id_cliente)
            });

            if (!cliente) {
                return res.status(404).json({
                    error: "Cliente no encontrado."
                });
            }

            let usuario = null;

            if (creado_por) {
                usuario = await _usuariosRepository.findOneBy({
                    id_usuario: Number(creado_por)
                });

                if (!usuario) {
                    return res.status(404).json({
                        error: "Usuario no encontrado."
                    });
                }
            }

            if (!observaciones) {
                observaciones = "Sin observaciones.";
            }

            const servicio = _serviciosRepository.create({
                nombre_servicio,
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

            await _serviciosRepository.save(servicio);

            return res.status(201).json(servicio);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Actualiza un servicio existente.
     */
    updateServicio: async (req, res) => {
        try {
            const { id_servicio } = req.params;

            if (Number.isNaN(Number(id_servicio))) {
                return res.status(400).json({
                    error: "ID de servicio inválido."
                });
            }

            const servicio = await _serviciosRepository.findOneBy({
                id_servicio: Number(id_servicio)
            });

            if (!servicio) {
                return res.status(404).json({
                    error: "Servicio no encontrado."
                });
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
            } = req.body;

            if (nombre_servicio !== undefined) {
                if (!nombre_servicio.trim()) {
                    return res.status(400).json({
                        error: "El nombre del servicio no puede estar vacío."
                    });
                }

                servicio.nombre_servicio = nombre_servicio;
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

            await _serviciosRepository.save(servicio);

            return res.status(200).json(servicio);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Elimina un servicio.
     */
    deleteServicio: async (req, res) => {
        try {
            const { id_servicio } = req.params;

            if (Number.isNaN(Number(id_servicio))) {
                return res.status(400).json({
                    error: "ID de servicio inválido."
                });
            }

            const servicio = await _serviciosRepository.findOneBy({
                id_servicio: Number(id_servicio)
            });

            if (!servicio) {
                return res.status(404).json({
                    error: "Servicio no encontrado."
                });
            }

            await _serviciosRepository.remove(servicio);

            return res.status(200).json({
                message: "Servicio eliminado correctamente."
            });
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    }
};

module.exports = serviciosController;