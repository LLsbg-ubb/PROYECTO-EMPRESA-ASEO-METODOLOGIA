const express = require("express");

const serviciosController = require("../controllers/servicios.controller");

const router = express.Router();

router.get("/", serviciosController.getAllServicios);
router.get("/:id_servicio", serviciosController.getServicioPorId);
router.post("/", serviciosController.createServicio);
router.put("/:id_servicio", serviciosController.updateServicio);
router.delete("/:id_servicio", serviciosController.deleteServicio);
router.post("/:id_servicio/asignar", serviciosController.asignarServicio);

module.exports = router;