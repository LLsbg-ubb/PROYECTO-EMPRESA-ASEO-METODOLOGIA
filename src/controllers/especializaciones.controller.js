const especializacionService = require("../services/especializaciones.service");

const manejarErrorBaseDatos = require("../utils/manejarErrorBaseDatos");

const especializacionesController = {
    /**
     * Obtiene todos las especializaciones registradas.
     */
    async getAllEspecializaciones(req, res) {
        try {
            const especializaciones = await especializacionService.getAll();

            return res.status(200).json(especializaciones);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene una especializacion por su ID.
     */
    async getEspecializacionPorId(req, res) {
        try {
            const { id_especializacion } = req.params;

            const id = Number(id_especializacion);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de especializacion inválido."
                });
            }

            const especializacion = await especializacionService.getById(id);

            if (!especializacion) {
                return res.status(404).json({
                    error: "Especializacion no encontrada."
                });
            }

            return res.status(200).json(especializacion);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Crea una nueva especializacion.
     */
    async createEspecializacion(req, res) {
        try {
            const especializacion = await especializacionService.create(req.body);

            return res.status(201).json(especializacion);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Actualiza una especializacion existente.
     */
    async updateEspecializacion(req, res) {
        try {
            const { id_especializacion } = req.params;

            const id = Number(id_especializacion);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de especializacion inválido."
                });
            }

            const especializacion = await especializacionService.update(id, req.body);

            if (!especializacion) {
                return res.status(404).json({
                    error: "especializacion no encontrada."
                });
            }

            return res.status(200).json(especializacion);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Elimina una especializacion.
     */
    async deleteEspecializacion(req, res) {
        try {
            const { id_especializacion } = req.params;

            const id = Number(id_especializacion);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de especializacion inválido."
                });
            }

            const deleted = await especializacionService.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    error: "Especializacion no encontrada."
                });
            }

            return res.status(200).json({
                message: "Especializacion eliminada correctamente."
            });
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    }
};

module.exports = especializacionesController;