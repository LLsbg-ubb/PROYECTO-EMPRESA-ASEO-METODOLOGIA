const AppDataSource = require("../config/db");

const Reporte = require("../entity/reporteTerreno.entity");
const Servicio = require("../entity/servicio.entity");
const Trabajador = require("../entity/trabajador.entity");

class ReporteService {
    constructor() {
        this.reportesRepository = AppDataSource.getRepository(Reporte);
        this.serviciosRepository = AppDataSource.getRepository(Servicio);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
    }

    /**
     * Obtiene todos los reportes registrados.
     * @returns {Promise<Reporte[]>}
     */
    async getAll() {
        return this.reportesRepository.find({
            order: {
                id_reporte: "ASC"
            }
        });
    }

    /**
     * Obtiene un reporte por su ID.
     * @param {number} idReporte
     * @returns {Promise<Reporte | null>}
     */
    async getById(idReporte) {
        return this.reportesRepository.findOne({
            where: {
                id_reporte: idReporte
            },
            relations: {
                servicio: true,
                trabajador: true
            }
        });
    }

    /**
     * Crea un nuevo reporte.
     * @param {object} data
     * @returns {Promise<Reporte>}
     */
    async create(data) {
        let {
            id_servicio,
            id_trabajador,
            porcentaje_avance,
            observaciones
        } = data;

        if (!id_servicio || !id_trabajador) {
            throw new Error("id_servicio e id_trabajador son obligatorios.");
        }

        const servicio = await this.serviciosRepository.findOneBy({
                id_servicio: Number(id_servicio)
            });

        if (!servicio) {
            throw new Error("Servicio no encontrado.");
        }

        const trabajador = await this.trabajadoresRepository.findOneBy({
                id_trabajador: Number(id_trabajador)
            });

        if (!trabajador) {
            throw new Error("Trabajador no encontrado.");
        }

        porcentaje_avance ??= 0;

        porcentaje_avance = Number(porcentaje_avance);

        if (Number.isNaN(porcentaje_avance)) {
            throw new Error("El porcentaje debe ser un número.");
        }

        if (porcentaje_avance < 0 || porcentaje_avance > 100) {
            throw new Error("El porcentaje debe estar entre 0 y 100.");
        }

        observaciones ??= "Sin observaciones.";

        const reporte = this.reportesRepository.create({
                servicio,
                trabajador,
                porcentaje_avance,
                observaciones
            });

        return this.reportesRepository.save(reporte);
    }

    /**
     * Actualiza un reporte existente.
     * @param {number} idReporte
     * @param {object} data
     * @returns {Promise<Reporte | null>}
     */
    async update(idReporte, data) {
        const reporte = await this.getById(idReporte);

        if (!reporte) {
            return null;
        }

        const { porcentaje_avance, observaciones } = data;

        if (porcentaje_avance !== undefined) {
            const porcentaje = Number(porcentaje_avance);

            if (Number.isNaN(porcentaje)) {
                throw new Error("El porcentaje debe ser un número.");
            }

            if (porcentaje < 0 || porcentaje > 100) {
                throw new Error("El porcentaje debe estar entre 0 y 100.");
            }

            reporte.porcentaje_avance = porcentaje;
        }

        if (observaciones !== undefined) {
            reporte.observaciones =
                observaciones.trim()
                    ? observaciones
                    : "Sin observaciones.";
        }

        return this.reportesRepository.save(reporte);
    }

    /**
     * Elimina un reporte existente.
     * @param {number} idReporte
     * @returns {Promise<boolean>}
     */
    async delete(idReporte) {
        const reporte = await this.reportesRepository.findOneBy({
                id_reporte: idReporte
            });

        if (!reporte) {
            return false;
        }

        await this.reportesRepository.remove(reporte);

        return true;
    }
}

module.exports = new ReporteService();