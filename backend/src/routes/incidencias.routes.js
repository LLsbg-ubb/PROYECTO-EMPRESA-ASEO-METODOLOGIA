const express = require("express");

const incidenciasController = require("../controllers/incidencias.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", incidenciasController.getAllIncidencias);
router.get("/:id_incidencia", incidenciasController.getIncidenciaPorId);
router.post(
    "/",
    authorize("SUPERVISOR", "TRABAJADOR"),
    incidenciasController.createIncidencia
);
router.put(
    "/:id_incidencia",
    authorize("SUPERVISOR"),
    incidenciasController.updateIncidencia
);
router.put(
    "/:id_incidencia/cerrar",
    authorize("SUPERVISOR"),
    incidenciasController.cerrarIncidencia
);
router.delete(
    "/:id_incidencia",
    authorize("ADMINISTRATIVO"),
    incidenciasController.deleteIncidencia
);

module.exports = router;