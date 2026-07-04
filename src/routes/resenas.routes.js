const express = require('express');
const router = express.Router();
const resenasController = require('../controllers/resenas.controller');

router.post('/', resenasController.crearResena);
router.get('/producto/:producto_id', resenasController.obtenerPorProducto);

module.exports = router;
