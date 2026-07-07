const express = require("express");

const especializacionesController = require("../controllers/especializaciones.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", especializacionesController.getAllEspecializaciones);
router.get("/:id_especializacion", especializacionesController.getEspecializacionPorId);
router.post(
    "/",
    authorize("ADMINISTRATIVO"),
    especializacionesController.createEspecializacion
);
router.put(
    "/:id_especializacion",
    authorize("ADMINISTRATIVO"),
    especializacionesController.updateEspecializacion
);
router.delete(
    "/:id_especializacion",
    authorize("ADMINISTRATIVO"),
    especializacionesController.deleteEspecializacion
);

module.exports = router;