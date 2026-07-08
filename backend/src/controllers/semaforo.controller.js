const SemaforoService = require("../services/semaforo.service");

class SemaforoController {
    constructor() {
        this.semaforoService = new SemaforoService();
    }

    async obtenerEstado(req, res){
        try{
            const idServicio = parseInt(req.params.id, 10);

            if (isNaN(idServicio)){
                return res.status(400).json({ message: "ID de servicio invalido." });
            }
            const estado = await this.semaforoService.recalcularYGuardar(idServicio);

            return res.status(200).json(estado);
        }

        catch (error){
            if (error.message === "Servicio no encontrado.") {
                return res.status(404).json({ message: error.message });
            }

            return res.status(500).json({
                message: "Error al calcular el semaforo.", 
                error: error.message
            });
        }
    }
}

module.exports = new SemaforoController();
    
