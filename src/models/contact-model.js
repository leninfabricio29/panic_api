const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuario contacto ']
  },
  contactUser: {  // Nuevo campo para referenciar al usuario agregado como contacto
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario al que se agrega el contacto es obligatorio']
  },
  alias: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  relationship: {
    type: String,
    required: true,
    trim: true
  },
  notificationMethods: {
    call: { type: Boolean, default: true },
    push: { type: Boolean, default: false }
  },
  notificationPriority: {
    type: [String],
    enum: ['call', 'push'],
    default: ['call', 'push']
  },
  lastNotifiedAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', ContactSchema);
