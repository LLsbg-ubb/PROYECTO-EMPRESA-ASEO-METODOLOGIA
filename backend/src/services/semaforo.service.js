class SemaforoService {

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
        if (!reportes || reportes.length === 0) return true;
        
        const reportesOrdenados = [...reportes].sort((a,b) => new Date(a.fecha_reporte) - new Date(b.fecha_reporte));
        const ultimoReporte = reportesOrdenados[reportesOrdenados.length - 1];
        const porcentajeEsperado = this.calcularPorcentajeEsperado(servicio);

        return ultimoReporte.porcentaje_avance < (porcentajeEsperado - 10);
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
