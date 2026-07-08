const AppDataSource = require("../config/db");

const Trabajador = require("../entity/trabajador.entity");
const Usuario = require("../entity/usuario.entity");
const Especializacion = require("../entity/especializacion.entity");

class TrabajadorService {
    constructor() {
        this.trabajadores = AppDataSource.getRepository(Trabajador);
        this.usuarios = AppDataSource.getRepository(Usuario);
        this.especializaciones = AppDataSource.getRepository(Especializacion);
    }

    /**
     * Obtiene todos los trabajadores registrados.
     * @returns {Promise<Trabajador[]>}
     */
    async getAll() {
        return this.trabajadores.find({
            relations: {
                usuario: true,
                especializaciones: true
            },
            order: {
                id_trabajador: "ASC"
            }
        });
    }

    /**
     * Obtiene un trabajador por su ID.
     * @param {number} idTrabajador
     * @returns {Promise<Trabajador | null>}
     */
    async getById(idTrabajador) {
        return this.trabajadores.findOneBy({
            id_trabajador: idTrabajador
        });
    }

    /**
     * Crea un nuevo trabajador.
     * @param {object} data
     * @returns {Promise<Trabajador>}
     */
    async create(data) {
        const {
            id_usuario,
            fecha_contratacion,
            estado
        } = data;

        if (!id_usuario || !fecha_contratacion) {
            throw new Error("id_usuario y fecha_contratacion son obligatorios.");
        }

        const usuario = await this.usuarios.findOneBy({
                id_usuario: Number(id_usuario)
            });

        if (!usuario) {
            throw new Error("Usuario no encontrado.");
        }

        const trabajadorExistente = await this.trabajadores.findOne({
                where: {
                    usuario: {
                        id_usuario: Number(id_usuario)
                    }
                },
                relations: {
                    usuario: true
                }
            });

        if (trabajadorExistente) {
            throw new Error("Ese usuario ya está asociado a un trabajador.");
        }

        const trabajador = this.trabajadores.create({
                fecha_contratacion,
                estado,
                usuario
            });

        return this.trabajadores.save(trabajador);
    }

    /**
     * Actualiza un trabajador existente.
     * @param {number} idTrabajador
     * @param {object} data
     * @returns {Promise<Trabajador | null>}
     */
    async update(idTrabajador, data) {
        const trabajador = await this.getById(idTrabajador);

        if (!trabajador) {
            return null;
        }

        const {
            fecha_contratacion,
            estado
        } = data;

        if (fecha_contratacion !== undefined) {
            trabajador.fecha_contratacion = fecha_contratacion;
        }

        if (estado !== undefined) {
            trabajador.estado = estado;
        }

        return this.trabajadores.save(trabajador);
    }

    /**
     * Elimina un trabajador existente.
     * @param {number} idTrabajador
     * @returns {Promise<boolean>}
     */
    async delete(idTrabajador) {
        const trabajador =
            await this.getById(idTrabajador);

        if (!trabajador) {
            return false;
        }

        await this.trabajadores.remove(trabajador);

        return true;
    }

    async asignarEspecializacion(idTrabajador, idEspecializacion) {

        const trabajador = await this.trabajadores.findOne({
            where: {
                id_trabajador: idTrabajador,
            },
            relations: {
                especializaciones: true,
            },
        });

        if (!trabajador) {
            throw new Error("Trabajador no encontrado.");
        }

        const especializacion =
            await this.especializaciones.findOneBy({
                id_especializacion: idEspecializacion,
            });

        if (!especializacion) {
            throw new Error("Especialización no encontrada.");
        }

        for (const especializacionTrabajador of trabajador.especializaciones) {

            if (
                especializacionTrabajador.id_especializacion ===
                idEspecializacion
            ) {
                throw new Error(
                    "La especialización ya se encuentra asignada al trabajador."
                );
            }

        }

        trabajador.especializaciones.push(especializacion);

        await this.trabajadores.save(trabajador);

        return trabajador;
    }

    async updateEspecializacion(idTrabajador, idEspecializacionActual, idEspecializacionNueva) {
        if (idEspecializacionActual === idEspecializacionNueva) {
            throw new Error("Debe seleccionar una especializacion diferente.");
        }

        const trabajador = await this.trabajadores.findOne({
            where: {
                id_trabajador: idTrabajador,
            },
            relations: {
                especializaciones: true,
            },
        });

        if (!trabajador) {
            throw new Error("Trabajador no encontrado.");
        }

        const indiceActual = trabajador.especializaciones.findIndex(
            especializacion => especializacion.id_especializacion === idEspecializacionActual
        );

        if (indiceActual === -1) {
            throw new Error("Especializacion actual no asignada al trabajador.");
        }

        const especializacionNueva = await this.especializaciones.findOneBy({
            id_especializacion: idEspecializacionNueva,
        });

        if (!especializacionNueva) {
            throw new Error("Especializacion nueva no encontrada.");
        }

        const yaAsignada = trabajador.especializaciones.some(
            especializacion => especializacion.id_especializacion === idEspecializacionNueva
        );

        if (yaAsignada) {
            throw new Error("La especializacion nueva ya esta asignada al trabajador.");
        }

        trabajador.especializaciones[indiceActual] = especializacionNueva;

        return this.trabajadores.save(trabajador);
    }

    async deleteEspecializacion(idTrabajador, idEspecializacion) {
        const trabajador = await this.trabajadores.findOne({
            where: {
                id_trabajador: idTrabajador,
            },
            relations: {
                especializaciones: true,
            },
        });

        if (!trabajador) {
            throw new Error("Trabajador no encontrado.");
        }

        const cantidadInicial = trabajador.especializaciones.length;

        trabajador.especializaciones = trabajador.especializaciones.filter(
            especializacion => especializacion.id_especializacion !== idEspecializacion
        );

        if (trabajador.especializaciones.length === cantidadInicial) {
            throw new Error("Especializacion no asignada al trabajador.");
        }

        return this.trabajadores.save(trabajador);
    }
}

module.exports = new TrabajadorService();
