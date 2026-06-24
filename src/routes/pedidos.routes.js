const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');
const { protegerApiAdmin } = require('../middlewares/auth.middleware');

// Público: la tienda registra el pedido al enviar por WhatsApp
router.post('/', pedidosController.crearPedido);

// Admin: ver, confirmar y cancelar pedidos
router.get('/', protegerApiAdmin, pedidosController.obtenerTodos);
router.post('/:id/confirmar', protegerApiAdmin, pedidosController.confirmarPedido);
router.post('/:id/cancelar', protegerApiAdmin, pedidosController.cancelarPedido);

module.exports = router;