const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');
const { protegerApiAdmin } = require('../middlewares/auth.middleware');

// Lectura pública: la tienda necesita mostrar el catálogo a cualquier visitante
router.get('/', productosController.obtenerTodos);

// Escritura protegida: solo el admin autenticado puede crear, editar o borrar
router.post('/', protegerApiAdmin, productosController.crearProducto);
router.put('/:id', protegerApiAdmin, productosController.editarProducto);
router.delete('/:id', protegerApiAdmin, productosController.eliminarProducto);

module.exports = router;