const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: Correo electrónico del usuario
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token para autenticación
 *         user:
 *           $ref: '#/components/schemas/User'
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: Correo electrónico del usuario
 *     UpdatePasswordRequest:
 *       type: object
 *       required:
 *         - userId
 *         - token
 *         - newPassword
 *       properties:
 *         userId:
 *           type: string
 *           description: ID del usuario
 *         token:
 *           type: string
 *           description: Token de restablecimiento
 *         newPassword:
 *           type: string
 *           description: Nueva contraseña
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión con un usuario existente
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Solicita restablecer la contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Correo de restablecimiento enviado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       400:
 *         description: Datos inválidos
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /api/auth/update-password:
 *   put:
 *     summary: Actualiza la contraseña utilizando un token de restablecimiento
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Datos inválidos o token expirado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/update-password', authController.updatePassword);

module.exports = router;