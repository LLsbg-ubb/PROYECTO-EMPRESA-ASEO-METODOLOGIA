const usuarioService =
    require("../services/usuarios.service");

const manejarErrorBaseDatos =
    require("../utils/manejarErrorBaseDatos");

const { ocultarContrasena, ocultarContrasenas } = require("../utils/ocultarContrasena");

const usuariosController = {
    /**
     * Obtiene todos los usuarios registrados.
     */
    async getAllUsuarios(req, res) {
        try {
            const usuarios = await usuarioService.getAll();

            return res.status(200).json(ocultarContrasenas(usuarios));
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene un usuario por su ID.
     */
    async getUsuarioPorId(req, res) {
        try {
            const id = Number(req.params.id_usuario);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de usuario inválido."
                });
            }

            const usuario = await usuarioService.getById(id);

            if (!usuario) {
                return res.status(404).json({
                    error: "Usuario no encontrado."
                });
            }

            return res.status(200).json(ocultarContrasena(usuario));
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Crea un nuevo usuario.
     */
    async createUsuario(req, res) {
        try {
            const usuario = await usuarioService.create(req.body);

            return res.status(201).json(ocultarContrasena(usuario));
        }
        catch (error) {
            if (error.code === "23505") {
                return res.status(409).json({
                    error: "Ya existe un usuario con ese RUN o correo."
                });
            }

            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Actualiza un usuario existente.
     */
    async updateUsuario(req, res) {
        try {
            const id = Number(req.params.id_usuario);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de usuario inválido."
                });
            }

            const usuario = await usuarioService.update(id, req.body);

            if (!usuario) {
                return res.status(404).json({
                    error: "Usuario no encontrado."
                });
            }

            return res.status(200).json(
                ocultarContrasena(usuario)
            );
        }
        catch (error) {
            if (error.code === "23505") {
                return res.status(409).json({
                    error: "Ya existe un usuario con ese RUN o correo."
                });
            }

            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Elimina un usuario.
     */
    async deleteUsuario(req, res) {
        try {
            const id = Number(req.params.id_usuario);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: "ID de usuario inválido."
                });
            }

            const deleted = await usuarioService.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    error: "Usuario no encontrado."
                });
            }

            return res.status(200).json({
                message: "Usuario eliminado correctamente."
            });
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    }
};

module.exports = usuariosController;