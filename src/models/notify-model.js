const mongoose = require('mongoose');

const NotifySchema = new mongoose.Schema(
    {
        emitter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['registro', 'cambio-barrio', 'emergencia', 'reseteo'],
            default: 'registro'
          },
        message: {
            type: String,
            required: true,
            trim: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Notify', NotifySchema);
