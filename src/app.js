const express = require('express');
const cors = require('cors');
const connectDB = require("./config/db-config");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

require('dotenv').config();


// Inicializar la aplicación Express
const app = express();

// Middleware
app.use(express.json()); // Permite que Express procese JSON en las solicitudes
app.use(cors()); // Habilita CORS si es necesario para solicitudes cruzadas

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Node.js',
      version: '1.0.0',
      description: 'Documentación de API con Swagger',
      contact: {
        name: 'Desarrollador',
        email: 'info@ejemplo.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: [`${__dirname}/routes/*.js`,], // Rutas a los archivos con anotaciones Swagger
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Conexión a la base de datos MongoDB
connectDB();

// Rutas
const userRoutes = require('./routes/user-routes');
const authRoutes = require('./routes/auth-routes');
const contactRoutes = require ('./routes/contact-routes');
const neighborhoodRoutes = require ('./routes/neighborhood-routes');


// Usar las rutas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/neighborhood', neighborhoodRoutes)

// Exportar la app para que pueda ser utilizada por el servidor
module.exports = app;