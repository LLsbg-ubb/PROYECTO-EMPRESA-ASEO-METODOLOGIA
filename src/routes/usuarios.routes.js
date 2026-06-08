const express = require("express");

const usuariosController = require("../controllers/usuarios.controller");

const router = express.Router();

router.get("/", usuariosController.getAllUsuarios);
router.get("/:id_usuario", usuariosController.getUsuarioPorId);
router.post("/", usuariosController.createUsuario);
router.put("/:id_usuario", usuariosController.updateUsuario);
router.delete("/:id_usuario", usuariosController.deleteUsuario);

module.exports = router;