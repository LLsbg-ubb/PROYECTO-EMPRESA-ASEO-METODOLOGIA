const express = require("express");

const router = express.Router();

router.use("/usuarios", require("./usuarios.routes"));
router.use("/clientes", require("./clientes.routes"));
router.use("/servicios", require("./servicios.routes"));
router.use("/trabajadores", require("./trabajadores.routes"));
router.use("/recursos", require("./recursos.routes"));
router.use("/reportes", require("./reportes.routes"));

module.exports = router;