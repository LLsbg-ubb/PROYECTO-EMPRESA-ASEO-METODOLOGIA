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
    },

    async asignarEspecializacion(req, res) {
        try {

            const idTrabajador = Number(req.params.id_trabajador);

            if (Number.isNaN(idTrabajador)) {
                return res.status(400).json({
                    error: "ID de trabajador inválido."
                });
            }

            const { idEspecializacion } = req.body;

            await trabajadorService.asignarEspecializacion(
                idTrabajador,
                idEspecializacion
            );

            return res.status(200).json({
                message: "Especialización asignada correctamente."
            });

        }
        catch (error) {

            if (error.message === "Trabajador no encontrado.") {
                return res.status(404).json({
                    error: error.message
                });
            }

            if (error.message === "Especialización no encontrada.") {
                return res.status(404).json({
                    error: error.message
                });
            }

            return res.status(400).json({
                error: error.message
            });
        }
    },

    async updateEspecializacion(req, res) {
        try {
            const idTrabajador = Number(req.params.id_trabajador);
            const idEspecializacionActual = Number(req.params.id_especializacion);
            const idEspecializacionNueva = Number(req.body.idEspecializacion);

            if (
                Number.isNaN(idTrabajador) ||
                Number.isNaN(idEspecializacionActual) ||
                Number.isNaN(idEspecializacionNueva)
            ) {
                return res.status(400).json({
                    error: "ID de trabajador o especializacion invalido."
                });
            }

            await trabajadorService.updateEspecializacion(
                idTrabajador,
                idEspecializacionActual,
                idEspecializacionNueva
            );

            return res.status(200).json({
                message: "Especializacion del trabajador actualizada correctamente."
            });
        }
        catch (error) {
            if (
                error.message === "Trabajador no encontrado." ||
                error.message === "Especializacion actual no asignada al trabajador." ||
                error.message === "Especializacion nueva no encontrada."
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

    async deleteEspecializacion(req, res) {
        try {
            const idTrabajador = Number(req.params.id_trabajador);
            const idEspecializacion = Number(req.params.id_especializacion);

            if (Number.isNaN(idTrabajador) || Number.isNaN(idEspecializacion)) {
                return res.status(400).json({
                    error: "ID de trabajador o especializacion invalido."
                });
            }

            await trabajadorService.deleteEspecializacion(
                idTrabajador,
                idEspecializacion
            );

            return res.status(200).json({
                message: "Especializacion quitada del trabajador correctamente."
            });
        }
        catch (error) {
            if (
                error.message === "Trabajador no encontrado." ||
                error.message === "Especializacion no asignada al trabajador."
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
};

module.exports = trabajadoresController;
