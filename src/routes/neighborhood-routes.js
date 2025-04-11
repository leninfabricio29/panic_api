// routes/neighborhoods.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const neighborhoodController = require('../controllers/neighborhood-controller');

//Se maneja así porque express, es estricto con el orden de las rutas

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas públicas para usuarios autenticados
router.get('/all-neighborhood', neighborhoodController.getAllNeighborhoods);

// Rutas solo para administradores
router.get('/stats', authorize('admin'), neighborhoodController.getNeighborhoodStats);
router.post('/register', authorize('admin'), neighborhoodController.createNeighborhood);
router.get('/stats', authorize('admin'), neighborhoodController.getNeighborhoodStats);

// Rutas públicas para usuarios autenticados
router.get('/:id', neighborhoodController.getNeighborhoodById);
router.get('/:id/users', neighborhoodController.getNeighborhoodUsers);

// Rutas solo para administradores
router.delete('/:id', authorize('admin'), neighborhoodController.deleteNeighborhood);
router.post('/:id/users', authorize('admin'), neighborhoodController.addUserToNeighborhood);
// Añade esta ruta en tu archivo de rutas
router.delete('/:id/users/:userId', authorize('admin'), neighborhoodController.removeUserFromNeighborhood);

module.exports = router;