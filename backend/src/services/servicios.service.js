const AppDataSource = require("../config/db");

const Servicio = require("../entity/servicio.entity");
const Usuario = require("../entity/usuario.entity");
const Cliente = require("../entity/cliente.entity");
const Trabajador = require("../entity/trabajador.entity");
const ServicioEspecializacion = require("../entity/servicioEspecializacion.entity");
const ServicioRecurso = require("../entity/servicioRecurso.entity");
const Recurso = require("../entity/recurso.entity");
const AsignacionTrabajador = require("../entity/asignacionTrabajador.entity");
const AsignacionRecurso = require("../entity/asignacionRecurso.entity");
const Especializacion = require("../entity/especializacion.entity");
const Pago = require("../entity/pago.entity");

class ServicioService {
    constructor() {
        this.serviciosRepository = AppDataSource.getRepository(Servicio);
        this.usuariosRepository = AppDataSource.getRepository(Usuario);
        this.clientesRepository = AppDataSource.getRepository(Cliente);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.servicioEspecializacionRepository = AppDataSource.getRepository(ServicioEspecializacion);
        this.servicioRecursoRepository = AppDataSource.getRepository(ServicioRecurso);
        this.recursoRepository = AppDataSource.getRepository(Recurso);
        this.asignacionTrabajadorRepository = AppDataSource.getRepository(AsignacionTrabajador);
        this.asignacionRecursoRepository = AppDataSource.getRepository(AsignacionRecurso);
        this.especializacionRepository = AppDataSource.getRepository(Especializacion);
        this.pagosRepository = AppDataSource.getRepository(Pago);
    }

    /**
     * Obtiene todos los servicios registrados.
     * @returns {Promise<Servicio[]>}
     */
        async getAll() {
            return this.serviciosRepository.find({
                relations: {
                    cliente: true,
                    creadoPor: true,
                    supervisor: true,
                    pago: true,
                    especializacionesRequeridas: {
                        especializacion: true
                    },
                    recursosRequeridos: {
                        recurso: true
                    },
                    asignacionesTrabajadores: {
                        trabajador: {
                            usuario: true,
                            especializaciones: true
                        },
                        asignadoPor: true
                    },
                    asignacionesRecursos: {
                        recurso: true
                    },
                    incidencias: true,
                    reportes: true
                },
                order: {
                    nombre_servicio: "ASC"
                }
            });
        }

    /**
     * Obtiene un servicio por su ID.
     * @param {number} idServicio
     * @returns {Promise<Servicio | null>}
     */
    async getById(idServicio) {
        return this.serviciosRepository.findOne({
            where: {
                id_servicio: idServicio
            },
            relations: {
                cliente: true,
                creadoPor: true,
                supervisor: true,
                pago: true,
                especializacionesRequeridas: {
                    especializacion: true
                },
                recursosRequeridos: {
                    recurso: true
                },
                asignacionesTrabajadores: {
                    trabajador: {
                        usuario: true,
                        especializaciones: true
                    },
                    asignadoPor: true
                },
                asignacionesRecursos: {
                    recurso: true
                },
                incidencias: true,
                reportes: true
            }
        });
    }

    /**
     * Crea un nuevo servicio.
     * @param {object} data
     * @returns {Promise<Servicio>}
     */
    async create(data) {
        let {
            id_cliente,
            nombre_servicio,
            direccion_servicio,
            fecha_inicio_programada,
            fecha_fin_programada,
            fecha_inicio_real,
            fecha_fin_real,
            contrato_confirmado,
            observaciones,
            creado_por
        } = data;

        if (!id_cliente || !nombre_servicio?.trim() || !fecha_inicio_programada || !fecha_fin_programada) {
            throw new Error("id_cliente, nombre_servicio, fecha_inicio_programada y fecha_fin_programada son obligatorios.");
        }

        const cliente = await this.clientesRepository.findOneBy({
                id_cliente: Number(id_cliente)
            });

        if (!cliente) {
            throw new Error("Cliente no encontrado.");
        }

        let usuario = null;

        if (creado_por) {
            usuario = await this.usuariosRepository.findOneBy({
                    id_usuario: Number(creado_por)
                });

            if (!usuario) {
                throw new Error("Usuario no encontrado.");
            }
        }

        observaciones ??= "Sin observaciones.";

        const servicio = this.serviciosRepository.create({
                nombre_servicio: nombre_servicio.trim(),
                direccion_servicio,
                fecha_inicio_programada,
                fecha_fin_programada,
                fecha_inicio_real,
                fecha_fin_real,
                contrato_confirmado,
                observaciones,
                cliente,
                creadoPor: usuario
            });

        return this.serviciosRepository.save(servicio);
    }

