const  Contact = require ( '../models/contact-model.js');
const  User  = require ('../models/user-model.js');
const  Notify = require ('../models/notify-model.js');

const { Expo } = require('expo-server-sdk');

let expo = new Expo();

const handlePanic = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const { name, lastLocation } = user;
    const [lng, lat] = lastLocation.coordinates;
    const locationUrl = `https://maps.google.com/?q=${lat},${lng}`;

    // 1. Buscar contactos con populate de contactUser
    const contacts = await Contact.find({ user: userId }).populate('contactUser');

    const tokens = [];
    const notificationsToSave = [];

    for (const contact of contacts) {
      const receiver = contact.contactUser;
      if (!receiver || !receiver.fcmToken || !Expo.isExpoPushToken(receiver.fcmToken)) continue;

      tokens.push({
        token: receiver.fcmToken,
        receiverId: receiver._id
      });

      // Crear notificación para la base de datos
      notificationsToSave.push(new Notify({
        emitter: user._id,
        receiver: receiver._id,
        title: '🚨 Alerta de emergencia',
        message: `${name} ha presionado el botón de pánico. Revisa su ubicación.`,
        type: 'emergencia'
      }));
    }

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'No hay contactos con token válido' });
    }

    // 2. Enviar notificaciones push
    const messages = tokens.map(t => ({
      to: t.token,
      sound: 'default',
      priority: 'high',
      title: '🚨 ¡Emergencia!',
      body: `${name} ha activado el botón de pánico.`,
      data: {
        senderName: name,
        locationUrl,
        type: 'emergencia'
      }
    }));

    console.log('🟡 Tokens:', tokens);

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        console.log('✅ Tickets enviados:', JSON.stringify(tickets, null, 2));
    
        tickets.forEach(ticket => {
          if (ticket.status !== 'ok') {
            console.error('❌ Error en ticket de Expo:', ticket);
          }
        });
    
      } catch (error) {
        console.error('❌ Error al enviar notificaciones con Expo:', error);
      }
    }
    

    // 3. Guardar notificaciones en la base de datos
    await Notify.insertMany(notificationsToSave);

    res.status(200).json({ message: 'Notificaciones enviadas y guardadas con éxito' });

  } catch (err) {
    console.error('❌ Error en /api/panic:', err);
    res.status(500).json({ message: 'Error al enviar alerta de pánico' });
  }
};

module.exports = { handlePanic };
