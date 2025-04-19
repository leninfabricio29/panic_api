// Asegúrate de que estas importaciones existan
const Contact = require('../models/contact-model');
const User = require('../models/user-model');
const Notify = require('../models/notify-model');

// --- ELIMINA o COMENTA estas dos líneas ya no usarás expo-server-sdk para este envío ---
// const { Expo } = require('expo-server-sdk');
// let expo = new Expo();
// ---------------------------------------------------------------------------------------

// --- Asegúrate de importar el objeto 'admin' inicializado desde tu archivo firebase.js ---
const admin = require('../config/firebase/firebase'); // <--- ¡ACTUALIZA ESTA RUTA!
// -----------------------------------------------------------------------------------------


const handlePanic = async (req, res) => {
    try {
        const userId = req.user.id;
        // Usamos populate para obtener los datos del usuario de contacto, incluyendo el token
        const contacts = await Contact.find({ user: userId }).populate('contactUser');

        const registrationTokens = []; // Aquí guardaremos los tokens FCM válidos
        const notificationsToSave = []; // Para guardar en la base de datos

        if (!contacts || contacts.length === 0) {
            console.warn(`Usuario ${userId} activó alerta, pero no tiene contactos configurados.`);
            return res.status(400).json({ message: 'No hay contactos configurados.' });
        }

        // Obtener datos del usuario que activó la alerta
        const user = await User.findById(userId);
        if (!user) {
             // Esto no debería pasar si req.user.id viene de un usuario válido autenticado
            console.error(`Error grave: Usuario con ID ${userId} autenticado pero no encontrado en DB.`);
            return res.status(404).json({ message: 'Usuario emisor no encontrado.' });
        }

        const emitterName = user.name || 'Usuario Desconocido'; // Nombre del usuario emisor
        const [lng, lat] = user.lastLocation && user.lastLocation.coordinates ? user.lastLocation.coordinates : [null, null];
        // Genera la URL de ubicación si hay coordenadas
        const locationUrl = (lat !== null && lng !== null) ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : 'Ubicación no disponible'; // Usar formato estándar de Google Maps URL


        for (const contact of contacts) {
            const receiver = contact.contactUser;

            // Validar que el contacto exista y tenga un token FCM válido
            // Ya no validamos con Expo.isExpoPushToken
            if (receiver && receiver.fcmToken && typeof receiver.fcmToken === 'string') {
                 // Puedes añadir una validación de formato más estricta si lo deseas,
                 // pero Firebase Admin SDK validará el formato al intentar enviar.
                registrationTokens.push(receiver.fcmToken);

                // Crear notificación para la base de datos (usando datos relevantes)
                notificationsToSave.push(new Notify({
                    emitter: user._id,
                    receiver: receiver._id,
                    title: '🚨 Alerta de emergencia', // Título para la DB
                    message: `${emitterName} ha presionado el botón de pánico.`, // Mensaje para la DB
                    type: 'emergencia',
                    locationUrl: locationUrl // Guarda la URL de ubicación en la notificación DB
                }));
            } else {
                console.warn(`Contacto del usuario ${userId} sin usuario asociado o sin token FCM válido: Contact ID ${contact._id}`);
            }
        }

        if (registrationTokens.length === 0) {
            console.warn(`No se encontraron tokens FCM válidos entre los contactos del usuario ${userId} para enviar la alerta.`);
            return res.status(400).json({ message: 'No hay contactos con token FCM válido para enviar la alerta.' });
        }

        // --- 2. Enviar notificaciones push usando Firebase Admin SDK ---

        // Carga útil del mensaje FCM
        const message = {
            // Este payload 'notification' es manejado automáticamente por el sistema Android
            // cuando la app está en segundo plano o cerrada para mostrar la notificación en la bandeja.
            // Es buena práctica incluirlo. También es usado por iOS y Web.
            notification: {
                title: '🚨 ¡Emergencia!', // Título para la notificación visible al usuario
                body: `${emitterName} ha activado el botón de pánico. Revisa la aplicación.`, // Cuerpo para la notificación visible
            },
            data: {
                // Este payload 'data' es el que tu MyFirebaseMessagingService recibirá
                // independientemente del estado de la app (primer plano, segundo plano, cerrada)
                // para ejecutar la lógica de pantalla completa.
                type: 'emergencia', // ¡CRUCIAL! El tipo que tu servicio nativo busca
                senderName: emitterName,
                locationUrl: locationUrl, // Pasa la URL de ubicación en los datos
                // Asegúrate de que todos los datos que MyFirebaseMessagingService espera estén aquí como strings
                // Ejemplo: si MyFirebaseMessagingService lee 'senderName', debe estar aquí.
                // Todos los valores en 'data' deben ser strings.
            },
             android: {
                 priority: 'high', // Prioridad alta para notificaciones urgentes
                 notification: {
                     channelId: 'panic_channel', // ¡CRUCIAL! Debe coincidir exactamente con el ID de tu canal nativo en Java
                     sound: 'default', // Usa 'default' o el nombre de un sonido específico en res/raw
                     // Puedes añadir más configuraciones específicas de Android aquí
                 }
             },
             // Puedes añadir configuraciones para iOS (apns) o la Web (webpush) si las necesitas
             // apns: {...},
             // webpush: {...},
        };

        console.log(`🟡 Intentando enviar alerta FCM a ${registrationTokens.length} token(s) del usuario ${userId}.`);

        // Envía el mensaje a todos los tokens registrados usando sendEachForMulticast
        // sendEachForMulticast es recomendado para enviar a múltiples tokens (hasta 500 por llamada)
        const response = await admin.messaging().sendEachForMulticast({
                tokens: registrationTokens,
                ...message, // Incluye el payload del mensaje definido arriba
            });

        console.log('✅ Resultado del envío FCM:', response.successCount, 'enviados,', response.failureCount, 'fallidos.');

        // Opcional: Procesar los resultados de los mensajes fallidos
        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`❌ Falló el envío a token ${registrationTokens[idx]}:`, resp.error.toJSON());
                    // Aquí podrías, por ejemplo, implementar lógica para limpiar tokens inválidos de tu DB
                    // Errores comunes: messaging/invalid-registration-token, messaging/registration-token-not-registered
                }
            });
        }


        // --- 3. Guardar notificaciones en la base de datos ---
        // Esta parte permanece igual
        if (notificationsToSave.length > 0) {
            await Notify.insertMany(notificationsToSave);
            console.log('✅ Notificaciones guardadas en la base de datos.');
        } else {
             console.warn(`No hay notificaciones para guardar en la base de datos para el usuario ${userId}.`);
        }

        // La respuesta al cliente indica que el proceso de envío ha iniciado
        res.status(200).json({
            message: 'Proceso de alerta de pánico iniciado. Mensajes enviados (o en cola para enviar) a través de FCM.',
            fcmSendResult: { // Incluye el resultado del envío FCM
                successCount: response.successCount,
                failureCount: response.failureCount
            }
        });

    } catch (err) {
        console.error('❌ Error general en /api/panic:', err);
        res.status(500).json({ message: 'Error interno al procesar la alerta de pánico' });
    }
};

module.exports = { handlePanic };