    /**
     * Actualiza un servicio existente.
     * @param {number} idServicio
     * @param {object} data
     * @returns {Promise<Servicio | null>}
     */
    async update(idServicio, data) {
        const servicio = await this.serviciosRepository.findOneBy({
                id_servicio: idServicio
            });

        if (!servicio) {
            return null;
        }

        const {
            nombre_servicio,
            direccion_servicio,
            fecha_inicio_programada,
            fecha_fin_programada,
            fecha_inicio_real,
            fecha_fin_real,
            estado,
            semaforo,
            contrato_confirmado,
            observaciones
        } = data;

        if (nombre_servicio !== undefined) {
            if (!nombre_servicio.trim()) {
                throw new Error("El nombre del servicio no puede estar vacío.");
            }

            servicio.nombre_servicio = nombre_servicio.trim();
        }

        if (direccion_servicio !== undefined) {
            servicio.direccion_servicio = direccion_servicio;
        }

        if (fecha_inicio_programada !== undefined) {
            servicio.fecha_inicio_programada = fecha_inicio_programada;
        }

        if (fecha_fin_programada !== undefined) {
            servicio.fecha_fin_programada = fecha_fin_programada;
        }

        if (fecha_inicio_real !== undefined) {
            servicio.fecha_inicio_real = fecha_inicio_real;
        }

        if (fecha_fin_real !== undefined) {
            servicio.fecha_fin_real = fecha_fin_real;
        }

        if (estado !== undefined) {
            servicio.estado = estado;
        }

        if (semaforo !== undefined) {
            servicio.semaforo = semaforo;
        }

        if (contrato_confirmado !== undefined) {
            servicio.contrato_confirmado = contrato_confirmado;
        }

        if (observaciones !== undefined) {
            servicio.observaciones =
                observaciones.trim()
                    ? observaciones
                    : "Sin observaciones.";
        }

        return this.serviciosRepository.save(servicio);
    }

    /**
     * Elimina un servicio existente.
     * @param {number} idServicio
     * @returns {Promise<boolean>}
     */
    async delete(idServicio) {
        const servicio =
            await this.serviciosRepository.findOneBy({
                id_servicio: idServicio
            });

        if (!servicio) {
            return false;
        }

        await this.serviciosRepository.remove(servicio);

        return true;
    }

    async validarServicioPendiente(idServicio) {
        const servicio = await this.serviciosRepository.findOneBy({
            id_servicio: idServicio,
        });

        if (!servicio) {
            throw new Error("Servicio no encontrado.");
        }

        if (servicio.estado !== "PENDIENTE") {
            throw new Error(
                "Solo se pueden modificar requerimientos de servicios pendientes."
            );
        }

        return servicio;
    }

