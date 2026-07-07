const AppDataSource = require("../config/db");
const Especializacion = require("../entity/especializacion.entity");

class EspecializacionService {
    constructor() {
        this.especializacionRepository = AppDataSource.getRepository(Especializacion);
    }

    /**
     * Obtiene todas las especializaciones registradas.
     * @returns {Promise<Especializacion[]>}
     */
    async getAll() {
        return this.especializacionRepository.find({
            order: {
                nombre: "ASC"
            }
        });
    }

    /**
     * Obtiene una especializacion por su ID.
     * @param {number} idEspecializacion
     * @returns {Promise<Especializacion | null>}
     */
    async getById(idEspecializacion) {
        return this.especializacionRepository.findOneBy({
            id_especializacion: idEspecializacion
        });
    }

    /**
     * Crea una nueva especializacion.
     * @param {object} data
     * @returns {Promise<Especializacion>}
     */
    async create(data) {
        let {
            nombre
        } = data;

        if (!nombre?.trim()) {
            throw new Error("El nombre es obligatorio.");
        }

        const especializacion = this.especializacionRepository.create({
            nombre: nombre.trim()
        });

        return this.especializacionRepository.save(especializacion);
    }

    /**
     * Actualiza una especializacion existente.
     * @param {number} idEspecializacion
     * @param {object} data
     * @returns {Promise<Especializacion | null>}
     */
    async update(idEspecializacion, data) {
        const especializacion = await this.getById(idEspecializacion);

        if (!especializacion) {
            return null;
        }

        const {
            nombre,
        } = data;

        if (nombre !== undefined) {
            if (!nombre.trim()) {
                throw new Error("El nombre no puede estar vacío.");
            }

            especializacion.nombre = nombre.trim();
        }

        return this.especializacionRepository.save(especializacion);
    }

    /**
     * Elimina una especializacion existente.
     * @param {number} idEspecializacion
     * @returns {Promise<boolean>}
     */
    async delete(idEspecializacion) {
        const especializacion = await this.getById(idEspecializacion);

        if (!especializacion) {
            return false;
        }

        await this.especializacionRepository.remove(especializacion);

        return true;
    }
}

module.exports = new EspecializacionService();