const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Este método hace las veces de crear usuario
exports.signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, address } =
      req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ error: "El correo electrónico ya existe en la base de datos" });
    }

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      address,
      profile: "cliente",
    });

    const token = jwt.sign(
      { userId: user._id, profile: user.profile },
      process.env.JWT_SECRET
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

// Login en la aplicación
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { userId: user._id, profile: user.profile },
      process.env.JWT_SECRET
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// Listar todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const user = req.user;
    if (user.profile !== "administrador restaurante") {
      return res
        .status(401)
        .json({ error: "No tienes permisos para realizar esta acción" });
    }

    const users = await User.find({ activo: true }).select(
      "-password -__v -activo"
    );
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

// Mostrar los datos de un sólo usuario
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const isAdminRestaurant = req.user.profile === "administrador restaurante";
    const isOwner = req.user._id.toString() === user._id.toString();

    if (!isAdminRestaurant && !isOwner) {
      return res
        .status(403)
        .json({ error: "No está autorizado para realizar esta acción" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { profile } = req.user;
    const { firstName, lastName, phoneNumber, address } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (
      profile !== "administrador restaurante" &&
      user._id.toString() !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para modificar este usuario" });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;

    await user.save();

    res.status(200).json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};

// Borrar usuario (desactvarlo a false)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { profile } = req.user;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Solo puede ser eliminado por el propio usuario o un administrador de restaurante
    if (
      profile !== "administrador restaurante" &&
      user._id.toString() !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ error: "No tiene permisos para realizar esta acción" });
    }

    // En lugar de eliminar, se establece activo como false
    user.activo = false;
    await user.save();

    res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
};
