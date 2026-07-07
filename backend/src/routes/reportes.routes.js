const express = require("express");

const reportesController = require("../controllers/reportes.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", reportesController.getAllReportes);
router.get("/:id_reporte", reportesController.getReportePorId);
router.post(
    "/",
    authorize("SUPERVISOR", "TRABAJADOR"),
    reportesController.createReporte
);
router.put(
    "/:id_reporte",
    authorize("SUPERVISOR"),
    reportesController.updateReporte
);
router.delete(
    "/:id_reporte",
    authorize("ADMINISTRATIVO"),
    reportesController.deleteReporte
);

module.exports = router;