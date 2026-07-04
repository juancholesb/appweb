const db = require('../config/db');

exports.crearResena = async (req, res) => {
    const { producto_id, nombre_cliente, calificacion, comentario } = req.body;

    if (!producto_id || !nombre_cliente || !calificacion) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        const query = `
            INSERT INTO resenas (producto_id, nombre_cliente, calificacion, comentario) 
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const valores = [producto_id, nombre_cliente, calificacion, comentario];
        const resultado = await db.query(query, valores);

        res.status(201).json({ mensaje: 'Reseña creada con éxito', resena: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la reseña', detalle: error.message });
    }
};

exports.obtenerPorProducto = async (req, res) => {
    const { producto_id } = req.params;

    try {
        const query = 'SELECT * FROM resenas WHERE producto_id = $1 ORDER BY fecha DESC';
        const resultado = await db.query(query, [producto_id]);
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reseñas', detalle: error.message });
    }
};
