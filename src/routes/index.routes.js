const express = require("express");

const router = express.Router();

router.use("/usuarios", require("./usuarios.routes"));
router.use("/clientes", require("./clientes.routes"));
router.use("/servicios", require("./servicios.routes"));
router.use("/trabajadores", require("./trabajadores.routes"));
router.use("/recursos", require("./recursos.routes"));
router.use("/reportes", require("./reportes.routes"));
router.use("/incidencias", require("./incidencias.routes"));
router.use("/semaforo", require("./semaforo.routes"));
router.use("/especializaciones", require("./especializaciones.routes"));

module.exports = router;