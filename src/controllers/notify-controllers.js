const Notify = require('../models/notify-model');


exports.getNotificationsByUser = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ error: 'ID de usuario requerido' });
      }
  
      const notifications = await Notify.find({ receiver: id })
        .sort({ createdAt: -1 }); // Opcional: ordenar recientes primero
  
      res.json(notifications);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({ error: error.message });
    }
  };

  
exports.markReadNotification = async (req, res) => {
    try {
        const { id } = req.params;
    
        if (!id) {
            return res.status(400).json({ error: 'ID de notificación requerido' });
        }

        const notification = await Notify.findById(id);


        if (!notification) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }
    

        notification.isRead = true;
        await notification.save();
        res.json({ message: 'Notificación marcada como leída' });
    
    
    } catch (error) {
        console.error('Error al obtener la notificación:', error);
        res.status(500).json({ error: error.message });
    }
}


exports.getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
    
        if (!id) {
            return res.status(400).json({ error: 'ID de notificación requerido' });
        }

        const notification = await Notify.findById(id);

       
        res.json({ notification });

        if (!notification) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }
    
       
    
    
    } catch (error) {
        console.error('Error al obtener la notificación:', error);
        res.status(500).json({ error: error.message });
    }
}
