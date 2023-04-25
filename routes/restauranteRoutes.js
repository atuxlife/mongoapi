const express = require("express");
const restauranteController = require("../controllers/restauranteController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

router.post("/", restauranteController.createRestaurante);
router.get("/", restauranteController.getRestaurantes);
router.get("/:id", restauranteController.getRestauranteById);
router.put("/:id", restauranteController.updateRestaurante);
router.delete("/:id", restauranteController.deleteRestaurante);

module.exports = router;
