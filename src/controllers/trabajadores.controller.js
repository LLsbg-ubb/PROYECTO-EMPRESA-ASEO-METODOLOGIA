const AppDataSource = require("../config/db");
const Trabajador = require("../entity/trabajador.entity");
const Usuario = require("../entity/usuario.entity");

const manejarErrorBaseDatos = require("../utils/manejarErrorBaseDatos");

const _trabajadoresRepository = AppDataSource.getRepository(Trabajador);
const _usuariosRepository = AppDataSource.getRepository(Usuario);

const trabajadoresController = {
    /**
     * Obtiene todos los trabajadores registrados.
     */
    getAllTrabajadores: async (req, res) => {
        try {
            const trabajadores = await _trabajadoresRepository.find({
                order: {
                    id_trabajador: "ASC"
                }
            });

            return res.status(200).json(trabajadores);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene un trabajador por su ID.
     */
    getTrabajadorPorId: async (req, res) => {
        try {
            const { id_trabajador } = req.params;

            if (Number.isNaN(Number(id_trabajador))) {
                return res.status(400).json({
                    error: "ID de trabajador inválido."
                });
            }

            const trabajador = await _trabajadoresRepository.findOneBy({
                id_trabajador: Number(id_trabajador)
            });

            if (!trabajador) {
                return res.status(404).json({
                    error: "Trabajador no encontrado."
                });
            }

            return res.status(200).json(trabajador);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Crea un nuevo trabajador.
     */
    createTrabajador: async (req, res) => {
        try {
            const {
                id_usuario,
                fecha_contratacion,
                estado
            } = req.body;

            if (!id_usuario || !fecha_contratacion) {
                return res.status(400).json({
                    error: "id_usuario y fecha_contratacion son obligatorios."
                });
            }

            const usuario = await _usuariosRepository.findOneBy({
                id_usuario: Number(id_usuario)
            });

            if (!usuario) {
                return res.status(404).json({
                    error: "Usuario no encontrado."
                });
            }

            const trabajador_existente =
                await _trabajadoresRepository.findOne({
                    where: {
                        usuario: {
                            id_usuario: Number(id_usuario)
                        }
                    },
                    relations: {
                        usuario: true
                    }
                });

            if (trabajador_existente) {
                return res.status(409).json({
                    error: "Ese usuario ya está asociado a un trabajador."
                });
            }

            const trabajador = _trabajadoresRepository.create({
                fecha_contratacion,
                estado,
                usuario
            });

            await _trabajadoresRepository.save(trabajador);

            return res.status(201).json(trabajador);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Actualiza un trabajador existente.
     */
    updateTrabajador: async (req, res) => {
        try {
            const { id_trabajador } = req.params;

            if (Number.isNaN(Number(id_trabajador))) {
                return res.status(400).json({
                    error: "ID de trabajador inválido."
                });
            }

            const trabajador = await _trabajadoresRepository.findOneBy({
                id_trabajador: Number(id_trabajador)
            });

            if (!trabajador) {
                return res.status(404).json({
                    error: "Trabajador no encontrado."
                });
            }

            const {
                fecha_contratacion,
                estado
            } = req.body;

            if (fecha_contratacion !== undefined) {
                trabajador.fecha_contratacion = fecha_contratacion;
            }

            if (estado !== undefined) {
                trabajador.estado = estado;
            }

            await _trabajadoresRepository.save(trabajador);

            return res.status(200).json(trabajador);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Elimina un trabajador.
     */
    deleteTrabajador: async (req, res) => {
        try {
            const { id_trabajador } = req.params;

            if (Number.isNaN(Number(id_trabajador))) {
                return res.status(400).json({
                    error: "ID de trabajador inválido."
                });
            }

            const trabajador = await _trabajadoresRepository.findOneBy({
                id_trabajador: Number(id_trabajador)
            });

            if (!trabajador) {
                return res.status(404).json({
                    error: "Trabajador no encontrado."
                });
            }

            await _trabajadoresRepository.remove(trabajador);

            return res.status(200).json({
                message: "Trabajador eliminado correctamente."
            });
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    }
};

module.exports = trabajadoresController;