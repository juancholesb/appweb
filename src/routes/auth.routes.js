const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/estado', authController.mostrarEstadoSesion);
router.post('/login', authController.iniciarSesion);
router.post('/logout', authController.cerrarSesion);

module.exports = router;