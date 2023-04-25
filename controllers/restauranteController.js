const Restaurante = require("../models/Restaurante");

// Obtener todos los restaurantes
exports.getRestaurantes = async (req, res) => {
  try {
    const restaurantes = await Restaurante.find({ activo: true }).populate(
      "categoria",
      "nombre"
    );
    res.json(restaurantes);
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};

// Obtener un restaurante por su id
exports.getRestauranteById = async (req, res) => {
  const { id } = req.params;
  try {
    const restaurante = await Restaurante.findById(id).populate(
      "categoria",
      "nombre"
    );
    if (!restaurante) {
      return res.status(404).json({ msg: "Restaurante no encontrado" });
    }
    res.json(restaurante);
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};

exports.createRestaurante = async (req, res) => {
  try {
    const user = req.user; // Usuario que hizo login
    const { nombre, direccion, categoria } = req.body;

    // Verificar que el usuario tiene el perfil necesario
    if (user.profile !== "administrador restaurante") {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Crear el restaurante y asignar el usuario como creador
    const restaurante = new Restaurante({
      nombre,
      direccion,
      categoria,
      propietario: user._id,
    });
    await restaurante.save();

    res.status(201).json({ restaurante });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el restaurante" });
  }
};

exports.updateRestaurante = async (req, res) => {
  try {
    const user = req.user; // Usuario que hizo login
    const restauranteId = req.params.id;
    const { nombre, direccion, categoria } = req.body;

    // Buscar el restaurante
    const restaurante = await Restaurante.findById(restauranteId);

    // Verificar que el usuario es el creador del restaurante
    if (restaurante.propietario.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Actualizar el restaurante
    restaurante.nombre = nombre;
    restaurante.direccion = direccion;
    restaurante.categoria = categoria;
    await restaurante.save();

    res.json({ restaurante });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el restaurante" });
  }
};

exports.deleteRestaurante = async (req, res) => {
  try {
    const user = req.user; // Usuario que hizo login
    const restauranteId = req.params.id;

    // Buscar el restaurante
    const restaurante = await Restaurante.findById(restauranteId);

    // Verificar que el usuario es el creador del restaurante
    if (restaurante.propietario.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Desactivar el restaurante
    restaurante.activo = false;
    await restaurante.save();

    res.json({ mensaje: "Restaurante desactivado" });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el restaurante" });
  }
};
