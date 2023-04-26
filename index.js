const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authMiddleware = require("./middlewares/auth");
const authRoutes = require("./routes/authRoutes");
const restauranteRoutes = require("./routes/restauranteRoutes");
const productoRoutes = require("./routes/productoRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");

dotenv.config();

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/restaurantes", restauranteRoutes);
app.use("/productos", productoRoutes);
app.use("/pedidos", pedidoRoutes);

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "Este endpoint está protegido" });
});

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
