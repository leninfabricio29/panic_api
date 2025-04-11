const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  fcmToken: {
    type: String,
    default: null
  },
  lastLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function(v) {
          return v.length === 2;
        },
        message: 'Las coordenadas deben contener exactamente dos valores (longitud y latitud).'
      },
      default: [0.0, 0.0]
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  neighborhood: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Neighborhood',
    default: null
  }
}, {
  timestamps: true
});

// Crear índice geoespacial
UserSchema.index({ lastLocation: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
