const AppDataSource = require("../config/db");

const Usuario = require("../entity/usuario.entity");

class UsuarioService {
    constructor() {
        this.repository = AppDataSource.getRepository(Usuario);
    }

    /**
     * Obtiene todos los usuarios registrados.
     * @returns {Promise<Usuario[]>}
     */
    async getAll() {
        return this.repository.find({
            order: {
                id_usuario: "ASC"
            }
        });
    }

    /**
     * Obtiene un usuario por su ID.
     * @param {number} idUsuario
     * @returns {Promise<Usuario | null>}
     */
    async getById(idUsuario) {
        return this.repository.findOneBy({
            id_usuario: idUsuario
        });
    }

    /**
     * Crea un nuevo usuario.
     * @param {object} data
     * @returns {Promise<Usuario>}
     */
    async create(data) {
        const {
            run,
            nombres,
            apellido_paterno,
            apellido_materno,
            correo,
            hash_contrasena,
            rol,
            activo
        } = data;

        if (!run || !nombres || !apellido_paterno || !correo || !hash_contrasena || !rol) {
            throw new Error("run, nombres, apellido_paterno, correo, hash_contrasena y rol son obligatorios.");
        }

        const usuario = this.repository.create({
            run,
            nombres,
            apellido_paterno,
            apellido_materno,
            correo,
            hash_contrasena,
            rol,
            activo
        });

        return this.repository.save(usuario);
    }

    /**
     * Actualiza un usuario existente.
     * @param {number} idUsuario
     * @param {object} data
     * @returns {Promise<Usuario | null>}
     */
    async update(idUsuario, data) {
        const usuario = await this.getById(idUsuario);

        if (!usuario) {
            return null;
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
        } = data;

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

        return this.repository.save(usuario);
    }

    /**
     * Elimina un usuario existente.
     * @param {number} idUsuario
     * @returns {Promise<boolean>}
     */
    async delete(idUsuario) {
        const usuario = await this.getById(idUsuario);

        if (!usuario) {
            return false;
        }

        await this.repository.remove(usuario);

        return true;
    }
}

module.exports = new UsuarioService();