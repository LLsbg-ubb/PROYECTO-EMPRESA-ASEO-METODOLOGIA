const express = require("express");

const recursosController = require("../controllers/recursos.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", recursosController.getAllRecursos);
router.get("/:id_recurso", recursosController.getRecursoPorId);
router.post(
    "/",
    authorize("ADMINISTRATIVO", "SUPERVISOR"),
    recursosController.createRecurso
);
router.put(
    "/:id_recurso",
    authorize("ADMINISTRATIVO", "SUPERVISOR"),
    recursosController.updateRecurso
);
router.delete(
    "/:id_recurso",
    authorize("ADMINISTRATIVO"),
    recursosController.deleteRecurso
);

module.exports = router;