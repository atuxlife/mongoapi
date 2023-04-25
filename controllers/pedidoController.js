const Pedido = require("../models/Pedido");
const User = require("../models/User");

// Controlador para crear un nuevo pedido
exports.crearPedido = async (req, res) => {
  try {
    const { restaurante, productos, direccion } = req.body;

    // Verificar que el usuario haya iniciado sesión y obtener sus datos
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: "No has iniciado sesión. Inicia sesión para crear un pedido.",
      });
    }

    // Validar que el usuario que crea el pedido sea un cliente
    if (user.profile !== "cliente") {
      return res
        .status(401)
        .json({ error: "No tienes permiso para crear un pedido" });
    }

    // Crear el pedido en estado 'Creado'
    const pedido = new Pedido({
      restaurante,
      usuario: user._id, // Utilizar el ID del usuario que inició sesión
      direccion,
      total: 0, // Se calcula más adelante
      productos: productos.map((producto) => ({
        producto: producto.id,
        cantidad: producto.cantidad,
      })),
      estado: "Creado",
    });

    // Calcular el total del pedido
    const productosIds = productos.map((producto) => producto.id);
    const productosInfo = await Producto.find({ _id: { $in: productosIds } });
    const total = productosInfo.reduce(
      (acc, producto) => acc + producto.precio,
      0
    );
    pedido.total = total;

    // Guardar el pedido
    await pedido.save();

    return res.status(201).json(pedido);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al crear el pedido" });
  }
};

// Controlador para que un usuario 'cliente' envíe el pedido
exports.enviarPedido = async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const user = req.user; // Usuario que hizo login

    // Buscar el pedido
    const pedido = await Pedido.findById(pedidoId);

    // Validar que el usuario que envía el pedido sea un cliente
    if (
      user.profile !== "cliente" ||
      user._id.toString() !== pedido.usuario.toString()
    ) {
      return res
        .status(401)
        .json({ error: "No tienes permiso para enviar este pedido" });
    }

    // Cambiar el estado del pedido a 'Enviado'
    pedido.estado = "Enviado";
    await pedido.save();

    return res.status(200).json({ message: "Pedido enviado correctamente" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al enviar el pedido" });
  }
};

// Controlador para el profile 'administrador restaurante'
exports.recibirPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate("restaurante");

    // Validar que el pedido pertenece al restaurante actual
    if (pedido.restaurante._id.toString() !== req.user.restaurante.toString()) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para realizar esta acción" });
    }

    // Validar que el usuario que recibe el pedido es un administrador de restaurante
    if (req.user.profile !== "administrador restaurante") {
      return res
        .status(401)
        .json({ error: "No tienes permiso para recibir este pedido" });
    }

    // Marcar el pedido como aceptado
    if (pedido.estado === "Creado") {
      pedido.estado = "Aceptado";
      await pedido.save();

      // Notificar al cliente que su pedido fue aceptado
      const cliente = await User.findById(pedido.usuario);
      if (cliente) {
        const notificacion = new Notificacion({
          mensaje: `Tu pedido con id ${pedido._id} ha sido aceptado por el restaurante.`,
          usuario: cliente._id,
          tipo: "Pedido",
        });
        await notificacion.save();
      }

      res.json({ message: "Pedido aceptado" });
    } else {
      res
        .status(400)
        .json({ error: "El pedido no puede ser aceptado en este estado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hubo un error al recibir el pedido" });
  }
};

// Controlador para el profile 'domiciliario'
exports.seleccionarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate("restaurante");

    // Validar que el pedido no ha sido seleccionado por otro domiciliario y que el usuario es un domiciliario
    if (
      req.user.profile !== "domiciliario" ||
      pedido.estado !== "Enviado" ||
      pedido.domiciliario
    ) {
      return res.status(401).json({
        error: "No tienes permiso para seleccionar este pedido",
      });
    }

    pedido.estado = "Aceptado";
    pedido.domiciliario = req.user._id;
    await pedido.save();

    // Notificar al cliente que su pedido fue aceptado por el domiciliario
    const cliente = await User.findById(pedido.usuario);
    if (cliente) {
      const notificacion = new Notificacion({
        mensaje: `Tu pedido con id ${pedido._id} ha sido aceptado por el domiciliario.`,
        usuario: cliente._id,
        tipo: "Pedido",
      });
      await notificacion.save();
    }

    res.json({ message: "Pedido aceptado por el domiciliario" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hubo un error al seleccionar el pedido" });
  }
};

// Controlador para marcar pedido como En dirección
exports.marcarRealizado = async (req, res) => {
  try {
    const user = req.user; // Usuario que hizo login
    const pedido = await Pedido.findOne({
      _id: req.params.id,
      usuario: user._id,
    });
    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    if (pedido.estado !== "En dirección") {
      return res
        .status(400)
        .json({ message: "El pedido no ha sido marcado como En dirección" });
    }
    if (user.profile !== "domiciliario" && user._id !== pedido.usuario) {
      return res
        .status(401)
        .json({ message: "No está autorizado para realizar esta acción" });
    }
    pedido.estado = "Realizado";
    await pedido.save();
    res.status(200).json({ message: "Pedido marcado como Realizado" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
