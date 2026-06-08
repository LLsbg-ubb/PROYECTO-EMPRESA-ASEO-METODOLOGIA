const AppDataSource = require("../config/db");
const Cliente = require("../entity/cliente.entity");
const manejarErrorBaseDatos = require("../utils/manejarErrorBaseDatos");

const _clientesRepository = AppDataSource.getRepository(Cliente);

const clientesController = {
    /**
     * Obtiene todos los clientes registrados.
     */
    getAllClientes: async (req, res) => {
        try {
            const clientes = await _clientesRepository.find({
                order: {
                    id_cliente: "ASC"
                }
            });

            return res.status(200).json(clientes);
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene un cliente por su ID.
     */
    getClientePorId: async (req, res) => {
        try {
            const { id_cliente } = req.params;

            if (Number.isNaN(Number(id_cliente))) {
                return res.status(400).json({
                    error: "ID de cliente inválido."
                });
            }

            const cliente = await _clientesRepository.findOneBy({
                id_cliente: Number(id_cliente)
            });

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
    createCliente: async (req, res) => {
        try {
            const {
                rut,
                razon_social,
                nombre_contacto,
                telefono,
                correo,
                direccion,
                comuna,
                ciudad
            } = req.body;

            if (!rut?.trim() || !razon_social?.trim()) {
                return res.status(400).json({
                    error: "RUT y razón social son obligatorios."
                });
            }

            if (
                correo &&
                !/\S+@\S+\.\S+/.test(correo)
            ) {
                return res.status(400).json({
                    error: "Correo electrónico inválido."
                });
            }

            const cliente = _clientesRepository.create({
                rut,
                razon_social,
                nombre_contacto,
                telefono,
                correo,
                direccion,
                comuna,
                ciudad
            });

            await _clientesRepository.save(cliente);

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
    updateCliente: async (req, res) => {
        try {
            const { id_cliente } = req.params;

            if (Number.isNaN(Number(id_cliente))) {
                return res.status(400).json({
                    error: "ID de cliente inválido."
                });
            }

            const cliente = await _clientesRepository.findOneBy({
                id_cliente: Number(id_cliente)
            });

            if (!cliente) {
                return res.status(404).json({
                    error: "Cliente no encontrado."
                });
            }

            const {
                razon_social,
                nombre_contacto,
                telefono,
                correo,
                direccion,
                comuna,
                ciudad
            } = req.body;

            if (
                razon_social !== undefined &&
                !razon_social.trim()
            ) {
                return res.status(400).json({
                    error: "La razón social no puede estar vacía."
                });
            }

            if (
                correo &&
                !/\S+@\S+\.\S+/.test(correo)
            ) {
                return res.status(400).json({
                    error: "Correo electrónico inválido."
                });
            }

            if (razon_social !== undefined) {
                cliente.razon_social = razon_social;
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

            await _clientesRepository.save(cliente);

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
    deleteCliente: async (req, res) => {
        try {
            const { id_cliente } = req.params;

            if (Number.isNaN(Number(id_cliente))) {
                return res.status(400).json({
                    error: "ID de cliente inválido."
                });
            }

            const cliente = await _clientesRepository.findOneBy({
                id_cliente: Number(id_cliente)
            });

            if (!cliente) {
                return res.status(404).json({
                    error: "Cliente no encontrado."
                });
            }

            await _clientesRepository.remove(cliente);

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