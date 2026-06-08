const reporteService = require("../services/reportes.service");

const manejarErrorBaseDatos = require("../utils/manejarErrorBaseDatos");

const reportesController = {
    /**
     * Obtiene todos los reportes registrados.
     */
    async getAllReportes(req, res) {
        try {
            const reportes = await reporteService.getAll();

            return res.status(200).json(reportes);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene un reporte por su ID.
     */
    async getReportePorId(req, res) {
        try {
            const id = Number(req.params.id_reporte);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de reporte inválido."
                });
            }

            const reporte =
                await reporteService.getById(id);

            if (!reporte) {
                return res.status(404).json({
                    error: "Reporte no encontrado."
                });
            }

            return res.status(200).json(reporte);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Crea un nuevo reporte.
     */
    async createReporte(req, res) {
        try {
            const reporte =
                await reporteService.create(req.body);

            return res.status(201).json(reporte);
        }
        catch (error) {
            if (error.message === "Servicio no encontrado.") {
                return res.status(404).json({
                    error: error.message
                });
            }

            if (error.message === "Trabajador no encontrado.") {
                return res.status(404).json({
                    error: error.message
                });
            }

            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Actualiza un reporte existente.
     */
    async updateReporte(req, res) {
        try {
            const id = Number(req.params.id_reporte);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de reporte inválido."
                });
            }

            const reporte =
                await reporteService.update(id, req.body
                );

            if (!reporte) {
                return res.status(404).json({
                    error: "Reporte no encontrado."
                });
            }

            return res.status(200).json(reporte);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Elimina un reporte.
     */
    async deleteReporte(req, res) {
        try {
            const id = Number(req.params.id_reporte);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de reporte inválido."
                });
            }

            const deleted = await reporteService.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    error: "Reporte no encontrado."
                });
            }

            return res.status(200).json({
                message: "Reporte eliminado correctamente."
            });
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    }
};

module.exports = reportesController;