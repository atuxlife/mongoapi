const mongoose = require("mongoose");
const { Schema } = mongoose.Schema;

const categoriaRestauranteSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
  },
});

const CategoriaRestaurante = mongoose.model(
  "CategoriaRestaurante",
  categoriaRestauranteSchema
);

module.exports = CategoriaRestaurante;
