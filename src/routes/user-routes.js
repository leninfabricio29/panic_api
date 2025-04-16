const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');
const { protect } = require('../middlewares/auth');

router.post('/register', userController.register);

router.post('/validate', userController.validateRegistration);
router.get('/:id', userController.getUserById);

router.put('/:id', userController.updateUser);

router.delete('/:id', userController.deleteUser);

router.get('/', userController.getUsers);

router.put('/:id/location', userController.updateLocation);


router.post('/token', protect , userController.saveExpoToken);


module.exports = router;