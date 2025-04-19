const User = require('../models/user-model');
const Contact = require('../models/contact-model');
const Neighborhood = require('../models/neighborhood-model')
const Notify = require('../models/notify-model');
const bcrypt = require('bcrypt');



exports.register = async (req, res) => {
  try {
    const { ci, name, email, phone, lastLocation } = req.body;

    // Crear el nuevo usuario
    const user = new User({
      ci,
      name,
      email,
      phone,
      lastLocation: lastLocation || { type: 'Point', coordinates: [0.0, 0.0] },
    });

    // Guardar el usuario
    await user.save();

    // Buscar todos los administradores
    const admins = await User.find({ role: 'admin' });

    if (admins.length > 0) {
      // Crear notificaciones en paralelo
      const notifications = admins.map(admin => ({
        emitter: user._id,
        receiver: admin._id,
        title: 'Nuevo usuario registrado: Validar datos y generar credenciales',
        message: `El usuario ${user.name} se ha registrado.`,
      }));

      // Insertar todas las notificaciones de una vez
      await Notify.insertMany(notifications);
    }

    res.status(201).json({ message: 'Usuario registrado exitosamente', user });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Ocurrió un error al registrar el usuario' });
  }
};


exports.validateRegistration = async (req, res) => {
  try {
    const { userId } = req.body;

    // Buscar el usuario por ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Generar el hash de la cédula para la contraseña
    const hashedPassword = await bcrypt.hash(user.ci, 10); // 10 salt rounds

    // Actualizar la contraseña y marcar como validado (opcional)
    user.password = hashedPassword;
    user.isActive = true; // <-- Solo si tienes un campo similar

    // Guardar los cambios
    await user.save();

    res.json({ message: 'Usuario validado exitosamente, se han creado las credenciales', user });
  } catch (error) {
    console.error('Error al validar registro:', error);
    res.status(500).json({ error: 'Ocurrió un error al validar el registro' });
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


// --- Renombrar la función para reflejar que ahora guarda tokens FCM ---
// Antes: exports.saveExpoToken = async (req, res) => {
exports.saveFCMToken = async (req, res) => {
    try {
        const userId = req.user.id;
        // --- Cambiar el nombre del parámetro esperado en el cuerpo de la solicitud ---
        // Antes: const { expoToken } = req.body;
        const { fcmToken } = req.body; // Ahora esperamos un parámetro llamado 'fcmToken'

        // --- Validar que el nuevo parámetro exista ---
        // Antes: if (!expoToken) return res.status(400).json({ error: 'Token Expo requerido' });
        if (!fcmToken) return res.status(400).json({ error: 'Token FCM requerido' });

        // --- La lógica de actualización en la DB ya usaba 'fcmToken', así que solo nos aseguramos de pasar el nuevo valor ---
        const user = await User.findByIdAndUpdate(
            userId,
            { fcmToken: fcmToken }, // Guardamos el valor del parámetro de entrada 'fcmToken'
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        // --- Actualizar el mensaje de éxito ---
        // Antes: res.json({ message: 'Token Expo guardado con éxito', user });
        res.json({ message: 'Token FCM guardado con éxito', user });

    } catch (error) {
        // --- Actualizar el mensaje de error en la consola ---
        // Antes: console.error('Error al guardar token Expo:', error);
        console.error('Error al guardar token FCM:', error);
        res.status(500).json({ error: 'Error interno al guardar el token' });
    }
};

// --- IMPORTANTE: Actualiza también la ruta en tu archivo de rutas ---
// Si tenías algo como:
// router.post('/users/token', userController.saveExpoToken);
// Cámbialo para usar la nueva función y posiblemente una ruta más clara, por ejemplo:
// router.post('/users/fcm-token', userController.saveFCMToken);





