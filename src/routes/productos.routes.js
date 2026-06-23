const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');

// Endpoints de comunicación Frontend <-> Backend
router.get('/', productosController.obtenerTodos);
router.post('/', productosController.crearProducto);
router.put('/:id', productosController.editarProducto);
router.delete('/:id', productosController.eliminarProducto);

module.exports = router;