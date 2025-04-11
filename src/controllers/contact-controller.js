// controllers/contactController.js
const Contact = require('../models/contact-model');
const User = require('../models/user-model'); // Asegúrate de importar el modelo de usuario

/**
 * @desc    Crear nuevo contacto de emergencia
 * @route   POST /api/contacts/register
 * @access  Private
 */
exports.createContact = async (req, res) => {
  try {
    const { alias, relationship, notificationMethods, notificationPriority, isEmergencyContact, contactUser } = req.body;

    // Validar datos requeridos
    if (!alias) {
      return res.status(400).json({
        success: false,
        message: 'El alias es obligatorio'
      });
    }

    // Validar si el contactUser está presente en el body
    if (!contactUser) {
      return res.status(400).json({
        success: false,
        message: 'El ID del usuario a agregar como contacto es obligatorio'
      });
    }

    // Evitar que el usuario se agregue a sí mismo como contacto
    if (req.user.id === contactUser) {
      return res.status(400).json({
        success: false,
        message: 'No puedes agregar a tu propio perfil como contacto'
      });
    }

    // Verificar que el usuario a agregar como contacto existe
    const userExists = await User.findById(contactUser);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'El usuario que intentas agregar como contacto no existe'
      });
    }

    // Crear contacto asociado al usuario autenticado
    const contact = await Contact.create({
      user: req.user.id,  // El contacto se asigna siempre al usuario autenticado
      contactUser,  // Aquí se guarda el ID del usuario al que se está agregando como contacto
      alias,
      relationship,
      notificationMethods: notificationMethods || { call: true, push: false },
      notificationPriority: notificationPriority || ['call', 'push'],
      isEmergencyContact: isEmergencyContact !== undefined ? isEmergencyContact : true
    });

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear contacto',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener todos los contactos del usuario actual
 * @route   GET /api/contacts/all-contacts
 * @access  Private
 */
exports.getUserContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id })
      .sort({ alias: 1 })
      .populate('contactUser', 'name email neighborhood'); // Populamos la información básica del usuario de contacto

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener contactos',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener un contacto específico
 * @route   GET /api/contacts/:id
 * @access  Private
 */
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('contactUser', 'name email neighborhood');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contacto no encontrado'
      });
    }

    // Verificar que el contacto pertenece al usuario autenticado
    if (contact.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver este contacto'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener contacto',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar un contacto
 * @route   PUT /api/contacts/:id
 * @access  Private
 */
exports.updateContact = async (req, res) => {
  try {
    const { alias, relationship, notificationMethods, notificationPriority, isEmergencyContact } = req.body;

    let contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contacto no encontrado'
      });
    }

    // Verificar que el contacto pertenece al usuario autenticado
    if (contact.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para actualizar este contacto'
      });
    }

    // No permitir cambiar el usuario de contacto, solo los detalles de la relación
    const updateFields = {};
    if (alias !== undefined) updateFields.alias = alias;
    if (relationship !== undefined) updateFields.relationship = relationship;
    if (notificationMethods !== undefined) updateFields.notificationMethods = notificationMethods;
    if (notificationPriority !== undefined) updateFields.notificationPriority = notificationPriority;
    if (isEmergencyContact !== undefined) updateFields.isEmergencyContact = isEmergencyContact;

    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    ).populate('contactUser', 'name email neighborhood');

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar contacto',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar un contacto
 * @route   DELETE /api/contacts/:id
 * @access  Private
 */
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contacto no encontrado'
      });
    }

    // Verificar que el contacto pertenece al usuario autenticado
    if (contact.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar este contacto'
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Contacto eliminado con éxito'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar contacto',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar la última fecha de notificación de un contacto
 * @route   PUT /api/contacts/:id/notify
 * @access  Private
 */
exports.updateLastNotified = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contacto no encontrado'
      });
    }

    // Verificar que el contacto pertenece al usuario autenticado
    if (contact.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para actualizar este contacto'
      });
    }

    // Actualizar la fecha de última notificación
    contact.lastNotifiedAt = new Date();
    await contact.save();

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la fecha de notificación',
      error: error.message
    });
  }
};



/**
 * @desc    Verificar si un usuario ya está agregado como contacto
 * @route   GET /api/contacts/check/:userId
 * @access  Private
 */
exports.checkIfUserIsContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      user: req.user.id,
      contactUser: req.params.userId
    });

    res.status(200).json({
      success: true,
      isContact: !!contact,
      data: contact || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar contacto',
      error: error.message
    });
  }
};