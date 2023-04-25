const Producto = require('../models/Producto');
const User = require('../models/User');
const ObjectId = require('mongoose').Types.ObjectId;

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate(
      "categoria",
      "nombre"
    );
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hubo un error al obtener el producto" });
  }
};
  
// Obtener todos los productos
exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true }).populate(
      "categoria",
      "nombre"
    );
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hubo un error al obtener los productos" });
  }
};

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    const user = req.user; // Usuario que hizo login

    // Verificar si el usuario tiene el perfil adecuado para crear un producto
    if (user.profile !== 'administrador restaurante') {
      return res.status(403).json({ error: 'No tienes permiso para crear un producto' });
    }

    const productoData = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      categoria: req.body.categoria,
      precio: req.body.precio,
      creador: user._id
    };

    // Verificar si el usuario es el creador del restaurante asociado al producto
    const restauranteDelProducto = await User.findById(user._id);
    if (restauranteDelProducto.creador !== user._id) {
      return res.status(403).json({ error: 'No tienes permiso para crear un producto en este restaurante' });
    }

    const nuevoProducto = new Producto(productoData);
    await nuevoProducto.save();

    res.json(nuevoProducto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un error al crear el producto' });
  }
};

// Actualizar un producto
exports.updateProducto = async (req, res) => {
  try {
    const user = req.user;

    // Verificar si el usuario es el creador del producto
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    if (!producto.creador.equals(user._id)) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para modificar este producto" });
    }

    const productoData = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      categoria: req.body.categoria,
      precio: req.body.precio,
    };

    await Producto.findByIdAndUpdate(req.params.id, productoData, {
      new: true,
    });

    res.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hubo un error al actualizar el producto" });
  }
};

// Borrar producto
exports.deleteProducto = async (req, res) => {
  try {
    const productoId = req.params.id;
    const producto = await Producto.findOne({
      _id: productoId,
      activo: true,
    }).populate("categoria");

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Validar que el usuario logueado sea el creador del producto o un administrador de restaurante
    const restaurante = await Restaurante.findOne({
      _id: producto.restaurante,
      usuario: req.user._id,
      activo: true,
    });

    if (!restaurante && req.user.profile !== "administrador restaurante") {
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar este producto" });
    }

    producto.activo = false;
    await producto.save();

    return res
      .status(200)
      .json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar el producto" });
  }
};

// Listado de productos por restaurante
exports.getProductosRestaurante = async (req, res) => {
  const { restauranteId } = req.params;
  try {
    const productos = await Producto.aggregate([
      {
        $match: {
          restaurante: mongoose.Types.ObjectId(restauranteId),
        },
      },
      {
        $group: {
          _id: "$_id",
          nombre: { $first: "$nombre" },
          descripcion: { $first: "$descripcion" },
          categoria: { $first: "$categoria" },
          precio: { $first: "$precio" },
          cantidad: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(productos);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener los productos del restaurante.");
  }
};
