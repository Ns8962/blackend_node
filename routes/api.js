const express = require('express');
const router = express.Router();
const { login, register, edit_user, logout } =require('../controllers/api');
const { authLogin, authToken  } = require('../Midleware/auth');

router.post('/login', authLogin, login);
router.post('/register', register);
router.put('/edit_user/:id', authToken, edit_user);
router.post('/logout', logout);

module.exports = router;