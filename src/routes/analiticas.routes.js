const express = require('express');
const router = express.Router();
const analiticasController = require('../controllers/analiticas.controller');
const { protegerVistaAdmin } = require('../middlewares/auth.middleware');

router.get('/', protegerVistaAdmin, analiticasController.obtenerEstadisticas);

module.exports = router;
