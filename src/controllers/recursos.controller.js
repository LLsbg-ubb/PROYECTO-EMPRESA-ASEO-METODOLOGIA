const recursoService = require("../services/recursos.service");

const manejarErrorBaseDatos = require("../utils/manejarErrorBaseDatos");

const recursosController = {
    /**
     * Obtiene todos los recursos registrados.
     */
    async getAllRecursos(req, res) {
        try {
            const recursos = await recursoService.getAll();

            return res.status(200).json(recursos);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene un recurso por su ID.
     */
    async getRecursoPorId(req, res) {
        try {
            const { id_recurso } = req.params;

            const id = Number(id_recurso);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de recurso inválido."
                });
            }

            const recurso = await recursoService.getById(id);

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
    async createRecurso(req, res) {
        try {
            const recurso = await recursoService.create(req.body);

            return res.status(201).json(recurso);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Actualiza un recurso existente.
     */
    async updateRecurso(req, res) {
        try {
            const { id_recurso } = req.params;

            const id = Number(id_recurso);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de recurso inválido."
                });
            }

            const recurso = await recursoService.update(id, req.body
            );

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
     * Elimina un recurso.
     */
    async deleteRecurso(req, res) {
        try {
            const { id_recurso } = req.params;

            const id = Number(id_recurso);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de recurso inválido."
                });
            }

            const deleted = await recursoService.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    error: "Recurso no encontrado."
                });
            }

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