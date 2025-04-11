// controllers/neighborhoodController.js
const Neighborhood = require('../models/neighborhood-model');
const User = require('../models/user-model'); // Asegúrate de importar el modelo de usuario

/**
 * @desc    Obtener todos los barrios/ciudadelas
 * @route   GET /api/neighborhoods
 * @access  Private
 */
exports.getAllNeighborhoods = async (req, res) => {
  try {
    const neighborhoods = await Neighborhood.find();
    
    res.status(200).json({
      success: true,
      count: neighborhoods.length,
      data: neighborhoods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener barrios',
      error: error.message
    });
  }
};

/**
 * @desc    Crear un nuevo barrio/ciudadela
 * @route   POST /api/neighborhoods
 * @access  Private (Admin)
 */
exports.createNeighborhood = async (req, res) => {
    try {
      const { name, description, area } = req.body;
  
      // Validar datos requeridos
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del barrio es obligatorio'
        });
      }
  
      // Crear el barrio con un polígono por defecto si no se proporciona un área
      const neighborhood = await Neighborhood.create({
        name,
        description,
        area: area || {
          type: 'Polygon',
          coordinates: [
            // Each polygon is an array of linear rings
            // The first linear ring is the exterior ring
            // Make sure it's properly nested - this is a 3-level array structure
            [
              [0, 0], [0, 1], [1, 1], [1, 0], [0, 0] // Polígono con 5 puntos
            ]
          ]
        }
      });
  
      res.status(201).json({
        success: true,
        neighborhood: neighborhood
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear barrio',
        error: error.message
      });
    }
  };
  
  
  

/**
 * @desc    Obtener un barrio específico por ID
 * @route   GET /api/neighborhoods/:id
 * @access  Private
 */
exports.getNeighborhoodById = async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.params.id);

    if (!neighborhood) {
      return res.status(404).json({
        success: false,
        message: 'Barrio no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      neighborhood: neighborhood
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener barrio',
      error: error.message
    });
  }
};


/**
 * @desc    Eliminar un barrio
 * @route   DELETE /api/neighborhoods/:id
 * @access  Private (Admin)
 */
exports.deleteNeighborhood = async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.params.id);

    if (!neighborhood) {
      return res.status(404).json({
        success: false,
        message: 'Barrio no encontrado'
      });
    }

    // Antes de eliminar el barrio, desasociar a todos los usuarios
    await User.updateMany(
      { neighborhood: req.params.id },
      { $set: { neighborhood: null } }
    );

    await Neighborhood.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Barrio eliminado con éxito'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar barrio',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener todos los usuarios de un barrio específico
 * @route   GET /api/neighborhoods/:id/users
 * @access  Private
 */
exports.getNeighborhoodUsers = async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.params.id);

    if (!neighborhood) {
      return res.status(404).json({
        success: false,
        message: 'Barrio no encontrado'
      });
    }

    // Obtener usuarios que pertenecen a este barrio
    const users = await User.find({ 
      neighborhood: req.params.id 
    })
    .select('name email phone lastLocation fcmToken');

    res.status(200).json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios del barrio',
      error: error.message
    });
  }
};

/**
 * @desc    Agregar un usuario al barrio
 * @route   POST /api/neighborhoods/:id/users
 * @access  Private (Admin)
 */
exports.addUserToNeighborhood = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario es requerido'
      });
    }

    const neighborhood = await Neighborhood.findById(req.params.id);
    if (!neighborhood) {
      return res.status(404).json({
        success: false,
        message: 'Barrio no encontrado'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar el usuario con el barrio asignado
    user.neighborhood = req.params.id;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Usuario agregado al barrio con éxito'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar usuario al barrio',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener estadísticas de barrios
 * @route   GET /api/neighborhoods/stats
 * @access  Private (Admin)
 */
exports.getNeighborhoodStats = async (req, res) => {
  try {
    // Agregación para obtener el conteo de usuarios por barrio
    const stats = await User.aggregate([
      {
        $match: { 
          neighborhood: { $ne: null } // Solo usuarios con barrio asignado
        }
      },
      {
        $group: {
          _id: '$neighborhood',
          userCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'neighborhoods', // Nombre de la colección en MongoDB
          localField: '_id',
          foreignField: '_id',
          as: 'neighborhoodInfo'
        }
      },
      {
        $unwind: '$neighborhoodInfo'
      },
      {
        $project: {
          _id: 1,
          userCount: 1,
          name: '$neighborhoodInfo.name'
        }
      },
      {
        $sort: { userCount: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de barrios',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar un usuario de un barrio/ciudadela (setear a null)
 * @route   DELETE /api/neighborhoods/:id/users/:userId
 * @access  Private (Admin)
 */
exports.removeUserFromNeighborhood = async (req, res) => {
    try {
      const { id, userId } = req.params;
      
      // Verificar que el barrio existe
      const neighborhood = await Neighborhood.findById(id);
      if (!neighborhood) {
        return res.status(404).json({
          success: false,
          message: 'Barrio no encontrado'
        });
      }
  
      // Verificar que el usuario existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
  
      // Verificar que el usuario realmente pertenece a este barrio
      if (!user.neighborhood || user.neighborhood.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'El usuario no pertenece a este barrio'
        });
      }
  
      // Eliminar la asociación del usuario con el barrio (setear a null)
      user.neighborhood = null;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: 'Usuario removido del barrio con éxito'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar usuario del barrio',
        error: error.message
      });
    }
  };