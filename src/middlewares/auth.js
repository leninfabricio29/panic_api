const jwt = require('jsonwebtoken');
const User = require('../models/user-model');

exports.protect = async (req, res, next) => {
    let token;
  
    // Verificar si hay token en los headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];
    }
  
    // Verificar si el token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No estás autorizado para acceder a este recurso'
      });
    }
  
    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Buscar usuario y agregar al request
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró ningún usuario con este ID'
        });
      }
  
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'No estás autorizado para acceder a este recurso'
      });
    }
  };

  exports.authorize = (...roles) => {
    return (req, res, next) => {
      // Verificar si el rol del usuario está incluido en los roles permitidos
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para realizar esta acción'
        });
      }
      next();
    };
  };
  