const express = require("express");
const auth = require("../middlewares/auth.middleware");
const semaforoController = require("../controllers/semaforo.controller");

const router = express.Router();

router.use(auth);

router.get("/:id", (req, res) => semaforoController.obtenerEstado(req, res));

module.exports = router;