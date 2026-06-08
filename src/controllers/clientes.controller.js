const clienteService = require("../services/clientes.service");

const manejarErrorBaseDatos = require("../utils/manejarErrorBaseDatos");

const clientesController = {
    /**
     * Obtiene todos los clientes registrados.
     */
    async getAllClientes(req, res) {
        try {
            const clientes = await clienteService.getAll();

            return res.status(200).json(clientes);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene un cliente por su ID.
     */
    async getClientePorId(req, res) {
        try {
            const id = Number(req.params.id_cliente);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de cliente inválido."
                });
            }

            const cliente = await clienteService.getById(id);

            if (!cliente) {
                return res.status(404).json({
                    error: "Cliente no encontrado."
                });
            }

            return res.status(200).json(cliente);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Crea un nuevo cliente.
     */
    async createCliente(req, res) {
        try {
            const cliente = await clienteService.create(req.body);

            return res.status(201).json(cliente);
        }
        catch (error) {
            if (error.code === "23505") {
                return res.status(409).json({
                    error: "Ya existe un cliente con ese RUT."
                });
            }

            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Actualiza un cliente existente.
     */
    async updateCliente(req, res) {
        try {
            const id = Number(req.params.id_cliente);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de cliente inválido."
                });
            }

            const cliente = await clienteService.update(id, req.body);

            if (!cliente) {
                return res.status(404).json({
                    error: "Cliente no encontrado."
                });
            }

            return res.status(200).json(cliente);
        }
        catch (error) {
            if (error.code === "23505") {
                return res.status(409).json({
                    error: "Ya existe un cliente con ese RUT."
                });
            }

            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Elimina un cliente.
     */
    async deleteCliente(req, res) {
        try {
            const id = Number(req.params.id_cliente);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de cliente inválido."
                });
            }

            const deleted = await clienteService.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    error: "Cliente no encontrado."
                });
            }

            return res.status(200).json({
                message: "Cliente eliminado correctamente."
            });
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    }
};

module.exports = clientesController;