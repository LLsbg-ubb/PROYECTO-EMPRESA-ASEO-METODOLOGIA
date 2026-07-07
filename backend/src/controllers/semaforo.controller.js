const AppDataSource = require("../config/db");
const Servicio = require("../entity/servicio.entity");
const SemaforoService = require("../services/semaforo.service");

class SemaforoController {
    constructor() {
        this.serviciosRepository = AppDataSource.getRepository(Servicio);
        this.semaforoService = new SemaforoService();
    }

    async obtenerEstado(req, res){
        try{
            const idServicio = parseInt(req.params.id, 10);

            if (isNaN(idServicio)){
                return res.status(400).json({ message: "ID de servicio invalido." });
            }
                
            const servicio = await this.serviciosRepository.findOne({
                where: { id_servicio: idServicio },
                relations: {
                    reportes: true,
                    incidencias: true,
                    asignacionesRecursos: {
                        recurso: true
                    }
                }    
            });

            if(!servicio){
                return res.status(404).json({ message: "Servicio no encontrado." });
            }

            const colorSemaforo = this.semaforoService.calcularEstadoSemaforo(
                servicio,
                servicio.reportes,
                servicio.incidencias,
                servicio.asignacionesRecursos
            );

            return res.status(200).json({
                id_servicio: idServicio,
                nombre_servicio: servicio.nombre_servicio,
                estado_servicio: servicio.estado,
                semaforo: colorSemaforo
            });
        }

        catch (error){
            return res.status(500).json({
                message: "Error al calcular el semaforo.", 
                error: error.message
            });
        }
    }
}

module.exports = new SemaforoController();
    