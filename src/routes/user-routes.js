const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-generado del usuario
 *         name:
 *           type: string
 *           description: Nombre del usuario
 *         email:
 *           type: string
 *           description: Correo electrónico del usuario
 *         password:
 *           type: string
 *           description: Contraseña del usuario (encriptada)
 *         isActive:
 *           type: boolean
 *           description: Estado del usuario (activo/inactivo)
 *         location:
 *           type: object
 *           properties:
 *             lat:
 *               type: number
 *               description: Latitud de la ubicación
 *             lng:
 *               type: number
 *               description: Longitud de la ubicación
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Fecha de creación del usuario
 *       example:
 *         id: 60d0fe4f5311236168a109ca
 *         name: Juan Pérez
 *         email: juan@ejemplo.com
 *         isActive: true
 *         location: { lat: 19.4326, lng: -99.1332 }
 *         createdAt: 2023-01-10T04:05:06.157Z
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/register', userController.register);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 */

router.post('/validate', userController.validateRegistration);
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualiza la información de un usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       400:
 *         description: Datos inválidos
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Desactiva un usuario (borrado lógico)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario desactivado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', userController.deleteUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtiene todos los usuarios activos
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios activos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', userController.getUsers);

/**
 * @swagger
 * /api/users/{id}/location:
 *   put:
 *     summary: Actualiza la ubicación de un usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lat
 *               - lng
 *             properties:
 *               lat:
 *                 type: number
 *                 description: Latitud
 *               lng:
 *                 type: number
 *                 description: Longitud
 *     responses:
 *       200:
 *         description: Ubicación actualizada exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       400:
 *         description: Datos inválidos
 */
router.put('/:id/location', userController.updateLocation);

module.exports = router;