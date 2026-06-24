const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categorias.controller');
const { protegerApiAdmin } = require('../middlewares/auth.middleware');

// Lectura pública (la tienda necesita ver las categorías)
router.get('/', categoriasController.obtenerTodas);

// Escritura protegida (solo el admin autenticado puede crear o borrar)
router.post('/', protegerApiAdmin, categoriasController.crearCategoria);
router.delete('/:id', protegerApiAdmin, categoriasController.eliminarCategoria);

module.exports = router;