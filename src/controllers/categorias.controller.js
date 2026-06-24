const db = require('../config/db');

exports.obtenerTodas = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM categorias ORDER BY nombre ASC');
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar las categorías.', detalle: error.message });
    }
};

exports.crearCategoria = async (req, res) => {
    const { nombre } = req.body;
    if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
    }
    try {
        const resultado = await db.query(
            'INSERT INTO categorias (nombre) VALUES ($1) RETURNING id',
            [nombre.trim()]
        );
        res.status(201).json({ mensaje: 'Categoría creada.', id: resultado.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la categoría.', detalle: error.message });
    }
};

exports.eliminarCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM categorias WHERE id = $1', [id]);
        res.json({ mensaje: 'Categoría eliminada.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la categoría.', detalle: error.message });
    }
};