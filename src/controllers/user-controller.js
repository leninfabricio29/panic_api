const User = require('../models/user-model');
const Contact = require('../models/contact-model');
const Neighborhood = require('../models/neighborhood-model')
const bcrypt = require('bcrypt');



exports.register = async (req, res) => {
    try {
      const { name, email, password, phone, lastLocation, role } = req.body;
  
      // Encriptar la contraseña antes de guardarla
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Crear el nuevo usuario
      const user = new User({
        name,
        email,
        password: hashedPassword, // Guardar la contraseña encriptada
        role, 
        phone,
        lastLocation: lastLocation || { type: 'Point', coordinates: [0.0, 0.0], }, // Ubicación predeterminada
       
      });
  
      // Guardar el usuario
      await user.save();
      res.status(201).json({ message: 'Usuario registrado exitosamente', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  
  exports.getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  exports.updateUser = async (req, res) => {
    try {
      const { name, phone, fcmToken } = req.body;
      const user = await User.findByIdAndUpdate(req.params.id, { name, phone, fcmToken }, { new: true });
  
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  
      res.json({ message: 'Usuario actualizado correctamente', user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  exports.deleteUser = async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  
      res.json({ message: 'Cuenta desactivada', user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  exports.getUsers = async (req, res) => {
    try {
      const users = await User.find({ isActive: true });
      res.json({users: users});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  


  exports.updateLocation = async (req, res) => {
    try {
      const { coordinates } = req.body;
      const user = await User.findByIdAndUpdate(req.params.id, { lastLocation: { type: 'Point', coordinates, lastUpdated: Date.now() } }, { new: true });
  
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  
      res.json({ message: 'Ubicación actualizada', user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };






