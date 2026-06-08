const AppDataSource = require("../config/db");

const Trabajador = require("../entity/trabajador.entity");
const Usuario = require("../entity/usuario.entity");

class TrabajadorService {
    constructor() {
        this.trabajadores = AppDataSource.getRepository(Trabajador);
        this.usuarios = AppDataSource.getRepository(Usuario);
    }

    /**
     * Obtiene todos los trabajadores registrados.
     * @returns {Promise<Trabajador[]>}
     */
    async getAll() {
        return this.trabajadores.find({
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
}

module.exports = new TrabajadorService();