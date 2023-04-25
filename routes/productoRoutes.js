const express = require("express");
const productoController = require("../controllers/productoController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

router.post("/", productoController.createProducto);
router.get("/", productoController.getProductos);
router.get("/:id", productoController.getProductoById);
router.put("/:id", productoController.updateProducto);
router.delete("/:id", productoController.deleteProducto);
router.get("/restaurante/:id", productoController.getProductosByRestaurante);

module.exports = router;
