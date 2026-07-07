const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const AppDataSource = require("../config/db");
const Usuario = require("../entity/usuario.entity");

const usuariosRepository = AppDataSource.getRepository(Usuario);

const authService = {
    login: async ({ correo, password }) => {

        if (!correo || !password) {
            throw new Error("Correo y contraseña son obligatorios.");
        }

        const usuario = await usuariosRepository.findOneBy({
            correo
        });

        if (!usuario) {
            throw new Error("Correo o contraseña incorrectos.");
        }

        if (!usuario.activo) {
            throw new Error("El usuario se encuentra deshabilitado.");
        }

        const passwordCorrecta = await bcrypt.compare(
            password,
            usuario.hash_contrasena
        );

        if (!passwordCorrecta) {
            throw new Error("Correo o contraseña incorrectos.");
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES || "8h"
            }
        );

        return {
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                run: usuario.run,
                nombres: usuario.nombres,
                apellido_paterno: usuario.apellido_paterno,
                apellido_materno: usuario.apellido_materno,
                correo: usuario.correo,
                rol: usuario.rol
            }
        };
    }
};

module.exports = authService;