    async asignarServicio(idServicio, trabajadores, recursos, idSupervisor, idAdministrador){
        const supervisorId = Number(idSupervisor);
        const administradorId = Number(idAdministrador);

        if (Number.isNaN(supervisorId)) {
            throw new Error("Debe seleccionar un supervisor para el servicio.");
        }

        if (Number.isNaN(administradorId)) {
            throw new Error("Debe indicar el usuario administrativo que asigna el servicio.");
        }

        if (!Array.isArray(trabajadores) || trabajadores.length === 0) {
            throw new Error(
                "Debe asignar al menos un trabajador al servicio."
            );
        }

        if (!Array.isArray(recursos) || recursos.length === 0) {
            throw new Error(
                "Debe asignar al menos un recurso al servicio."
            );
        }

        const servicio = await this.serviciosRepository.findOneBy({
                id_servicio: idServicio
            });

        if (!servicio) {
            throw new Error("Servicio no encontrado.");
        }

        if(!servicio.contrato_confirmado){
            throw new Error("El contrato del servicio no esta confirmado.");
        }

        if (servicio.fecha_inicio_real) {
            throw new Error("El servicio ya ha sido iniciado.");
        }

        if (servicio.estado !== "PENDIENTE") {
            throw new Error("El servicio no se encuentra en estado PENDIENTE.");
        }

        const especializacionesServicio = 
            await this.servicioEspecializacionRepository.find({
                where: {
                    id_servicio: idServicio,
                },
                 relations: {
                    especializacion: true,
                },
            });
        
        const especializacionesCubiertas = new Set();

        for (const idTrabajador of trabajadores) {

            const trabajador = await this.trabajadoresRepository.findOne({
                where: {
                    id_trabajador: idTrabajador,
                },
                relations: {
                    especializaciones: true,
                },
            });

            if (!trabajador) {
                throw new Error(`Trabajador ${idTrabajador} no encontrado.`);
            }

            if (trabajador.estado !== "DISPONIBLE") {
                throw new Error(`El trabajador ${idTrabajador} no esta disponible.`);
            }

            let cumpleEspecializacion = false;

            for (const te of trabajador.especializaciones) {
                for (const se of especializacionesServicio) {

                    if (te.id_especializacion === se.id_especializacion) {
                        cumpleEspecializacion = true;

                        especializacionesCubiertas.add(te.id_especializacion);
                    }

                }
            }

            if (!cumpleEspecializacion) {
                throw new Error(
                    `El trabajador ${idTrabajador} no posee una especialización requerida para el servicio.`
                );
            }

        }

        for (const se of especializacionesServicio) {

            if (!especializacionesCubiertas.has(se.id_especializacion)) {
                throw new Error(
                    `No existe un trabajador asignado para la especialización ${se.id_especializacion}.`
                );
            }

        }

        const recursosServicio =
            await this.servicioRecursoRepository.find({
            where: {
                id_servicio: idServicio,
            },
        });

        for (const recurso of recursosServicio) {

            if (!recursos.includes(recurso.id_recurso)) {
                throw new Error(
                    `El recurso requerido ${recurso.id_recurso} no fue incluido en la asignación.`
                );
            }

        }
        
        for (const recursoServicio of recursosServicio) {

            const recurso = await this.recursoRepository.findOneBy({
                id_recurso: recursoServicio.id_recurso
            });

            if (!recurso) {
                throw new Error(
                    `Recurso ${recursoServicio.id_recurso} no encontrado.`
                );
            }

            if (recurso.stock_disponible < recursoServicio.cantidad_requerida) {
                throw new Error(
                    `Stock insuficiente para el recurso ${recursoServicio.id_recurso}.`
                );
            }

        }

        const supervisor = await this.usuariosRepository.findOneBy({
            id_usuario: supervisorId,
        });

        if (!supervisor) {
            throw new Error("Supervisor no encontrado.");
        }

        if (supervisor.rol !== "SUPERVISOR") {
            throw new Error("El usuario indicado no posee rol de supervisor.");
        }

        const administrador = await this.usuariosRepository.findOneBy({
            id_usuario: administradorId,
        });

        if (!administrador) {
            throw new Error("Administrador no encontrado.");
        }   

        if (administrador.rol !== "ADMINISTRATIVO") {
            throw new Error("El usuario indicado no posee rol administrativo.");
        }

        servicio.supervisor = supervisor;

        for (const idTrabajador of trabajadores) {

            const asignacion = this.asignacionTrabajadorRepository.create({
                servicio: {
                    id_servicio: idServicio,
                },

                trabajador: {
                    id_trabajador: idTrabajador,
                },

                asignadoPor: {
                    id_usuario: administradorId,
                 },
            });

            await this.asignacionTrabajadorRepository.save(asignacion);
        }

        for (const idTrabajador of trabajadores) {

            const trabajador = await this.trabajadoresRepository.findOneBy({
                id_trabajador: idTrabajador
            });

            trabajador.estado = "ASIGNADO";

            await this.trabajadoresRepository.save(trabajador);

        }

        for (const recursoServicio of recursosServicio) {

            const asignacionRecurso =
                this.asignacionRecursoRepository.create({

                    cantidad: recursoServicio.cantidad_requerida,

                    servicio: {
                        id_servicio: idServicio,
                    },

                    recurso: {
                        id_recurso: recursoServicio.id_recurso,
                    },

                 });

            await this.asignacionRecursoRepository.save(asignacionRecurso);
        }

        for (const recursoServicio of recursosServicio) {

            const recurso = await this.recursoRepository.findOneBy({
                id_recurso: recursoServicio.id_recurso,
            });

            recurso.stock_disponible = recurso.stock_disponible - recursoServicio.cantidad_requerida;

            await this.recursoRepository.save(recurso);
        }

        servicio.estado = "ASIGNADO";

        await this.serviciosRepository.save(servicio);

    }

