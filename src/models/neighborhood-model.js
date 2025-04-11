const mongoose = require('mongoose');

const NeighborhoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del barrio es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Área geográfica (polígono)
  area: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // Array de arrays de arrays de números (estructura de polígono GeoJSON)
      validate: {
        validator: function(v) {
          // Validación para estructura de polígono GeoJSON
          return Array.isArray(v) && 
                 v.length > 0 && 
                 v.every(ring => 
                   Array.isArray(ring) && 
                   ring.length >= 4 && // Un polígono debe tener al menos 4 puntos
                   ring.every(coord => 
                     Array.isArray(coord) && 
                     coord.length === 2 && 
                     typeof coord[0] === 'number' && 
                     typeof coord[1] === 'number'
                   ) &&
                   // El primer y último punto deben ser iguales para cerrar el polígono
                   JSON.stringify(ring[0]) === JSON.stringify(ring[ring.length - 1])
                 );
        },
        message: 'Las coordenadas deben seguir la estructura de polígono GeoJSON'
      },
      default: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]  // Polígono por defecto con 5 puntos
    }
  },  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice geoespacial
NeighborhoodSchema.index({ area: '2dsphere' });

module.exports = mongoose.model('Neighborhood', NeighborhoodSchema);