const express = require("express");

const trabajadoresController = require("../controllers/trabajadores.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", trabajadoresController.getAllTrabajadores);
router.get("/:id_trabajador", trabajadoresController.getTrabajadorPorId);
router.post(
    "/",
    authorize("ADMINISTRATIVO"),
    trabajadoresController.createTrabajador
);
router.put(
    "/:id_trabajador",
    authorize("ADMINISTRATIVO"),
    trabajadoresController.updateTrabajador
);
router.delete(
    "/:id_trabajador",
    authorize("ADMINISTRATIVO"),
    trabajadoresController.deleteTrabajador
);
router.post(
    "/:id_trabajador/especializaciones",
    authorize("ADMINISTRATIVO", "SUPERVISOR"),
    trabajadoresController.asignarEspecializacion
);

module.exports = router;