const express = require('express');
const { registerUser, loginUser, recoverPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/recover', recoverPassword);

module.exports = router;
