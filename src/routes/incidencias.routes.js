const express = require("express");

const incidenciasController = require("../controllers/incidencias.controller");

const router = express.Router();

router.get("/", incidenciasController.getAllIncidencias);
router.get("/:id_incidencia", incidenciasController.getIncidenciaPorId);
router.post("/", incidenciasController.createIncidencia);
router.put("/:id_incidencia", incidenciasController.updateIncidencia);
router.put("/:id_incidencia/cerrar", incidenciasController.cerrarIncidencia);
router.delete("/:id_incidencia", incidenciasController.deleteIncidencia);

module.exports = router;
