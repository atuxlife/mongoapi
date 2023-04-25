const { Schema } = require("mongoose");
const CategoriaRestaurante = require("./CategoriaRestaurante");
const User = require("./User");

const restauranteSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  direccion: {
    type: String,
    required: true,
  },
  categoria: {
    type: Schema.Types.ObjectId,
    ref: "CategoriaRestaurante",
  },
  propietario: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  activo: {
    type: Boolean,
    default: true,
  },
});

const Restaurante = mongoose.model("Restaurante", restauranteSchema);

module.exports = Restaurante;
