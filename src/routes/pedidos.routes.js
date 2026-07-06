const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');
const { protegerApiAdmin } = require('../middlewares/auth.middleware');

// Público: la tienda registra el pedido al enviar por WhatsApp
router.post('/', pedidosController.crearPedido);

// Público: consultar estado de un pedido (sin datos sensibles)
router.get('/:id/estado', pedidosController.obtenerEstado);

// Admin: ver, confirmar, cancelar y actualizar estado de pedidos
router.get('/', protegerApiAdmin, pedidosController.obtenerTodos);
router.post('/:id/confirmar', protegerApiAdmin, pedidosController.confirmarPedido);
router.post('/:id/cancelar', protegerApiAdmin, pedidosController.cancelarPedido);
router.patch('/:id/estado', protegerApiAdmin, pedidosController.actualizarEstado);

module.exports = router;