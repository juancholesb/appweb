const express = require('express');
const router = express.Router();
const promocionesController = require('../controllers/promociones.controller');
const { protegerApiAdmin } = require('../middlewares/auth.middleware');

// Lectura pública (el carrusel de la tienda necesita verlas)
router.get('/', promocionesController.obtenerTodas);

// Escritura protegida
router.post('/', protegerApiAdmin, promocionesController.crearPromocion);
router.put('/:id', protegerApiAdmin, promocionesController.editarPromocion);
router.delete('/:id', protegerApiAdmin, promocionesController.eliminarPromocion);

module.exports = router;