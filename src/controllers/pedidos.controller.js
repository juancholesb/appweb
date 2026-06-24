const db = require('../config/db');

// Obtener todos los pedidos (admin)
exports.obtenerTodos = async (req, res) => {
    try {
        const resultado = await db.query(`
            SELECT * FROM pedidos ORDER BY fecha DESC
        `);
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pedidos.', detalle: error.message });
    }
};

// Crear pedido (público - lo llama la tienda al enviar por WhatsApp)
exports.crearPedido = async (req, res) => {
    const { cliente_nombre, cliente_direccion, ubicacion, metodo_pago, items, total } = req.body;

    if (!cliente_nombre || !items || items.length === 0) {
        return res.status(400).json({ error: 'Faltan datos del pedido.' });
    }

    try {
        const resultado = await db.query(`
            INSERT INTO pedidos (cliente_nombre, cliente_direccion, ubicacion, metodo_pago, items, total, estado)
            VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
            RETURNING id
        `, [
            cliente_nombre,
            cliente_direccion || '',
            ubicacion || '',
            metodo_pago || '',
            JSON.stringify(items),
            total || 0
        ]);

        res.status(201).json({ mensaje: 'Pedido registrado.', id: resultado.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar pedido.', detalle: error.message });
    }
};

// Confirmar pedido y descontar stock (admin)
exports.confirmarPedido = async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener el pedido
        const pedidoRes = await db.query('SELECT * FROM pedidos WHERE id = $1', [id]);
        if (pedidoRes.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        const pedido = pedidoRes.rows[0];

        if (pedido.estado === 'confirmado') {
            return res.status(400).json({ error: 'Este pedido ya fue confirmado.' });
        }

        // Parsear items
        const items = typeof pedido.items === 'string' ? JSON.parse(pedido.items) : pedido.items;

        // Descontar stock de cada producto
        for (const item of items) {
            await db.query(`
                UPDATE productos 
                SET stock = GREATEST(0, stock - $1)
                WHERE id = $2
            `, [item.cantidad, item.id]);
        }

        // Marcar pedido como confirmado
        await db.query(`
            UPDATE pedidos SET estado = 'confirmado', fecha_confirmacion = NOW()
            WHERE id = $1
        `, [id]);

        res.json({ mensaje: 'Pedido confirmado y stock actualizado.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al confirmar pedido.', detalle: error.message });
    }
};

// Cancelar pedido (admin)
exports.cancelarPedido = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(`UPDATE pedidos SET estado = 'cancelado' WHERE id = $1`, [id]);
        res.json({ mensaje: 'Pedido cancelado.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al cancelar pedido.', detalle: error.message });
    }
};