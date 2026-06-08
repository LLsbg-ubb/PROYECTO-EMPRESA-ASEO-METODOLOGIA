const trabajadorService =
    require("../services/trabajadores.service");

const manejarErrorBaseDatos =
    require("../utils/manejarErrorBaseDatos");

const trabajadoresController = {
    /**
     * Obtiene todos los trabajadores registrados.
     */
    async getAllTrabajadores(req, res) {
        try {
            const trabajadores = await trabajadorService.getAll();

            return res.status(200).json(trabajadores);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene un trabajador por su ID.
     */
    async getTrabajadorPorId(req, res) {
        try {
            const id = Number(req.params.id_trabajador);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de trabajador inválido."
                });
            }

            const trabajador = await trabajadorService.getById(id);

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
    async createTrabajador(req, res) {
        try {
            const trabajador = await trabajadorService.create(req.body);

            return res.status(201).json(trabajador);
        }
        catch (error) {
            if (error.message === "Usuario no encontrado.") {
                return res.status(404).json({
                    error: error.message
                });
            }

            if (error.message === "Ese usuario ya está asociado a un trabajador.") {
                return res.status(409).json({
                    error: error.message
                });
            }

            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Actualiza un trabajador existente.
     */
    async updateTrabajador(req, res) {
        try {
            const id = Number(req.params.id_trabajador);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de trabajador inválido."
                });
            }

            const trabajador = await trabajadorService.update(id, req.body);

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
     * Elimina un trabajador.
     */
    async deleteTrabajador(req, res) {
        try {
            const id = Number(req.params.id_trabajador);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de trabajador inválido."
                });
            }

            const deleted = await trabajadorService.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    error: "Trabajador no encontrado."
                });
            }

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