    async validarYCerrarServicio(idServicio, datosCierre) {
        const { observaciones, conformidad_cliente, validacion_cumplimiento } = datosCierre;

        if (!observaciones?.trim() || conformidad_cliente === undefined || validacion_cumplimiento === undefined) {
            throw new Error("Falta información obligatoria del servicio (observaciones, conformidad o cumplimiento).");
        }

        const servicio = await this.serviciosRepository.findOne({
            where: { id_servicio: idServicio },
            relations: {
                pago: true,
                incidencias: true
            }
        });

        if (!servicio) {
            throw new Error("Servicio no encontrado.");
        }

        if (servicio.estado === "CERRADO") {
            throw new Error("El servicio ya se encuentra cerrado de manera definitiva.");
        }

        const tieneIncidenciasPendientes = servicio.incidencias?.some(inc => inc.estado === "ABIERTA");
        if (tieneIncidenciasPendientes) {
            throw new Error("No se puede cerrar el servicio: existen incidencias pendientes (ABIERTA).");
        }

        if (!servicio.pago || servicio.pago.estado !== "PAGADO") {
            throw new Error("No se puede cerrar el servicio: el pago está incompleto o no ha sido registrado.");
        }

        servicio.estado = "CERRADO"; 
        servicio.observaciones = observaciones.trim();
        servicio.fecha_fin_real = new Date();
    
        servicio.conformidad_cliente = conformidad_cliente;
        servicio.validacion_cumplimiento = validacion_cumplimiento;

        return this.serviciosRepository.save(servicio);
    }

    async registrarPago(idServicio, datosPago) {
        const { monto } = datosPago;

        if (!monto) {
            throw new Error("El monto es un campo obligatorio para registrar el pago.");
        }

        const servicio = await this.serviciosRepository.findOne({
            where: { id_servicio: idServicio },
            relations: {
                pago: true
            }
        });

        if (!servicio) {
            throw new Error("Servicio no encontrado.");
        }

        const comprobanteGenerado = `CMP-${Date.now()}-${idServicio}`;

        let pago = servicio.pago;

        if (!pago) {
            pago = this.pagosRepository.create({
                monto,
                comprobante: comprobanteGenerado,
                estado: "PAGADO",
                fecha_pago: new Date(),
                servicio: servicio
            });
        } else {
            pago.monto = monto;
            pago.comprobante = comprobanteGenerado;
            pago.estado = "PAGADO";
            pago.fecha_pago = new Date();
        }

        return this.pagosRepository.save(pago);
    }

    async asignarEspecializacion(idServicio, idEspecializacion) {

        await this.validarServicioPendiente(idServicio);

        const especializacion =
            await this.especializacionRepository.findOneBy({
                id_especializacion: idEspecializacion,
            });

        if (!especializacion) {
            throw new Error("Especialización no encontrada.");
        }

        const relacionExistente =
            await this.servicioEspecializacionRepository.findOneBy({
                id_servicio: idServicio,
                id_especializacion: idEspecializacion,
            });

        if (relacionExistente) {
            throw new Error(
                "La especialización ya se encuentra asignada al servicio."
            );
        }

        const servicioEspecializacion =
            this.servicioEspecializacionRepository.create({

                id_servicio: idServicio,

                id_especializacion: idEspecializacion,

                servicio: {
                    id_servicio: idServicio,
                },

                especializacion: {
                    id_especializacion: idEspecializacion,
                },
            });

        await this.servicioEspecializacionRepository.save(
            servicioEspecializacion
        );
    }
    async asignarRecurso(idServicio, idRecurso, cantidadRequerida) {

        await this.validarServicioPendiente(idServicio);

        const recurso = await this.recursoRepository.findOneBy({
            id_recurso: idRecurso,
        });

        if (!recurso) {
            throw new Error("Recurso no encontrado.");
        }

        const cantidad = Number(cantidadRequerida);

        if (Number.isNaN(cantidad) || cantidad <= 0) {
            throw new Error(
                "La cantidad requerida debe ser mayor a cero."
            );
        }

        const relacionExistente =
            await this.servicioRecursoRepository.findOneBy({
                id_servicio: idServicio,
                id_recurso: idRecurso,
            });

        if (relacionExistente) {
            throw new Error(
                "El recurso ya se encuentra asignado al servicio."
            );
        }

        const servicioRecurso =
            this.servicioRecursoRepository.create({

                id_servicio: idServicio,

                id_recurso: idRecurso,

                cantidad_requerida: cantidad,

                servicio: {
                    id_servicio: idServicio,
                },

                recurso: {
                    id_recurso: idRecurso,
                },
            });

        await this.servicioRecursoRepository.save(
            servicioRecurso
        );
    }

