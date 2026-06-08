const AppDataSource = require("../config/db");
const Recurso = require("../entity/recurso.entity");

class RecursoService {
    constructor() {
        this.repository = AppDataSource.getRepository(Recurso);
    }

    /**
     * Obtiene todos los recursos registrados.
     * @returns {Promise<Recurso[]>}
     */
    async getAll() {
        return this.repository.find({
            order: {
                nombre: "ASC"
            }
        });
    }

    /**
     * Obtiene un recurso por su ID.
     * @param {number} idRecurso
     * @returns {Promise<Recurso | null>}
     */
    async getById(idRecurso) {
        return this.repository.findOneBy({
            id_recurso: idRecurso
        });
    }

    /**
     * Crea un nuevo recurso.
     * @param {object} data
     * @returns {Promise<Recurso>}
     */
    async create(data) {
        let {
            nombre,
            descripcion,
            stock_disponible
        } = data;

        if (!nombre?.trim()) {
            throw new Error("El nombre es obligatorio.");
        }

        descripcion ??= "Sin descripción.";
        stock_disponible ??= 0;

        stock_disponible = Number(stock_disponible);

        if (Number.isNaN(stock_disponible)) {
            throw new Error("El stock debe ser un número.");
        }

        if (stock_disponible < 0) {
            throw new Error("El stock no puede ser un valor negativo.");
        }

        const recurso = this.repository.create({
            nombre: nombre.trim(),
            descripcion,
            stock_disponible
        });

        return this.repository.save(recurso);
    }

    /**
     * Actualiza un recurso existente.
     * @param {number} idRecurso
     * @param {object} data
     * @returns {Promise<Recurso | null>}
     */
    async update(idRecurso, data) {
        const recurso = await this.getById(idRecurso);

        if (!recurso) {
            return null;
        }

        const {
            nombre,
            descripcion,
            stock_disponible
        } = data;

        if (nombre !== undefined) {
            if (!nombre.trim()) {
                throw new Error("El nombre no puede estar vacío.");
            }

            recurso.nombre = nombre.trim();
        }

        if (descripcion !== undefined) {
            recurso.descripcion = descripcion;
        }

        if (stock_disponible !== undefined) {
            const stock = Number(stock_disponible);

            if (Number.isNaN(stock)) {
                throw new Error("El stock debe ser un número.");
            }

            if (stock < 0) {
                throw new Error("El stock no puede ser un valor negativo.");
            }

            recurso.stock_disponible = stock;
        }

        return this.repository.save(recurso);
    }

    /**
     * Elimina un recurso existente.
     * @param {number} idRecurso
     * @returns {Promise<boolean>}
     */
    async delete(idRecurso) {
        const recurso = await this.getById(idRecurso);

        if (!recurso) {
            return false;
        }

        await this.repository.remove(recurso);

        return true;
    }
}

module.exports = new RecursoService();