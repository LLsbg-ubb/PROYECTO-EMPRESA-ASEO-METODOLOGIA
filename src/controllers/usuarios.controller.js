const AppDataSource = require("../config/db");
const Usuario = require("../entity/usuario.entity");

const manejarErrorBaseDatos = require("../utils/manejarErrorBaseDatos");
const {
    ocultarContrasena,
    ocultarContrasenas
} = require("../utils/ocultarContrasena");

const _usuariosRepository = AppDataSource.getRepository(Usuario);

const usuariosController = {
    /**
     * Obtiene todos los usuarios registrados.
     */
    getAllUsuarios: async (req, res) => {
        try {
            const usuarios = await _usuariosRepository.find({
                order: {
                    id_usuario: "ASC"
                }
            });

            return res.status(200).json(
                ocultarContrasenas(usuarios)
            );
        }
        catch (error) {
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Obtiene un usuario por su ID.
     */
    getUsuarioPorId: async (req, res) => {
        try {
            const { id_usuario } = req.params;

            if (Number.isNaN(Number(id_usuario))) {
                return res.status(400).json({
                    error: "ID de usuario inválido."
                });
            }

            const usuario = await _usuariosRepository.findOneBy({
                id_usuario: Number(id_usuario)
            });

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
            return manejarErrorBaseDatos(error, res);
        }
    },

    /**
     * Crea un nuevo usuario.
     */
    createUsuario: async (req, res) => {
        try {
            const {
                run,
                nombres,
                apellido_paterno,
                apellido_materno,
                correo,
                hash_contrasena,
                rol,
                activo
            } = req.body;

            if (
                !run ||
                !nombres ||
                !apellido_paterno ||
                !correo ||
                !hash_contrasena ||
                !rol
            ) {
                return res.status(400).json({
                    error: "run, nombres, apellido_paterno, correo, hash_contrasena y rol son obligatorios."
                });
            }

            const usuario = _usuariosRepository.create({
                run,
                nombres,
                apellido_paterno,
                apellido_materno,
                correo,
                hash_contrasena,
                rol,
                activo
            });

            await _usuariosRepository.save(usuario);

            return res.status(201).json(
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
     * Actualiza un usuario existente.
     */
    updateUsuario: async (req, res) => {
        try {
            const { id_usuario } = req.params;

            if (Number.isNaN(Number(id_usuario))) {
                return res.status(400).json({
                    error: "ID de usuario inválido."
                });
            }

            const usuario = await _usuariosRepository.findOneBy({
                id_usuario: Number(id_usuario)
            });

            if (!usuario) {
                return res.status(404).json({
                    error: "Usuario no encontrado."
                });
            }

            const {
                run,
                nombres,
                apellido_paterno,
                apellido_materno,
                correo,
                hash_contrasena,
                rol,
                activo
            } = req.body;

            if (run !== undefined) {
                usuario.run = run;
            }

            if (nombres !== undefined) {
                usuario.nombres = nombres;
            }

            if (apellido_paterno !== undefined) {
                usuario.apellido_paterno = apellido_paterno;
            }

            if (apellido_materno !== undefined) {
                usuario.apellido_materno = apellido_materno;
            }

            if (correo !== undefined) {
                usuario.correo = correo;
            }

            if (hash_contrasena !== undefined) {
                usuario.hash_contrasena = hash_contrasena;
            }

            if (rol !== undefined) {
                usuario.rol = rol;
            }

            if (activo !== undefined) {
                usuario.activo = activo;
            }

            await _usuariosRepository.save(usuario);

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
    deleteUsuario: async (req, res) => {
        try {
            const { id_usuario } = req.params;

            if (Number.isNaN(Number(id_usuario))) {
                return res.status(400).json({
                    error: "ID de usuario inválido."
                });
            }

            const usuario = await _usuariosRepository.findOneBy({
                id_usuario: Number(id_usuario)
            });

            if (!usuario) {
                return res.status(404).json({
                    error: "Usuario no encontrado."
                });
            }

            await _usuariosRepository.remove(usuario);

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