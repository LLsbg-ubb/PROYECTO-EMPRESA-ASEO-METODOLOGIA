const AppDataSource = require("../config/db");
const Cliente = require("../entity/cliente.entity");

class ClienteService {
    constructor() {
        this.repository = AppDataSource.getRepository(Cliente);
    }

    /**
     * Obtiene todos los clientes registrados.
     * @returns {Promise<Cliente[]>}
     */
    async getAll() {
        return this.repository.find({
            order: {
                id_cliente: "ASC"
            }
        });
    }

    /**
     * Obtiene un cliente por su ID.
     * @param {number} idCliente
     * @returns {Promise<Cliente | null>}
     */
    async getById(idCliente) {
        return this.repository.findOneBy({
            id_cliente: idCliente
        });
    }

    /**
     * Crea un nuevo cliente.
     * @param {object} data
     * @returns {Promise<Cliente>}
     */
    async create(data) {
        const {
            rut,
            razon_social,
            nombre_contacto,
            telefono,
            correo,
            direccion,
            comuna,
            ciudad
        } = data;

        if (!rut?.trim() || !razon_social?.trim()) {
            throw new Error("RUT y razón social son obligatorios.");
        }

        if (correo && !/\S+@\S+\.\S+/.test(correo)) {
            throw new Error("Correo electrónico inválido.");
        }

        const cliente = this.repository.create({
            rut: rut.trim(),
            razon_social: razon_social.trim(),
            nombre_contacto,
            telefono,
            correo,
            direccion,
            comuna,
            ciudad
        });

        return this.repository.save(cliente);
    }

    /**
     * Actualiza un cliente existente.
     * @param {number} idCliente
     * @param {object} data
     * @returns {Promise<Cliente | null>}
     */
    async update(idCliente, data) {
        const cliente = await this.getById(idCliente);

        if (!cliente) {
            return null;
        }

        const {
            razon_social,
            nombre_contacto,
            telefono,
            correo,
            direccion,
            comuna,
            ciudad
        } = data;

        if (razon_social !== undefined && !razon_social.trim()) {
            throw new Error("La razón social no puede estar vacía.");
        }

        if (correo && !/\S+@\S+\.\S+/.test(correo)) {
            throw new Error("Correo electrónico inválido.");
        }

        if (razon_social !== undefined) {
            cliente.razon_social = razon_social.trim();
        }

        if (nombre_contacto !== undefined) {
            cliente.nombre_contacto = nombre_contacto;
        }

        if (telefono !== undefined) {
            cliente.telefono = telefono;
        }

        if (correo !== undefined) {
            cliente.correo = correo;
        }

        if (direccion !== undefined) {
            cliente.direccion = direccion;
        }

        if (comuna !== undefined) {
            cliente.comuna = comuna;
        }

        if (ciudad !== undefined) {
            cliente.ciudad = ciudad;
        }

        return this.repository.save(cliente);
    }

    /**
     * Elimina un cliente existente.
     * @param {number} idCliente
     * @returns {Promise<boolean>}
     */
    async delete(idCliente) {
        const cliente = await this.getById(idCliente);

        if (!cliente) {
            return false;
        }

        await this.repository.remove(cliente);

        return true;
    }
}

module.exports = new ClienteService();