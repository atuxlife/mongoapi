const express = require("express");
const authMiddleware = require("../middleware/auth");
const pedidoController = require("../controllers/pedidoController");

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Rutas para perfil 'cliente'
router.post("/", pedidoController.crearPedido);
router.get("/", pedidoController.obtenerPedidosCliente);
router.get("/:id", pedidoController.obtenerPedidoClientePorId);
router.put("/:id/enviar", pedidoController.enviarPedido);
router.put("/:id/cancelar", pedidoController.cancelarPedido);

// Rutas para perfil 'domiciliario'
router.get("/pendientes", pedidoController.obtenerPedidosPendientes);
router.put("/:id/aceptar", pedidoController.aceptarPedido);
router.put("/:id/marcar-en-direccion", pedidoController.marcarEnDireccion);
router.put("/:id/marcar-realizado", pedidoController.marcarRealizado);

// Rutas para perfil 'administrador restaurante'
router.get("/en-curso", pedidoController.obtenerPedidosEnCurso);
router.get("/realizados", pedidoController.obtenerPedidosRealizados);
router.put("/:id/recibir", pedidoController.recibirPedido);

module.exports = router;
