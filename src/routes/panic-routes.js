    // routes/panic.js
    const express = require('express');
    const router = express.Router();
    const { handlePanic } = require('../controllers/panic-controller');
    const { protect } = require('../middlewares/auth');

    router.use(protect)

    router.post('/alerta', handlePanic);

    module.exports = router;
