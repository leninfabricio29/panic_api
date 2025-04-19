const admin = require('firebase-admin');
require('dotenv').config();

const decodedBase64 = Buffer.from(process.env.FIREBASE_CREDENTIALS_BASE64, 'base64').toString('utf8');
const serviceAccount = JSON.parse(decodedBase64);

// Firebase usa \n para las claves privadas, así que lo restauramos correctamente:
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
