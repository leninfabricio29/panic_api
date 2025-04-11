// routes/contacts.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');

// Requerir el controlador
const contactController = require('../controllers/contact-controller');

// Todas las rutas requieren autenticación
router.use(protect);

/**
 * @swagger
 * /api/contacts/register:
 *   post:
 *     summary: Registrar un nuevo contacto de emergencia
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alias
 *             properties:
 *               alias:
 *                 type: string
 *                 description: Nombre o alias del contacto
 *               relationship:
 *                 type: string
 *                 description: Relación con el contacto (familiar, amigo, etc.)
 *               notificationMethods:
 *                 type: object
 *                 properties:
 *                   call:
 *                     type: boolean
 *                     default: true
 *                   push:
 *                     type: boolean
 *                     default: false
 *               notificationPriority:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [call, push]
 *                 default: [call, push]
 *               isEmergencyContact:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Contacto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado, token de autenticación inválido o expirado
 *       500:
 *         description: Error del servidor
 */
router.post('/register', contactController.createContact);

/**
 * @swagger
 * /api/contacts/all-contacts:
 *   get:
 *     summary: Obtener todos los contactos del usuario
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contactos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Número de contactos
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/all-contacts', contactController.getUserContacts);

/**
 * @swagger
 * /api/contacts/{id}:
 *   get:
 *     summary: Obtener un contacto por su ID
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del contacto
 *     responses:
 *       200:
 *         description: Contacto obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permiso para ver este contacto
 *       404:
 *         description: Contacto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', contactController.getContactById);

/**
 * @swagger
 * /api/contacts/{id}:
 *   put:
 *     summary: Actualizar un contacto por su ID
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del contacto
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alias:
 *                 type: string
 *               relationship:
 *                 type: string
 *               notificationMethods:
 *                 type: object
 *                 properties:
 *                   call:
 *                     type: boolean
 *                   push:
 *                     type: boolean
 *               notificationPriority:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [call, push]
 *               isEmergencyContact:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Contacto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permiso para actualizar este contacto
 *       404:
 *         description: Contacto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', contactController.updateContact);

/**
 * @swagger
 * /api/contacts/{id}:
 *   delete:
 *     summary: Eliminar un contacto por su ID
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del contacto
 *     responses:
 *       200:
 *         description: Contacto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Contacto eliminado con éxito
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permiso para eliminar este contacto
 *       404:
 *         description: Contacto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', contactController.deleteContact);

/**
 * @swagger
 * /api/contacts/{id}/notify:
 *   put:
 *     summary: Actualizar la fecha de última notificación de un contacto
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del contacto
 *     responses:
 *       200:
 *         description: Fecha de notificación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permiso para actualizar este contacto
 *       404:
 *         description: Contacto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/notify', contactController.updateLastNotified);

module.exports = router;