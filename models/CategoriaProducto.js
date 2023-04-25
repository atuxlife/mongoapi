const mongoose = require("mongoose");
const { Schema } = mongoose.Schema;

const categoriaProductoSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
  },
});

const CategoriaProducto = mongoose.model(
  "CategoriaProducto",
  categoriaProductoSchema
);

module.exports = CategoriaProducto;
