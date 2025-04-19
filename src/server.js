const app = require('./app'); // Importa la app de Express desde app.js
require('dotenv').config();

const PORT = process.env.PORT ; // Establece el puerto para el servidor
console.log = (...args) => {
  process.stdout.write(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' ') + '\n');
};
// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de la api ${PORT}`);
});
