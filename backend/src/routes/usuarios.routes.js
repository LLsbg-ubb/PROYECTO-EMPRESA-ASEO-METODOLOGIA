const express = require("express");

const usuariosController = require("../controllers/usuarios.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.use(auth);

router.get(
    "/",
    authorize("ADMINISTRATIVO"),
    usuariosController.getAllUsuarios
);
router.get(
    "/:id_usuario",
    authorize("ADMINISTRATIVO"),
    usuariosController.getUsuarioPorId
);
router.post(
    "/",
    authorize("ADMINISTRATIVO"),
    usuariosController.createUsuario
);
router.put(
    "/:id_usuario",
    authorize("ADMINISTRATIVO"),
    usuariosController.updateUsuario
);
router.delete(
    "/:id_usuario",
    authorize("ADMINISTRATIVO"),
    usuariosController.deleteUsuario
);

module.exports = router;