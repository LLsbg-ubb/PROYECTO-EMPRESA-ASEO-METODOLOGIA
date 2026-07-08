const AppDataSource = require("../config/db");
const Servicio = require("../entity/servicio.entity");

class SemaforoService {
    constructor() {
        this.serviciosRepository = AppDataSource.getRepository(Servicio);
    }

    async recalcularYGuardar(idServicio) {
        const servicio = await this.serviciosRepository.findOne({
            where: {
                id_servicio: Number(idServicio),
            },
            relations: {
                reportes: true,
                incidencias: true,
                asignacionesRecursos: {
                    recurso: true,
                },
            },
        });

        if (!servicio) {
            throw new Error("Servicio no encontrado.");
        }

        const semaforo = this.calcularEstadoSemaforo(
            servicio,
            servicio.reportes,
            servicio.incidencias,
            servicio.asignacionesRecursos
        );

        servicio.semaforo = semaforo;

        await this.serviciosRepository.save(servicio);

        return {
            id_servicio: servicio.id_servicio,
            nombre_servicio: servicio.nombre_servicio,
            estado_servicio: servicio.estado,
            avance_esperado: this.calcularPorcentajeEsperado(servicio),
            avance_reportado: this.obtenerUltimoReporte(servicio.reportes)?.porcentaje_avance ?? 0,
            semaforo,
        };
    }

    calcularEstadoSemaforo(servicio, reportes, incidencias, asignacionesRecursos) {
        if (servicio.estado === 'FINALIZADO' || servicio.estado === 'CERRADO' || servicio.estado === 'CANCELADO'){
            return 'VERDE';
        }
        if (this.tieneIncidenciasCriticas(incidencias) || this.estaElTiempoExcedido(servicio)){
            return 'ROJO';
        }
        if (this.hayRetrasosOAdvertencias(reportes, asignacionesRecursos, servicio)){
            return 'AMARILLO';
        }
        return 'VERDE';
    }

    tieneIncidenciasCriticas(incidencias){
        const incidenciasCriticas = incidencias.filter(
           incidencia =>
            (incidencia.prioridad === 'ALTA' || incidencia.prioridad === 'CRITICA') && incidencia.estado === 'ABIERTA');
           return incidenciasCriticas.length > 0;           
    }
    
    estaElTiempoExcedido(servicio){
        if (!servicio.fecha_fin_programada) return false;

        const tiempoActual = new Date();
        const tiempoLimite = new Date(servicio.fecha_fin_programada);

        return tiempoActual > tiempoLimite;
    }

    hayRetrasosOAdvertencias(reportes, asignacionesRecursos, servicio) {
        const advertenciaInsumos = this.verificarInsumosBajos(asignacionesRecursos);
        const advertenciaRetraso = this.verificarRetrasoOperativo(reportes, servicio);

        return advertenciaInsumos || advertenciaRetraso;
    }

    verificarInsumosBajos(asignacionesRecursos){
        if (!asignacionesRecursos || asignacionesRecursos.length === 0) return false;

        const recursosBajos = asignacionesRecursos.filter(asignacion => asignacion.recurso && asignacion.recurso.stock_disponible <= 5);
        return recursosBajos.length > 0;
    }

    verificarRetrasoOperativo(reportes, servicio){
        const porcentajeEsperado = this.calcularPorcentajeEsperado(servicio);

        if (!reportes || reportes.length === 0) {
            return porcentajeEsperado >= 10;
        }

        const ultimoReporte = this.obtenerUltimoReporte(reportes);
        const porcentajeAvance = Number(ultimoReporte.porcentaje_avance ?? 0);

        return porcentajeAvance < (porcentajeEsperado - 10);
    }

    obtenerUltimoReporte(reportes) {
        if (!reportes || reportes.length === 0) {
            return null;
        }

        const reportesOrdenados = [...reportes].sort(
            (a, b) => new Date(a.fecha_reporte) - new Date(b.fecha_reporte)
        );

        return reportesOrdenados[reportesOrdenados.length - 1];
    }

    calcularPorcentajeEsperado(servicio) {
        if (!servicio.fecha_inicio_programada || !servicio.fecha_fin_programada) return 0;

        const tiempoActual = new Date().getTime();
        const tiempoInicio = new Date(servicio.fecha_inicio_programada).getTime();
        const tiempoLimite = new Date(servicio.fecha_fin_programada).getTime();

        const duracionTotal = tiempoLimite - tiempoInicio;
        const tiempoTranscurrido = tiempoActual - tiempoInicio;

        if (tiempoTranscurrido <= 0) return 0;
        if (tiempoTranscurrido >= duracionTotal) return 100;

        return (tiempoTranscurrido/duracionTotal) * 100;
    }
}

module.exports = SemaforoService;
