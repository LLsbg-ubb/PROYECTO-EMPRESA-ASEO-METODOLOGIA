const AppDataSource = require("../config/db");

const Incidencia = require("../entity/incidencia.entity");
const IncidenciaRecurso = require("../entity/incidenciaRecurso.entity");
const Servicio = require("../entity/servicio.entity");
const Usuario = require("../entity/usuario.entity");
const Recurso = require("../entity/recurso.entity");

class IncidenciaService {
    constructor() {
        this.incidencias = AppDataSource.getRepository(Incidencia);
        this.incidenciaRecursos = AppDataSource.getRepository(IncidenciaRecurso);
        this.servicios = AppDataSource.getRepository(Servicio);
        this.usuarios = AppDataSource.getRepository(Usuario);
        this.recursos = AppDataSource.getRepository(Recurso);
    }

    /**
     * Obtiene todas las incidencias registradas.
     */
    async getAll() {
        return this.incidencias.find({
            relations: {
                servicio: true,
                reportadaPor: true,
                recursosRequeridos: {
                    recurso: true
                }
            },
            order: {
                id_incidencia: "ASC"
            }
        });
    }

    /**
     * Obtiene una incidencia por su ID.
     */
    async getById(idIncidencia) {
        return this.incidencias.findOne({
            where: {
                id_incidencia: idIncidencia
            },
            relations: {
                servicio: true,
                reportadaPor: true,
                recursosRequeridos: {
                    recurso: true
                }
            }
        });
    }

    /**
     * Crea una incidencia asociada a un servicio.
     */
    async create(data) {
        const {
            id_servicio,
            reportada_por,
            tipo,
            descripcion,
            prioridad,
            recursos_requeridos
        } = data;

        if (!id_servicio || !reportada_por || !tipo?.trim() || !descripcion?.trim() || !prioridad) {
            throw new Error("id_servicio, reportada_por, tipo, descripcion y prioridad son obligatorios.");
        }

        if (!["BAJA", "MEDIA", "ALTA", "CRITICA"].includes(prioridad)) {
            throw new Error("Prioridad invalida.");
        }

        const servicio = await this.servicios.findOneBy({
            id_servicio: Number(id_servicio)
        });

        if (!servicio) {
            throw new Error("Servicio no encontrado.");
        }

        const supervisor = await this.usuarios.findOneBy({
            id_usuario: Number(reportada_por)
        });

        if (!supervisor) {
            throw new Error("Supervisor no encontrado.");
        }

        if (supervisor.rol !== "SUPERVISOR") {
            throw new Error("El usuario debe tener rol SUPERVISOR.");
        }

        const incidencia = this.incidencias.create({
            tipo: tipo.trim(),
            descripcion: descripcion.trim(),
            prioridad,
            estado: "ABIERTA",
            servicio,
            reportadaPor: supervisor,
            recursosRequeridos: await this.crearRecursos(recursos_requeridos)
        });

        return this.incidencias.save(incidencia);
    }

    /**
     * Actualiza una incidencia abierta.
     */
    async update(idIncidencia, data) {
        const incidencia = await this.getById(idIncidencia);

        if (!incidencia) {
            return null;
        }

        if (incidencia.estado === "RESUELTA") {
            throw new Error("No se puede modificar una incidencia resuelta.");
        }

        const {
            tipo,
            descripcion,
            prioridad,
            recursos_requeridos
        } = data;

        if (tipo !== undefined) {
            if (!tipo.trim()) {
                throw new Error("El tipo no puede estar vacio.");
            }

            incidencia.tipo = tipo.trim();
        }

        if (descripcion !== undefined) {
            if (!descripcion.trim()) {
                throw new Error("La descripcion no puede estar vacia.");
            }

            incidencia.descripcion = descripcion.trim();
        }

        if (prioridad !== undefined) {
            if (!["BAJA", "MEDIA", "ALTA", "CRITICA"].includes(prioridad)) {
                throw new Error("Prioridad invalida.");
            }

            incidencia.prioridad = prioridad;
        }

        if (recursos_requeridos !== undefined) {
            if (incidencia.recursosRequeridos.length > 0) {
                await this.incidenciaRecursos.remove(incidencia.recursosRequeridos);
            }

            incidencia.recursosRequeridos = await this.crearRecursos(recursos_requeridos);
        }

        return this.incidencias.save(incidencia);
    }

    /**
     * Cierra una incidencia con solucion o accion correctiva.
     */
    async cerrar(idIncidencia, data) {
        const incidencia = await this.getById(idIncidencia);

        if (!incidencia) {
            return null;
        }

        if (incidencia.estado === "RESUELTA") {
            throw new Error("La incidencia ya esta resuelta.");
        }

        const solucion = data.solucion || data.accion_correctiva;

        if (!solucion?.trim()) {
            throw new Error("No se puede cerrar una incidencia sin solucion.");
        }

        incidencia.solucion = solucion.trim();
        incidencia.estado = "RESUELTA";
        incidencia.fecha_resolucion = new Date();

        return this.incidencias.save(incidencia);
    }

    /**
     * Elimina una incidencia.
     */
    async delete(idIncidencia) {
        const incidencia = await this.getById(idIncidencia);

        if (!incidencia) {
            return false;
        }

        await this.incidencias.remove(incidencia);

        return true;
    }

    async crearRecursos(recursos = []) {
        if (!Array.isArray(recursos)) {
            throw new Error("Los recursos requeridos deben ser una lista.");
        }

        const recursosIncidencia = [];

        for (const recurso of recursos) {
            const {
                id_recurso,
                cantidad_requerida,
                observacion
            } = recurso;

            if (!id_recurso) {
                throw new Error("El id_recurso es obligatorio.");
            }

            const recursoExistente = await this.recursos.findOneBy({
                id_recurso: Number(id_recurso)
            });

            if (!recursoExistente) {
                throw new Error("Recurso no encontrado.");
            }

            const cantidad = Number(cantidad_requerida ?? 1);

            if (Number.isNaN(cantidad) || cantidad <= 0) {
                throw new Error("La cantidad requerida debe ser mayor a 0.");
            }

            const incidenciaRecurso = this.incidenciaRecursos.create({
                recurso: recursoExistente,
                cantidad_requerida: cantidad,
                observacion
            });

            recursosIncidencia.push(incidenciaRecurso);
        }

        return recursosIncidencia;
    }
}

module.exports = new IncidenciaService();
