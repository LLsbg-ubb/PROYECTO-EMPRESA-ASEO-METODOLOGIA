const express = require("express");
const router = express.Router();
const semaforoController = require("../controllers/semaforo.controller");

router.get("/:id", (req, res) => semaforoController.obtenerEstado(req, res));

module.exports = router;