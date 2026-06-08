const express = require("express");
const clientesController = require("../controllers/clientes.controller");

const router = express.Router();

router.get("/", clientesController.getAllClientes);
router.get("/:id_cliente", clientesController.getClientePorId);
router.post("/", clientesController.createCliente);
router.put("/:id_cliente", clientesController.updateCliente);
router.delete("/:id_cliente", clientesController.deleteCliente);

module.exports = router;