const incidenciaService = require("../services/incidencias.service");

const manejarErrorBaseDatos = require("../utils/manejarErrorBaseDatos");

const incidenciasController = {
    /**
     * Obtiene todas las incidencias registradas.
     */
    async getAllIncidencias(req, res) {
        try {
            const incidencias = await incidenciaService.getAll();

            return res.status(200).json(incidencias);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene una incidencia por su ID.
     */
    async getIncidenciaPorId(req, res) {
        try {
            const id = Number(req.params.id_incidencia);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de incidencia invalido."
                });
            }

            const incidencia = await incidenciaService.getById(id);

            if (!incidencia) {
                return res.status(404).json({
                    error: "Incidencia no encontrada."
                });
            }

            return res.status(200).json(incidencia);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Crea una nueva incidencia.
     */
    async createIncidencia(req, res) {
        try {
            const incidencia = await incidenciaService.create(req.body);

            return res.status(201).json(incidencia);
        }
        catch (error) {
            if (
                error.message === "Servicio no encontrado." ||
                error.message === "Supervisor no encontrado." ||
                error.message === "Recurso no encontrado."
            ) {
                return res.status(404).json({
                    error: error.message
                });
            }

            return res.status(400).json({
                error: error.message
            });
        }
    },

    /**
     * Actualiza una incidencia existente.
     */
    async updateIncidencia(req, res) {
        try {
            const id = Number(req.params.id_incidencia);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de incidencia invalido."
                });
            }

            const incidencia = await incidenciaService.update(id, req.body);

            if (!incidencia) {
                return res.status(404).json({
                    error: "Incidencia no encontrada."
                });
            }

            return res.status(200).json(incidencia);
        }
        catch (error) {
            return res.status(400).json({
                error: error.message
            });
        }
    },

    /**
     * Cierra una incidencia con una solucion.
     */
    async cerrarIncidencia(req, res) {
        try {
            const id = Number(req.params.id_incidencia);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de incidencia invalido."
                });
            }

            const incidencia = await incidenciaService.cerrar(id, req.body);

            if (!incidencia) {
                return res.status(404).json({
                    error: "Incidencia no encontrada."
                });
            }

            return res.status(200).json(incidencia);
        }
        catch (error) {
            return res.status(400).json({
                error: error.message
            });
        }
    },

    /**
     * Elimina una incidencia.
     */
    async deleteIncidencia(req, res) {
        try {
            const id = Number(req.params.id_incidencia);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de incidencia invalido."
                });
            }

            const deleted = await incidenciaService.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    error: "Incidencia no encontrada."
                });
            }

            return res.status(200).json({
                message: "Incidencia eliminada correctamente."
            });
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    }
};

module.exports = incidenciasController;
