const express = require("express");
const clientesController = require("../controllers/clientes.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", clientesController.getAllClientes);
router.get("/:id_cliente", clientesController.getClientePorId);
router.post(
    "/",
    authorize("ADMINISTRATIVO", "SUPERVISOR"),
    clientesController.createCliente
);
router.put(
    "/:id_cliente",
    authorize("ADMINISTRATIVO", "SUPERVISOR"),
    clientesController.updateCliente
);
router.delete(
    "/:id_cliente",
    authorize("ADMINISTRATIVO"),
    clientesController.deleteCliente
);

module.exports = router;