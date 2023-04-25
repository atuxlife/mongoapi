const mongoose = require("mongoose");
const CategoriaProducto = require("./CategoriaProducto");

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CategoriaProducto",
  },
  precio: {
    type: Number,
    required: true,
  },
  activo: {
    type: Boolean,
    default: true,
  },
});

const Producto = mongoose.model("Producto", productoSchema);

module.exports = Producto;
