const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("./User");
const Restaurante = require("./Restaurante");
const Producto = require("./Producto");

const PedidoSchema = new mongoose.Schema({
  restaurante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurante",
    required: true,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  domiciliario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now,
  },
  direccion: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  productos: [
    {
      producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto",
        required: true,
      },
      cantidad: {
        type: Number,
        required: true,
      },
    },
  ],
  estado: {
    type: String,
    enum: [
      "Creado",
      "Enviado",
      "Aceptado",
      "Recibido",
      "En dirección",
      "Realizado",
    ],
    default: "Creado",
  },
});

const Pedido = mongoose.model("Pedido", PedidoSchema);

module.exports = Pedido;
