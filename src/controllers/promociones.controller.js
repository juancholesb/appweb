const db = require('../config/db');

exports.obtenerTodas = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM promociones ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar las promociones.', detalle: error.message });
    }
};

exports.crearPromocion = async (req, res) => {
    const { titulo, subtitulo, descripcion, textoBoton, imagen, colorFondo, enlace } = req.body;
    try {
        const querySQL = `
            INSERT INTO promociones (titulo, subtitulo, descripcion, texto_boton, imagen, color_fondo, enlace)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;
        const valores = [titulo, subtitulo, descripcion, textoBoton, imagen, colorFondo, enlace || '#productos'];
        const resultado = await db.query(querySQL, valores);
        res.status(201).json({ mensaje: 'Promoción creada.', id: resultado.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la promoción.', detalle: error.message });
    }
};

exports.editarPromocion = async (req, res) => {
    const { id } = req.params;
    const { titulo, subtitulo, descripcion, textoBoton, imagen, colorFondo, enlace } = req.body;
    try {
        const querySQL = `
            UPDATE promociones
            SET titulo = $1, subtitulo = $2, descripcion = $3, texto_boton = $4,
                imagen = $5, color_fondo = $6, enlace = $7
            WHERE id = $8
        `;
        const valores = [titulo, subtitulo, descripcion, textoBoton, imagen, colorFondo, enlace || '#productos', id];
        await db.query(querySQL, valores);
        res.json({ mensaje: 'Promoción actualizada.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la promoción.', detalle: error.message });
    }
};

exports.eliminarPromocion = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM promociones WHERE id = $1', [id]);
        res.json({ mensaje: 'Promoción eliminada.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la promoción.', detalle: error.message });
    }
};