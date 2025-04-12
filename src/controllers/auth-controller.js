// controllers/auth.controller.js
const User = require('../models/user-model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Buscar al usuario por email y traer la contraseña con el '+password' para que no sea excluida por default
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(400).json({ message: 'Email o contraseña incorrectos' });
      }
  
      // Verificar si la contraseña ingresada es la misma que la almacenada
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Email o contraseña incorrectos' });
      }
  
      // Crear el token JWT
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).json({ token , user});
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor', details: error.message });
    }
  };
  


exports.resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Buscar al usuario por email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'El email no está registrado' });
    }

    // Generar una contraseña aleatoria
    const newPassword = Math.random().toString(36).slice(-5); // Contraseña aleatoria de 8 caracteres
    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña en la base de datos
    user.password = hashedPassword;
    await user.save();

    // Devolver la nueva contraseña al usuario (solo por seguridad)
    res.status(200).json({ message: 'Contraseña restablecida', newPassword });
} catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
};


exports.updatePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    // Buscar al usuario por email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'El email no está registrado' });
    }

    // Verificar que la contraseña actual sea correcta
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    // Verificar que la nueva contraseña no sea igual a la actual
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la actual' });
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña en la base de datos
    user.password = hashedPassword;
    await user.save();

    // Responder indicando que la contraseña fue actualizada
    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};


