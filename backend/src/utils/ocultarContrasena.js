function ocultarContrasena(usuario) {
    if (!usuario) {
        return usuario;
    }

    const { hash_contrasena, ...usuarioSeguro } = usuario;
    return usuarioSeguro;
}

function ocultarContrasenas(usuarios) {
    return usuarios.map(ocultarContrasena);
}

module.exports = {
    ocultarContrasena,
    ocultarContrasenas
};