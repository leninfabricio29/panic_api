const app = require('./app'); // Importa la app de Express desde app.js
require('dotenv').config();

const PORT = process.env.PORT ; // Establece el puerto para el servidor

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`API activa en el puerto${PORT}`);
});
