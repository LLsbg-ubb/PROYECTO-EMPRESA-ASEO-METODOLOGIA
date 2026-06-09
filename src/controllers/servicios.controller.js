const servicioService = require("../services/servicios.service");

const manejarErrorBaseDatos = require("../utils/manejarErrorBaseDatos");

const serviciosController = {
    /**
     * Obtiene todos los servicios registrados.
     */
    async getAllServicios(req, res) {
        try {
            const servicios =
                await servicioService.getAll();

            return res.status(200).json(servicios);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene un servicio por su ID.
     */
    async getServicioPorId(req, res) {
        try {
            const id = Number(req.params.id_servicio);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de servicio inválido."
                });
            }

            const servicio = await servicioService.getById(id);

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
    async createServicio(req, res) {
        try {
            const servicio =
                await servicioService.create(req.body);

            return res.status(201).json(servicio);
        }
        catch (error) {
            if (error.message === "Cliente no encontrado.") {
                return res.status(404).json({
                    error: error.message
                });
            }

            if (error.message === "Usuario no encontrado.") {
                return res.status(404).json({
                    error: error.message
                });
            }

            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Actualiza un servicio existente.
     */
    async updateServicio(req, res) {
        try {
            const id = Number(req.params.id_servicio);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de servicio inválido."
                });
            }

            const servicio = await servicioService.update(id, req.body);

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
     * Elimina un servicio.
     */
    async deleteServicio(req, res) {
        try {
            const id = Number(req.params.id_servicio);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de servicio inválido."
                });
            }

            const deleted = await servicioService.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    error: "Servicio no encontrado."
                });
            }

            return res.status(200).json({
                message: "Servicio eliminado correctamente."
            });
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    async asignarServicio(req, res) {
        try {

            const idServicio = Number(req.params.id_servicio);

            if (Number.isNaN(idServicio)) {
                return res.status(400).json({
                    error: "ID de servicio inválido."
                });
            }

            const {
                trabajadores,
                recursos,
                idSupervisor
            } = req.body;

            const resultado =
                await servicioService.asignarServicio(
                    idServicio,
                    trabajadores,
                    recursos,
                    idSupervisor
                );

            if (!resultado) {
                return res.status(400).json({
                    error: "No fue posible realizar la asignación."
                });
            }

            return res.status(200).json({
                message: "Servicio asignado correctamente."
            });

        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    async validarYCerrarServicio(req, res) {
        try {
            const idServicio = Number(req.params.id_servicio);

            if (Number.isNaN(idServicio)) {
                return res.status(400).json({ error: "ID de servicio inválido." });
            }

            const servicioCerrado = await servicioService.validarYCerrarServicio(idServicio, req.body);

            return res.status(200).json({
                message: "Formulario de finalización validado y servicio cerrado con éxito.",
                servicio: servicioCerrado
            });
        } catch (error) {
            if (error.message.includes("Falta información") || error.message.includes("No se puede cerrar")) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes("Servicio no encontrado")) {
                return res.status(404).json({ error: error.message });
            }
            return manejarErrorBaseDatos(error, res);
        }
    },

    async registrarPagoServicio(req, res) {
        try {
            const idServicio = Number(req.params.id_servicio);

            if (Number.isNaN(idServicio)) {
                return res.status(400).json({ error: "ID de servicio inválido." });
            }

            const pagoRegistrado = await servicioService.registrarPago(idServicio, req.body);

            return res.status(201).json({
                message: "Registro digital de pago completado y comprobante generado.",
                pago: pagoRegistrado
            });
        } catch (error) {
            if (error.message.includes("obligatorio")) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes("Servicio no encontrado")) {
                return res.status(404).json({ error: error.message });
            }
            return manejarErrorBaseDatos(error, res);
        }
    }
};

module.exports = serviciosController;