    async actualizarEspecializacionRequerida(
        idServicio,
        idEspecializacionActual,
        idEspecializacionNueva
    ) {
        await this.validarServicioPendiente(idServicio);

        if (idEspecializacionActual === idEspecializacionNueva) {
            throw new Error("Debe seleccionar una especialización diferente.");
        }

        const relacionActual =
            await this.servicioEspecializacionRepository.findOneBy({
                id_servicio: idServicio,
                id_especializacion: idEspecializacionActual,
            });

        if (!relacionActual) {
            throw new Error("Especialización requerida no encontrada.");
        }

        const especializacionNueva =
            await this.especializacionRepository.findOneBy({
                id_especializacion: idEspecializacionNueva,
            });

        if (!especializacionNueva) {
            throw new Error("Especialización no encontrada.");
        }

        const relacionExistente =
            await this.servicioEspecializacionRepository.findOneBy({
                id_servicio: idServicio,
                id_especializacion: idEspecializacionNueva,
            });

        if (relacionExistente) {
            throw new Error(
                "La especialización ya se encuentra asignada al servicio."
            );
        }

        await this.servicioEspecializacionRepository.remove(relacionActual);

        const nuevaRelacion = this.servicioEspecializacionRepository.create({
            id_servicio: idServicio,
            id_especializacion: idEspecializacionNueva,
            servicio: {
                id_servicio: idServicio,
            },
            especializacion: {
                id_especializacion: idEspecializacionNueva,
            },
        });

        return this.servicioEspecializacionRepository.save(nuevaRelacion);
    }

    async eliminarEspecializacionRequerida(idServicio, idEspecializacion) {
        await this.validarServicioPendiente(idServicio);

        const relacion =
            await this.servicioEspecializacionRepository.findOneBy({
                id_servicio: idServicio,
                id_especializacion: idEspecializacion,
            });

        if (!relacion) {
            throw new Error("Especialización requerida no encontrada.");
        }

        await this.servicioEspecializacionRepository.remove(relacion);

        return true;
    }

    async actualizarRecursoRequerido(idServicio, idRecurso, cantidadRequerida) {
        await this.validarServicioPendiente(idServicio);

        const cantidad = Number(cantidadRequerida);

        if (Number.isNaN(cantidad) || cantidad <= 0) {
            throw new Error(
                "La cantidad requerida debe ser mayor a cero."
            );
        }

        const relacion =
            await this.servicioRecursoRepository.findOneBy({
                id_servicio: idServicio,
                id_recurso: idRecurso,
            });

        if (!relacion) {
            throw new Error("Recurso requerido no encontrado.");
        }

        relacion.cantidad_requerida = cantidad;

        return this.servicioRecursoRepository.save(relacion);
    }

    async eliminarRecursoRequerido(idServicio, idRecurso) {
        await this.validarServicioPendiente(idServicio);

        const relacion =
            await this.servicioRecursoRepository.findOneBy({
                id_servicio: idServicio,
                id_recurso: idRecurso,
            });

        if (!relacion) {
            throw new Error("Recurso requerido no encontrado.");
        }

        await this.servicioRecursoRepository.remove(relacion);

        return true;
    }
}

module.exports = new ServicioService();
