const AppDataSource = require("../config/db");
const Recurso = require("../entity/recurso.entity");

const manejarErrorBaseDatos = require("../utils/manejarErrorBaseDatos");

const _recursosRepository = AppDataSource.getRepository(Recurso);

const recursosController = {
    /**
     * Obtiene todos los recursos registrados.
     */
    getAllRecursos: async (req, res) => {
        try {
            const recursos = await _recursosRepository.find({
                order: {
                    nombre: "ASC"
                }
            });

            return res.status(200).json(recursos);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene un recurso por su ID.
     */
    getRecursoPorId: async (req, res) => {
        try {
            const { id_recurso } = req.params;

            if (Number.isNaN(Number(id_recurso))) {
                return res.status(400).json({
                    error: "ID de recurso inválido."
                });
            }

            const recurso = await _recursosRepository.findOneBy({
                id_recurso: Number(id_recurso)
            });

            if (!recurso) {
                return res.status(404).json({
                    error: "Recurso no encontrado."
                });
            }

            return res.status(200).json(recurso);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Crea un nuevo recurso.
     */
    createRecurso: async (req, res) => {
        try {
            let {
                nombre,
                descripcion,
                stock_disponible
            } = req.body;

            if (!nombre?.trim()) {
                return res.status(400).json({
                    error: "El nombre es obligatorio."
                });
            }

            if (!descripcion) {
                descripcion = "Sin descripción.";
            }

            if (stock_disponible === undefined) {
                stock_disponible = 0;
            }

            stock_disponible = Number(stock_disponible);

            if (Number.isNaN(stock_disponible)) {
                return res.status(400).json({
                    error: "El stock debe ser un número."
                });
            }

            if (stock_disponible < 0) {
                return res.status(400).json({
                    error: "El stock no puede ser un valor negativo."
                });
            }

            const recurso = _recursosRepository.create({
                nombre,
                descripcion,
                stock_disponible
            });

            await _recursosRepository.save(recurso);

            return res.status(201).json(recurso);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Actualiza un recurso existente.
     */
    updateRecurso: async (req, res) => {
        try {
            const { id_recurso } = req.params;

            if (Number.isNaN(Number(id_recurso))) {
                return res.status(400).json({
                    error: "ID de recurso inválido."
                });
            }

            const recurso = await _recursosRepository.findOneBy({
                id_recurso: Number(id_recurso)
            });

            if (!recurso) {
                return res.status(404).json({
                    error: "Recurso no encontrado."
                });
            }

            const {
                nombre,
                descripcion,
                stock_disponible
            } = req.body;

            if (nombre !== undefined) {
                if (!nombre.trim()) {
                    return res.status(400).json({
                        error: "El nombre no puede estar vacío."
                    });
                }

                recurso.nombre = nombre;
            }

            if (descripcion !== undefined) {
                recurso.descripcion = descripcion;
            }

            if (stock_disponible !== undefined) {
                const stock = Number(stock_disponible);

                if (Number.isNaN(stock)) {
                    return res.status(400).json({
                        error: "El stock debe ser un número."
                    });
                }

                if (stock < 0) {
                    return res.status(400).json({
                        error: "El stock no puede ser un valor negativo."
                    });
                }

                recurso.stock_disponible = stock;
            }

            await _recursosRepository.save(recurso);

            return res.status(200).json(recurso);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Elimina un recurso.
     */
    deleteRecurso: async (req, res) => {
        try {
            const { id_recurso } = req.params;

            if (Number.isNaN(Number(id_recurso))) {
                return res.status(400).json({
                    error: "ID de recurso inválido."
                });
            }

            const recurso = await _recursosRepository.findOneBy({
                id_recurso: Number(id_recurso)
            });

            if (!recurso) {
                return res.status(404).json({
                    error: "Recurso no encontrado."
                });
            }

            await _recursosRepository.remove(recurso);

            return res.status(200).json({
                message: "Recurso eliminado correctamente."
            });
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    }
};

module.exports = recursosController;