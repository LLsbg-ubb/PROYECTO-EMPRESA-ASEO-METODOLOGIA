const express = require("express");

const trabajadoresController = require("../controllers/trabajadores.controller");

const router = express.Router();

router.get("/", trabajadoresController.getAllTrabajadores);
router.get("/:id_trabajador", trabajadoresController.getTrabajadorPorId);
router.post("/", trabajadoresController.createTrabajador);
router.put("/:id_trabajador", trabajadoresController.updateTrabajador);
router.delete("/:id_trabajador", trabajadoresController.deleteTrabajador);
router.post("/:id_trabajador/especializaciones", trabajadoresController.asignarEspecializacion);

module.exports = router;