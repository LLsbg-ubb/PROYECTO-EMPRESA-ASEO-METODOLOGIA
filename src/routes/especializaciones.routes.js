const express = require("express");

const especializacionesController = require("../controllers/especializaciones.controller");

const router = express.Router();

router.get("/", especializacionesController.getAllEspecializaciones);
router.get("/:id_especializacion", especializacionesController.getEspecializacionPorId);
router.post("/", especializacionesController.createEspecializacion);
router.put("/:id_especializacion", especializacionesController.updateEspecializacion);
router.delete("/:id_especializacion", especializacionesController.deleteEspecializacion);

module.exports = router;