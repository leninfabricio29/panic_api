const express = require('express');
const cors = require('cors');
const connectDB = require("./config/db-config");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const logger = require('./utils/logger'); // 👈 Importar el logger


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


app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Puedes filtrar campos sensibles aquí si deseas
    const filteredBody = { ...req.body };
    if (filteredBody.password) filteredBody.password = '***';

    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      body: filteredBody
    };

    logger.info(JSON.stringify(logData, null, 2));
  });

  next();
});

// Rutas
const userRoutes = require('./routes/user-routes');
const authRoutes = require('./routes/auth-routes');
const contactRoutes = require ('./routes/contact-routes');
const neighborhoodRoutes = require ('./routes/neighborhood-routes');
const notifyRoutes = require('./routes/notify-routes');
const panicRoutes = require('./routes/panic-routes')



// Usar las rutas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/neighborhood', neighborhoodRoutes)
app.use('/api/notify', notifyRoutes);
app.use('/api/panic', panicRoutes)

// Exportar la app para que pueda ser utilizada por el servidor
module.exports = app;