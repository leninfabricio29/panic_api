const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("📌 Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB", error);
    process.exit(1);
  }
};

module.exports = connectDB; // Exportando la función correctamente en JS
