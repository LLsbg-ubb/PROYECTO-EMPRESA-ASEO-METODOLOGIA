const express = require("express");

const recursosController = require("../controllers/recursos.controller");

const router = express.Router();

router.get("/", recursosController.getAllRecursos);
router.get("/:id_recurso", recursosController.getRecursoPorId);
router.post("/", recursosController.createRecurso);
router.put("/:id_recurso", recursosController.updateRecurso);
router.delete("/:id_recurso", recursosController.deleteRecurso);

module.exports = router;