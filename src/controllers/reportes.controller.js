const AppDataSource = require("../config/db");
const Reporte = require("../entity/reporteTerreno.entity");
const Servicio = require("../entity/servicio.entity");
const Trabajador = require("../entity/trabajador.entity");

const manejarErrorBaseDatos = require("../utils/manejarErrorBaseDatos");

const _reportesRepository = AppDataSource.getRepository(Reporte);
const _serviciosRepository = AppDataSource.getRepository(Servicio);
const _trabajadoresRepository = AppDataSource.getRepository(Trabajador);

const reportesController = {
    /**
     * Obtiene todos los reportes registrados.
     */
    getAllReportes: async (req, res) => {
        try {
            const reportes = await _reportesRepository.find({
                order: {
                    id_reporte: "ASC"
                }
            });

            return res.status(200).json(reportes);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene un reporte por su ID.
     */
    getReportePorId: async (req, res) => {
        try {
            const { id_reporte } = req.params;

            if (Number.isNaN(Number(id_reporte))) {
                return res.status(400).json({
                    error: "ID de reporte inválido."
                });
            }

            const reporte = await _reportesRepository.findOne({
                where: {
                    id_reporte: Number(id_reporte)
                },
                relations: {
                    servicio: true,
                    trabajador: true
                }
            });

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
    createReporte: async (req, res) => {
        try {
            let {
                id_servicio,
                id_trabajador,
                porcentaje_avance,
                observaciones
            } = req.body;

            if (!id_servicio || !id_trabajador) {
                return res.status(400).json({
                    error: "id_servicio e id_trabajador son obligatorios."
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

            const trabajador = await _trabajadoresRepository.findOneBy({
                id_trabajador: Number(id_trabajador)
            });

            if (!trabajador) {
                return res.status(404).json({
                    error: "Trabajador no encontrado."
                });
            }

            if (porcentaje_avance === undefined) {
                porcentaje_avance = 0;
            }

            porcentaje_avance = Number(porcentaje_avance);

            if (Number.isNaN(porcentaje_avance)) {
                return res.status(400).json({
                    error: "El porcentaje debe ser un número."
                });
            }

            if (porcentaje_avance < 0 || porcentaje_avance > 100) {
                return res.status(400).json({
                    error: "El porcentaje debe estar entre 0 y 100."
                });
            }

            if (!observaciones) {
                observaciones = "Sin observaciones.";
            }

            const reporte = _reportesRepository.create({
                servicio,
                trabajador,
                porcentaje_avance,
                observaciones
            });

            await _reportesRepository.save(reporte);

            return res.status(201).json(reporte);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Actualiza un reporte existente.
     */
    updateReporte: async (req, res) => {
        try {
            const { id_reporte } = req.params;

            if (Number.isNaN(Number(id_reporte))) {
                return res.status(400).json({
                    error: "ID de reporte inválido."
                });
            }

            const reporte = await _reportesRepository.findOne({
                where: {
                    id_reporte: Number(id_reporte)
                },
                relations: {
                    servicio: true,
                    trabajador: true
                }
            });

            if (!reporte) {
                return res.status(404).json({
                    error: "Reporte no encontrado."
                });
            }

            const {
                porcentaje_avance,
                observaciones
            } = req.body;

            if (porcentaje_avance !== undefined) {
                const porcentaje = Number(porcentaje_avance);

                if (Number.isNaN(porcentaje)) {
                    return res.status(400).json({
                        error: "El porcentaje debe ser un número."
                    });
                }

                if (porcentaje < 0 || porcentaje > 100) {
                    return res.status(400).json({
                        error: "El porcentaje debe estar entre 0 y 100."
                    });
                }

                reporte.porcentaje_avance = porcentaje;
            }

            if (observaciones !== undefined) {
                reporte.observaciones =
                    observaciones.trim()
                        ? observaciones
                        : "Sin observaciones.";
            }

            await _reportesRepository.save(reporte);

            return res.status(200).json(reporte);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Elimina un reporte.
     */
    deleteReporte: async (req, res) => {
        try {
            const { id_reporte } = req.params;

            if (Number.isNaN(Number(id_reporte))) {
                return res.status(400).json({
                    error: "ID de reporte inválido."
                });
            }

            const reporte = await _reportesRepository.findOneBy({
                id_reporte: Number(id_reporte)
            });

            if (!reporte) {
                return res.status(404).json({
                    error: "Reporte no encontrado."
                });
            }

            await _reportesRepository.remove(reporte);

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