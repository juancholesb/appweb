const db = require('../config/db');

exports.obtenerTodos = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM productos ORDER BY id DESC');
        
        // Mapeamos las filas para asegurar que los sabores se envíen bien estructurados
        const productos = resultado.rows.map(p => {
            let saboresFormateados = p.sabores;
            if (typeof p.sabores === 'string' && p.sabores.includes(',')) {
                saboresFormateados = p.sabores.split(',').map(s => s.trim());
            }
            return { ...p, sabores: saboresFormateados };
        });

        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar el inventario en Postgres.', detalle: error.message });
    }
};

exports.crearProducto = async (req, res) => {
    const { nombre, descripcion, precio, categoria, imagen, sabores, stock } = req.body;
    try {
        const stringSabores = Array.isArray(sabores) ? sabores.join(', ') : String(sabores || '');
        const stockInicial = Number(stock) || 0;

        const querySQL = `
            INSERT INTO productos (nombre, descripcion, precio, categoria, imagen, sabores, stock) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id
        `;
        const valores = [nombre, descripcion, precio, categoria, imagen || 'img/logo.png', stringSabores, stockInicial];
        
        const resultado = await db.query(querySQL, valores);
        res.status(201).json({ mensaje: 'Vape registrado en Postgres', id: resultado.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el producto.', detalle: error.message });
    }
};

exports.editarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria, imagen, sabores, stock } = req.body;
    try {
        const stringSabores = Array.isArray(sabores) ? sabores.join(', ') : String(sabores || '');
        const stockVal = (stock !== undefined && stock !== null && stock !== '') ? Number(stock) : null;

        const querySQL = stockVal !== null
            ? `UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, categoria=$4, imagen=$5, sabores=$6, stock=$7 WHERE id=$8`
            : `UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, categoria=$4, imagen=$5, sabores=$6 WHERE id=$7`;
        const valores = stockVal !== null
            ? [nombre, descripcion, precio, categoria, imagen, stringSabores, stockVal, id]
            : [nombre, descripcion, precio, categoria, imagen, stringSabores, id];

        await db.query(querySQL, valores);
        res.json({ mensaje: 'Vape actualizado correctamente en Postgres.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto.', detalle: error.message });
    }
};

exports.eliminarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM productos WHERE id = $1', [id]);
        res.json({ mensaje: 'Producto removido de Postgres.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al remover el producto.', detalle: error.message });
    }
};