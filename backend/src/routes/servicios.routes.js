const express = require("express");

const serviciosController = require("../controllers/servicios.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", serviciosController.getAllServicios);
router.get("/:id_servicio", serviciosController.getServicioPorId);
router.post(
    "/",
    authorize("ADMINISTRATIVO", "SUPERVISOR"),
    serviciosController.createServicio
);
router.put(
    "/:id_servicio",
    authorize("ADMINISTRATIVO", "SUPERVISOR"),
    serviciosController.updateServicio
);
router.delete(
    "/:id_servicio",
    authorize("ADMINISTRATIVO"),
    serviciosController.deleteServicio
);
router.post(
    "/:id_servicio/asignar",
    authorize("SUPERVISOR"),
    serviciosController.asignarServicio
);
router.post(
    "/:id_servicio/pago",
    authorize("ADMINISTRATIVO"),
    serviciosController.registrarPagoServicio
);
router.post(
    "/:id_servicio/cerrar",
    authorize("ADMINISTRATIVO", "SUPERVISOR"),
    serviciosController.validarYCerrarServicio
);
router.post(
    "/:id_servicio/especializaciones",
    authorize("SUPERVISOR"),
    serviciosController.asignarEspecializacion
);
router.post(
    "/:id_servicio/recursos",
    authorize("SUPERVISOR"),
    serviciosController.asignarRecurso
);

module.exports = router;