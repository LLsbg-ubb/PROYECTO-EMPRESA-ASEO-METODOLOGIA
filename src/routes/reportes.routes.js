const express = require("express");

const reportesController = require("../controllers/reportes.controller");

const router = express.Router();

router.get("/", reportesController.getAllReportes);
router.get("/:id_reporte", reportesController.getReportePorId);
router.post("/", reportesController.createReporte);
router.put("/:id_reporte", reportesController.updateReporte);
router.delete("/:id_reporte", reportesController.deleteReporte);

module.exports = router;